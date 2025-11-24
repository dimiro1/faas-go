import { icons } from "../icons.js";
import { API } from "../api.js";
import { BackButton } from "../components/button.js";
import { routes } from "../routes.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import {
  Badge,
  BadgeVariant,
  BadgeSize,
  IDBadge,
  StatusBadge,
} from "../components/badge.js";
import {
  DiffViewer,
  VersionLabels,
  LineType,
} from "../components/diff-viewer.js";

export const VersionDiff = {
  func: null,
  diffData: null,
  loading: true,

  oninit: (vnode) => {
    VersionDiff.loadData(vnode.attrs.id, vnode.attrs.v1, vnode.attrs.v2);
  },

  loadData: async (functionId, v1, v2) => {
    VersionDiff.loading = true;
    try {
      const [func, diffData] = await Promise.all([
        API.functions.get(functionId),
        API.versions.diff(functionId, v1, v2),
      ]);
      VersionDiff.func = func;
      VersionDiff.diffData = diffData;
    } catch (e) {
      console.error("Failed to load diff:", e);
    } finally {
      VersionDiff.loading = false;
      m.redraw();
    }
  },

  view: () => {
    if (VersionDiff.loading) {
      return m(".loading", [
        m.trust(icons.spinner()),
        m("p", "Loading diff..."),
      ]);
    }

    if (!VersionDiff.func || !VersionDiff.diffData) {
      return m(".fade-in", m(Card, m(CardContent, "Diff not found")));
    }

    const func = VersionDiff.func;

    return m(".fade-in", [
      // Header
      m(".function-details-header", [
        m(".function-details-left", [
          m(BackButton, { href: routes.functionVersions(func.id) }),
          m(".function-details-divider"),
          m(".function-details-info", [
            m("h1.function-details-title", [
              func.name,
              m(IDBadge, { id: func.id }),
              m(
                Badge,
                {
                  variant: BadgeVariant.OUTLINE,
                  size: BadgeSize.SM,
                  mono: true,
                },
                `v${VersionDiff.diffData.old_version} → v${VersionDiff.diffData.new_version}`,
              ),
            ]),
            m(
              "p.function-details-description",
              func.description || "No description",
            ),
          ]),
        ]),
        m(".function-details-actions", [
          m(StatusBadge, { enabled: !func.disabled, glow: true }),
        ]),
      ]),

      m(Card, [
        m(CardHeader, {
          title: "Code Changes",
        }, [
          m(VersionLabels, {
            oldLabel: `v${VersionDiff.diffData.old_version}`,
            newLabel: `v${VersionDiff.diffData.new_version}`,
            additions: VersionDiff.diffData.diff.filter(
              (l) => l.line_type === "added",
            ).length,
            deletions: VersionDiff.diffData.diff.filter(
              (l) => l.line_type === "removed",
            ).length,
          }),
        ]),
        m(CardContent, { noPadding: true }, [
          m(DiffViewer, {
            lines: VersionDiff.diffData.diff.map((line) => ({
              type:
                line.line_type === "added"
                  ? LineType.ADDED
                  : line.line_type === "removed"
                    ? LineType.REMOVED
                    : LineType.UNCHANGED,
              content: line.content,
              oldLine: line.old_line || 0,
              newLine: line.new_line || 0,
            })),
            maxHeight: "600px",
            noBorder: true,
          }),
        ]),
      ]),
    ]);
  },
};
