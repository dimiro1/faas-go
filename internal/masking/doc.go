// Package masking provides utilities for redacting sensitive data from HTTP events
// and log messages before storage.
//
// Sensitive data includes: Authorization headers, Cookies, API keys, tokens, passwords,
// and secrets. Detection is based on field names and regex patterns.
//
// Masking is applied automatically before storing event JSON and log messages in the database.
// The original unmasked data is still passed to Lua function handlers.
package masking
