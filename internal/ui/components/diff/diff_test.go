package diff

import (
	"testing"
)

func TestGetTypeColor(t *testing.T) {
	tests := []struct {
		name     string
		lineType LineType
		wantNil  bool
	}{
		{
			name:     "added line returns green color",
			lineType: LineAdded,
			wantNil:  false,
		},
		{
			name:     "removed line returns red color",
			lineType: LineRemoved,
			wantNil:  false,
		},
		{
			name:     "unchanged line returns muted color",
			lineType: LineUnchanged,
			wantNil:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getTypeColor(tt.lineType)
			if (result == nil) != tt.wantNil {
				t.Errorf("getTypeColor(%v) returned nil = %v, want nil = %v", tt.lineType, result == nil, tt.wantNil)
			}
		})
	}
}

func TestGetContentColor(t *testing.T) {
	tests := []struct {
		name     string
		lineType LineType
		wantNil  bool
	}{
		{
			name:     "added line returns green content color",
			lineType: LineAdded,
			wantNil:  false,
		},
		{
			name:     "removed line returns red content color",
			lineType: LineRemoved,
			wantNil:  false,
		},
		{
			name:     "unchanged line returns default content color",
			lineType: LineUnchanged,
			wantNil:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getContentColor(tt.lineType)
			if (result == nil) != tt.wantNil {
				t.Errorf("getContentColor(%v) returned nil = %v, want nil = %v", tt.lineType, result == nil, tt.wantNil)
			}
		})
	}
}

func TestGetTypeSymbol(t *testing.T) {
	tests := []struct {
		name     string
		lineType LineType
		want     string
	}{
		{
			name:     "added line returns plus",
			lineType: LineAdded,
			want:     "+",
		},
		{
			name:     "removed line returns minus",
			lineType: LineRemoved,
			want:     "-",
		},
		{
			name:     "unchanged line returns space",
			lineType: LineUnchanged,
			want:     " ",
		},
		{
			name:     "unknown type returns space",
			lineType: LineType("unknown"),
			want:     " ",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getTypeSymbol(tt.lineType)
			if result != tt.want {
				t.Errorf("getTypeSymbol(%v) = %q, want %q", tt.lineType, result, tt.want)
			}
		})
	}
}

func TestIntToString(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  string
	}{
		{
			name:  "single digit",
			input: 5,
			want:  "5",
		},
		{
			name:  "double digit",
			input: 42,
			want:  "42",
		},
		{
			name:  "triple digit",
			input: 100,
			want:  "100",
		},
		{
			name:  "zero",
			input: 0,
			want:  "0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := intToString(tt.input)
			if result != tt.want {
				t.Errorf("intToString(%d) = %q, want %q", tt.input, result, tt.want)
			}
		})
	}
}

func TestLineTypeConstants(t *testing.T) {
	if LineAdded != "added" {
		t.Errorf("LineAdded = %q, want %q", LineAdded, "added")
	}
	if LineRemoved != "removed" {
		t.Errorf("LineRemoved = %q, want %q", LineRemoved, "removed")
	}
	if LineUnchanged != "unchanged" {
		t.Errorf("LineUnchanged = %q, want %q", LineUnchanged, "unchanged")
	}
}
