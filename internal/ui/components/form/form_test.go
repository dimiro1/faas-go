package form

import (
	"context"
	"io"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
	"github.com/dimiro1/faas-go/internal/ui/components/icons"
)

// Helper to render component and parse with goquery
func renderAndParse(t *testing.T, component interface {
	Render(context.Context, io.Writer) error
},
) *goquery.Document {
	t.Helper()

	pr, pw := io.Pipe()
	go func() {
		_ = component.Render(context.Background(), pw)
		_ = pw.Close()
	}()

	doc, err := goquery.NewDocumentFromReader(pr)
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	return doc
}

// Label Tests

func TestLabel_RendersWithText(t *testing.T) {
	doc := renderAndParse(t, Label(LabelProps{
		Text: "Username",
	}))

	label := doc.Find("label")
	if label.Length() != 1 {
		t.Errorf("expected 1 label, got %d", label.Length())
	}

	if !strings.Contains(label.Text(), "Username") {
		t.Errorf("expected label to contain 'Username', got %q", label.Text())
	}
}

func TestLabel_WithForAttribute(t *testing.T) {
	doc := renderAndParse(t, Label(LabelProps{
		Text: "Email",
		For:  "email-input",
	}))

	label := doc.Find("label")
	forAttr, _ := label.Attr("for")
	if forAttr != "email-input" {
		t.Errorf("expected for='email-input', got %q", forAttr)
	}
}

func TestLabel_RequiredIndicator(t *testing.T) {
	doc := renderAndParse(t, Label(LabelProps{
		Text:     "Password",
		Required: true,
	}))

	label := doc.Find("label")
	span := label.Find("span")
	if span.Length() != 1 {
		t.Error("expected required indicator span")
	}

	if !strings.Contains(span.Text(), "*") {
		t.Error("expected required indicator to contain '*'")
	}

	ariaHidden, _ := span.Attr("aria-hidden")
	if ariaHidden != "true" {
		t.Error("expected required indicator to have aria-hidden='true'")
	}
}

// Input Tests

func TestInput_RendersBasicInput(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Placeholder: "Enter text",
	}))

	input := doc.Find("input")
	if input.Length() != 1 {
		t.Errorf("expected 1 input, got %d", input.Length())
	}

	inputType, _ := input.Attr("type")
	if inputType != "text" {
		t.Errorf("expected type='text', got %q", inputType)
	}

	placeholder, _ := input.Attr("placeholder")
	if placeholder != "Enter text" {
		t.Errorf("expected placeholder='Enter text', got %q", placeholder)
	}
}

func TestInput_WithID(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		ID: "my-input",
	}))

	input := doc.Find("input")
	id, _ := input.Attr("id")
	if id != "my-input" {
		t.Errorf("expected id='my-input', got %q", id)
	}
}

func TestInput_WithName(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Name: "username",
	}))

	input := doc.Find("input")
	name, _ := input.Attr("name")
	if name != "username" {
		t.Errorf("expected name='username', got %q", name)
	}
}

func TestInput_WithValue(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Value: "test value",
	}))

	input := doc.Find("input")
	value, _ := input.Attr("value")
	if value != "test value" {
		t.Errorf("expected value='test value', got %q", value)
	}
}

func TestInput_TypeEmail(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Type: "email",
	}))

	input := doc.Find("input")
	inputType, _ := input.Attr("type")
	if inputType != "email" {
		t.Errorf("expected type='email', got %q", inputType)
	}
}

func TestInput_Disabled(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Disabled: true,
	}))

	input := doc.Find("input")
	_, disabled := input.Attr("disabled")
	if !disabled {
		t.Error("expected input to be disabled")
	}
}

func TestInput_Readonly(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Readonly: true,
	}))

	input := doc.Find("input")
	_, readonly := input.Attr("readonly")
	if !readonly {
		t.Error("expected input to be readonly")
	}
}

func TestInput_Required(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Required: true,
	}))

	input := doc.Find("input")
	_, required := input.Attr("required")
	if !required {
		t.Error("expected input to be required")
	}
}

func TestInput_AriaLabel(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		AriaLabel: "Search query",
	}))

	input := doc.Find("input")
	ariaLabel, _ := input.Attr("aria-label")
	if ariaLabel != "Search query" {
		t.Errorf("expected aria-label='Search query', got %q", ariaLabel)
	}
}

