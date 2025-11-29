package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLoadPort_Default(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	port := loadPort(getenv)

	if port != "3000" {
		t.Errorf("expected default port 3000, got %s", port)
	}
}

func TestLoadPort_FromEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "PORT" {
			return "8080"
		}
		return ""
	}

	port := loadPort(getenv)

	if port != "8080" {
		t.Errorf("expected port 8080, got %s", port)
	}
}

func TestLoadDataDir_Default(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	dataDir := loadDataDir(getenv, "")

	if dataDir != "./data" {
		t.Errorf("expected default data dir ./data, got %s", dataDir)
	}
}

func TestLoadDataDir_FromParameter(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	dataDir := loadDataDir(getenv, "/custom/path")

	if dataDir != "/custom/path" {
		t.Errorf("expected data dir /custom/path, got %s", dataDir)
	}
}

func TestLoadDataDir_FromEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "DATA_DIR" {
			return "/var/lib/lunar"
		}
		return ""
	}

	dataDir := loadDataDir(getenv, "")

	if dataDir != "/var/lib/lunar" {
		t.Errorf("expected data dir /var/lib/lunar, got %s", dataDir)
	}
}

func TestLoadTimeout_Default(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	timeout := loadTimeout(getenv)

	if timeout != 5*time.Minute {
		t.Errorf("expected default timeout 5m, got %v", timeout)
	}
}

func TestLoadTimeout_FromEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "EXECUTION_TIMEOUT" {
			return "120"
		}
		return ""
	}

	timeout := loadTimeout(getenv)

	if timeout != 120*time.Second {
		t.Errorf("expected timeout 120s, got %v", timeout)
	}
}

func TestLoadTimeout_Invalid(t *testing.T) {
	getenv := func(key string) string {
		if key == "EXECUTION_TIMEOUT" {
			return "invalid"
		}
		return ""
	}

	timeout := loadTimeout(getenv)

	if timeout != 5*time.Minute {
		t.Errorf("expected default timeout 5m for invalid input, got %v", timeout)
	}
}

func TestLoadAPIKey_FromEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "API_KEY" {
			return "test-key-from-env"
		}
		return ""
	}

	tmpDir := t.TempDir()
	apiKey, err := loadAPIKey(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if apiKey != "test-key-from-env" {
		t.Errorf("expected key 'test-key-from-env', got %s", apiKey)
	}

	// Verify no file was created when env var is set
	keyPath := filepath.Join(tmpDir, "api_key.txt")
	if _, err := os.Stat(keyPath); !os.IsNotExist(err) {
		t.Error("api_key.txt should not be created when API_KEY env var is set")
	}
}

