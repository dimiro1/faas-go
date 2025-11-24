import { icons } from "../icons.js";
import { API } from "../api.js";
import { Pagination } from "../components/pagination.js";
import { Button, ButtonVariant, ButtonSize } from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "../components/table.js";
import { Badge, BadgeVariant, BadgeSize, StatusBadge } from "../components/badge.js";

export const FunctionsList = {
    functions: [],
    loading: true,
    limit: 20,
    offset: 0,
    total: 0,

    oninit: () => {
        FunctionsList.loadFunctions();
    },

    loadFunctions: async () => {
        FunctionsList.loading = true;
        try {
            const response = await API.functions.list(
                FunctionsList.limit,
                FunctionsList.offset
            );
            FunctionsList.functions = response.functions || [];
            FunctionsList.total = response.pagination?.total || 0;
        } catch (e) {
            console.error("Failed to load functions:", e);
        } finally {
            FunctionsList.loading = false;
            m.redraw();
        }
    },

    handlePageChange: (newOffset) => {
        FunctionsList.offset = newOffset;
        FunctionsList.loadFunctions();
    },

    handleLimitChange: (newLimit) => {
        FunctionsList.limit = newLimit;
        FunctionsList.offset = 0;
        FunctionsList.loadFunctions();
    },

    view: () => {
        if (FunctionsList.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading functions...")
            ]);
        }

        return m(".fade-in", [
            m(".page-header", [
                m(".page-header__title", [
                    m("div", [
                        m("h1", "Functions"),
                        m(".page-header__subtitle", "Manage your serverless functions")
                    ]),
                    m(Button, {
                        variant: ButtonVariant.PRIMARY,
                        href: "#!/functions/new",
                        icon: "plus"
                    }, "New Function")
                ])
            ]),

            m(Card, [
                m(CardHeader, {
                    title: "All Functions",
                    subtitle: `${FunctionsList.total} functions total`
                }),

                FunctionsList.functions.length === 0
                    ? m(CardContent, [
                        m(".table__empty", [
                            m(".table__empty-icon", m.trust(icons.inbox())),
                            m("p.table__empty-message", "No functions yet. Create your first function to get started.")
                        ])
                    ])
                    : [
                        m(Table, [
                            m(TableHeader, [
                                m(TableRow, [
                                    m(TableHead, "Name"),
                                    m(TableHead, "Description"),
                                    m(TableHead, "Status"),
                                    m(TableHead, "Version")
                                ])
                            ]),
                            m(TableBody,
                                FunctionsList.functions.map((func) =>
                                    m(TableRow, {
                                        key: func.id,
                                        onclick: () => m.route.set(`/functions/${func.id}`)
                                    }, [
                                        m(TableCell, { mono: true }, func.name),
                                        m(TableCell, func.description || m("span.text-muted", "No description")),
                                        m(TableCell, m(StatusBadge, { enabled: !func.disabled })),
                                        m(TableCell,
                                            m(Badge, {
                                                variant: BadgeVariant.SUCCESS,
                                                size: BadgeSize.SM,
                                                mono: true
                                            }, `v${func.active_version.version}`)
                                        )
                                    ])
                                )
                            )
                        ]),
                        m(Pagination, {
                            total: FunctionsList.total,
                            limit: FunctionsList.limit,
                            offset: FunctionsList.offset,
                            onPageChange: FunctionsList.handlePageChange,
                            onLimitChange: FunctionsList.handleLimitChange
                        })
                    ]
            ])
        ]);
    }
};
