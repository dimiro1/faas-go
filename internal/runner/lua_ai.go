package runner

import (
	"encoding/json"
	"fmt"

	"github.com/dimiro1/faas-go/internal/env"
	internalhttp "github.com/dimiro1/faas-go/internal/http"
	lua "github.com/yuin/gopher-lua"
)

const (
	defaultOpenAIEndpoint    = "https://api.openai.com/v1"
	defaultAnthropicEndpoint = "https://api.anthropic.com"
	anthropicVersion         = "2023-06-01"
)

// registerAI creates the global 'ai' table with AI provider functions
func registerAI(L *lua.LState, httpClient internalhttp.Client, envStore env.Store, functionID string) {
	aiTable := L.NewTable()

	// ai.chat(options)
	L.SetField(aiTable, "chat", L.NewFunction(func(L *lua.LState) int {
		options := L.CheckTable(1)

		// Extract required parameters
		provider := lua.LVAsString(options.RawGetString("provider"))
		model := lua.LVAsString(options.RawGetString("model"))
		messagesLV := options.RawGetString("messages")

		// Validate required parameters
		if provider == "" {
			L.Push(lua.LNil)
			L.Push(lua.LString("provider is required (openai or anthropic)"))
			return 2
		}
		if model == "" {
			L.Push(lua.LNil)
			L.Push(lua.LString("model is required"))
			return 2
		}
		if messagesLV.Type() != lua.LTTable {
			L.Push(lua.LNil)
			L.Push(lua.LString("messages is required and must be a table"))
			return 2
		}

		// Convert messages from Lua to Go
		messages := luaMessagesToGo(L, messagesLV.(*lua.LTable))
		if len(messages) == 0 {
			L.Push(lua.LNil)
			L.Push(lua.LString("messages cannot be empty"))
			return 2
		}

		// Extract optional parameters
		maxTokens := int(lua.LVAsNumber(options.RawGetString("max_tokens")))
		temperature := lua.LVAsNumber(options.RawGetString("temperature"))
		endpoint := lua.LVAsString(options.RawGetString("endpoint"))

		// Set defaults for optional parameters
		if maxTokens == 0 {
			maxTokens = 1024
		}

		var response *aiChatResponse
		var err error

		switch provider {
		case "openai":
			response, err = callOpenAI(httpClient, envStore, functionID, endpoint, model, messages, maxTokens, float64(temperature))
		case "anthropic":
			response, err = callAnthropic(httpClient, envStore, functionID, endpoint, model, messages, maxTokens, float64(temperature))
		default:
			L.Push(lua.LNil)
			L.Push(lua.LString(fmt.Sprintf("unsupported provider: %s (use openai or anthropic)", provider)))
			return 2
		}

		if err != nil {
			L.Push(lua.LNil)
			L.Push(lua.LString(err.Error()))
			return 2
		}

		// Convert response to Lua table
		L.Push(aiResponseToLuaTable(L, response))
		L.Push(lua.LNil)
		return 2
	}))

	L.SetGlobal("ai", aiTable)
}

// aiMessage represents a chat message
type aiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// aiChatResponse represents the unified response from AI providers
type aiChatResponse struct {
	Content string
	Model   string
	Usage   aiUsage
}

type aiUsage struct {
	InputTokens  int
	OutputTokens int
}

// luaMessagesToGo converts a Lua table of messages to Go
func luaMessagesToGo(_ *lua.LState, tbl *lua.LTable) []aiMessage {
	var messages []aiMessage
	tbl.ForEach(func(_, v lua.LValue) {
		if msgTbl, ok := v.(*lua.LTable); ok {
			msg := aiMessage{
				Role:    lua.LVAsString(msgTbl.RawGetString("role")),
				Content: lua.LVAsString(msgTbl.RawGetString("content")),
			}
			if msg.Role != "" && msg.Content != "" {
				messages = append(messages, msg)
			}
		}
	})
	return messages
}

// aiResponseToLuaTable converts an AI response to a Lua table
func aiResponseToLuaTable(L *lua.LState, resp *aiChatResponse) *lua.LTable {
	tbl := L.NewTable()
	L.SetField(tbl, "content", lua.LString(resp.Content))
	L.SetField(tbl, "model", lua.LString(resp.Model))

	usageTbl := L.NewTable()
	L.SetField(usageTbl, "input_tokens", lua.LNumber(resp.Usage.InputTokens))
	L.SetField(usageTbl, "output_tokens", lua.LNumber(resp.Usage.OutputTokens))
	L.SetField(tbl, "usage", usageTbl)

	return tbl
}

