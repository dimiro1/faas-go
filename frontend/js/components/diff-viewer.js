// Diff viewer component
import { icons } from "../icons.js";

// Line types
export const LineType = {
  ADDED: "added",
  REMOVED: "removed",
  UNCHANGED: "unchanged",
};

// Version labels component
export const VersionLabels = {
  view(vnode) {
    const { oldLabel, newLabel, oldMeta, newMeta, additions, deletions } =
      vnode.attrs;

    return m(".diff-version-labels", [
      m("span.diff-stats-summary", [
        additions > 0 &&
          m("span.diff-stats-added", [
            m.trust(icons.plusSmall()),
            ` ${additions} addition${additions !== 1 ? "s" : ""} `,
          ]),
        deletions > 0 &&
          m("span.diff-stats-removed", [
            m.trust(icons.minusSmall()),
            ` ${deletions} deletion${deletions !== 1 ? "s" : ""}`,
          ]),
      ]),
    ]);
  },
};

// Diff viewer component
export const DiffViewer = {
  view(vnode) {
    const { lines = [], maxHeight, noBorder, language } = vnode.attrs;

    return m(
      ".diff-container",
      {
        class: noBorder ? "diff-container--no-border" : "",
        role: "region",
        "aria-label": "Code diff",
      },
      [
        m(
          ".diff-scroll",
          { style: maxHeight ? `max-height: ${maxHeight}` : "" },
          [
            m("table.diff-table", [
              m(
                "tbody",
                lines.map((line) => m(DiffLine, { line, language })),
              ),
            ]),
          ],
        ),
      ],
    );
  },
};

// Single diff line
const DiffLine = {
  view(vnode) {
    const { line, language } = vnode.attrs;
    const lineClass = `diff-line--${line.type}`;

    return m("tr", { class: lineClass }, [
      m("td.diff-line-number", line.oldLine > 0 ? line.oldLine : ""),
      m("td.diff-line-number", line.newLine > 0 ? line.newLine : ""),
      m("td.diff-line-type", {
        class: `diff-type--${line.type}`,
        "aria-label": getTypeAriaLabel(line.type),
      }),
      m("td.diff-content", line.content || " "),
    ]);
  },
};

function getTypeAriaLabel(type) {
  switch (type) {
    case LineType.ADDED:
      return "Line added";
    case LineType.REMOVED:
      return "Line removed";
    default:
      return "Unchanged line";
  }
}
