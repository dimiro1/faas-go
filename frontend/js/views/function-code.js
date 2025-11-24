import { icons } from "../icons.js";
import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { CodeEditor } from "../components/code-editor.js";
import {
  Button,
  ButtonVariant,
  ButtonSize,
  BackButton,
} from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import {
  Badge,
  BadgeVariant,
  BadgeSize,
  IDBadge,
  StatusBadge,
} from "../components/badge.js";
import { Tabs, TabContent } from "../components/tabs.js";
import { getFunctionTabs } from "../utils.js";
import { routes } from "../routes.js";
import { APIReference, LuaAPISections } from "../components/api-reference.js";

export const FunctionCode = {
  func: null,
  loading: true,
  activeApiSection: "handler",
  editedCode: null,

  oninit: (vnode) => {
    FunctionCode.editedCode = null;
    FunctionCode.loadFunction(vnode.attrs.id);
  },

  loadFunction: async (id) => {
    FunctionCode.loading = true;
    try {
      FunctionCode.func = await API.functions.get(id);
    } catch (e) {
      console.error("Failed to load function:", e);
    } finally {
      FunctionCode.loading = false;
      m.redraw();
    }
  },

  saveCode: async () => {
    if (FunctionCode.editedCode === null) return;

    try {
      await API.functions.update(FunctionCode.func.id, {
        code: FunctionCode.editedCode,
      });
      Toast.show("Code saved successfully", "success");
      FunctionCode.editedCode = null;
      FunctionCode.loadFunction(FunctionCode.func.id);
    } catch (e) {
      Toast.show("Failed to save code: " + e.message, "error");
    }
  },

  view: (vnode) => {
    if (FunctionCode.loading) {
      return m(".loading", [
        m.trust(icons.spinner()),
        m("p", "Loading function..."),
      ]);
    }

    if (!FunctionCode.func) {
      return m(".fade-in", m(Card, m(CardContent, "Function not found")));
    }

    const func = FunctionCode.func;

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
          m(
            Button,
            {
              variant: ButtonVariant.PRIMARY,
              size: ButtonSize.SM,
              onclick: FunctionCode.saveCode,
              disabled: FunctionCode.editedCode === null,
            },
            "Save Changes",
          ),
        ]),
      ]),

      // Tabs
      m(Tabs, {
        tabs: getFunctionTabs(func.id),
        activeTab: "code",
      }),

      // Content
      m(TabContent, [
        m(".code-tab-container", [
          m(Card, { class: "code-card" }, [
            m(CardHeader, {
              title: `main.lua`,
              icon: "code",
              actions: [m("span.code-editor-lang", "lua")],
            }),
            m(CardContent, { noPadding: true }, [
              m(CodeEditor, {
                id: "code-viewer",
                value:
                  FunctionCode.editedCode !== null
                    ? FunctionCode.editedCode
                    : func.active_version.code,
                onChange: (value) => {
                  if (value !== func.active_version.code) {
                    FunctionCode.editedCode = value;
                  } else {
                    FunctionCode.editedCode = null;
                  }
                  m.redraw();
                },
              }),
            ]),
          ]),
          m(".api-reference-sidebar", [
            m(APIReference, {
              sections: LuaAPISections,
              activeSection: FunctionCode.activeApiSection,
              onSectionChange: (id) => {
                FunctionCode.activeApiSection = id;
              },
            }),
          ]),
        ]),
      ]),
    ]);
  },
};
