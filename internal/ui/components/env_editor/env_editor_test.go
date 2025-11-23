package env_editor

import (
	"bytes"
	"context"
	"strings"
	"testing"
)

func TestEditor(t *testing.T) {
	tests := []struct {
		name     string
		props    Props
		contains []string
	}{
		{
			name: "renders empty editor",
			props: Props{
				ID:      "test-editor",
				Action:  "/api/env",
				EnvVars: []EnvVar{},
			},
			contains: []string{
				`id="test-editor"`,
				`action="/api/env"`,
				`method="POST"`,
				"Add Variable",
				`aria-label="Add new environment variable"`,
			},
		},
		{
			name: "renders with env vars",
			props: Props{
				ID:     "test-editor",
				Action: "/api/env",
				EnvVars: []EnvVar{
					{Key: "DATABASE_URL", Value: "postgres://localhost"},
					{Key: "API_KEY", Value: "secret123"},
				},
			},
			contains: []string{
				"DATABASE_URL",
				"postgres://localhost",
				"API_KEY",
				"secret123",
				`data-state="original"`,
				`name="env_key[]"`,
				`name="env_value[]"`,
				`name="env_state[]"`,
			},
		},
		{
			name: "uses custom method",
			props: Props{
				ID:      "test-editor",
				Action:  "/api/env",
				Method:  "PUT",
				EnvVars: []EnvVar{},
			},
			contains: []string{
				`method="PUT"`,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			err := Editor(tt.props).Render(context.Background(), &buf)
			if err != nil {
				t.Fatalf("failed to render: %v", err)
			}

			html := buf.String()
			for _, s := range tt.contains {
				if !strings.Contains(html, s) {
					t.Errorf("expected HTML to contain %q", s)
				}
			}
		})
	}
}

func TestEnvRow(t *testing.T) {
	tests := []struct {
		name     string
		env      EnvVar
		state    string
		contains []string
	}{
		{
			name:  "renders original state",
			env:   EnvVar{Key: "TEST_KEY", Value: "test_value"},
			state: "original",
			contains: []string{
				"TEST_KEY",
				"test_value",
				`data-state="original"`,
				`value="original"`,
				`title="Remove"`,
				`aria-label="Remove variable"`,
				`data-removed="false"`,
			},
		},
		{
			name:  "renders removed state",
			env:   EnvVar{Key: "REMOVED_KEY", Value: "removed_value"},
			state: "removed",
			contains: []string{
				"REMOVED_KEY",
				`data-state="removed"`,
				`value="removed"`,
				`title="Restore"`,
				`aria-label="Restore variable"`,
				`data-removed="true"`,
				"disabled",
			},
		},
		{
			name:  "renders added state",
			env:   EnvVar{Key: "NEW_KEY", Value: "new_value"},
			state: "added",
			contains: []string{
				"NEW_KEY",
				`data-state="added"`,
				`value="added"`,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			err := EnvRow(tt.env, tt.state).Render(context.Background(), &buf)
			if err != nil {
				t.Fatalf("failed to render: %v", err)
			}

			html := buf.String()
			for _, s := range tt.contains {
				if !strings.Contains(html, s) {
					t.Errorf("expected HTML to contain %q", s)
				}
			}
		})
	}
}

func TestGetMethod(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"", "POST"},
		{"POST", "POST"},
		{"PUT", "PUT"},
		{"PATCH", "PATCH"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := getMethod(tt.input)
			if result != tt.expected {
				t.Errorf("getMethod(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestGetButtonTitle(t *testing.T) {
	tests := []struct {
		state    string
		expected string
	}{
		{"original", "Remove"},
		{"added", "Remove"},
		{"removed", "Restore"},
	}

	for _, tt := range tests {
		t.Run(tt.state, func(t *testing.T) {
			result := getButtonTitle(tt.state)
			if result != tt.expected {
				t.Errorf("getButtonTitle(%q) = %q, want %q", tt.state, result, tt.expected)
			}
		})
	}
}

func TestGetDataRemoved(t *testing.T) {
	tests := []struct {
		state    string
		expected string
	}{
		{"original", "false"},
		{"added", "false"},
		{"removed", "true"},
	}

	for _, tt := range tests {
		t.Run(tt.state, func(t *testing.T) {
			result := getDataRemoved(tt.state)
			if result != tt.expected {
				t.Errorf("getDataRemoved(%q) = %q, want %q", tt.state, result, tt.expected)
			}
		})
	}
}

func TestNewRowTemplate(t *testing.T) {
	var buf bytes.Buffer
	err := NewRowTemplate().Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	html := buf.String()
	contains := []string{
		`<template id="env-row-template">`,
		`data-state="added"`,
		`name="env_key[]"`,
		`name="env_value[]"`,
		`name="env_state[]"`,
		`value="added"`,
		`aria-label="Environment variable name"`,
		`aria-label="Environment variable value"`,
		`aria-label="Remove variable"`,
	}

	for _, s := range contains {
		if !strings.Contains(html, s) {
			t.Errorf("expected HTML to contain %q", s)
		}
	}
}
