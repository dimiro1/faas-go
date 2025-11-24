import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import { FormHelp } from "../components/form.js";
import { EnvEditor } from "../components/env-editor.js";

export const FunctionEnv = {
    func: null,
    envVars: [],
    loading: true,
    saving: false,
    errors: {},

    oninit: (vnode) => {
        FunctionEnv.loadData(vnode.attrs.id);
    },

    loadData: async (id) => {
        FunctionEnv.loading = true;
        FunctionEnv.errors = {};
        try {
            const func = await API.functions.get(id);
            FunctionEnv.func = func;
            FunctionEnv.envVars = Object.entries(func.env_vars || {}).map(
                ([key, value]) => ({
                    key,
                    value,
                    state: 'original',
                    originalKey: key
                })
            );
        } catch (e) {
            console.error("Failed to load function:", e);
        } finally {
            FunctionEnv.loading = false;
            m.redraw();
        }
    },

    parseErrorMessage: (message) => {
        const match = message.match(/^(\w+):\s*(.+)$/);
        if (match) {
            return { field: match[1], message: match[2] };
        }
        return null;
    },

    saveEnvVars: async () => {
        FunctionEnv.saving = true;
        FunctionEnv.errors = {};

        try {
            const env_vars = {};
            FunctionEnv.envVars.forEach((envVar) => {
                // Only include non-removed variables
                if (envVar.state !== 'removed') {
                    const key = envVar.key || "";
                    const value = envVar.value || "";
                    if (key || value) {
                        env_vars[key] = value;
                    }
                }
            });

            await API.functions.updateEnv(FunctionEnv.func.id, env_vars);
            Toast.show("Environment variables updated", "success");
            m.route.set(`/functions/${FunctionEnv.func.id}`);
        } catch (e) {
            const error = FunctionEnv.parseErrorMessage(e.message);
            if (error) {
                FunctionEnv.errors.general = error.message;
            } else {
                Toast.show("Failed to update environment variables: " + e.message, "error");
            }
            m.redraw();
        } finally {
            FunctionEnv.saving = false;
        }
    },

    view: () => {
        if (FunctionEnv.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading...")
            ]);
        }

        if (!FunctionEnv.func) {
            return m(".fade-in", m(Card, m(CardContent, "Function not found")));
        }

        // Count only non-removed variables
        const activeCount = FunctionEnv.envVars.filter(v => v.state !== 'removed').length;

        return m(".fade-in", [
            m(BackButton, { href: `#!/functions/${FunctionEnv.func.id}` }),

            m(".page-header", [
                m(".page-header__title", [
                    m("div", [
                        m("h1", "Environment Variables"),
                        m(".page-header__subtitle", FunctionEnv.func.name)
                    ])
                ])
            ]),

            m(Card, { style: "margin-bottom: 1.5rem" }, [
                m(CardHeader, {
                    title: "Environment Variables",
                    subtitle: `${activeCount} variables`
                }),
                m(CardContent, [
                    FunctionEnv.errors.general &&
                        m(FormHelp, { error: true, text: FunctionEnv.errors.general, style: "margin-bottom: 1rem" }),

                    m(EnvEditor, {
                        envVars: FunctionEnv.envVars,
                        onAdd: () => {
                            FunctionEnv.envVars.push({ key: "", value: "", state: 'added' });
                            delete FunctionEnv.errors.general;
                        },
                        onToggleRemove: (i) => {
                            const envVar = FunctionEnv.envVars[i];
                            if (envVar.state === 'removed') {
                                // Restore
                                envVar.state = 'original';
                            } else if (envVar.state === 'added') {
                                // Completely remove new items
                                FunctionEnv.envVars.splice(i, 1);
                            } else {
                                // Mark original as removed
                                envVar.state = 'removed';
                            }
                            delete FunctionEnv.errors.general;
                        },
                        onChange: (i, key, value) => {
                            FunctionEnv.envVars[i].key = key;
                            FunctionEnv.envVars[i].value = value;
                            delete FunctionEnv.errors.general;
                        }
                    })
                ])
            ]),

            m("div", { style: "display: flex; justify-content: flex-end; gap: 0.5rem;" }, [
                m(Button, {
                    variant: ButtonVariant.OUTLINE,
                    href: `#!/functions/${FunctionEnv.func.id}`
                }, "Cancel"),
                m(Button, {
                    variant: ButtonVariant.PRIMARY,
                    onclick: FunctionEnv.saveEnvVars,
                    disabled: FunctionEnv.saving,
                    loading: FunctionEnv.saving
                }, FunctionEnv.saving ? "Saving..." : "Save Changes")
            ])
        ]);
    }
};
