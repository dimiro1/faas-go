// Package diff provides line-by-line text comparison functionality.
//
// This package compares two text strings and produces a structured diff
// showing which lines were added, removed, or unchanged.
//
// Example:
//
//	result := diff.Compare(oldText, newText)
//	for _, line := range result.Lines {
//	    fmt.Printf("%s: %s\n", line.Type, line.Content)
//	}
package diff
