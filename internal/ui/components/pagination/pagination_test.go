package pagination

import (
	"context"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
)

func TestPagination_Basic(t *testing.T) {
	props := Props{
		CurrentStart: 1,
		CurrentEnd:   10,
		Total:        100,
		HasPrev:      false,
		HasNext:      true,
	}

	var buf strings.Builder
	err := Pagination(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check info text contains numbers
	info := doc.Find("div").First().Text()
	if !strings.Contains(info, "1") || !strings.Contains(info, "10") || !strings.Contains(info, "100") {
		t.Error("expected pagination info to contain start, end, and total numbers")
	}

	// Check Previous button is disabled
	prevBtn := doc.Find("button").First()
	if _, exists := prevBtn.Attr("disabled"); !exists {
		t.Error("expected Previous button to be disabled")
	}

	// Check Next button is enabled
	nextBtn := doc.Find("button").Last()
	if _, exists := nextBtn.Attr("disabled"); exists {
		t.Error("expected Next button to be enabled")
	}
}

func TestPagination_BothEnabled(t *testing.T) {
	props := Props{
		CurrentStart: 11,
		CurrentEnd:   20,
		Total:        100,
		HasPrev:      true,
		HasNext:      true,
	}

	var buf strings.Builder
	err := Pagination(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Both buttons should be enabled
	buttons := doc.Find("button")
	buttons.Each(func(i int, s *goquery.Selection) {
		if _, exists := s.Attr("disabled"); exists {
			t.Errorf("expected button %d to be enabled", i)
		}
	})
}

func TestPagination_WithPerPageSelector(t *testing.T) {
	props := Props{
		CurrentStart: 1,
		CurrentEnd:   10,
		Total:        100,
		PerPage:      10,
		ShowPerPage:  true,
	}

	var buf strings.Builder
	err := Pagination(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check select element exists
	sel := doc.Find("select")
	if sel.Length() == 0 {
		t.Error("expected per page selector to be present")
	}

	// Check default options
	options := sel.Find("option")
	if options.Length() != 3 {
		t.Errorf("expected 3 default options, got %d", options.Length())
	}
}

func TestPagination_CustomPerPageOptions(t *testing.T) {
	props := Props{
		CurrentStart:   1,
		CurrentEnd:     25,
		Total:          200,
		PerPage:        25,
		ShowPerPage:    true,
		PerPageOptions: []int{25, 50, 100},
	}

	var buf strings.Builder
	err := Pagination(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check custom options
	options := doc.Find("select option")
	if options.Length() != 3 {
		t.Errorf("expected 3 custom options, got %d", options.Length())
	}

	// Check first option value
	firstVal, _ := options.First().Attr("value")
	if firstVal != "25" {
		t.Errorf("expected first option value to be 25, got %s", firstVal)
	}
}

func TestPagination_WithID(t *testing.T) {
	props := Props{
		ID:           "my-pagination",
		CurrentStart: 1,
		CurrentEnd:   10,
		Total:        100,
	}

	var buf strings.Builder
	err := Pagination(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check ID is set
	id, exists := doc.Find("#my-pagination").Attr("id")
	if !exists || id != "my-pagination" {
		t.Error("expected pagination to have id 'my-pagination'")
	}
}

func TestSimple_Basic(t *testing.T) {
	props := Props{
		HasPrev: true,
		HasNext: true,
	}

	var buf strings.Builder
	err := Simple(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Should have buttons but no info text
	buttons := doc.Find("button")
	if buttons.Length() != 2 {
		t.Errorf("expected 2 buttons, got %d", buttons.Length())
	}

	// Should not have select
	sel := doc.Find("select")
	if sel.Length() != 0 {
		t.Error("expected no select element in simple pagination")
	}
}

func TestSimple_DisabledButtons(t *testing.T) {
	props := Props{
		HasPrev: false,
		HasNext: false,
	}

	var buf strings.Builder
	err := Simple(props).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Both buttons should be disabled
	buttons := doc.Find("button")
	buttons.Each(func(i int, s *goquery.Selection) {
		if _, exists := s.Attr("disabled"); !exists {
			t.Errorf("expected button %d to be disabled", i)
		}
	})
}

func TestGetPerPageOptions_Default(t *testing.T) {
	props := Props{}
	options := getPerPageOptions(props)

	if len(options) != 3 {
		t.Errorf("expected 3 default options, got %d", len(options))
	}

	expected := []int{10, 20, 50}
	for i, opt := range options {
		if opt != expected[i] {
			t.Errorf("expected option %d to be %d, got %d", i, expected[i], opt)
		}
	}
}

func TestGetPerPageOptions_Custom(t *testing.T) {
	props := Props{
		PerPageOptions: []int{5, 15, 30},
	}
	options := getPerPageOptions(props)

	if len(options) != 3 {
		t.Errorf("expected 3 custom options, got %d", len(options))
	}

	for i, opt := range options {
		if opt != props.PerPageOptions[i] {
			t.Errorf("expected option %d to be %d, got %d", i, props.PerPageOptions[i], opt)
		}
	}
}
