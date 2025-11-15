package runner

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"hash"

	"github.com/google/uuid"
	lua "github.com/yuin/gopher-lua"
)

// registerCrypto registers the crypto module with hashing and UUID functions
func registerCrypto(L *lua.LState) {
	cryptoModule := L.NewTable()

	// Hashing functions
	L.SetField(cryptoModule, "md5", L.NewFunction(cryptoMD5))
	L.SetField(cryptoModule, "sha1", L.NewFunction(cryptoSHA1))
	L.SetField(cryptoModule, "sha256", L.NewFunction(cryptoSHA256))
	L.SetField(cryptoModule, "sha512", L.NewFunction(cryptoSHA512))

	// HMAC functions
	L.SetField(cryptoModule, "hmac_sha1", L.NewFunction(cryptoHMACSHA1))
	L.SetField(cryptoModule, "hmac_sha256", L.NewFunction(cryptoHMACSHA256))
	L.SetField(cryptoModule, "hmac_sha512", L.NewFunction(cryptoHMACSHA512))

	// UUID function
	L.SetField(cryptoModule, "uuid", L.NewFunction(cryptoUUID))

	// Set the crypto module as a global
	L.SetGlobal("crypto", cryptoModule)
}

// cryptoMD5 computes MD5 hash of a string
// Usage: local hash = crypto.md5(str)
func cryptoMD5(L *lua.LState) int {
	str := L.CheckString(1)
	return hashString(L, md5.New(), str)
}

// cryptoSHA1 computes SHA1 hash of a string
// Usage: local hash = crypto.sha1(str)
func cryptoSHA1(L *lua.LState) int {
	str := L.CheckString(1)
	return hashString(L, sha1.New(), str)
}

// cryptoSHA256 computes SHA256 hash of a string
// Usage: local hash = crypto.sha256(str)
func cryptoSHA256(L *lua.LState) int {
	str := L.CheckString(1)
	return hashString(L, sha256.New(), str)
}

// cryptoSHA512 computes SHA512 hash of a string
// Usage: local hash = crypto.sha512(str)
func cryptoSHA512(L *lua.LState) int {
	str := L.CheckString(1)
	return hashString(L, sha512.New(), str)
}

// cryptoHMACSHA1 computes HMAC-SHA1 of a message with a secret key
// Usage: local hash = crypto.hmac_sha1(message, key)
func cryptoHMACSHA1(L *lua.LState) int {
	message := L.CheckString(1)
	key := L.CheckString(2)
	return hmacString(L, sha1.New, message, key)
}

// cryptoHMACSHA256 computes HMAC-SHA256 of a message with a secret key
// Usage: local hash = crypto.hmac_sha256(message, key)
func cryptoHMACSHA256(L *lua.LState) int {
	message := L.CheckString(1)
	key := L.CheckString(2)
	return hmacString(L, sha256.New, message, key)
}

// cryptoHMACSHA512 computes HMAC-SHA512 of a message with a secret key
// Usage: local hash = crypto.hmac_sha512(message, key)
func cryptoHMACSHA512(L *lua.LState) int {
	message := L.CheckString(1)
	key := L.CheckString(2)
	return hmacString(L, sha512.New, message, key)
}

// cryptoUUID generates a new UUID v4
// Usage: local id = crypto.uuid()
func cryptoUUID(L *lua.LState) int {
	id := uuid.New()
	L.Push(lua.LString(id.String()))
	return 1
}

// hashString is a helper function to compute hash of a string
func hashString(L *lua.LState, h hash.Hash, str string) int {
	h.Write([]byte(str))
	hashBytes := h.Sum(nil)
	L.Push(lua.LString(hex.EncodeToString(hashBytes)))
	return 1
}

// hmacString is a helper function to compute HMAC of a string
func hmacString(L *lua.LState, hashFunc func() hash.Hash, message, key string) int {
	h := hmac.New(hashFunc, []byte(key))
	h.Write([]byte(message))
	hashBytes := h.Sum(nil)
	L.Push(lua.LString(hex.EncodeToString(hashBytes)))
	return 1
}
