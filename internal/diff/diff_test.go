package diff

import (
	"strings"
	"testing"
)

func TestCompare_NoChanges(t *testing.T) {
	text := "line 1\nline 2\nline 3"
	result := Compare(text, text)

	if len(result.Lines) != 3 {
		t.Errorf("expected 3 lines, got %d", len(result.Lines))
	}

	for i, line := range result.Lines {
		if line.Type != LineTypeUnchanged {
			t.Errorf("line %d: expected unchanged, got %s", i, line.Type)
		}
		if line.OldLine == nil || line.NewLine == nil {
			t.Errorf("line %d: expected both line numbers to be set", i)
		}
		if *line.OldLine != i+1 || *line.NewLine != i+1 {
			t.Errorf("line %d: expected line numbers %d, got old=%d new=%d", i, i+1, *line.OldLine, *line.NewLine)
		}
	}
}

func TestCompare_AddedLines(t *testing.T) {
	oldText := "line 1\nline 2"
	newText := "line 1\nline 2\nline 3"

	result := Compare(oldText, newText)

	if len(result.Lines) != 3 {
		t.Fatalf("expected 3 lines, got %d", len(result.Lines))
	}

	// First two lines should be unchanged
	for i := 0; i < 2; i++ {
		if result.Lines[i].Type != LineTypeUnchanged {
			t.Errorf("line %d: expected unchanged, got %s", i, result.Lines[i].Type)
		}
	}

	// Last line should be added
	if result.Lines[2].Type != LineTypeAdded {
		t.Errorf("line 2: expected added, got %s", result.Lines[2].Type)
	}
	if result.Lines[2].OldLine != nil {
		t.Errorf("line 2: expected no old line number")
	}
	if result.Lines[2].NewLine == nil || *result.Lines[2].NewLine != 3 {
		t.Errorf("line 2: expected new line number 3")
	}
}

func TestCompare_RemovedLines(t *testing.T) {
	oldText := "line 1\nline 2\nline 3"
	newText := "line 1\nline 2"

	result := Compare(oldText, newText)

	if len(result.Lines) != 3 {
		t.Fatalf("expected 3 lines, got %d", len(result.Lines))
	}

	// First two lines should be unchanged
	for i := 0; i < 2; i++ {
		if result.Lines[i].Type != LineTypeUnchanged {
			t.Errorf("line %d: expected unchanged, got %s", i, result.Lines[i].Type)
		}
	}

	// Last line should be removed
	if result.Lines[2].Type != LineTypeRemoved {
		t.Errorf("line 2: expected removed, got %s", result.Lines[2].Type)
	}
	if result.Lines[2].OldLine == nil || *result.Lines[2].OldLine != 3 {
		t.Errorf("line 2: expected old line number 3")
	}
	if result.Lines[2].NewLine != nil {
		t.Errorf("line 2: expected no new line number")
	}
}

func TestCompare_ModifiedLines(t *testing.T) {
	oldText := "line 1\nold line 2\nline 3"
	newText := "line 1\nnew line 2\nline 3"

	result := Compare(oldText, newText)

	if len(result.Lines) < 4 {
		t.Fatalf("expected at least 4 lines, got %d", len(result.Lines))
	}

	// Should contain both removed and added versions of line 2
	hasRemoved := false
	hasAdded := false
	for _, line := range result.Lines {
		if line.Type == LineTypeRemoved && line.Content == "old line 2" {
			hasRemoved = true
		}
		if line.Type == LineTypeAdded && line.Content == "new line 2" {
			hasAdded = true
		}
	}

	if !hasRemoved {
		t.Error("expected to find removed line 'old line 2'")
	}
	if !hasAdded {
		t.Error("expected to find added line 'new line 2'")
	}
}

func TestCompare_LuaCode(t *testing.T) {
	oldCode := `function handler(ctx, event)
  log.info("Old version")
  return {statusCode = 200}
end`

	newCode := `function handler(ctx, event)
  log.info("New version")
  return {statusCode = 200}
end`

	result := Compare(oldCode, newCode)

	// Should have some lines
	if len(result.Lines) == 0 {
		t.Fatal("expected some diff lines")
	}

	// Should have both removed and added lines for the log statement
	hasRemoved := false
	hasAdded := false
	for _, line := range result.Lines {
		if line.Type == LineTypeRemoved && strings.Contains(line.Content, "Old version") {
			hasRemoved = true
		}
		if line.Type == LineTypeAdded && strings.Contains(line.Content, "New version") {
			hasAdded = true
		}
	}

	if !hasRemoved {
		t.Error("expected to find removed line with 'Old version'")
	}
	if !hasAdded {
		t.Error("expected to find added line with 'New version'")
	}
}