func TestLoadAPIKey_FromFile(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	tmpDir := t.TempDir()
	keyPath := filepath.Join(tmpDir, "api_key.txt")

	// Create a key file
	expectedKey := "test-key-from-file"
	if err := os.WriteFile(keyPath, []byte(expectedKey), 0o600); err != nil {
		t.Fatalf("failed to create test key file: %v", err)
	}

	apiKey, err := loadAPIKey(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if apiKey != expectedKey {
		t.Errorf("expected key '%s', got %s", expectedKey, apiKey)
	}
}

func TestLoadAPIKey_GenerateNew(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	tmpDir := t.TempDir()

	apiKey, err := loadAPIKey(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should generate a 64-character hex string (32 bytes)
	if len(apiKey) != 64 {
		t.Errorf("expected 64-character key, got %d characters", len(apiKey))
	}

	// Verify the key was saved to file
	keyPath := filepath.Join(tmpDir, "api_key.txt")
	savedKey, err := os.ReadFile(keyPath)
	if err != nil {
		t.Fatalf("failed to read saved key file: %v", err)
	}

	if string(savedKey) != apiKey {
		t.Errorf("saved key doesn't match returned key")
	}

	// Verify file permissions
	info, err := os.Stat(keyPath)
	if err != nil {
		t.Fatalf("failed to stat key file: %v", err)
	}

	if info.Mode().Perm() != 0o600 {
		t.Errorf("expected file permissions 0600, got %o", info.Mode().Perm())
	}
}

func TestLoadAPIKey_EnvTakesPrecedence(t *testing.T) {
	getenv := func(key string) string {
		if key == "API_KEY" {
			return "env-key"
		}
		return ""
	}

	tmpDir := t.TempDir()
	keyPath := filepath.Join(tmpDir, "api_key.txt")

	// Create a different key in file
	if err := os.WriteFile(keyPath, []byte("file-key"), 0o600); err != nil {
		t.Fatalf("failed to create test key file: %v", err)
	}

	apiKey, err := loadAPIKey(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should prefer env var over file
	if apiKey != "env-key" {
		t.Errorf("expected env key 'env-key', got %s", apiKey)
	}
}

func TestLoadConfig_Defaults(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	tmpDir := t.TempDir()
	config, err := loadConfig(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if config.Port != "3000" {
		t.Errorf("expected default port 3000, got %s", config.Port)
	}

	if config.DataDir != tmpDir {
		t.Errorf("expected data dir %s, got %s", tmpDir, config.DataDir)
	}

	if config.ExecutionTimeout != 5*time.Minute {
		t.Errorf("expected default timeout 5m, got %v", config.ExecutionTimeout)
	}

	if len(config.APIKey) != 64 {
		t.Errorf("expected 64-character API key, got %d characters", len(config.APIKey))
	}
}

func TestLoadConfig_FromEnv(t *testing.T) {
	tmpDir := t.TempDir()
	env := map[string]string{
		"PORT":              "8080",
		"DATA_DIR":          tmpDir,
		"EXECUTION_TIMEOUT": "60",
		"API_KEY":           "custom-api-key",
	}

	getenv := func(key string) string {
		return env[key]
	}

	config, err := loadConfig(getenv, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if config.Port != "8080" {
		t.Errorf("expected port 8080, got %s", config.Port)
	}

	if config.DataDir != tmpDir {
		t.Errorf("expected data dir %s, got %s", tmpDir, config.DataDir)
	}

	if config.ExecutionTimeout != 60*time.Second {
		t.Errorf("expected timeout 60s, got %v", config.ExecutionTimeout)
	}

	if config.APIKey != "custom-api-key" {
		t.Errorf("expected API key 'custom-api-key', got %s", config.APIKey)
	}
}

func TestLoadConfig_PartialEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "PORT" {
			return "9000"
		}
		return ""
	}

	tmpDir := t.TempDir()
	config, err := loadConfig(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if config.Port != "9000" {
		t.Errorf("expected port 9000, got %s", config.Port)
	}

	if config.DataDir != tmpDir {
		t.Errorf("expected data dir %s, got %s", tmpDir, config.DataDir)
	}

	if config.ExecutionTimeout != 5*time.Minute {
		t.Errorf("expected default timeout 5m, got %v", config.ExecutionTimeout)
	}

	if len(config.APIKey) != 64 {
		t.Errorf("expected generated API key, got %s", config.APIKey)
	}
}

func TestLoadBaseURL_Default(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	baseURL := loadBaseURL(getenv, "3000")

	expected := "http://localhost:3000"
	if baseURL != expected {
		t.Errorf("expected base URL %s, got %s", expected, baseURL)
	}
}

func TestLoadBaseURL_DefaultCustomPort(t *testing.T) {
	getenv := func(key string) string {
		return ""
	}

	baseURL := loadBaseURL(getenv, "8080")

	expected := "http://localhost:8080"
	if baseURL != expected {
		t.Errorf("expected base URL %s, got %s", expected, baseURL)
	}
}

func TestLoadBaseURL_FromEnv(t *testing.T) {
	getenv := func(key string) string {
		if key == "BASE_URL" {
			return "https://myapp.example.com"
		}
		return ""
	}

	baseURL := loadBaseURL(getenv, "3000")

	expected := "https://myapp.example.com"
	if baseURL != expected {
		t.Errorf("expected base URL %s, got %s", expected, baseURL)
	}
}

func TestLoadBaseURL_EnvTakesPrecedence(t *testing.T) {
	getenv := func(key string) string {
		if key == "BASE_URL" {
			return "https://production.example.com"
		}
		return ""
	}

	baseURL := loadBaseURL(getenv, "9000")

	expected := "https://production.example.com"
	if baseURL != expected {
		t.Errorf("expected base URL %s, got %s", expected, baseURL)
	}
}

func TestLoadConfig_WithBaseURL(t *testing.T) {
	tmpDir := t.TempDir()
	env := map[string]string{
		"PORT":     "8080",
		"BASE_URL": "https://lunar.example.com",
		"API_KEY":  "test-key",
	}

	getenv := func(key string) string {
		return env[key]
	}

	config, err := loadConfig(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if config.BaseURL != "https://lunar.example.com" {
		t.Errorf("expected base URL 'https://lunar.example.com', got %s", config.BaseURL)
	}
}

func TestLoadConfig_BaseURLDefaultsToLocalhost(t *testing.T) {
	getenv := func(key string) string {
		if key == "PORT" {
			return "4000"
		}
		return ""
	}

	tmpDir := t.TempDir()
	config, err := loadConfig(getenv, tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "http://localhost:4000"
	if config.BaseURL != expected {
		t.Errorf("expected base URL %s, got %s", expected, config.BaseURL)
	}
}
