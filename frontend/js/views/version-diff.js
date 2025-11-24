import { icons } from "../icons.js";
import { API } from "../api.js";
import { BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";

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
                m("p", "Loading diff...")
            ]);
        }

        if (!VersionDiff.func || !VersionDiff.diffData) {
            return m(".fade-in", m(Card, m(CardContent, "Diff not found")));
        }

        return m(".fade-in", [
            m(BackButton, { href: `#!/functions/${VersionDiff.func.id}` }),

            m(".page-header", [
                m(".page-header__title", [
                    m("div", [
                        m("h1", "Version Comparison"),
                        m(".page-header__subtitle",
                            `${VersionDiff.func.name} - v${VersionDiff.diffData.old_version} → v${VersionDiff.diffData.new_version}`
                        )
                    ])
                ])
            ]),

            m(Card, [
                m(CardHeader, {
                    title: "Code Changes"
                }, [
                    m(".diff-legend", [
                        m("span.diff-legend__removed", `- Version ${VersionDiff.diffData.old_version}`),
                        m("span.diff-legend__added", `+ Version ${VersionDiff.diffData.new_version}`)
                    ])
                ]),
                m(CardContent, { noPadding: true }, [
                    m(".diff-viewer", [
                        m("table.diff-table", [
                            m("tbody",
                                VersionDiff.diffData.diff.map((line, idx) =>
                                    m("tr.diff-row", {
                                        key: idx,
                                        class: line.line_type === "added" ? "diff-row--added" :
                                               line.line_type === "removed" ? "diff-row--removed" : ""
                                    }, [
                                        m("td.diff-line-num", line.old_line || ""),
                                        m("td.diff-line-num", line.new_line || ""),
                                        m("td.diff-symbol", {
                                            class: line.line_type === "added" ? "diff-symbol--added" :
                                                   line.line_type === "removed" ? "diff-symbol--removed" : ""
                                        }, line.line_type === "added" ? "+" : line.line_type === "removed" ? "-" : " "),
                                        m("td.diff-content", {
                                            class: line.line_type === "added" ? "diff-content--added" :
                                                   line.line_type === "removed" ? "diff-content--removed" : ""
                                        }, line.content || " ")
                                    ])
                                )
                            )
                        ])
                    ])
                ])
            ])
        ]);
    }
};
