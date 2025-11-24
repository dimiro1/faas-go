import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { CodeEditor } from "../components/code-editor.js";
import { CodeExamples } from "../components/code-examples.js";
import { Pagination } from "../components/pagination.js";
import { formatUnixTimestamp } from "../utils.js";
import { Button, ButtonVariant, ButtonSize, BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent, CardFooter } from "../components/card.js";
import { Badge, BadgeVariant, BadgeSize, IDBadge, StatusBadge, MethodBadges, LogLevelBadge } from "../components/badge.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "../components/table.js";
import { Tabs, TabContent } from "../components/tabs.js";
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect, FormCheckbox, FormHelp, CopyInput } from "../components/form.js";
import { APIReference, LuaAPISections } from "../components/api-reference.js";
import { LogViewer } from "../components/log-viewer.js";
import { CodeViewer } from "../components/code-viewer.js";
import { RequestBuilder } from "../components/request-builder.js";

export const FunctionDetail = {
    func: null,
    versions: [],
    executions: [],
    loading: true,
    activeTab: "code",
    testRequest: {
        method: "GET",
        query: "",
        body: "",
    },
    testResponse: null,
    testLogs: [],
    selectedVersions: [],
    versionsLimit: 20,
    versionsOffset: 0,
    versionsTotal: 0,
    executionsLimit: 20,
    executionsOffset: 0,
    executionsTotal: 0,

    oninit: (vnode) => {
        const tab = m.route.param("tab");
        if (tab) FunctionDetail.activeTab = tab;

        FunctionDetail.testResponse = null;
        FunctionDetail.testLogs = [];
        FunctionDetail.loadData(vnode.attrs.id);
    },

    loadData: async (id) => {
        FunctionDetail.loading = true;
        try {
            const [func, versions, executions] = await Promise.all([
                API.functions.get(id),
                API.versions.list(id, FunctionDetail.versionsLimit, FunctionDetail.versionsOffset),
                API.executions.list(id, FunctionDetail.executionsLimit, FunctionDetail.executionsOffset),
            ]);
            FunctionDetail.func = func;
            FunctionDetail.versions = versions.versions || [];
            FunctionDetail.versionsTotal = versions.pagination?.total || 0;
            FunctionDetail.executions = executions.executions || [];
            FunctionDetail.executionsTotal = executions.pagination?.total || 0;
        } catch (e) {
            console.error("Failed to load function:", e);
        } finally {
            FunctionDetail.loading = false;
            m.redraw();
        }
    },

    loadVersions: async () => {
        try {
            const versions = await API.versions.list(
                FunctionDetail.func.id,
                FunctionDetail.versionsLimit,
                FunctionDetail.versionsOffset
            );
            FunctionDetail.versions = versions.versions || [];
            FunctionDetail.versionsTotal = versions.pagination?.total || 0;
            m.redraw();
        } catch (e) {
            console.error("Failed to load versions:", e);
        }
    },

    loadExecutions: async () => {
        try {
            const executions = await API.executions.list(
                FunctionDetail.func.id,
                FunctionDetail.executionsLimit,
                FunctionDetail.executionsOffset
            );
            FunctionDetail.executions = executions.executions || [];
            FunctionDetail.executionsTotal = executions.pagination?.total || 0;
            m.redraw();
        } catch (e) {
            console.error("Failed to load executions:", e);
        }
    },

    handleVersionsPageChange: (newOffset) => {
        FunctionDetail.versionsOffset = newOffset;
        FunctionDetail.loadVersions();
    },

    handleVersionsLimitChange: (newLimit) => {
        FunctionDetail.versionsLimit = newLimit;
        FunctionDetail.versionsOffset = 0;
        FunctionDetail.loadVersions();
    },

    handleExecutionsPageChange: (newOffset) => {
        FunctionDetail.executionsOffset = newOffset;
        FunctionDetail.loadExecutions();
    },

    handleExecutionsLimitChange: (newLimit) => {
        FunctionDetail.executionsLimit = newLimit;
        FunctionDetail.executionsOffset = 0;
        FunctionDetail.loadExecutions();
    },

    setTab: (tab) => {
        FunctionDetail.activeTab = tab;
    },

    executeTest: async () => {
        try {
            const response = await API.execute(
                FunctionDetail.func.id,
                FunctionDetail.testRequest
            );
            FunctionDetail.testResponse = response;
            FunctionDetail.testLogs = [];
            m.redraw();

            const executionId = response.headers["X-Execution-Id"];
            if (executionId) {
                try {
                    const logsData = await API.executions.getLogs(executionId);
                    FunctionDetail.testLogs = logsData.logs || [];
                    m.redraw();
                } catch (e) {
                    console.error("Failed to load logs:", e);
                    FunctionDetail.testLogs = [];
                }
            }

            FunctionDetail.loadData(FunctionDetail.func.id);
        } catch (e) {
            Toast.show("Execution failed: " + e.message, "error");
        }
    },

    activateVersion: async (version) => {
        if (!confirm(`Activate version ${version}?`)) return;
        try {
            await API.versions.activate(FunctionDetail.func.id, version);
            Toast.show(`Version ${version} activated`, "success");
            FunctionDetail.loadData(FunctionDetail.func.id);
        } catch (e) {
            Toast.show("Failed to activate version", "error");
        }
    },

    deleteFunction: async () => {
        if (!confirm(`Are you sure you want to delete "${FunctionDetail.func.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await API.functions.delete(FunctionDetail.func.id);
            Toast.show("Function deleted successfully", "success");
            m.route.set("/functions");
        } catch (e) {
            Toast.show("Failed to delete function: " + e.message, "error");
        }
    },

    toggleDisabled: async () => {
        const newDisabledState = !FunctionDetail.func.disabled;
        const action = newDisabledState ? "disable" : "enable";

        if (!confirm(`Are you sure you want to ${action} this function?`)) {
            return;
        }

        try {
            await API.functions.update(FunctionDetail.func.id, {
                disabled: newDisabledState,
            });
            Toast.show(`Function ${newDisabledState ? "disabled" : "enabled"} successfully`, "success");
            FunctionDetail.loadData(FunctionDetail.func.id);
        } catch (e) {
            Toast.show(`Failed to ${action} function: ` + e.message, "error");
        }
    },

    view: (vnode) => {
        if (FunctionDetail.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading function...")
            ]);
        }

        if (!FunctionDetail.func) {
            return m(".fade-in", m(Card, m(CardContent, "Function not found")));
        }

        const func = FunctionDetail.func;
        const tabs = [
            { id: "code", label: "Code" },
            { id: "executions", label: `Executions (${FunctionDetail.executionsTotal})` },
            { id: "settings", label: "Settings" },
            { id: "test", label: "Test" }
        ];

        return m(".fade-in", [
            // Header
            m(".function-details-header", [
                m(".function-details-left", [
                    m(BackButton, { href: "#!/functions" }),
                    m(".function-details-divider"),
                    m(".function-details-info", [
                        m("h1.function-details-title", [
                            func.name,
                            m(IDBadge, { id: func.id })
                        ]),
                        m("p.function-details-description", func.description || "No description")
                    ])
                ]),
                m(".function-details-actions", [
                    m(StatusBadge, { enabled: !func.disabled, glow: true })
                ])
            ]),

            // Tabs
            m(Tabs, {
                tabs,
                activeTab: FunctionDetail.activeTab,
                onTabChange: FunctionDetail.setTab
            }),

            // Tab Content
            m(TabContent, [
                // Code Tab
                FunctionDetail.activeTab === "code" && m(".code-tab-container", [
                    m(Card, { class: "code-card" }, [
                        m(CardHeader, {
                            title: `main.lua`,
                            subtitle: `v${func.active_version.version}`,
                            icon: "code"
                        }),
                        m(CardContent, { noPadding: true }, [
                            m(CodeEditor, {
                                id: "code-viewer",
                                value: func.active_version.code,
                                readOnly: true
                            })
                        ])
                    ]),
                    m(".api-reference-sidebar", [
                        m(APIReference, {
                            sections: LuaAPISections.map((s, i) => ({ ...s, active: i === 0 })),
                            activeSection: 'http',
                            onSectionChange: () => {}
                        })
                    ])
                ]),

                // Executions Tab
                FunctionDetail.activeTab === "executions" && m(".executions-tab-container", [
                    m(Card, [
                        m(CardHeader, {
                            title: "Execution History",
                            subtitle: `${FunctionDetail.executionsTotal} total executions`
                        }),
                        FunctionDetail.executions.length === 0
                            ? m(CardContent, [
                                m(TableEmpty, {
                                    icon: "inbox",
                                    message: "No executions yet. Test your function to see execution history."
                                })
                            ])
                            : [
                                m(Table, [
                                    m(TableHeader, [
                                        m(TableRow, [
                                            m(TableHead, "Execution ID"),
                                            m(TableHead, "Status"),
                                            m(TableHead, "Duration"),
                                            m(TableHead, "Time")
                                        ])
                                    ]),
                                    m(TableBody,
                                        FunctionDetail.executions.map(exec =>
                                            m(TableRow, {
                                                key: exec.id,
                                                onclick: () => m.route.set(`/executions/${exec.id}`)
                                            }, [
                                                m(TableCell, m(IDBadge, { id: exec.id })),
                                                m(TableCell,
                                                    m(Badge, {
                                                        variant: exec.status === "success" ? BadgeVariant.SUCCESS : BadgeVariant.DESTRUCTIVE,
                                                        size: BadgeSize.SM
                                                    }, exec.status.toUpperCase())
                                                ),
                                                m(TableCell, { mono: true }, exec.duration_ms ? `${exec.duration_ms}ms` : "N/A"),
                                                m(TableCell, formatUnixTimestamp(exec.created_at))
                                            ])
                                        )
                                    )
                                ]),
                                m(Pagination, {
                                    total: FunctionDetail.executionsTotal,
                                    limit: FunctionDetail.executionsLimit,
                                    offset: FunctionDetail.executionsOffset,
                                    onPageChange: FunctionDetail.handleExecutionsPageChange,
                                    onLimitChange: FunctionDetail.handleExecutionsLimitChange
                                })
                            ]
                    ])
                ]),

                // Settings Tab
                FunctionDetail.activeTab === "settings" && m(".settings-tab-container", [
                    // General Settings
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "General Configuration" }),
                        m(CardContent, [
                            m(FormGroup, [
                                m(FormLabel, { text: "Function Name" }),
                                m(FormInput, {
                                    value: func.name,
                                    mono: true,
                                    disabled: true
                                })
                            ]),
                            m(FormGroup, [
                                m(FormLabel, { text: "Description" }),
                                m(FormTextarea, {
                                    value: func.description || "",
                                    rows: 2,
                                    disabled: true
                                })
                            ])
                        ]),
                        m(CardFooter, [
                            m(Button, {
                                variant: ButtonVariant.SECONDARY,
                                href: `#!/functions/${func.id}/edit`
                            }, "Edit Details")
                        ])
                    ]),

                    // Environment Variables
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, {
                            title: "Environment Variables",
                            subtitle: `${Object.keys(func.env_vars || {}).length} variables`
                        }),
                        m(CardContent, [
                            Object.keys(func.env_vars || {}).length === 0
                                ? m(".text-muted", { style: "text-align: center; padding: 1rem;" }, "No environment variables configured")
                                : m(".env-vars-list",
                                    Object.entries(func.env_vars).map(([key, value]) =>
                                        m(".env-var-item", { key }, [
                                            m("span.env-var-key", key),
                                            m("span.env-var-value", value)
                                        ])
                                    )
                                )
                        ]),
                        m(CardFooter, [
                            m(Button, {
                                variant: ButtonVariant.SECONDARY,
                                href: `#!/functions/${func.id}/env`
                            }, "Manage Variables")
                        ])
                    ]),

                    // Network & Triggers
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "Network & Triggers" }),
                        m(CardContent, [
                            m(FormGroup, [
                                m(FormLabel, { text: "Invocation URL" }),
                                m(CopyInput, {
                                    value: `${window.location.origin}/api/functions/${func.id}/invoke`,
                                    mono: true
                                })
                            ]),
                            m(FormGroup, [
                                m(FormLabel, { text: "Supported Methods" }),
                                m(MethodBadges)
                            ])
                        ])
                    ]),

                    // Function Status
                    m(Card, { variant: "warning", style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "Function Status" }),
                        m(CardContent, [
                            m(FormCheckbox, {
                                id: "enable-function",
                                label: "Enable Function",
                                description: "Disabling will stop all incoming requests to this function.",
                                checked: !func.disabled,
                                onchange: FunctionDetail.toggleDisabled
                            })
                        ])
                    ]),

                    // Danger Zone
                    m(Card, { variant: "danger" }, [
                        m(CardHeader, { title: "Danger Zone" }),
                        m(CardContent, [
                            m(".danger-zone-item", [
                                m(".danger-zone-info", [
                                    m("p.danger-zone-title", "Delete Function"),
                                    m("p.danger-zone-description", "Once deleted, this function cannot be recovered.")
                                ]),
                                m(Button, {
                                    variant: ButtonVariant.DESTRUCTIVE,
                                    onclick: FunctionDetail.deleteFunction
                                }, "Delete")
                            ])
                        ])
                    ])
                ]),

                // Test Tab
                FunctionDetail.activeTab === "test" && m(".test-tab-container", [
                    m(CodeExamples, {
                        functionId: func.id,
                        method: FunctionDetail.testRequest.method,
                        query: FunctionDetail.testRequest.query,
                        body: FunctionDetail.testRequest.body
                    }),

                    m(".test-panels", [
                        // Request Builder
                        m(RequestBuilder, {
                            url: `${window.location.origin}/api/functions/${func.id}/invoke`,
                            method: FunctionDetail.testRequest.method,
                            query: FunctionDetail.testRequest.query,
                            body: FunctionDetail.testRequest.body,
                            onMethodChange: (value) => FunctionDetail.testRequest.method = value,
                            onQueryChange: (value) => FunctionDetail.testRequest.query = value,
                            onBodyChange: (value) => FunctionDetail.testRequest.body = value,
                            onExecute: FunctionDetail.executeTest
                        }),

                        // Response Viewer
                        m(Card, { class: "response-viewer" }, [
                            m(CardHeader, {
                                title: "Response",
                                subtitle: FunctionDetail.testResponse ? `Status: ${FunctionDetail.testResponse.status}` : null
                            }),
                            m(CardContent, [
                                FunctionDetail.testResponse
                                    ? m("div", [
                                        m(".response-status", [
                                            m(Badge, {
                                                variant: FunctionDetail.testResponse.status === 200 ? BadgeVariant.SUCCESS : BadgeVariant.DESTRUCTIVE,
                                                size: BadgeSize.SM
                                            }, FunctionDetail.testResponse.status)
                                        ]),
                                        m(".response-body", [
                                            m("label.form-label", "Body"),
                                            m("pre.response-pre", FunctionDetail.testResponse.body)
                                        ]),
                                        FunctionDetail.testLogs.length > 0 && m(".response-logs", [
                                            m("label.form-label", "Logs"),
                                            m(LogViewer, {
                                                logs: FunctionDetail.testLogs,
                                                maxHeight: '200px'
                                            })
                                        ])
                                    ])
                                    : m(".no-response", [
                                        m("p", "No response yet"),
                                        m("p.text-muted", "Execute a request to see the response")
                                    ])
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
};
