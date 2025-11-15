package runner

import (
	"time"

	lua "github.com/yuin/gopher-lua"
)

// registerTime registers the time module with time-related functions
func registerTime(L *lua.LState) {
	timeModule := L.NewTable()

	// Register time functions
	L.SetField(timeModule, "now", L.NewFunction(timeNow))
	L.SetField(timeModule, "format", L.NewFunction(timeFormat))
	L.SetField(timeModule, "parse", L.NewFunction(timeParse))
	L.SetField(timeModule, "sleep", L.NewFunction(timeSleep))

	// Set the time module as a global
	L.SetGlobal("time", timeModule)
}

// timeNow returns the current Unix timestamp in seconds
// Usage: local timestamp = time.now()
func timeNow(L *lua.LState) int {
	now := time.Now().Unix()
	L.Push(lua.LNumber(now))
	return 1
}

// timeFormat formats a Unix timestamp to a string
// Uses Go's time format layout (e.g., "2006-01-02 15:04:05")
// Usage: local formatted = time.format(timestamp, layout)
func timeFormat(L *lua.LState) int {
	timestamp := L.CheckNumber(1)
	layout := L.CheckString(2)

	t := time.Unix(int64(timestamp), 0)
	formatted := t.Format(layout)

	L.Push(lua.LString(formatted))
	return 1
}

// timeParse parses a time string according to a layout
// Returns Unix timestamp or nil + error
// Usage: local timestamp, err = time.parse(timeStr, layout)
func timeParse(L *lua.LState) int {
	timeStr := L.CheckString(1)
	layout := L.CheckString(2)

	t, err := time.Parse(layout, timeStr)
	if err != nil {
		L.Push(lua.LNil)
		L.Push(lua.LString(err.Error()))
		return 2
	}

	L.Push(lua.LNumber(t.Unix()))
	L.Push(lua.LNil)
	return 2
}

// timeSleep sleeps for the specified number of milliseconds
// Note: This will block the Lua execution
// Usage: time.sleep(1000)  -- sleep for 1 second
func timeSleep(L *lua.LState) int {
	milliseconds := L.CheckNumber(1)
	duration := time.Duration(milliseconds) * time.Millisecond

	// Check if context is cancelled to respect timeouts
	select {
	case <-L.Context().Done():
		return 0
	case <-time.After(duration):
		return 0
	}
}
