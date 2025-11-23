package api_reference

import (
	"testing"
)

func TestGetTypeColor(t *testing.T) {
	tests := []struct {
		name     string
		itemType string
		wantNil  bool
	}{
		{name: "string type", itemType: "string", wantNil: false},
		{name: "number type", itemType: "number", wantNil: false},
		{name: "table type", itemType: "table", wantNil: false},
		{name: "function type", itemType: "function", wantNil: false},
		{name: "module type", itemType: "module", wantNil: false},
		{name: "unknown type", itemType: "unknown", wantNil: false},
		{name: "empty type", itemType: "", wantNil: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getTypeColor(tt.itemType)
			if (result == nil) != tt.wantNil {
				t.Errorf("getTypeColor(%q) returned nil = %v, want nil = %v", tt.itemType, result == nil, tt.wantNil)
			}
		})
	}
}

func TestDocItem(t *testing.T) {
	tests := []struct {
		name string
		item DocItem
	}{
		{
			name: "ctx item",
			item: DocItem{
				Name:        "ctx.method",
				Type:        "string",
				Description: "HTTP method",
			},
		},
		{
			name: "event item",
			item: DocItem{
				Name:        "event.body",
				Type:        "string",
				Description: "Request body",
			},
		},
		{
			name: "module item",
			item: DocItem{
				Name:        "json",
				Type:        "module",
				Description: "JSON utilities",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.item.Name == "" {
				t.Error("Name should not be empty")
			}
			if tt.item.Type == "" {
				t.Error("Type should not be empty")
			}
			if tt.item.Description == "" {
				t.Error("Description should not be empty")
			}
		})
	}
}

func TestSection(t *testing.T) {
	tests := []struct {
		name    string
		section Section
	}{
		{
			name: "section with items",
			section: Section{
				ID:          "ctx",
				Name:        "Context",
				Description: "Context object",
				Active:      true,
				Items: []DocItem{
					{Name: "ctx.method", Type: "string", Description: "HTTP method"},
				},
			},
		},
		{
			name: "section inactive",
			section: Section{
				ID:          "event",
				Name:        "Event",
				Description: "Event object",
				Active:      false,
				Items: []DocItem{
					{Name: "event.body", Type: "string", Description: "Request body"},
				},
			},
		},
		{
			name: "section with multiple items",
			section: Section{
				ID:          "modules",
				Name:        "Modules",
				Description: "Built-in modules",
				Active:      false,
				Items: []DocItem{
					{Name: "json", Type: "module", Description: "JSON utilities"},
					{Name: "log", Type: "module", Description: "Logging utilities"},
					{Name: "http", Type: "module", Description: "HTTP client"},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.section.ID == "" {
				t.Error("ID should not be empty")
			}
			if tt.section.Name == "" {
				t.Error("Name should not be empty")
			}
			if tt.section.Description == "" {
				t.Error("Description should not be empty")
			}
			if len(tt.section.Items) == 0 {
				t.Error("Items should not be empty")
			}
		})
	}
}
