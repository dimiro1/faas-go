// Diff viewer component

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
      m("span.diff-version-item.diff-version-old", [
        m.trust(
          `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        ),
        oldLabel,
        oldMeta && m("span.diff-version-meta", `(${oldMeta})`),
      ]),
      m("span.diff-version-item.diff-version-new", [
        m.trust(
          `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        ),
        newLabel,
        newMeta && m("span.diff-version-meta", `(${newMeta})`),
      ]),
      (additions > 0 || deletions > 0) &&
        m("span.diff-version-stats", [
          additions > 0 && m("span.diff-stats-added", `+${additions}`),
          deletions > 0 && m("span.diff-stats-removed", `-${deletions}`),
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
