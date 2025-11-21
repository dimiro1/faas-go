package card

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

func TestCard_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, Card(Props{}))

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestCard_WithID(t *testing.T) {
	doc := renderAndParse(t, Card(Props{
		ID: "my-card",
	}))

	card := doc.Find("#my-card")
	if card.Length() != 1 {
		t.Errorf("expected 1 element with id='my-card', got %d", card.Length())
	}
}

func TestCard_AriaLabel(t *testing.T) {
	doc := renderAndParse(t, Card(Props{
		AriaLabel: "User profile card",
	}))

	card := doc.Find("div").First()
	ariaLabel, _ := card.Attr("aria-label")
	if ariaLabel != "User profile card" {
		t.Errorf("expected aria-label='User profile card', got %q", ariaLabel)
	}
}

func TestCard_AriaDescribedBy(t *testing.T) {
	doc := renderAndParse(t, Card(Props{
		AriaDescribedBy: "card-desc",
	}))

	card := doc.Find("div").First()
	ariaDescribedBy, _ := card.Attr("aria-describedby")
	if ariaDescribedBy != "card-desc" {
		t.Errorf("expected aria-describedby='card-desc', got %q", ariaDescribedBy)
	}
}

func TestCard_Variants(t *testing.T) {
	variants := []CardVariant{
		Default,
		Danger,
		Success,
		Warning,
		Info,
	}

	for _, variant := range variants {
		t.Run(string(variant), func(t *testing.T) {
			doc := renderAndParse(t, Card(Props{
				Variant: variant,
			}))

			card := doc.Find("div").First()
			if card.Length() != 1 {
				t.Errorf("expected 1 div for variant %s", variant)
			}

			class, _ := card.Attr("class")
			if class == "" {
				t.Errorf("expected card to have classes for variant %s", variant)
			}
		})
	}
}

func TestCard_Elevations(t *testing.T) {
	elevations := []CardElevation{
		ElevationNone,
		ElevationSm,
		ElevationMd,
		ElevationLg,
	}

	for _, elevation := range elevations {
		t.Run(string(elevation), func(t *testing.T) {
			doc := renderAndParse(t, Card(Props{
				Elevation: elevation,
			}))

			card := doc.Find("div").First()
			if card.Length() != 1 {
				t.Errorf("expected 1 div for elevation %s", elevation)
			}
		})
	}
}

func TestCard_Radii(t *testing.T) {
	radii := []CardRadius{
		RadiusNone,
		RadiusSm,
		RadiusDefault,
		RadiusLg,
	}

	for _, radius := range radii {
		t.Run(string(radius), func(t *testing.T) {
			doc := renderAndParse(t, Card(Props{
				Radius: radius,
			}))

			card := doc.Find("div").First()
			if card.Length() != 1 {
				t.Errorf("expected 1 div for radius %s", radius)
			}
		})
	}
}

func TestSimple_RendersCard(t *testing.T) {
	doc := renderAndParse(t, Simple())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestPadded_RendersCard(t *testing.T) {
	doc := renderAndParse(t, Padded())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestHeader_RendersTitle(t *testing.T) {
	doc := renderAndParse(t, Header(HeaderProps{
		Title: "Test Title",
	}))

	h3 := doc.Find("h3")
	if h3.Length() != 1 {
		t.Errorf("expected 1 h3 element, got %d", h3.Length())
	}

	text := h3.Text()
	if text != "Test Title" {
		t.Errorf("expected title 'Test Title', got %q", text)
	}
}

func TestHeader_WithSubtitle(t *testing.T) {
	doc := renderAndParse(t, Header(HeaderProps{
		Title:    "Main Title",
		Subtitle: "Subtitle text",
	}))

	h3 := doc.Find("h3")
	if h3.Length() != 1 {
		t.Errorf("expected 1 h3 element, got %d", h3.Length())
	}

	p := doc.Find("p")
	if p.Length() != 1 {
		t.Errorf("expected 1 p element for subtitle, got %d", p.Length())
	}

	subtitleText := p.Text()
	if subtitleText != "Subtitle text" {
		t.Errorf("expected subtitle 'Subtitle text', got %q", subtitleText)
	}
}

func TestHeader_WithIcon(t *testing.T) {
	doc := renderAndParse(t, Header(HeaderProps{
		Title: "Settings",
		Icon:  icons.Cog(),
	}))

	svgs := doc.Find("svg")
	if svgs.Length() != 1 {
		t.Errorf("expected 1 icon svg, got %d", svgs.Length())
	}
}

func TestHeader_Variants(t *testing.T) {
	variants := []CardVariant{
		Default,
		Danger,
		Success,
		Warning,
		Info,
	}

	for _, variant := range variants {
		t.Run(string(variant), func(t *testing.T) {
			doc := renderAndParse(t, Header(HeaderProps{
				Title:   "Test",
				Variant: variant,
			}))

			header := doc.Find("div").First()
			if header.Length() != 1 {
				t.Errorf("expected 1 header div for variant %s", variant)
			}
		})
	}
}

func TestSimpleHeader_RendersTitle(t *testing.T) {
	doc := renderAndParse(t, SimpleHeader("Simple Title"))

	h3 := doc.Find("h3")
	if h3.Length() != 1 {
		t.Errorf("expected 1 h3 element, got %d", h3.Length())
	}

	text := h3.Text()
	if text != "Simple Title" {
		t.Errorf("expected title 'Simple Title', got %q", text)
	}
}

func TestHeaderTabs_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, HeaderTabs())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestTab_Active(t *testing.T) {
	doc := renderAndParse(t, Tab("Overview", true))

	button := doc.Find("button")
	if button.Length() != 1 {
		t.Errorf("expected 1 button element, got %d", button.Length())
	}

	text := button.Text()
	if text != "Overview" {
		t.Errorf("expected text 'Overview', got %q", text)
	}
}

func TestTab_Inactive(t *testing.T) {
	doc := renderAndParse(t, Tab("Settings", false))

	button := doc.Find("button")
	if button.Length() != 1 {
		t.Errorf("expected 1 button element, got %d", button.Length())
	}

	text := button.Text()
	if text != "Settings" {
		t.Errorf("expected text 'Settings', got %q", text)
	}
}

func TestContent_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, Content(ContentProps{}))

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestContent_Dark(t *testing.T) {
	doc := renderAndParse(t, Content(ContentProps{
		Dark: true,
	}))

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestContent_Large(t *testing.T) {
	doc := renderAndParse(t, Content(ContentProps{
		Large: true,
	}))

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestSimpleContent_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, SimpleContent())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestDarkContent_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, DarkContent())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestLargeContent_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, LargeContent())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestFooter_RendersDiv(t *testing.T) {
	doc := renderAndParse(t, Footer())

	divs := doc.Find("div")
	if divs.Length() < 1 {
		t.Error("expected at least 1 div element")
	}
}

