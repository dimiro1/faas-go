import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
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
  MethodBadges,
} from "../components/badge.js";
import { Tabs, TabContent } from "../components/tabs.js";
import { getFunctionTabs } from "../utils.js";
import { routes, paths } from "../routes.js";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormCheckbox,
  FormHelp,
  CopyInput,
} from "../components/form.js";
import { EnvEditor } from "../components/env-editor.js";

export const FunctionSettings = {
  func: null,
  loading: true,
  editedName: null,
  editedDescription: null,
  editedDisabled: null,
  envVars: [],
  envErrors: {},

  oninit: (vnode) => {
    FunctionSettings.editedName = null;
    FunctionSettings.editedDescription = null;
    FunctionSettings.editedDisabled = null;
    FunctionSettings.envVars = [];
    FunctionSettings.envErrors = {};
    FunctionSettings.loadFunction(vnode.attrs.id);
  },

  loadFunction: async (id) => {
    FunctionSettings.loading = true;
    try {
      FunctionSettings.func = await API.functions.get(id);
      FunctionSettings.editedName = null;
      FunctionSettings.editedDescription = null;
      FunctionSettings.editedDisabled = null;
      FunctionSettings.envVars = Object.entries(
        FunctionSettings.func.env_vars || {},
      ).map(([key, value]) => ({
        key,
        value,
        state: "original",
        originalKey: key,
      }));
      FunctionSettings.envErrors = {};
    } catch (e) {
      console.error("Failed to load function:", e);
    } finally {
      FunctionSettings.loading = false;
      m.redraw();
    }
  },

  hasEnvChanges: () => {
    return (
      FunctionSettings.envVars.some((v) => v.state !== "original") ||
      FunctionSettings.envVars.some((v) => v.state === "modified")
    );
  },

  saveEnvVars: async () => {
    FunctionSettings.envErrors = {};

    try {
      const env_vars = {};
      FunctionSettings.envVars.forEach((envVar) => {
        if (envVar.state !== "removed") {
          const key = envVar.key || "";
          const value = envVar.value || "";
          if (key || value) {
            env_vars[key] = value;
          }
        }
      });

      await API.functions.updateEnv(FunctionSettings.func.id, env_vars);
      Toast.show("Environment variables updated", "success");
      FunctionSettings.loadFunction(FunctionSettings.func.id);
    } catch (e) {
      FunctionSettings.envErrors.general = e.message;
      m.redraw();
    }
  },

  hasGeneralChanges: () => {
    return (
      FunctionSettings.editedName !== null ||
      FunctionSettings.editedDescription !== null
    );
  },

  saveGeneralSettings: async () => {
    if (!FunctionSettings.hasGeneralChanges()) return;

    try {
      const updates = {};
      if (FunctionSettings.editedName !== null) {
        updates.name = FunctionSettings.editedName;
      }
      if (FunctionSettings.editedDescription !== null) {
        updates.description = FunctionSettings.editedDescription;
      }

      await API.functions.update(FunctionSettings.func.id, updates);
      Toast.show("Settings saved successfully", "success");
      FunctionSettings.loadFunction(FunctionSettings.func.id);
    } catch (e) {
      Toast.show("Failed to save settings: " + e.message, "error");
    }
  },

  deleteFunction: async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${FunctionSettings.func.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await API.functions.delete(FunctionSettings.func.id);
      Toast.show("Function deleted successfully", "success");
      m.route.set(paths.functions());
    } catch (e) {
      Toast.show("Failed to delete function: " + e.message, "error");
    }
  },

  hasStatusChanges: () => {
    return FunctionSettings.editedDisabled !== null;
  },

  saveStatusSettings: async () => {
    if (!FunctionSettings.hasStatusChanges()) return;

    try {
      await API.functions.update(FunctionSettings.func.id, {
        disabled: FunctionSettings.editedDisabled,
      });
      const action = FunctionSettings.editedDisabled ? "disabled" : "enabled";
      Toast.show(`Function ${action} successfully`, "success");
      FunctionSettings.loadFunction(FunctionSettings.func.id);
    } catch (e) {
      Toast.show("Failed to update status: " + e.message, "error");
    }
  },

  view: (vnode) => {
    if (FunctionSettings.loading) {
      return m(".loading", [
        m.trust(icons.spinner()),
        m("p", "Loading function..."),
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
        activeTab: "settings",
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
                  value:
                    FunctionSettings.editedName !== null
                      ? FunctionSettings.editedName
                      : func.name,
                  mono: true,
                  oninput: (e) => {
                    const value = e.target.value;
                    if (value !== func.name) {
                      FunctionSettings.editedName = value;
                    } else {
                      FunctionSettings.editedName = null;
                    }
                  },
                }),
              ]),
              m(FormGroup, [
                m(FormLabel, { text: "Description" }),
                m(FormTextarea, {
                  value:
                    FunctionSettings.editedDescription !== null
                      ? FunctionSettings.editedDescription
                      : func.description || "",
                  rows: 2,
                  oninput: (e) => {
                    const value = e.target.value;
                    if (value !== (func.description || "")) {
                      FunctionSettings.editedDescription = value;
                    } else {
                      FunctionSettings.editedDescription = null;
                    }
                  },
                }),
              ]),
            ]),
            m(CardFooter, [
              m(
                Button,
                {
                  variant: ButtonVariant.PRIMARY,
                  onclick: FunctionSettings.saveGeneralSettings,
                  disabled: !FunctionSettings.hasGeneralChanges(),
                },
                "Save Changes",
              ),
            ]),
          ]),

          // Environment Variables
          m(Card, { style: "margin-bottom: 1.5rem" }, [
            m(CardHeader, {
              title: "Environment Variables",
              subtitle: `${FunctionSettings.envVars.filter((v) => v.state !== "removed").length} variables`,
            }),
            m(CardContent, [
              FunctionSettings.envErrors.general &&
                m(FormHelp, {
                  error: true,
                  text: FunctionSettings.envErrors.general,
                  style: "margin-bottom: 1rem",
                }),

              m(EnvEditor, {
                envVars: FunctionSettings.envVars,
                onAdd: () => {
                  FunctionSettings.envVars.push({
                    key: "",
                    value: "",
                    state: "added",
                  });
                  delete FunctionSettings.envErrors.general;
                },
                onToggleRemove: (i) => {
                  const envVar = FunctionSettings.envVars[i];
                  if (envVar.state === "removed") {
                    envVar.state = "original";
                  } else if (envVar.state === "added") {
                    FunctionSettings.envVars.splice(i, 1);
                  } else {
                    envVar.state = "removed";
                  }
                  delete FunctionSettings.envErrors.general;
                },
                onChange: (i, key, value) => {
                  FunctionSettings.envVars[i].key = key;
                  FunctionSettings.envVars[i].value = value;
                  if (FunctionSettings.envVars[i].state === "original") {
                    FunctionSettings.envVars[i].state = "modified";
                  }
                  delete FunctionSettings.envErrors.general;
                },
              }),
            ]),
            m(CardFooter, [
              m(
                Button,
                {
                  variant: ButtonVariant.PRIMARY,
                  onclick: FunctionSettings.saveEnvVars,
                  disabled: !FunctionSettings.hasEnvChanges(),
                },
                "Save Changes",
              ),
            ]),
          ]),

          // Network & Triggers
          m(Card, { style: "margin-bottom: 1.5rem" }, [
            m(CardHeader, { title: "Network & Triggers" }),
            m(CardContent, [
              m(FormGroup, [
                m(FormLabel, { text: "Invocation URL" }),
                m(CopyInput, {
                  value: `${window.location.origin}/fn/${func.id}`,
                  mono: true,
                }),
              ]),
              m(FormGroup, [
                m(FormLabel, { text: "Supported Methods" }),
                m(MethodBadges, {
                  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                }),
              ]),
            ]),
          ]),

          // Function Status
          m(Card, { variant: "warning", style: "margin-bottom: 1.5rem" }, [
            m(CardHeader, { title: "Function Status" }),
            m(CardContent, [
              m(FormCheckbox, {
                id: "enable-function",
                label: "Enable Function",
                description:
                  "Disabling will stop all incoming requests to this function.",
                checked:
                  FunctionSettings.editedDisabled !== null
                    ? !FunctionSettings.editedDisabled
                    : !func.disabled,
                onchange: () => {
                  const newValue =
                    FunctionSettings.editedDisabled !== null
                      ? !FunctionSettings.editedDisabled
                      : !func.disabled;
                  if (newValue === func.disabled) {
                    FunctionSettings.editedDisabled = null;
                  } else {
                    FunctionSettings.editedDisabled = newValue;
                  }
                },
              }),
            ]),
            m(CardFooter, [
              m(
                Button,
                {
                  variant: ButtonVariant.PRIMARY,
                  onclick: FunctionSettings.saveStatusSettings,
                  disabled: !FunctionSettings.hasStatusChanges(),
                },
                "Save Changes",
              ),
            ]),
          ]),

          // Danger Zone
          m(Card, { variant: "danger" }, [
            m(CardHeader, { title: "Danger Zone" }),
            m(CardContent, [
              m(".danger-zone-item", [
                m(".danger-zone-info", [
                  m("p.danger-zone-title", "Delete Function"),
                  m(
                    "p.danger-zone-description",
                    "Once deleted, this function cannot be recovered.",
                  ),
                ]),
                m(
                  Button,
                  {
                    variant: ButtonVariant.DESTRUCTIVE,
                    onclick: FunctionSettings.deleteFunction,
                  },
                  "Delete",
                ),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  },
};
