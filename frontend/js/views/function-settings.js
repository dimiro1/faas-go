import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent, CardFooter } from "../components/card.js";
import { Badge, BadgeVariant, BadgeSize, IDBadge, StatusBadge, MethodBadges } from "../components/badge.js";
import { Tabs, TabContent } from "../components/tabs.js";
import { getFunctionTabs } from "../utils.js";
import { FormGroup, FormLabel, FormInput, FormTextarea, FormCheckbox, CopyInput } from "../components/form.js";

export const FunctionSettings = {
    func: null,
    loading: true,

    oninit: (vnode) => {
        FunctionSettings.loadFunction(vnode.attrs.id);
    },

    loadFunction: async (id) => {
        FunctionSettings.loading = true;
        try {
            FunctionSettings.func = await API.functions.get(id);
        } catch (e) {
            console.error("Failed to load function:", e);
        } finally {
            FunctionSettings.loading = false;
            m.redraw();
        }
    },

    deleteFunction: async () => {
        if (!confirm(`Are you sure you want to delete "${FunctionSettings.func.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await API.functions.delete(FunctionSettings.func.id);
            Toast.show("Function deleted successfully", "success");
            m.route.set("/functions");
        } catch (e) {
            Toast.show("Failed to delete function: " + e.message, "error");
        }
    },

    toggleDisabled: async () => {
        const newDisabledState = !FunctionSettings.func.disabled;
        const action = newDisabledState ? "disable" : "enable";

        if (!confirm(`Are you sure you want to ${action} this function?`)) {
            return;
        }

        try {
            await API.functions.update(FunctionSettings.func.id, {
                disabled: newDisabledState,
            });
            Toast.show(`Function ${newDisabledState ? "disabled" : "enabled"} successfully`, "success");
            FunctionSettings.loadFunction(FunctionSettings.func.id);
        } catch (e) {
            Toast.show(`Failed to ${action} function: ` + e.message, "error");
        }
    },

    view: (vnode) => {
        if (FunctionSettings.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading function...")
            ]);
        }

        if (!FunctionSettings.func) {
            return m(".fade-in", m(Card, m(CardContent, "Function not found")));
        }

        const func = FunctionSettings.func;

        return m(".fade-in", [
            // Header
            m(".function-details-header", [
                m(".function-details-left", [
                    m(BackButton, { href: "#!/functions" }),
                    m(".function-details-divider"),
                    m(".function-details-info", [
                        m("h1.function-details-title", [
                            func.name,
                            m(IDBadge, { id: func.id }),
                            m(Badge, {
                                variant: BadgeVariant.OUTLINE,
                                size: BadgeSize.SM,
                                mono: true
                            }, `v${func.active_version.version}`)
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
                tabs: getFunctionTabs(func.id),
                activeTab: "settings"
            }),

            // Content
            m(TabContent, [
                m(".settings-tab-container", [
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
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "Function Status" }),
                        m(CardContent, [
                            m(FormCheckbox, {
                                id: "enable-function",
                                label: "Enable Function",
                                description: "Disabling will stop all incoming requests to this function.",
                                checked: !func.disabled,
                                onchange: FunctionSettings.toggleDisabled
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
                                    onclick: FunctionSettings.deleteFunction
                                }, "Delete")
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
};
