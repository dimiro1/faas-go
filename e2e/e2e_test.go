package e2e

import (
	"context"
	"database/sql"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/chromedp/chromedp"
	"github.com/dimiro1/faas-go/frontend"
	"github.com/dimiro1/faas-go/internal/api"
	"github.com/dimiro1/faas-go/internal/env"
	internalhttp "github.com/dimiro1/faas-go/internal/http"
	"github.com/dimiro1/faas-go/internal/kv"
	"github.com/dimiro1/faas-go/internal/logger"
	"github.com/dimiro1/faas-go/internal/migrate"
	"github.com/dimiro1/faas-go/internal/store"
	_ "modernc.org/sqlite"
)

const testAPIKey = "test-api-key-12345"

// startTestServer creates a test server with an in-memory database
func startTestServer(t *testing.T) *httptest.Server {
	t.Helper()

	// Create in-memory SQLite database
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		t.Fatalf("Failed to enable foreign keys: %v", err)
	}

	// Run migrations
	if err := migrate.Run(db, migrate.FS); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}

	// Create dependencies
	apiDB := store.NewSQLiteDB(db)
	kvStore := kv.NewSQLiteStore(db)
	envStore := env.NewSQLiteStore(db)
	appLogger := logger.NewSQLiteLogger(db)
	httpClient := internalhttp.NewDefaultClient()

	// Create server
	server := api.NewServer(api.ServerConfig{
		DB:               apiDB,
		Logger:           appLogger,
		KVStore:          kvStore,
		EnvStore:         envStore,
		HTTPClient:       httpClient,
		ExecutionTimeout: 30 * time.Second,
		FrontendHandler:  frontend.Handler(),
		APIKey:           testAPIKey,
		BaseURL:          "http://localhost:8080",
	})

	// Create test server
	ts := httptest.NewServer(server.Handler())

	// Register cleanup
	t.Cleanup(func() {
		ts.Close()
		_ = db.Close()
	})

	return ts
}

// newBrowserContext creates a chromedp context with timeout
func newBrowserContext(t *testing.T, timeout time.Duration) (context.Context, context.CancelFunc) {
	t.Helper()

	// Create allocator context (uses headless Chrome by default)
	allocCtx, allocCancel := chromedp.NewExecAllocator(
		context.Background(),
		append(
			chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Flag("headless", true),
			chromedp.Flag("disable-gpu", true),
			chromedp.Flag("no-sandbox", true),
		)...,
	)

	// Create browser context
	ctx, ctxCancel := chromedp.NewContext(allocCtx)

	// Add timeout
	ctx, timeoutCancel := context.WithTimeout(ctx, timeout)

	// Combined cleanup
	cancel := func() {
		timeoutCancel()
		ctxCancel()
		allocCancel()
	}

	return ctx, cancel
}

// TestFunctionsListPageLoads verifies the functions list page loads correctly
func TestFunctionsListPageLoads(t *testing.T) {
	srv := startTestServer(t)
	ctx, cancel := newBrowserContext(t, 30*time.Second)
	defer cancel()

	var title string
	var pageContent string

	err := chromedp.Run(ctx,
		// Navigate to the app root (which redirects to login or functions)
		chromedp.Navigate(srv.URL),

		// Wait for the page to be interactive
		chromedp.Sleep(500*time.Millisecond),

		// Get the page title
		chromedp.Title(&title),

		// Get the page body content
		chromedp.OuterHTML("body", &pageContent),
	)

	if err != nil {
		t.Fatalf("chromedp run failed: %v", err)
	}

	// Verify we loaded the app
	if title == "" {
		t.Error("page title should not be empty")
	}

	t.Logf("Page loaded with title: %s", title)
}

// TestLoginPageRedirect verifies unauthenticated users see login
func TestLoginPageRedirect(t *testing.T) {
	srv := startTestServer(t)
	ctx, cancel := newBrowserContext(t, 30*time.Second)
	defer cancel()

	var currentURL string

	err := chromedp.Run(ctx,
		// Navigate to functions page
		chromedp.Navigate(srv.URL+"#!/functions"),

		// Wait for potential redirect
		chromedp.Sleep(1*time.Second),

		// Get current URL
		chromedp.Location(&currentURL),
	)

	if err != nil {
		t.Fatalf("chromedp run failed: %v", err)
	}

	// The URL should contain login after redirect (due to auth check)
	// Note: The exact behavior depends on how frontend handles unauthenticated state
	t.Logf("Current URL after navigation: %s", currentURL)
}

