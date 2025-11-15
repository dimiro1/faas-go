package runner

import (
	"net/url"

	lua "github.com/yuin/gopher-lua"
)

// registerURL registers the url module with URL parsing and encoding functions
func registerURL(L *lua.LState) {
	urlModule := L.NewTable()

	// Register url functions
	L.SetField(urlModule, "parse", L.NewFunction(urlParse))
	L.SetField(urlModule, "encode", L.NewFunction(urlEncode))
	L.SetField(urlModule, "decode", L.NewFunction(urlDecode))

	// Set the url module as a global
	L.SetGlobal("url", urlModule)
}

// urlParse parses a URL string into components
// Usage: local parsed, err = url.parse(urlStr)
// Returns: { scheme, host, path, query, fragment }
func urlParse(L *lua.LState) int {
	urlStr := L.CheckString(1)

	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		L.Push(lua.LNil)
		L.Push(lua.LString(err.Error()))
		return 2
	}

	// Create result table
	result := L.NewTable()
	L.SetField(result, "scheme", lua.LString(parsedURL.Scheme))
	L.SetField(result, "host", lua.LString(parsedURL.Host))
	L.SetField(result, "path", lua.LString(parsedURL.Path))
	L.SetField(result, "fragment", lua.LString(parsedURL.Fragment))

	// Parse query parameters into a table
	if parsedURL.RawQuery != "" {
		queryTable := L.NewTable()
		queryValues := parsedURL.Query()
		for key, values := range queryValues {
			if len(values) == 1 {
				L.SetField(queryTable, key, lua.LString(values[0]))
			} else {
				// Multiple values - create an array
				arrayTable := L.NewTable()
				for i, v := range values {
					arrayTable.RawSetInt(i+1, lua.LString(v))
				}
				L.SetField(queryTable, key, arrayTable)
			}
		}
		L.SetField(result, "query", queryTable)
	} else {
		L.SetField(result, "query", L.NewTable())
	}

	// Add username and password if present
	if parsedURL.User != nil {
		username := parsedURL.User.Username()
		L.SetField(result, "username", lua.LString(username))

		if password, ok := parsedURL.User.Password(); ok {
			L.SetField(result, "password", lua.LString(password))
		}
	}

	L.Push(result)
	L.Push(lua.LNil)
	return 2
}

// urlEncode URL-encodes a string
// Usage: local encoded = url.encode(str)
func urlEncode(L *lua.LState) int {
	str := L.CheckString(1)
	encoded := url.QueryEscape(str)
	L.Push(lua.LString(encoded))
	return 1
}

// urlDecode URL-decodes a string
// Usage: local decoded, err = url.decode(str)
func urlDecode(L *lua.LState) int {
	str := L.CheckString(1)

	decoded, err := url.QueryUnescape(str)
	if err != nil {
		L.Push(lua.LNil)
		L.Push(lua.LString(err.Error()))
		return 2
	}

	L.Push(lua.LString(decoded))
	L.Push(lua.LNil)
	return 2
}
