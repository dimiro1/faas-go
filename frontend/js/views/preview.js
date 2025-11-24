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
  CardDivider,
} from "../components/card.js";
import {
  Badge,
  BadgeVariant,
  BadgeSize,
  IDBadge,
  StatusBadge,
  MethodBadges,
  LogLevelBadge,
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
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormHelp,
  PasswordInput,
  CopyInput,
} from "../components/form.js";
import { Pagination } from "../components/pagination.js";
import { Toast } from "../components/toast.js";
import { Kbd, Separator } from "../components/kbd.js";
import {
  TemplateCard,
  TemplateCards,
  FunctionTemplates,
} from "../components/template-card.js";
import { APIReference, LuaAPISections } from "../components/api-reference.js";
import { LogViewer } from "../components/log-viewer.js";
import { CodeViewer } from "../components/code-viewer.js";
import { EnvEditor } from "../components/env-editor.js";
import { RequestBuilder } from "../components/request-builder.js";
import {
  DiffViewer,
  VersionLabels,
  LineType,
} from "../components/diff-viewer.js";

// Preview page for all components
export const Preview = {
  activeComponent: "button",

  // State for interactive demos
  demoState: {
    selectedTemplate: "http",
    activeTab: "tab1",
    apiSection: "http",
    checkboxChecked: false,
    selectValue: "option1",
    paginationOffset: 0,
    paginationLimit: 10,
    envVars: [
      {
        key: "API_KEY",
        value: "secret123",
        state: "original",
        originalKey: "API_KEY",
      },
      { key: "DEBUG", value: "true", state: "original", originalKey: "DEBUG" },
    ],
    requestMethod: "GET",
    requestQuery: "",
    requestBody: "",
  },

  oninit: (vnode) => {
    const component = m.route.param("component");
    if (component) {
      Preview.activeComponent = component;
    }
  },

  onbeforeupdate: (vnode) => {
    const component = m.route.param("component");
    if (component && component !== Preview.activeComponent) {
      Preview.activeComponent = component;
    }
  },

  components: [
    "button",
    "card",
    "badge",
    "table",
    "tabs",
    "form",
    "pagination",
    "toast",
    "kbd",
    "template-card",
    "api-reference",
    "log-viewer",
    "code-viewer",
    "env-editor",
    "request-builder",
    "diff-viewer",
  ],

  view: () => {
    return m(".preview-page", [
      m(".preview-sidebar", [
        m("h2.preview-sidebar__title", "Components"),
        m(
          "nav.preview-sidebar__nav",
          Preview.components.map((comp) =>
            m(
              "a.preview-sidebar__link",
              {
                href: `#!/preview/${comp}`,
                class:
                  Preview.activeComponent === comp
                    ? "preview-sidebar__link--active"
                    : "",
              },
              comp.replace("-", " "),
            ),
          ),
        ),
      ]),
      m(".preview-content", [
        m(
          "h1.preview-content__title",
          Preview.activeComponent.replace("-", " "),
        ),
        m(".preview-content__component", [
          Preview.renderComponent(Preview.activeComponent),
        ]),
      ]),
    ]);
  },

  renderComponent: (name) => {
    switch (name) {
      case "button":
        return Preview.renderButtons();
      case "card":
        return Preview.renderCards();
      case "badge":
        return Preview.renderBadges();
      case "table":
        return Preview.renderTable();
      case "tabs":
        return Preview.renderTabs();
      case "form":
        return Preview.renderForms();
      case "pagination":
        return Preview.renderPagination();
      case "toast":
        return Preview.renderToast();
      case "kbd":
        return Preview.renderKbd();
      case "template-card":
        return Preview.renderTemplateCards();
      case "api-reference":
        return Preview.renderAPIReference();
      case "log-viewer":
        return Preview.renderLogViewer();
      case "code-viewer":
        return Preview.renderCodeViewer();
      case "env-editor":
        return Preview.renderEnvEditor();
      case "request-builder":
        return Preview.renderRequestBuilder();
      case "diff-viewer":
        return Preview.renderDiffViewer();
      default:
        return m("p", "Component not found");
    }
  },

  renderButtons: () => {
    return m(".preview-section", [
      m("h3", "Variants"),
      m(".preview-row", [
        m(Button, { variant: ButtonVariant.PRIMARY }, "Primary"),
        m(Button, { variant: ButtonVariant.SECONDARY }, "Secondary"),
        m(Button, { variant: ButtonVariant.OUTLINE }, "Outline"),
        m(Button, { variant: ButtonVariant.GHOST }, "Ghost"),
        m(Button, { variant: ButtonVariant.DESTRUCTIVE }, "Destructive"),
        m(Button, { variant: ButtonVariant.LINK }, "Link"),
      ]),

      m("h3", "Sizes"),
      m(".preview-row", [
        m(Button, { size: ButtonSize.SM }, "Small"),
        m(Button, { size: ButtonSize.DEFAULT }, "Default"),
        m(Button, { size: ButtonSize.LG }, "Large"),
        m(Button, { size: ButtonSize.ICON, icon: "plus" }),
      ]),

      m("h3", "With Icons"),
      m(".preview-row", [
        m(Button, { icon: "plus" }, "Add Item"),
        m(
          Button,
          { variant: ButtonVariant.DESTRUCTIVE, icon: "trash" },
          "Delete",
        ),
        m(Button, { variant: ButtonVariant.SECONDARY, icon: "copy" }, "Copy"),
      ]),

      m("h3", "States"),
      m(".preview-row", [
        m(Button, { disabled: true }, "Disabled"),
        m(Button, { loading: true }, "Loading"),
      ]),

      m("h3", "Back Button"),
      m(".preview-row", [m(BackButton, { href: "#!/preview" })]),
    ]);
  },

  renderCards: () => {
    return m(".preview-section", [
      m("h3", "Basic Card"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardHeader, { title: "Card Title", subtitle: "Card subtitle text" }),
        m(CardContent, [
          m("p", "This is the card content. It can contain any elements."),
        ]),
        m(CardFooter, [
          m(Button, { variant: ButtonVariant.PRIMARY }, "Action"),
        ]),
      ]),

      m("h3", "Card Variants"),
      m(".preview-grid", [
        m(Card, { variant: "danger", style: "margin-bottom: 1rem;" }, [
          m(CardHeader, { title: "Danger Card" }),
          m(CardContent, "This is a danger variant card."),
        ]),
        m(Card, { variant: "warning", style: "margin-bottom: 1rem;" }, [
          m(CardHeader, { title: "Warning Card" }),
          m(CardContent, "This is a warning variant card."),
        ]),
      ]),

      m("h3", "With Divider"),
      m(Card, { style: "max-width: 400px;" }, [
        m(CardHeader, { title: "Section 1" }),
        m(CardContent, "First section content"),
        m(CardDivider),
        m(CardContent, "Second section content"),
      ]),
    ]);
  },

  renderBadges: () => {
    return m(".preview-section", [
      m("h3", "Variants"),
      m(".preview-row", [
        m(Badge, { variant: BadgeVariant.DEFAULT }, "Default"),
        m(Badge, { variant: BadgeVariant.PRIMARY }, "Primary"),
        m(Badge, { variant: BadgeVariant.SECONDARY }, "Secondary"),
        m(Badge, { variant: BadgeVariant.SUCCESS }, "Success"),
        m(Badge, { variant: BadgeVariant.DESTRUCTIVE }, "Destructive"),
        m(Badge, { variant: BadgeVariant.WARNING }, "Warning"),
        m(Badge, { variant: BadgeVariant.INFO }, "Info"),
      ]),

      m("h3", "Sizes"),
      m(".preview-row", [
        m(Badge, { size: BadgeSize.SM }, "Small"),
        m(Badge, { size: BadgeSize.DEFAULT }, "Default"),
        m(Badge, { size: BadgeSize.LG }, "Large"),
      ]),

      m("h3", "ID Badge"),
      m(".preview-row", [
        m(IDBadge, { id: "abc123def456" }),
        m(IDBadge, { id: "xyz789" }),
      ]),

      m("h3", "Status Badge"),
      m(".preview-row", [
        m(StatusBadge, { enabled: true }),
        m(StatusBadge, { enabled: false }),
        m(StatusBadge, { enabled: true, glow: true }),
      ]),

      m("h3", "Method Badges"),
      m(".preview-row", [m(MethodBadges)]),

      m("h3", "Log Level Badges"),
      m(".preview-row", [
        m(LogLevelBadge, { level: "INFO" }),
        m(LogLevelBadge, { level: "WARN" }),
        m(LogLevelBadge, { level: "ERROR" }),
        m(LogLevelBadge, { level: "DEBUG" }),
      ]),
    ]);
  },

  renderTable: () => {
    const data = [
      { id: "func-1", name: "get-users", status: "active", version: "1.0.0" },
      {
        id: "func-2",
        name: "create-order",
        status: "active",
        version: "2.1.0",
      },
      {
        id: "func-3",
        name: "send-email",
        status: "disabled",
        version: "1.2.3",
      },
    ];

    return m(".preview-section", [
      m("h3", "Basic Table"),
      m(Card, [
        m(Table, [
          m(TableHeader, [
            m(TableRow, [
              m(TableHead, "Name"),
              m(TableHead, "Status"),
              m(TableHead, "Version"),
            ]),
          ]),
          m(
            TableBody,
            data.map((row) =>
              m(TableRow, { key: row.id }, [
                m(TableCell, { mono: true }, row.name),
                m(
                  TableCell,
                  m(StatusBadge, { enabled: row.status === "active" }),
                ),
                m(TableCell, row.version),
              ]),
            ),
          ),
        ]),
      ]),

      m("h3", "Empty Table"),
      m(Card, [
        m(Table, [
          m(TableBody, [
            m(TableEmpty, {
              colspan: 3,
              icon: "inbox",
              message: "No items found. Create your first item to get started.",
            }),
          ]),
        ]),
      ]),
    ]);
  },

  renderTabs: () => {
    const tabs = [
      { id: "tab1", label: "Overview" },
      { id: "tab2", label: "Settings" },
      { id: "tab3", label: "Logs (42)" },
    ];

    return m(".preview-section", [
      m("h3", "Tabs"),
      m(Tabs, {
        tabs,
        activeTab: Preview.demoState.activeTab,
        onTabChange: (id) => (Preview.demoState.activeTab = id),
      }),
      m(TabContent, [
        Preview.demoState.activeTab === "tab1" &&
          m(Card, [m(CardContent, "Overview content goes here")]),
        Preview.demoState.activeTab === "tab2" &&
          m(Card, [m(CardContent, "Settings content goes here")]),
        Preview.demoState.activeTab === "tab3" &&
          m(Card, [m(CardContent, "Logs content goes here")]),
      ]),
    ]);
  },

  renderForms: () => {
    return m(".preview-section", [
      m("h3", "Input"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardContent, [
          m(FormGroup, [
            m(FormLabel, { text: "Name", required: true }),
            m(FormInput, { placeholder: "Enter name" }),
          ]),
          m(FormGroup, [
            m(FormLabel, { text: "Code" }),
            m(FormInput, { placeholder: "monospace", mono: true }),
          ]),
          m(FormGroup, [
            m(FormLabel, { text: "Error State" }),
            m(FormInput, { error: true, value: "Invalid value" }),
            m(FormHelp, { error: true, text: "This field has an error" }),
          ]),
        ]),
      ]),

      m("h3", "Password Input"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardContent, [
          m(FormGroup, [
            m(FormLabel, { text: "Password" }),
            m(PasswordInput, { placeholder: "Enter password" }),
          ]),
        ]),
      ]),

      m("h3", "Copy Input"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardContent, [
          m(FormGroup, [
            m(FormLabel, { text: "API URL" }),
            m(CopyInput, {
              value: "https://api.example.com/v1/functions",
              mono: true,
            }),
          ]),
        ]),
      ]),

      m("h3", "Textarea"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardContent, [
          m(FormGroup, [
            m(FormLabel, { text: "Description" }),
            m(FormTextarea, { placeholder: "Enter description...", rows: 3 }),
          ]),
        ]),
      ]),

      m("h3", "Select"),
      m(Card, { style: "max-width: 400px; margin-bottom: 1rem;" }, [
        m(CardContent, [
          m(FormGroup, [
            m(FormLabel, { text: "Option" }),
            m(FormSelect, {
              options: [
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ],
              selected: Preview.demoState.selectValue,
              onchange: (e) => (Preview.demoState.selectValue = e.target.value),
            }),
          ]),
        ]),
      ]),

      m("h3", "Checkbox"),
      m(Card, { style: "max-width: 400px;" }, [
        m(CardContent, [
          m(FormCheckbox, {
            id: "demo-checkbox",
            label: "Enable feature",
            description: "This will enable the experimental feature.",
            checked: Preview.demoState.checkboxChecked,
            onchange: () =>
              (Preview.demoState.checkboxChecked =
                !Preview.demoState.checkboxChecked),
          }),
        ]),
      ]),
    ]);
  },

  renderPagination: () => {
    return m(".preview-section", [
      m("h3", "Pagination"),
      m(Card, [
        m(CardContent, [
          m(Pagination, {
            total: 100,
            limit: Preview.demoState.paginationLimit,
            offset: Preview.demoState.paginationOffset,
            onPageChange: (offset) =>
              (Preview.demoState.paginationOffset = offset),
            onLimitChange: (limit) => {
              Preview.demoState.paginationLimit = limit;
              Preview.demoState.paginationOffset = 0;
            },
          }),
        ]),
      ]),
    ]);
  },

  renderToast: () => {
    return m(".preview-section", [
      m("h3", "Toast Notifications"),
      m(".preview-row", [
        m(
          Button,
          {
            onclick: () =>
              Toast.show("Operation completed successfully", "success"),
          },
          "Success Toast",
        ),
        m(
          Button,
          {
            variant: ButtonVariant.DESTRUCTIVE,
            onclick: () => Toast.show("An error occurred", "error"),
          },
          "Error Toast",
        ),
        m(
          Button,
          {
            variant: ButtonVariant.SECONDARY,
            onclick: () => Toast.show("Please note this information", "info"),
          },
          "Info Toast",
        ),
      ]),
    ]);
  },

  renderKbd: () => {
    return m(".preview-section", [
      m("h3", "Keyboard Shortcuts"),
      m(".preview-row", [m(Kbd, "Ctrl"), m(Separator), m(Kbd, "C")]),
      m(".preview-row", { style: "margin-top: 1rem;" }, [
        m(Kbd, "⌘"),
        m(Separator),
        m(Kbd, "K"),
      ]),
    ]);
  },

  renderTemplateCards: () => {
    return m(".preview-section", [
      m("h3", "Template Cards"),
      m(
        TemplateCards,
        FunctionTemplates.map((template) =>
          m(TemplateCard, {
            key: template.id,
            name: template.name,
            description: template.description,
            icon: template.icon,
            selected: Preview.demoState.selectedTemplate === template.id,
            onclick: () => (Preview.demoState.selectedTemplate = template.id),
          }),
        ),
      ),
    ]);
  },

  renderAPIReference: () => {
    return m(".preview-section", [
      m("h3", "API Reference"),
      m(".preview-api-reference", { style: "max-width: 400px;" }, [
        m(APIReference, {
          sections: LuaAPISections,
          activeSection: Preview.demoState.apiSection,
          onSectionChange: (id) => {
            Preview.demoState.apiSection = id;
          },
        }),
      ]),
    ]);
  },

  renderLogViewer: () => {
    const logs = [
      {
        level: "INFO",
        message: "Function started",
        timestamp: "2024-01-15 10:30:00",
      },
      {
        level: "DEBUG",
        message: "Processing request...",
        timestamp: "2024-01-15 10:30:01",
      },
      {
        level: "WARN",
        message: "Rate limit approaching",
        timestamp: "2024-01-15 10:30:02",
      },
      {
        level: "ERROR",
        message: "Connection timeout",
        timestamp: "2024-01-15 10:30:03",
      },
      {
        level: "INFO",
        message: "Retrying connection...",
        timestamp: "2024-01-15 10:30:04",
      },
    ];

    return m(".preview-section", [
      m("h3", "Log Viewer"),
      m(Card, { style: "max-width: 600px;" }, [
        m(CardHeader, { title: "Execution Logs" }),
        m(CardContent, { noPadding: true }, [
          m(LogViewer, {
            logs,
            maxHeight: "250px",
            noBorder: true,
          }),
        ]),
      ]),

      m("h3", "Empty State"),
      m(Card, { style: "max-width: 600px;" }, [
        m(CardContent, { noPadding: true }, [
          m(LogViewer, { logs: [], noBorder: true }),
        ]),
      ]),
    ]);
  },

  renderCodeViewer: () => {
    const luaCode = `function handle(ctx)
    local method = ctx.request.method
    log.info("Received " .. method .. " request")

    return {
        status = 200,
        body = json.encode({ message = "Hello!" })
    }
end`;

    const jsonCode = `{
    "name": "my-function",
    "version": "1.0.0",
    "env": {
        "API_KEY": "secret"
    }
}`;

    return m(".preview-section", [
      m("h3", "Lua Code"),
      m(Card, { style: "max-width: 600px; margin-bottom: 1rem;" }, [
        m(CardContent, { noPadding: true }, [
          m(CodeViewer, {
            code: luaCode,
            language: "lua",
            showHeader: true,
            noBorder: true,
            padded: true,
          }),
        ]),
      ]),

      m("h3", "JSON"),
      m(Card, { style: "max-width: 600px;" }, [
        m(CardContent, { noPadding: true }, [
          m(CodeViewer, {
            code: jsonCode,
            language: "json",
            noBorder: true,
            padded: true,
          }),
        ]),
      ]),
    ]);
  },

  renderEnvEditor: () => {
    return m(".preview-section", [
      m("h3", "Environment Editor"),
      m(Card, { style: "max-width: 600px;" }, [
        m(CardHeader, { title: "Environment Variables" }),
        m(CardContent, [
          m(EnvEditor, {
            envVars: Preview.demoState.envVars,
            onAdd: () =>
              Preview.demoState.envVars.push({
                key: "",
                value: "",
                state: "added",
              }),
            onToggleRemove: (i) => {
              const envVar = Preview.demoState.envVars[i];
              if (envVar.state === "removed") {
                envVar.state = "original";
              } else if (envVar.state === "added") {
                Preview.demoState.envVars.splice(i, 1);
              } else {
                envVar.state = "removed";
              }
            },
            onChange: (i, key, value) => {
              Preview.demoState.envVars[i].key = key;
              Preview.demoState.envVars[i].value = value;
            },
          }),
        ]),
      ]),
    ]);
  },

  renderRequestBuilder: () => {
    return m(".preview-section", [
      m("h3", "Request Builder"),
      m(".preview-request-builder", { style: "max-width: 500px;" }, [
        m(RequestBuilder, {
          url: "https://api.example.com/functions/abc123/invoke",
          method: Preview.demoState.requestMethod,
          query: Preview.demoState.requestQuery,
          body: Preview.demoState.requestBody,
          onMethodChange: (v) => (Preview.demoState.requestMethod = v),
          onQueryChange: (v) => (Preview.demoState.requestQuery = v),
          onBodyChange: (v) => (Preview.demoState.requestBody = v),
          onExecute: () => Toast.show("Request sent!", "success"),
        }),
      ]),
    ]);
  },

  renderDiffViewer: () => {
    const sampleDiff = [
      {
        oldLine: 1,
        newLine: 1,
        type: LineType.UNCHANGED,
        content: "function handle(request)",
      },
      {
        oldLine: 2,
        newLine: 2,
        type: LineType.UNCHANGED,
        content: "  local response = {}",
      },
      {
        oldLine: 3,
        newLine: 0,
        type: LineType.REMOVED,
        content: '  response.body = "Hello"',
      },
      {
        oldLine: 0,
        newLine: 3,
        type: LineType.ADDED,
        content: '  response.body = "Hello, World!"',
      },
      {
        oldLine: 0,
        newLine: 4,
        type: LineType.ADDED,
        content: "  response.status = 200",
      },
      {
        oldLine: 4,
        newLine: 5,
        type: LineType.UNCHANGED,
        content: "  return response",
      },
      { oldLine: 5, newLine: 6, type: LineType.UNCHANGED, content: "end" },
    ];

    return [
      m(".preview-section", [
        m("h3", "Version Labels"),
        m(VersionLabels, {
          oldLabel: "v1",
          newLabel: "v2",
          oldMeta: "2 days ago",
          newMeta: "just now",
          additions: 2,
          deletions: 1,
        }),
      ]),

      m(".preview-section", [
        m("h3", "Diff Viewer"),
        m(DiffViewer, {
          lines: sampleDiff,
          maxHeight: "300px",
        }),
      ]),
    ];
  },
};
