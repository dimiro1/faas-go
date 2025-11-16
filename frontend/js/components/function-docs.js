// Comprehensive API documentation sidebar for function development
export const FunctionDocs = {
  view: () => {
    return m(".docs-sidebar", [
      m(".docs-header", [
        m("h3", "API Reference"),
        m("p.docs-subtitle", "Available APIs in your functions"),
      ]),

      m(".docs-content", [
        // Context (ctx)
        m(".docs-section", [
          m("h4.docs-section-title", "ctx"),
          m("p.docs-section-desc", "Execution context"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "ctx.executionId"),
              m("span.docs-desc", "Unique execution ID"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.functionId"),
              m("span.docs-desc", "Function ID"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.functionName"),
              m("span.docs-desc", "Function name"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.version"),
              m("span.docs-desc", "Function version"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.requestId"),
              m("span.docs-desc", "HTTP request ID"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.startedAt"),
              m("span.docs-desc", "Start timestamp"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "ctx.baseUrl"),
              m("span.docs-desc", "Base URL of server"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `log.info("Execution: " .. ctx.executionId)
-- Build full URL for callback
local callback = ctx.baseUrl .. "/fn/" .. ctx.functionId`,
              ),
            ],
          ),
        ]),

        // Event
        m(".docs-section", [
          m("h4.docs-section-title", "event"),
          m("p.docs-section-desc", "HTTP request event"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "event.method"),
              m("span.docs-desc", "HTTP method"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "event.path"),
              m("span.docs-desc", "Request path"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "event.body"),
              m("span.docs-desc", "Request body"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "event.headers"),
              m("span.docs-desc", "Request headers (table)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "event.query"),
              m("span.docs-desc", "Query parameters (table)"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local name = event.query.name or "World"
local data = json.decode(event.body)`,
              ),
            ],
          ),
        ]),

        // Logger
        m(".docs-section", [
          m("h4.docs-section-title", "log"),
          m("p.docs-section-desc", "Logging utilities"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "log.info(message)"),
              m("span.docs-desc", "Log info message"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "log.debug(message)"),
              m("span.docs-desc", "Log debug message"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "log.warn(message)"),
              m("span.docs-desc", "Log warning"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "log.error(message)"),
              m("span.docs-desc", "Log error"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `log.info("Function started")
log.error("Failed: " .. err)`,
              ),
            ],
          ),
        ]),

        // KV Store
        m(".docs-section", [
          m("h4.docs-section-title", "kv"),
          m("p.docs-section-desc", "Key-value storage"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "kv.get(key)"),
              m("span.docs-desc", "Get value by key"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "kv.set(key, value)"),
              m("span.docs-desc", "Set key-value pair"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "kv.delete(key)"),
              m("span.docs-desc", "Delete key"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local count = kv.get("counter") or "0"
kv.set("counter", tostring(tonumber(count) + 1))`,
              ),
            ],
          ),
        ]),

        // Environment
        m(".docs-section", [
          m("h4.docs-section-title", "env"),
          m("p.docs-section-desc", "Environment variables"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "env.get(key)"),
              m("span.docs-desc", "Get environment variable"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [m("code.language-lua", `local apiKey = env.get("API_KEY")`)],
          ),
        ]),

        // HTTP
        m(".docs-section", [
          m("h4.docs-section-title", "http"),
          m("p.docs-section-desc", "HTTP client"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "http.get(url)"),
              m("span.docs-desc", "GET request"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "http.post(url, body)"),
              m("span.docs-desc", "POST request"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "http.put(url, body)"),
              m("span.docs-desc", "PUT request"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "http.delete(url)"),
              m("span.docs-desc", "DELETE request"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local res = http.get("https://api.example.com/data")
local data = json.decode(res.body)`,
              ),
            ],
          ),
        ]),

        // JSON
        m(".docs-section", [
          m("h4.docs-section-title", "json"),
          m("p.docs-section-desc", "JSON encoding/decoding"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "json.encode(table)"),
              m("span.docs-desc", "Encode table to JSON"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "json.decode(str)"),
              m("span.docs-desc", "Decode JSON to table"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local data = {name = "John", age = 30}
local jsonStr = json.encode(data)`,
              ),
            ],
          ),
        ]),

        // Crypto
        m(".docs-section", [
          m("h4.docs-section-title", "crypto"),
          m("p.docs-section-desc", "Cryptographic functions"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "crypto.md5(str)"),
              m("span.docs-desc", "MD5 hash (hex)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "crypto.sha1(str)"),
              m("span.docs-desc", "SHA1 hash (hex)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "crypto.sha256(str)"),
              m("span.docs-desc", "SHA256 hash (hex)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "crypto.sha512(str)"),
              m("span.docs-desc", "SHA512 hash (hex)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "crypto.hmac_sha256(msg, key)"),
              m("span.docs-desc", "HMAC-SHA256 (hex)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "crypto.uuid()"),
              m("span.docs-desc", "Generate UUID v4"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local hash = crypto.sha256("hello")
local id = crypto.uuid()`,
              ),
            ],
          ),
        ]),

        // Time
        m(".docs-section", [
          m("h4.docs-section-title", "time"),
          m("p.docs-section-desc", "Time utilities"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "time.now()"),
              m("span.docs-desc", "Unix timestamp (seconds)"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "time.format(ts, layout)"),
              m("span.docs-desc", "Format timestamp"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "time.sleep(ms)"),
              m("span.docs-desc", "Sleep milliseconds"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local now = time.now()
time.sleep(1000) -- wait 1 second`,
              ),
            ],
          ),
        ]),

        // URL
        m(".docs-section", [
          m("h4.docs-section-title", "url"),
          m("p.docs-section-desc", "URL utilities"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "url.parse(str)"),
              m("span.docs-desc", "Parse URL"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "url.encode(str)"),
              m("span.docs-desc", "URL encode"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "url.decode(str)"),
              m("span.docs-desc", "URL decode"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local encoded = url.encode("hello world")
-- Result: "hello%20world"`,
              ),
            ],
          ),
        ]),

        // Strings
        m(".docs-section", [
          m("h4.docs-section-title", "strings"),
          m("p.docs-section-desc", "String manipulation"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "strings.trim(str)"),
              m("span.docs-desc", "Remove whitespace"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "strings.split(str, sep)"),
              m("span.docs-desc", "Split by separator"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "strings.join(arr, sep)"),
              m("span.docs-desc", "Join array"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "strings.toLower(str)"),
              m("span.docs-desc", "To lowercase"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "strings.toUpper(str)"),
              m("span.docs-desc", "To uppercase"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "strings.contains(str, sub)"),
              m("span.docs-desc", "Check substring"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local parts = strings.split("a,b,c", ",")
local upper = strings.toUpper("hello")`,
              ),
            ],
          ),
        ]),

        // Random
        m(".docs-section", [
          m("h4.docs-section-title", "random"),
          m("p.docs-section-desc", "Random generators"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "random.int(min, max)"),
              m("span.docs-desc", "Random integer"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "random.float()"),
              m("span.docs-desc", "Random 0.0-1.0"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "random.string(len)"),
              m("span.docs-desc", "Random alphanumeric"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "random.id()"),
              m("span.docs-desc", "Sortable unique ID"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local num = random.int(1, 100)
local token = random.string(32)`,
              ),
            ],
          ),
        ]),

        // Base64
        m(".docs-section", [
          m("h4.docs-section-title", "base64"),
          m("p.docs-section-desc", "Base64 encoding"),
          m(".docs-methods", [
            m(".docs-method", [
              m("code.docs-signature", "base64.encode(str)"),
              m("span.docs-desc", "Encode to base64"),
            ]),
            m(".docs-method", [
              m("code.docs-signature", "base64.decode(str)"),
              m("span.docs-desc", "Decode from base64"),
            ]),
          ]),
          m(
            "pre.docs-example",
            {
              oncreate: (vnode) => {
                hljs.highlightElement(vnode.dom.querySelector("code"));
              },
            },
            [
              m(
                "code.language-lua",
                `local encoded = base64.encode("hello")
local decoded = base64.decode(encoded)`,
              ),
            ],
          ),
        ]),
      ]),
    ]);
  },
};