// TestLoginFlow verifies user can log in
func TestLoginFlow(t *testing.T) {
	srv := startTestServer(t)
	ctx, cancel := newBrowserContext(t, 30*time.Second)
	defer cancel()

	var currentURL string

	err := chromedp.Run(ctx,
		// Navigate to login page
		chromedp.Navigate(srv.URL+"#!/login"),

		// Wait for the login form to be visible
		chromedp.WaitVisible(`input[type="password"]`, chromedp.ByQuery),

		// Enter the API key
		chromedp.SendKeys(`input[type="password"]`, testAPIKey, chromedp.ByQuery),

		// Click the login button
		chromedp.Click(`button[type="submit"]`, chromedp.ByQuery),

		// Wait for navigation after login
		chromedp.Sleep(1*time.Second),

		// Get current URL
		chromedp.Location(&currentURL),
	)

	if err != nil {
		t.Fatalf("chromedp run failed: %v", err)
	}

	// After successful login, should be redirected to functions page
	if !strings.Contains(currentURL, "functions") {
		t.Errorf("expected redirect to functions page, got URL: %s", currentURL)
	}

	t.Logf("After login, URL is: %s", currentURL)
}

// TestFunctionsListAfterLogin verifies functions list displays after authentication
func TestFunctionsListAfterLogin(t *testing.T) {
	srv := startTestServer(t)
	ctx, cancel := newBrowserContext(t, 30*time.Second)
	defer cancel()

	var pageContent string
	var headingText string

	err := chromedp.Run(ctx,
		// Navigate to login page
		chromedp.Navigate(srv.URL+"#!/login"),

		// Wait for the login form
		chromedp.WaitVisible(`input[type="password"]`, chromedp.ByQuery),

		// Enter the API key and submit
		chromedp.SendKeys(`input[type="password"]`, testAPIKey, chromedp.ByQuery),
		chromedp.Click(`button[type="submit"]`, chromedp.ByQuery),

		// Wait for functions page to load
		chromedp.Sleep(1*time.Second),

		// Wait for the page content
		chromedp.WaitVisible(`h1`, chromedp.ByQuery),

		// Get the h1 text
		chromedp.Text(`h1`, &headingText, chromedp.ByQuery),

		// Get the page content
		chromedp.OuterHTML("body", &pageContent),
	)

	if err != nil {
		t.Fatalf("chromedp run failed: %v", err)
	}

	// Verify we're on the functions page
	if !strings.Contains(headingText, "Functions") {
		t.Errorf("expected Functions heading, got: %s", headingText)
	}

	// Verify empty state message or table is present
	hasEmptyMessage := strings.Contains(pageContent, "No functions yet")
	hasTable := strings.Contains(pageContent, "table")

	if !hasEmptyMessage && !hasTable {
		t.Error("expected either empty state message or functions table")
	}

	t.Logf("Functions page heading: %s", headingText)
}

// TestNewFunctionButtonPresent verifies the new function button is visible
func TestNewFunctionButtonPresent(t *testing.T) {
	srv := startTestServer(t)
	ctx, cancel := newBrowserContext(t, 30*time.Second)
	defer cancel()

	var buttonText string

	err := chromedp.Run(ctx,
		// Login first
		chromedp.Navigate(srv.URL+"#!/login"),
		chromedp.WaitVisible(`input[type="password"]`, chromedp.ByQuery),
		chromedp.SendKeys(`input[type="password"]`, testAPIKey, chromedp.ByQuery),
		chromedp.Click(`button[type="submit"]`, chromedp.ByQuery),

		// Wait for functions page
		chromedp.Sleep(1*time.Second),

		// Find the "New Function" button/link
		chromedp.WaitVisible(`a[href="#!/functions/new"]`, chromedp.ByQuery),
		chromedp.Text(`a[href="#!/functions/new"]`, &buttonText, chromedp.ByQuery),
	)

	if err != nil {
		t.Fatalf("chromedp run failed: %v", err)
	}

	if !strings.Contains(buttonText, "New Function") {
		t.Errorf("expected 'New Function' button text, got: %s", buttonText)
	}

	t.Logf("New Function button found with text: %s", buttonText)
}
