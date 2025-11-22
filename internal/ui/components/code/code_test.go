package code

import (
	"strings"
	"testing"
)

func TestHighlightCode(t *testing.T) {
	tests := []struct {
		name      string
		code      string
		language  string
		showLines bool
		padded    bool
		wrap      bool
		contains  []string
	}{
		{
			name:     "JSON highlighting",
			code:     `{"key": "value"}`,
			language: "json",
			contains: []string{"<pre", "key", "value"},
		},
		{
			name:     "Go highlighting",
			code:     `func main() { fmt.Println("hello") }`,
			language: "go",
			contains: []string{"<pre", "func", "main"},
		},
		{
			name:      "with line numbers",
			code:      "line1\nline2",
			language:  "text",
			showLines: true,
			contains:  []string{"<pre"},
		},
		{
			name:     "with padding",
			code:     `{"test": true}`,
			language: "json",
			padded:   true,
			contains: []string{"padding: 1rem"},
		},
		{
			name:     "without padding",
			code:     `{"test": true}`,
			language: "json",
			padded:   false,
		},
		{
			name:     "with wrap",
			code:     `{"test": true}`,
			language: "json",
			wrap:     true,
			contains: []string{"white-space: pre-wrap"},
		},
		{
			name:     "unknown language falls back",
			code:     "some text",
			language: "unknown-lang",
			contains: []string{"<pre", "some text"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := highlightCode(tt.code, tt.language, tt.showLines, tt.padded, tt.wrap)

			for _, expected := range tt.contains {
				if !strings.Contains(result, expected) {
					t.Errorf("expected result to contain %q, got: %s", expected, result)
				}
			}

			if tt.padded && !strings.Contains(result, "padding: 1rem") {
				t.Errorf("expected padding when padded=true, got: %s", result)
			}
		})
	}
}

func TestEscapeHTML(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		padded   bool
		contains []string
	}{
		{
			name:     "escapes HTML characters",
			input:    "<script>alert('xss')</script>",
			contains: []string{"&lt;script&gt;", "&lt;/script&gt;"},
		},
		{
			name:     "escapes ampersand",
			input:    "foo & bar",
			contains: []string{"foo &amp; bar"},
		},
		{
			name:     "escapes quotes",
			input:    `say "hello"`,
			contains: []string{"&quot;hello&quot;"},
		},
		{
			name:     "with padding",
			input:    "test",
			padded:   true,
			contains: []string{"padding: 1rem"},
		},
		{
			name:     "without padding",
			input:    "test",
			padded:   false,
			contains: []string{"padding: 0"},
		},
		{
			name:     "wraps in pre tag",
			input:    "content",
			contains: []string{"<pre", "</pre>"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := escapeHTML(tt.input, tt.padded)

			for _, expected := range tt.contains {
				if !strings.Contains(result, expected) {
					t.Errorf("expected result to contain %q, got: %s", expected, result)
				}
			}
		})
	}
}