// OpenAI API structures
type openAIRequest struct {
	Model       string      `json:"model"`
	Messages    []aiMessage `json:"messages"`
	MaxTokens   int         `json:"max_tokens,omitempty"`
	Temperature float64     `json:"temperature,omitempty"`
}

type openAIResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
	} `json:"usage"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func callOpenAI(httpClient internalhttp.Client, envStore env.Store, functionID, endpoint, model string, messages []aiMessage, maxTokens int, temperature float64) (*aiChatResponse, error) {
	// Get API key from environment
	apiKey, err := envStore.Get(functionID, "OPENAI_API_KEY")
	if err != nil || apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY not set in function environment")
	}

	// Determine endpoint
	if endpoint == "" {
		endpoint, _ = envStore.Get(functionID, "OPENAI_ENDPOINT")
		if endpoint == "" {
			endpoint = defaultOpenAIEndpoint
		}
	}

	// Build request
	reqBody := openAIRequest{
		Model:     model,
		Messages:  messages,
		MaxTokens: maxTokens,
	}
	if temperature > 0 {
		reqBody.Temperature = temperature
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Make HTTP request
	resp, err := httpClient.Post(internalhttp.Request{
		URL: endpoint + "/chat/completions",
		Headers: internalhttp.Headers{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + apiKey,
		},
		Body: string(jsonBody),
	})
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}

	// Parse response
	var openAIResp openAIResponse
	if err := json.Unmarshal([]byte(resp.Body), &openAIResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Check for API error
	if openAIResp.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", openAIResp.Error.Message)
	}

	// Check for valid response
	if len(openAIResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	return &aiChatResponse{
		Content: openAIResp.Choices[0].Message.Content,
		Model:   openAIResp.Model,
		Usage: aiUsage{
			InputTokens:  openAIResp.Usage.PromptTokens,
			OutputTokens: openAIResp.Usage.CompletionTokens,
		},
	}, nil
}

// Anthropic API structures
type anthropicRequest struct {
	Model       string      `json:"model"`
	MaxTokens   int         `json:"max_tokens"`
	System      string      `json:"system,omitempty"`
	Messages    []aiMessage `json:"messages"`
	Temperature float64     `json:"temperature,omitempty"`
}

type anthropicResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
	Usage struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
	Error *struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error"`
}

func callAnthropic(httpClient internalhttp.Client, envStore env.Store, functionID, endpoint, model string, messages []aiMessage, maxTokens int, temperature float64) (*aiChatResponse, error) {
	// Get API key from environment
	apiKey, err := envStore.Get(functionID, "ANTHROPIC_API_KEY")
	if err != nil || apiKey == "" {
		return nil, fmt.Errorf("ANTHROPIC_API_KEY not set in function environment")
	}

	// Determine endpoint
	if endpoint == "" {
		endpoint, _ = envStore.Get(functionID, "ANTHROPIC_ENDPOINT")
		if endpoint == "" {
			endpoint = defaultAnthropicEndpoint
		}
	}

	// Extract system message if present (Anthropic handles it differently)
	var systemPrompt string
	var userMessages []aiMessage
	for _, msg := range messages {
		if msg.Role == "system" {
			systemPrompt = msg.Content
		} else {
			userMessages = append(userMessages, msg)
		}
	}

	// Build request
	reqBody := anthropicRequest{
		Model:     model,
		MaxTokens: maxTokens,
		System:    systemPrompt,
		Messages:  userMessages,
	}
	if temperature > 0 {
		reqBody.Temperature = temperature
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Make HTTP request
	resp, err := httpClient.Post(internalhttp.Request{
		URL: endpoint + "/v1/messages",
		Headers: internalhttp.Headers{
			"Content-Type":      "application/json",
			"x-api-key":         apiKey,
			"anthropic-version": anthropicVersion,
		},
		Body: string(jsonBody),
	})
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}

	// Parse response
	var anthropicResp anthropicResponse
	if err := json.Unmarshal([]byte(resp.Body), &anthropicResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Check for API error
	if anthropicResp.Error != nil {
		return nil, fmt.Errorf("anthropic API error: %s", anthropicResp.Error.Message)
	}

	// Check for valid response
	if len(anthropicResp.Content) == 0 {
		return nil, fmt.Errorf("no response from Anthropic")
	}

	// Concatenate all text content
	var content string
	for _, c := range anthropicResp.Content {
		if c.Type == "text" {
			content += c.Text
		}
	}

	return &aiChatResponse{
		Content: content,
		Model:   anthropicResp.Model,
		Usage: aiUsage{
			InputTokens:  anthropicResp.Usage.InputTokens,
			OutputTokens: anthropicResp.Usage.OutputTokens,
		},
	}, nil
}
