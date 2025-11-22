package table

import (
	"context"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
)

func TestTable_Basic(t *testing.T) {
	var buf strings.Builder
	err := Table(TableProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check table element exists
	table := doc.Find("table")
	if table.Length() == 0 {
		t.Error("expected table element to exist")
	}
}

func TestTable_WithID(t *testing.T) {
	var buf strings.Builder
	err := Table(TableProps{ID: "my-table"}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check ID is set
	table := doc.Find("#my-table")
	if table.Length() == 0 {
		t.Error("expected table to have id 'my-table'")
	}
}

func TestTable_Striped(t *testing.T) {
	var buf strings.Builder
	err := Table(TableProps{Striped: true}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check data attribute
	table := doc.Find("table[data-table-striped='true']")
	if table.Length() == 0 {
		t.Error("expected table to have data-table-striped attribute")
	}
}

func TestTable_Hoverable(t *testing.T) {
	var buf strings.Builder
	err := Table(TableProps{Hoverable: true}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check data attribute
	table := doc.Find("table[data-table-hoverable='true']")
	if table.Length() == 0 {
		t.Error("expected table to have data-table-hoverable attribute")
	}
}

func TestTable_Dense(t *testing.T) {
	var buf strings.Builder
	err := Table(TableProps{Dense: true}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(buf.String()))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}

	// Check data attribute
	table := doc.Find("table[data-table-dense='true']")
	if table.Length() == 0 {
		t.Error("expected table to have data-table-dense attribute")
	}
}

func TestHeader_Basic(t *testing.T) {
	var buf strings.Builder
	err := Header(HeaderProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check thead element in output
	if !strings.Contains(buf.String(), "<thead") {
		t.Error("expected thead element to exist")
	}
}

func TestBody_Basic(t *testing.T) {
	var buf strings.Builder
	err := Body(BodyProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check tbody element in output
	if !strings.Contains(buf.String(), "<tbody") {
		t.Error("expected tbody element to exist")
	}
}

func TestFooter_Basic(t *testing.T) {
	var buf strings.Builder
	err := Footer(FooterProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check tfoot element in output
	if !strings.Contains(buf.String(), "<tfoot") {
		t.Error("expected tfoot element to exist")
	}
}

func TestRow_Basic(t *testing.T) {
	var buf strings.Builder
	err := Row(RowProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check tr element in output
	if !strings.Contains(buf.String(), "<tr") {
		t.Error("expected tr element to exist")
	}
}

func TestRow_Selected(t *testing.T) {
	var buf strings.Builder
	err := Row(RowProps{Selected: true}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	output := buf.String()

	// Check data attribute and aria
	if !strings.Contains(output, `data-table-row-selected="true"`) {
		t.Error("expected row to have data-table-row-selected attribute")
	}

	if !strings.Contains(output, `aria-selected="true"`) {
		t.Error("expected row to have aria-selected='true'")
	}
}

func TestHead_Basic(t *testing.T) {
	var buf strings.Builder
	err := Head(HeadProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	output := buf.String()

	// Check th element exists with scope
	if !strings.Contains(output, "<th") || !strings.Contains(output, `scope="col"`) {
		t.Error("expected th element with scope='col'")
	}
}

func TestHead_WithWidth(t *testing.T) {
	var buf strings.Builder
	err := Head(HeadProps{Width: "100px"}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check style attribute
	if !strings.Contains(buf.String(), "width: 100px") {
		t.Error("expected th to have width style")
	}
}

func TestCell_Basic(t *testing.T) {
	var buf strings.Builder
	err := Cell(CellProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check td element exists
	if !strings.Contains(buf.String(), "<td") {
		t.Error("expected td element to exist")
	}
}

func TestCell_Mono(t *testing.T) {
	var buf strings.Builder
	err := Cell(CellProps{Mono: true}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check that mono class is applied (class name contains pattern)
	if !strings.Contains(buf.String(), "tableCellMono") {
		t.Error("expected cell to have mono class")
	}
}

func TestCell_AlignCenter(t *testing.T) {
	var buf strings.Builder
	err := Cell(CellProps{Align: "center"}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check that align class is applied
	if !strings.Contains(buf.String(), "tableCellAlignCenter") {
		t.Error("expected cell to have center align class")
	}
}

func TestCell_AlignRight(t *testing.T) {
	var buf strings.Builder
	err := Cell(CellProps{Align: "right"}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check that align class is applied
	if !strings.Contains(buf.String(), "tableCellAlignRight") {
		t.Error("expected cell to have right align class")
	}
}

func TestCaption_Basic(t *testing.T) {
	var buf strings.Builder
	err := Caption(CaptionProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check caption element exists
	if !strings.Contains(buf.String(), "<caption") {
		t.Error("expected caption element to exist")
	}
}

func TestHeaderRow_Basic(t *testing.T) {
	var buf strings.Builder
	err := HeaderRow([]string{"Name", "Age", "Email"}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	output := buf.String()

	// Check correct number of th elements
	thCount := strings.Count(output, "<th")
	if thCount != 3 {
		t.Errorf("expected 3 th elements, got %d", thCount)
	}

	// Check content
	if !strings.Contains(output, "Name") || !strings.Contains(output, "Age") || !strings.Contains(output, "Email") {
		t.Error("expected header row to contain Name, Age, Email")
	}
}

func TestHeaderRowWithWidths_Basic(t *testing.T) {
	columns := []Column{
		{Name: "ID", Width: "50px"},
		{Name: "Name", Width: "auto"},
	}

	var buf strings.Builder
	err := HeaderRowWithWidths(columns).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	output := buf.String()

	// Check correct number of th elements
	thCount := strings.Count(output, "<th")
	if thCount != 2 {
		t.Errorf("expected 2 th elements, got %d", thCount)
	}

	// Check first th has width style
	if !strings.Contains(output, "width: 50px") {
		t.Error("expected first th to have width: 50px")
	}
}

func TestEmpty_Basic(t *testing.T) {
	var buf strings.Builder
	err := Empty(EmptyProps{
		Colspan: 3,
		Message: "No data found",
	}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	output := buf.String()

	// Check td with colspan
	if !strings.Contains(output, `colspan="3"`) {
		t.Error("expected td with colspan='3'")
	}

	// Check message
	if !strings.Contains(output, "No data found") {
		t.Error("expected message 'No data found'")
	}
}

func TestEmpty_DefaultMessage(t *testing.T) {
	var buf strings.Builder
	err := Empty(EmptyProps{}).Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("failed to render: %v", err)
	}

	// Check default message
	if !strings.Contains(buf.String(), "No data available") {
		t.Error("expected default message 'No data available'")
	}
}

func TestIntToString(t *testing.T) {
	tests := []struct {
		input    int
		expected string
	}{
		{0, "1"},
		{1, "1"},
		{5, "5"},
		{10, "10"},
		{99, "99"},
		{100, "100"},
	}

	for _, tt := range tests {
		result := intToString(tt.input)
		if result != tt.expected {
			t.Errorf("intToString(%d) = %s, expected %s", tt.input, result, tt.expected)
		}
	}
}
