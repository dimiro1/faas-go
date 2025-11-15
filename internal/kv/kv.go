package kv

import (
	"database/sql"
	"fmt"
)

// Error represents a KV store error
type Error struct {
	Message string
}

func (e *Error) Error() string {
	return fmt.Sprintf("KV error: %s", e.Message)
}

// Store is an interface for key-value storage operations
// namespace is typically the function ID to isolate data between functions
type Store interface {
	Get(namespace, key string) (string, error)
	Set(namespace, key, value string) error
	Delete(namespace, key string) error
}

// MemoryStore is an in-memory implementation of Store
type MemoryStore struct {
	data map[string]map[string]string // namespace -> key -> value
}

// NewMemoryStore creates a new in-memory KV store
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		data: make(map[string]map[string]string),
	}
}

// Get retrieves a value by namespace and key
func (m *MemoryStore) Get(namespace, key string) (string, error) {
	ns, exists := m.data[namespace]
	if !exists {
		return "", &Error{Message: fmt.Sprintf("key not found: %s", key)}
	}

	value, exists := ns[key]
	if !exists {
		return "", &Error{Message: fmt.Sprintf("key not found: %s", key)}
	}
	return value, nil
}

// Set stores a key-value pair in a namespace
func (m *MemoryStore) Set(namespace, key, value string) error {
	if _, exists := m.data[namespace]; !exists {
		m.data[namespace] = make(map[string]string)
	}
	m.data[namespace][key] = value
	return nil
}

// Delete removes a key-value pair from a namespace
func (m *MemoryStore) Delete(namespace, key string) error {
	if ns, exists := m.data[namespace]; exists {
		delete(ns, key)
	}
	return nil
}

// SQLiteStore is a SQLite-backed implementation of Store
type SQLiteStore struct {
	db *sql.DB
}

// NewSQLiteStore creates a new SQLite-backed KV store
func NewSQLiteStore(db *sql.DB) *SQLiteStore {
	return &SQLiteStore{db: db}
}

// Migrate runs the database migration for the KV store
func Migrate(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS kv_store (
		namespace TEXT NOT NULL,
		key TEXT NOT NULL,
		value TEXT NOT NULL,
		PRIMARY KEY (namespace, key)
	);
	CREATE INDEX IF NOT EXISTS idx_namespace ON kv_store(namespace);
	`

	if _, err := db.Exec(schema); err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	return nil
}

// Get retrieves a value by namespace and key
func (s *SQLiteStore) Get(namespace, key string) (string, error) {
	var value string
	err := s.db.QueryRow(
		"SELECT value FROM kv_store WHERE namespace = ? AND key = ?",
		namespace, key,
	).Scan(&value)

	if err == sql.ErrNoRows {
		return "", &Error{Message: fmt.Sprintf("key not found: %s", key)}
	}
	if err != nil {
		return "", fmt.Errorf("failed to get value: %w", err)
	}

	return value, nil
}

// Set stores a key-value pair in a namespace
func (s *SQLiteStore) Set(namespace, key, value string) error {
	_, err := s.db.Exec(
		"INSERT OR REPLACE INTO kv_store (namespace, key, value) VALUES (?, ?, ?)",
		namespace, key, value,
	)
	if err != nil {
		return fmt.Errorf("failed to set value: %w", err)
	}
	return nil
}

// Delete removes a key-value pair from a namespace
func (s *SQLiteStore) Delete(namespace, key string) error {
	_, err := s.db.Exec(
		"DELETE FROM kv_store WHERE namespace = ? AND key = ?",
		namespace, key,
	)
	if err != nil {
		return fmt.Errorf("failed to delete value: %w", err)
	}
	return nil
}