func TestInput_AriaDescribedBy(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		AriaDescribedBy: "help-text",
	}))

	input := doc.Find("input")
	ariaDescribedBy, _ := input.Attr("aria-describedby")
	if ariaDescribedBy != "help-text" {
		t.Errorf("expected aria-describedby='help-text', got %q", ariaDescribedBy)
	}
}

func TestInput_AriaInvalid(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		AriaInvalid: true,
	}))

	input := doc.Find("input")
	ariaInvalid, _ := input.Attr("aria-invalid")
	if ariaInvalid != "true" {
		t.Errorf("expected aria-invalid='true', got %q", ariaInvalid)
	}
}

func TestInput_WithIcon(t *testing.T) {
	doc := renderAndParse(t, Input(InputProps{
		Icon: icons.Search(),
	}))

	// Should have wrapper div
	wrapper := doc.Find("div")
	if wrapper.Length() < 1 {
		t.Error("expected wrapper div for input with icon")
	}

	// Should have icon span
	span := doc.Find("span")
	if span.Length() != 1 {
		t.Error("expected icon span")
	}

	ariaHidden, _ := span.Attr("aria-hidden")
	if ariaHidden != "true" {
		t.Error("expected icon span to have aria-hidden='true'")
	}

	// Should have SVG icon
	svgs := doc.Find("svg")
	if svgs.Length() != 1 {
		t.Errorf("expected 1 icon svg, got %d", svgs.Length())
	}
}

// Checkbox Tests

func TestCheckbox_RendersBasic(t *testing.T) {
	doc := renderAndParse(t, Checkbox(CheckboxProps{
		Label: "Accept terms",
	}))

	input := doc.Find("input[type='checkbox']")
	if input.Length() != 1 {
		t.Errorf("expected 1 checkbox, got %d", input.Length())
	}

	label := doc.Find("label")
	if !strings.Contains(label.Text(), "Accept terms") {
		t.Error("expected checkbox to contain label text")
	}
}

func TestCheckbox_Checked(t *testing.T) {
	doc := renderAndParse(t, Checkbox(CheckboxProps{
		Checked: true,
	}))

	input := doc.Find("input[type='checkbox']")
	_, checked := input.Attr("checked")
	if !checked {
		t.Error("expected checkbox to be checked")
	}
}

func TestCheckbox_Description(t *testing.T) {
	doc := renderAndParse(t, Checkbox(CheckboxProps{
		Label:       "Enable feature",
		Description: "This will enable the feature",
	}))

	label := doc.Find("label")
	if !strings.Contains(label.Text(), "Enable feature") {
		t.Error("expected checkbox to contain label text")
	}
	if !strings.Contains(label.Text(), "This will enable the feature") {
		t.Error("expected checkbox to contain description text")
	}
}

func TestCheckbox_Disabled(t *testing.T) {
	doc := renderAndParse(t, Checkbox(CheckboxProps{
		Disabled: true,
	}))

	input := doc.Find("input[type='checkbox']")
	_, disabled := input.Attr("disabled")
	if !disabled {
		t.Error("expected checkbox to be disabled")
	}
}

func TestCheckbox_WithNameAndValue(t *testing.T) {
	doc := renderAndParse(t, Checkbox(CheckboxProps{
		Name:  "agree",
		Value: "yes",
	}))

	input := doc.Find("input[type='checkbox']")
	name, _ := input.Attr("name")
	if name != "agree" {
		t.Errorf("expected name='agree', got %q", name)
	}

	value, _ := input.Attr("value")
	if value != "yes" {
		t.Errorf("expected value='yes', got %q", value)
	}
}

// Radio Tests

func TestRadio_RendersBasic(t *testing.T) {
	doc := renderAndParse(t, Radio(RadioProps{
		Label: "Option 1",
		Name:  "choice",
		Value: "1",
	}))

	input := doc.Find("input[type='radio']")
	if input.Length() != 1 {
		t.Errorf("expected 1 radio, got %d", input.Length())
	}

	name, _ := input.Attr("name")
	if name != "choice" {
		t.Errorf("expected name='choice', got %q", name)
	}

	value, _ := input.Attr("value")
	if value != "1" {
		t.Errorf("expected value='1', got %q", value)
	}
}

