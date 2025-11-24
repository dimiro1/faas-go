import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { CodeEditor } from "../components/code-editor.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import { FormGroup, FormLabel, FormInput, FormTextarea, FormHelp } from "../components/form.js";
import { APIReference, LuaAPISections } from "../components/api-reference.js";

export const FunctionEdit = {
    func: null,
    loading: true,
    formData: {
        name: "",
        description: "",
        code: "",
    },
    errors: {},

    oninit: (vnode) => {
        FunctionEdit.loadFunction(vnode.attrs.id);
    },

    loadFunction: async (id) => {
        FunctionEdit.loading = true;
        FunctionEdit.errors = {};
        try {
            const func = await API.functions.get(id);
            FunctionEdit.func = func;
            FunctionEdit.formData = {
                name: func.name,
                description: func.description || "",
                code: func.active_version.code,
            };
        } catch (e) {
            console.error("Failed to load function:", e);
        } finally {
            FunctionEdit.loading = false;
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

    saveFunction: async () => {
        FunctionEdit.errors = {};
        try {
            await API.functions.update(FunctionEdit.func.id, FunctionEdit.formData);
            Toast.show("Function updated successfully", "success");
            m.route.set(`/functions/${FunctionEdit.func.id}`);
        } catch (e) {
            const error = FunctionEdit.parseErrorMessage(e.message);
            if (error) {
                FunctionEdit.errors[error.field] = error.message;
                m.redraw();
            } else {
                Toast.show("Failed to save function: " + e.message, "error");
            }
        }
    },

    view: (vnode) => {
        if (FunctionEdit.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading function...")
            ]);
        }

        if (!FunctionEdit.func) {
            return m(".fade-in", m(Card, m(CardContent, "Function not found")));
        }

        return m(".fade-in", [
            m(BackButton, { href: `#!/functions/${FunctionEdit.func.id}` }),

            m(".page-header", [
                m(".page-header__title", [
                    m("div", [
                        m("h1", FunctionEdit.func.name),
                        m(".page-header__subtitle", "Edit function code and details")
                    ])
                ])
            ]),

            m(".layout-with-sidebar", [
                m(".main-column", [
                    // Function Details
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "Function Details" }),
                        m(CardContent, [
                            m(FormGroup, [
                                m(FormLabel, { text: "Name", required: true }),
                                m(FormInput, {
                                    value: FunctionEdit.formData.name,
                                    error: !!FunctionEdit.errors.name,
                                    mono: true,
                                    oninput: (e) => {
                                        FunctionEdit.formData.name = e.target.value;
                                        delete FunctionEdit.errors.name;
                                    }
                                }),
                                FunctionEdit.errors.name &&
                                    m(FormHelp, { error: true, text: FunctionEdit.errors.name })
                            ]),
                            m(FormGroup, [
                                m(FormLabel, { text: "Description" }),
                                m(FormTextarea, {
                                    value: FunctionEdit.formData.description,
                                    error: !!FunctionEdit.errors.description,
                                    rows: 2,
                                    oninput: (e) => {
                                        FunctionEdit.formData.description = e.target.value;
                                        delete FunctionEdit.errors.description;
                                    }
                                }),
                                FunctionEdit.errors.description &&
                                    m(FormHelp, { error: true, text: FunctionEdit.errors.description })
                            ])
                        ])
                    ]),

                    // Code Editor
                    m(Card, { style: "margin-bottom: 1.5rem" }, [
                        m(CardHeader, { title: "Function Code" }),
                        m(CardContent, { noPadding: true }, [
                            m(CodeEditor, {
                                id: "code-editor",
                                value: FunctionEdit.formData.code,
                                onChange: (value) => {
                                    FunctionEdit.formData.code = value;
                                    delete FunctionEdit.errors.code;
                                }
                            }),
                            FunctionEdit.errors.code &&
                                m(FormHelp, { error: true, text: FunctionEdit.errors.code, style: "padding: 1rem" })
                        ])
                    ]),

                    // Actions
                    m("div", {
                        style: "display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 1.5rem;"
                    }, [
                        m(Button, {
                            variant: ButtonVariant.OUTLINE,
                            href: `#!/functions/${FunctionEdit.func.id}`
                        }, "Cancel"),
                        m(Button, {
                            variant: ButtonVariant.PRIMARY,
                            onclick: FunctionEdit.saveFunction
                        }, "Save Changes")
                    ])
                ]),

                // Sidebar - API Reference
                m(".docs-sidebar", [
                    m(APIReference, {
                        sections: LuaAPISections.map((s, i) => ({ ...s, active: i === 0 })),
                        activeSection: 'http',
                        onSectionChange: () => {}
                    })
                ])
            ])
        ]);
    }
};
