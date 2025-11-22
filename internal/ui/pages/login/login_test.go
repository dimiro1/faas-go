package login

import (
	"context"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
)

func TestLoginPage_RendersTitle(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	title := doc.Find("h1").Text()
	if title != "FaaS-Go" {
		t.Errorf("expected title 'FaaS-Go', got '%s'", title)
	}
}

func TestLoginPage_RendersSubtitle(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	html := buf.String()
	if !strings.Contains(html, "Enter your API key to continue") {
		t.Error("expected subtitle text not found")
	}
}

func TestLoginPage_RendersForm(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	form := doc.Find("form")
	if form.Length() == 0 {
		t.Error("expected form element not found")
	}

	method, _ := form.Attr("method")
	if method != "POST" {
		t.Errorf("expected form method 'POST', got '%s'", method)
	}

	action, _ := form.Attr("action")
	if action != "/login" {
		t.Errorf("expected form action '/login', got '%s'", action)
	}
}

func TestLoginPage_RendersPasswordInput(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	input := doc.Find("input#api-key")
	if input.Length() == 0 {
		t.Error("expected input#api-key not found")
	}

	inputType, _ := input.Attr("type")
	if inputType != "password" {
		t.Errorf("expected input type 'password', got '%s'", inputType)
	}

	name, _ := input.Attr("name")
	if name != "api_key" {
		t.Errorf("expected input name 'api_key', got '%s'", name)
	}

	_, required := input.Attr("required")
	if !required {
		t.Error("expected input to have required attribute")
	}
}

func TestLoginPage_RendersSubmitButton(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	button := doc.Find("button[type='submit']")
	if button.Length() == 0 {
		t.Error("expected submit button not found")
	}

	if !strings.Contains(button.Text(), "Login") {
		t.Errorf("expected button text 'Login', got '%s'", button.Text())
	}
}

func TestLoginPage_RendersFooter(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	html := buf.String()
	if !strings.Contains(html, "Check the server logs") {
		t.Error("expected footer text not found")
	}
}

func TestLoginPage_NoErrorByDefault(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	html := buf.String()
	if strings.Contains(html, "Error:") {
		t.Error("expected no error message when Error is empty")
	}
}

func TestLoginPage_ShowsErrorWhenProvided(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{
		Error: "Invalid API key",
	}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	html := buf.String()
	if !strings.Contains(html, "Invalid API key") {
		t.Error("expected error message not found")
	}
}

func TestLoginPage_RendersLabel(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	label := doc.Find("label[for='api-key']")
	if label.Length() == 0 {
		t.Error("expected label for api-key not found")
	}

	if !strings.Contains(label.Text(), "API Key") {
		t.Errorf("expected label text 'API Key', got '%s'", label.Text())
	}
}

func TestLoginPage_PageTitle(t *testing.T) {
	var buf strings.Builder
	err := LoginPage(LoginPageData{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	title := doc.Find("title").Text()
	if title != "FaaS Console - Login" {
		t.Errorf("expected page title 'FaaS Console - Login', got '%s'", title)
	}
}