func TestRadio_Checked(t *testing.T) {
	doc := renderAndParse(t, Radio(RadioProps{
		Checked: true,
	}))

	input := doc.Find("input[type='radio']")
	_, checked := input.Attr("checked")
	if !checked {
		t.Error("expected radio to be checked")
	}
}

func TestRadio_Disabled(t *testing.T) {
	doc := renderAndParse(t, Radio(RadioProps{
		Disabled: true,
	}))

	input := doc.Find("input[type='radio']")
	_, disabled := input.Attr("disabled")
	if !disabled {
		t.Error("expected radio to be disabled")
	}
}

// HelpText Tests

func TestHelpText_RendersDefault(t *testing.T) {
	doc := renderAndParse(t, HelpText(HelpTextProps{
		Text: "Enter your email address",
	}))

	p := doc.Find("p")
	if p.Length() != 1 {
		t.Errorf("expected 1 paragraph, got %d", p.Length())
	}

	if !strings.Contains(p.Text(), "Enter your email address") {
		t.Error("expected help text content")
	}
}

func TestHelpText_WithID(t *testing.T) {
	doc := renderAndParse(t, HelpText(HelpTextProps{
		ID:   "email-help",
		Text: "Help text",
	}))

	p := doc.Find("p")
	id, _ := p.Attr("id")
	if id != "email-help" {
		t.Errorf("expected id='email-help', got %q", id)
	}
}

func TestHelpText_ErrorVariant(t *testing.T) {
	doc := renderAndParse(t, HelpText(HelpTextProps{
		Text:    "This field is required",
		Variant: HelpTextError,
	}))

	p := doc.Find("p")
	class, _ := p.Attr("class")
	if class == "" {
		t.Error("expected help text to have classes")
	}
}

func TestHelpText_SuccessVariant(t *testing.T) {
	doc := renderAndParse(t, HelpText(HelpTextProps{
		Text:    "Username available",
		Variant: HelpTextSuccess,
	}))

	p := doc.Find("p")
	class, _ := p.Attr("class")
	if class == "" {
		t.Error("expected help text to have classes")
	}
}

// Textarea Tests

func TestTextarea_RendersBasic(t *testing.T) {
	doc := renderAndParse(t, TextareaInput(TextareaProps{
		Placeholder: "Enter description",
	}))

	textarea := doc.Find("textarea")
	if textarea.Length() != 1 {
		t.Errorf("expected 1 textarea, got %d", textarea.Length())
	}

	placeholder, _ := textarea.Attr("placeholder")
	if placeholder != "Enter description" {
		t.Errorf("expected placeholder='Enter description', got %q", placeholder)
	}
}

func TestTextarea_WithValue(t *testing.T) {
	doc := renderAndParse(t, TextareaInput(TextareaProps{
		Value: "Some content",
	}))

	textarea := doc.Find("textarea")
	if !strings.Contains(textarea.Text(), "Some content") {
		t.Error("expected textarea to contain value")
	}
}

func TestTextarea_WithRows(t *testing.T) {
	doc := renderAndParse(t, TextareaInput(TextareaProps{
		Rows: 10,
	}))

	textarea := doc.Find("textarea")
	rows, _ := textarea.Attr("rows")
	if rows != "10" {
		t.Errorf("expected rows='10', got %q", rows)
	}
}

func TestTextarea_Disabled(t *testing.T) {
	doc := renderAndParse(t, TextareaInput(TextareaProps{
		Disabled: true,
	}))

	textarea := doc.Find("textarea")
	_, disabled := textarea.Attr("disabled")
	if !disabled {
		t.Error("expected textarea to be disabled")
	}
}

// Select Tests

func TestSelect_RendersOptions(t *testing.T) {
	doc := renderAndParse(t, SelectInput(SelectProps{
		Options: []string{"Option 1", "Option 2", "Option 3"},
	}))

	selectEl := doc.Find("select")
	if selectEl.Length() != 1 {
		t.Errorf("expected 1 select, got %d", selectEl.Length())
	}

	options := selectEl.Find("option")
	if options.Length() != 3 {
		t.Errorf("expected 3 options, got %d", options.Length())
	}
}

