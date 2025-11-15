package diff

import (
	"strings"

	"github.com/sergi/go-diff/diffmatchpatch"
)

// LineType represents the type of change in a diff line
type LineType string

const (
	LineTypeUnchanged LineType = "unchanged"
	LineTypeAdded     LineType = "added"
	LineTypeRemoved   LineType = "removed"
)

// Line represents a single line in a diff
type Line struct {
	Type    LineType
	OldLine *int
	NewLine *int
	Content string
}

// Result represents the result of comparing two texts
type Result struct {
	Lines []Line
}

// Compare generates a line-by-line diff between two text strings
func Compare(oldText, newText string) Result {
	dmp := diffmatchpatch.New()

	// Ensure both texts end with newline for consistent diff behavior
	if oldText != "" && !strings.HasSuffix(oldText, "\n") {
		oldText += "\n"
	}
	if newText != "" && !strings.HasSuffix(newText, "\n") {
		newText += "\n"
	}

	// Generate line-based diff
	chars1, chars2, lineArray := dmp.DiffLinesToChars(oldText, newText)
	diffArray := dmp.DiffMain(chars1, chars2, false)
	diffArray = dmp.DiffCharsToLines(diffArray, lineArray)

	// Convert to our Line format
	var lines []Line
	oldLineNum := 1
	newLineNum := 1

	for _, diff := range diffArray {
		// Skip empty diffs
		if diff.Text == "" {
			continue
		}

		textLines := strings.Split(strings.TrimSuffix(diff.Text, "\n"), "\n")

		for i, line := range textLines {
			// Skip the last empty line if it exists
			if line == "" && i == len(textLines)-1 {
				continue
			}

			switch diff.Type {
			case diffmatchpatch.DiffEqual:
				oldLine := oldLineNum
				newLine := newLineNum
				lines = append(lines, Line{
					Type:    LineTypeUnchanged,
					OldLine: &oldLine,
					NewLine: &newLine,
					Content: line,
				})
				oldLineNum++
				newLineNum++

			case diffmatchpatch.DiffDelete:
				oldLine := oldLineNum
				lines = append(lines, Line{
					Type:    LineTypeRemoved,
					OldLine: &oldLine,
					NewLine: nil,
					Content: line,
				})
				oldLineNum++

			case diffmatchpatch.DiffInsert:
				newLine := newLineNum
				lines = append(lines, Line{
					Type:    LineTypeAdded,
					OldLine: nil,
					NewLine: &newLine,
					Content: line,
				})
				newLineNum++
			}
		}
	}

	return Result{Lines: lines}
}
