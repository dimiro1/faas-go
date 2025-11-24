import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { Pagination } from "../components/pagination.js";
import { formatUnixTimestamp, getFunctionTabs } from "../utils.js";
import { routes, paths } from "../routes.js";
import {
  Button,
  ButtonVariant,
  ButtonSize,
  BackButton,
} from "../components/button.js";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../components/card.js";
import {
  Badge,
  BadgeVariant,
  BadgeSize,
  IDBadge,
  StatusBadge,
} from "../components/badge.js";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "../components/table.js";
import { Tabs, TabContent } from "../components/tabs.js";

export const FunctionVersions = {
  func: null,
  versions: [],
  loading: true,
  versionsLimit: 20,
  versionsOffset: 0,
  versionsTotal: 0,
  selectedVersions: [],

  oninit: (vnode) => {
    FunctionVersions.selectedVersions = [];
    FunctionVersions.loadData(vnode.attrs.id);
  },

  loadData: async (id) => {
    FunctionVersions.loading = true;
    try {
      const [func, versions] = await Promise.all([
        API.functions.get(id),
        API.versions.list(
          id,
          FunctionVersions.versionsLimit,
          FunctionVersions.versionsOffset,
        ),
      ]);
      FunctionVersions.func = func;
      FunctionVersions.versions = versions.versions || [];
      FunctionVersions.versionsTotal = versions.pagination?.total || 0;
    } catch (e) {
      console.error("Failed to load function:", e);
    } finally {
      FunctionVersions.loading = false;
      m.redraw();
    }
  },

  loadVersions: async () => {
    try {
      const versions = await API.versions.list(
        FunctionVersions.func.id,
        FunctionVersions.versionsLimit,
        FunctionVersions.versionsOffset,
      );
      FunctionVersions.versions = versions.versions || [];
      FunctionVersions.versionsTotal = versions.pagination?.total || 0;
      m.redraw();
    } catch (e) {
      console.error("Failed to load versions:", e);
    }
  },

  handlePageChange: (newOffset) => {
    FunctionVersions.versionsOffset = newOffset;
    FunctionVersions.loadVersions();
  },

  handleLimitChange: (newLimit) => {
    FunctionVersions.versionsLimit = newLimit;
    FunctionVersions.versionsOffset = 0;
    FunctionVersions.loadVersions();
  },

  toggleVersionSelection: (version) => {
    const idx = FunctionVersions.selectedVersions.indexOf(version);
    if (idx === -1) {
      if (FunctionVersions.selectedVersions.length < 2) {
        FunctionVersions.selectedVersions.push(version);
      } else {
        FunctionVersions.selectedVersions.shift();
        FunctionVersions.selectedVersions.push(version);
      }
    } else {
      FunctionVersions.selectedVersions.splice(idx, 1);
    }
  },

  activateVersion: async (version) => {
    if (!confirm(`Activate version ${version}?`)) return;
    try {
      await API.versions.activate(FunctionVersions.func.id, version);
      Toast.show(`Version ${version} activated`, "success");
      FunctionVersions.loadData(FunctionVersions.func.id);
    } catch (e) {
      Toast.show("Failed to activate version", "error");
    }
  },

  compareVersions: () => {
    if (FunctionVersions.selectedVersions.length !== 2) return;
    const [v1, v2] = FunctionVersions.selectedVersions.sort((a, b) => a - b);
    m.route.set(paths.functionDiff(FunctionVersions.func.id, v1, v2));
  },

  view: (vnode) => {
    if (FunctionVersions.loading) {
      return m(".loading", [
        m.trust(icons.spinner()),
        m("p", "Loading function..."),
      ]);
    }

    if (!FunctionVersions.func) {
      return m(".fade-in", m(Card, m(CardContent, "Function not found")));
    }

    const func = FunctionVersions.func;

    return m(".fade-in", [
      // Header
      m(".function-details-header", [
        m(".function-details-left", [
          m(BackButton, { href: routes.functions() }),
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
                `v${func.active_version.version}`,
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

      // Tabs
      m(Tabs, {
        tabs: getFunctionTabs(func.id),
        activeTab: "versions",
      }),

      // Content
      m(TabContent, [
        m(".versions-tab-container", [
          // Version List
          m(Card, { style: "margin-bottom: 1.5rem" }, [
            m(CardHeader, {
              title: "Version History",
              subtitle: `${FunctionVersions.versionsTotal} versions`,
            }),
            FunctionVersions.versions.length === 0
              ? m(CardContent, [
                  m(TableEmpty, {
                    icon: "inbox",
                    message: "No versions yet.",
                  }),
                ])
              : [
                  m(Table, [
                    m(TableHeader, [
                      m(TableRow, [
                        m(TableHead, { style: "width: 40px" }, ""),
                        m(TableHead, "Version"),
                        m(TableHead, "Created"),
                        m(TableHead, "Actions"),
                      ]),
                    ]),
                    m(
                      TableBody,
                      FunctionVersions.versions.map((ver) =>
                        m(
                          TableRow,
                          {
                            key: ver.version,
                            class: FunctionVersions.selectedVersions.includes(
                              ver.version,
                            )
                              ? "table__row--selected"
                              : "",
                          },
                          [
                            m(TableCell, [
                              m("input[type=checkbox]", {
                                checked:
                                  FunctionVersions.selectedVersions.includes(
                                    ver.version,
                                  ),
                                onchange: () =>
                                  FunctionVersions.toggleVersionSelection(
                                    ver.version,
                                  ),
                              }),
                            ]),
                            m(TableCell, [
                              m(
                                "span",
                                {
                                  style:
                                    "font-family: var(--font-mono); margin-right: 0.5rem;",
                                },
                                `v${ver.version}`,
                              ),
                              ver.version === func.active_version.version &&
                                m(
                                  Badge,
                                  {
                                    variant: BadgeVariant.SUCCESS,
                                    size: BadgeSize.SM,
                                  },
                                  "ACTIVE",
                                ),
                            ]),
                            m(TableCell, formatUnixTimestamp(ver.created_at)),
                            m(TableCell, { align: "right" }, [
                              ver.version !== func.active_version.version &&
                                m(
                                  Button,
                                  {
                                    variant: ButtonVariant.OUTLINE,
                                    size: ButtonSize.SM,
                                    onclick: (e) => {
                                      e.stopPropagation();
                                      FunctionVersions.activateVersion(
                                        ver.version,
                                      );
                                    },
                                  },
                                  "Activate",
                                ),
                            ]),
                          ],
                        ),
                      ),
                    ),
                  ]),
                  m(Pagination, {
                    total: FunctionVersions.versionsTotal,
                    limit: FunctionVersions.versionsLimit,
                    offset: FunctionVersions.versionsOffset,
                    onPageChange: FunctionVersions.handlePageChange,
                    onLimitChange: FunctionVersions.handleLimitChange,
                  }),
                ],
            m(CardFooter, [
              m(
                Button,
                {
                  variant: ButtonVariant.PRIMARY,
                  onclick: FunctionVersions.compareVersions,
                  disabled: FunctionVersions.selectedVersions.length !== 2,
                },
                FunctionVersions.selectedVersions.length === 2
                  ? `Compare v${FunctionVersions.selectedVersions[0]} and v${FunctionVersions.selectedVersions[1]}`
                  : "Select 2 versions to compare",
              ),
            ]),
          ]),
        ]),
      ]),
    ]);
  },
};