func TestSelect_WithSelected(t *testing.T) {
	doc := renderAndParse(t, SelectInput(SelectProps{
		Options:  []string{"Option 1", "Option 2", "Option 3"},
		Selected: "Option 2",
	}))

	options := doc.Find("option")
	found := false
	options.Each(func(i int, s *goquery.Selection) {
		if strings.Contains(s.Text(), "Option 2") {
			_, selected := s.Attr("selected")
			if selected {
				found = true
			}
		}
	})

	if !found {
		t.Error("expected Option 2 to be selected")
	}
}

func TestSelect_Disabled(t *testing.T) {
	doc := renderAndParse(t, SelectInput(SelectProps{
		Options:  []string{"Option 1"},
		Disabled: true,
	}))

	selectEl := doc.Find("select")
	_, disabled := selectEl.Attr("disabled")
	if !disabled {
		t.Error("expected select to be disabled")
	}
}

func TestSelect_WithID(t *testing.T) {
	doc := renderAndParse(t, SelectInput(SelectProps{
		ID:      "my-select",
		Options: []string{"Option 1"},
	}))

	selectEl := doc.Find("select")
	id, _ := selectEl.Attr("id")
	if id != "my-select" {
		t.Errorf("expected id='my-select', got %q", id)
	}
}

// Search Tests

func TestSearch_RendersWithIcon(t *testing.T) {
	doc := renderAndParse(t, Search(SearchProps{
		Placeholder: "Search...",
		Width:       "200px",
	}))

	input := doc.Find("input[type='search']")
	if input.Length() != 1 {
		t.Errorf("expected 1 search input, got %d", input.Length())
	}

	// Should have search icon
	svgs := doc.Find("svg")
	if svgs.Length() != 1 {
		t.Errorf("expected 1 search icon, got %d", svgs.Length())
	}
}

func TestSearch_AriaLabel(t *testing.T) {
	doc := renderAndParse(t, Search(SearchProps{
		Placeholder: "Search users...",
	}))

	input := doc.Find("input[type='search']")
	ariaLabel, _ := input.Attr("aria-label")
	if ariaLabel != "Search users..." {
		t.Errorf("expected aria-label='Search users...', got %q", ariaLabel)
	}
}

func TestSearch_FullWidth(t *testing.T) {
	doc := renderAndParse(t, Search(SearchProps{
		Placeholder: "Search...",
		FullWidth:   true,
	}))

	input := doc.Find("input[type='search']")
	if input.Length() != 1 {
		t.Error("expected search input")
	}
}

// FormGroup Tests

func TestFormGroup_RendersChildren(t *testing.T) {
	doc := renderAndParse(t, FormGroup(FormGroupProps{}))

	div := doc.Find("div")
	if div.Length() != 1 {
		t.Errorf("expected 1 div, got %d", div.Length())
	}
}

// Legacy function tests

func TestTextInput_Legacy(t *testing.T) {
	doc := renderAndParse(t, TextInput("email", "Enter email", "test@example.com"))

	input := doc.Find("input")
	if input.Length() != 1 {
		t.Errorf("expected 1 input, got %d", input.Length())
	}

	inputType, _ := input.Attr("type")
	if inputType != "email" {
		t.Errorf("expected type='email', got %q", inputType)
	}
}

func TestSearchInput_Legacy(t *testing.T) {
	doc := renderAndParse(t, SearchInput("Search...", "200px"))

	input := doc.Find("input[type='search']")
	if input.Length() != 1 {
		t.Errorf("expected 1 search input, got %d", input.Length())
	}
}

func TestTextarea_Legacy(t *testing.T) {
	doc := renderAndParse(t, Textarea("Enter text", "Some value"))

	textarea := doc.Find("textarea")
	if textarea.Length() != 1 {
		t.Errorf("expected 1 textarea, got %d", textarea.Length())
	}
}

func TestSelect_Legacy(t *testing.T) {
	doc := renderAndParse(t, Select([]string{"A", "B", "C"}))

	selectEl := doc.Find("select")
	if selectEl.Length() != 1 {
		t.Errorf("expected 1 select, got %d", selectEl.Length())
	}

	options := selectEl.Find("option")
	if options.Length() != 3 {
		t.Errorf("expected 3 options, got %d", options.Length())
	}
}