func TestDivider_RendersHr(t *testing.T) {
	doc := renderAndParse(t, Divider())

	hrs := doc.Find("hr")
	if hrs.Length() != 1 {
		t.Errorf("expected 1 hr element, got %d", hrs.Length())
	}
}

func TestDividerWithMargin_RendersHr(t *testing.T) {
	doc := renderAndParse(t, DividerWithMargin())

	hrs := doc.Find("hr")
	if hrs.Length() != 1 {
		t.Errorf("expected 1 hr element, got %d", hrs.Length())
	}
}

func TestCard_CombinedFeatures(t *testing.T) {
	doc := renderAndParse(t, Card(Props{
		ID:              "combined-card",
		Variant:         Danger,
		Elevation:       ElevationLg,
		Radius:          RadiusLg,
		AriaLabel:       "Danger zone",
		AriaDescribedBy: "danger-desc",
	}))

	card := doc.Find("#combined-card")
	if card.Length() != 1 {
		t.Error("expected card with combined features")
	}

	ariaLabel, _ := card.Attr("aria-label")
	if ariaLabel != "Danger zone" {
		t.Errorf("expected aria-label='Danger zone', got %q", ariaLabel)
	}

	ariaDescribedBy, _ := card.Attr("aria-describedby")
	if ariaDescribedBy != "danger-desc" {
		t.Errorf("expected aria-describedby='danger-desc', got %q", ariaDescribedBy)
	}
}

func TestHeader_IconWithVariant(t *testing.T) {
	doc := renderAndParse(t, Header(HeaderProps{
		Title:   "Delete",
		Icon:    icons.Trash(),
		Variant: Danger,
	}))

	// Should have icon
	svgs := doc.Find("svg")
	if svgs.Length() != 1 {
		t.Errorf("expected 1 icon svg, got %d", svgs.Length())
	}

	// Should have title
	h3 := doc.Find("h3")
	if h3.Length() != 1 {
		t.Errorf("expected 1 h3 element, got %d", h3.Length())
	}

	text := h3.Text()
	if text != "Delete" {
		t.Errorf("expected title 'Delete', got %q", text)
	}
}

func TestHeader_FullFeatures(t *testing.T) {
	doc := renderAndParse(t, Header(HeaderProps{
		Title:    "API Endpoint",
		Subtitle: "https://api.example.com",
		Icon:     icons.ExternalLink(),
		Variant:  Info,
	}))

	// Should have icon
	svgs := doc.Find("svg")
	if svgs.Length() != 1 {
		t.Errorf("expected 1 icon svg, got %d", svgs.Length())
	}

	// Should have title
	h3 := doc.Find("h3")
	text := h3.Text()
	if !strings.Contains(text, "API Endpoint") {
		t.Errorf("expected title to contain 'API Endpoint', got %q", text)
	}

	// Should have subtitle
	p := doc.Find("p")
	subtitleText := p.Text()
	if subtitleText != "https://api.example.com" {
		t.Errorf("expected subtitle 'https://api.example.com', got %q", subtitleText)
	}
}
