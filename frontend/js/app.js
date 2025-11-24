import { Toast } from "./components/toast.js";
import { Header } from "./components/navbar.js";
import { CommandPalette } from "./components/command-palette.js";
import { Login } from "./views/login.js";
import { FunctionsList } from "./views/functions-list.js";
import { FunctionCreate } from "./views/function-create.js";
import { FunctionCode } from "./views/function-code.js";
import { FunctionVersions } from "./views/function-versions.js";
import { FunctionExecutions } from "./views/function-executions.js";
import { FunctionSettings } from "./views/function-settings.js";
import { FunctionTest } from "./views/function-test.js";
import { ExecutionDetail } from "./views/execution-detail.js";
import { VersionDiff } from "./views/version-diff.js";
import { Preview } from "./views/preview.js";
import { API } from "./api.js";

// Layout component with new navbar
const Layout = {
  handleLogout: async () => {
    try {
      await API.auth.logout();
      m.route.set("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  },

  view: (vnode) => {
    const breadcrumb = vnode.attrs.breadcrumb;

    return [
      m(Header, {
        breadcrumb,
        onLogout: Layout.handleLogout,
      }),
      m("main", vnode.children),
      m(Toast),
      m(CommandPalette),
    ];
  },
};

// Routes
m.route(document.getElementById("app"), "/functions", {
  "/login": {
    render: () => m(Login),
  },
  "/functions": {
    render: () => m(Layout, m(FunctionsList)),
  },
  "/functions/new": {
    render: () => m(Layout, { breadcrumb: "New Function" }, m(FunctionCreate)),
  },
  "/functions/:id": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Code" },
        m(FunctionCode, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/functions/:id/versions": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Versions" },
        m(FunctionVersions, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/functions/:id/executions": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Executions" },
        m(FunctionExecutions, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/functions/:id/settings": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Settings" },
        m(FunctionSettings, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/functions/:id/test": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Test" },
        m(FunctionTest, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/functions/:id/diff/:v1/:v2": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Version Diff" },
        m(VersionDiff, {
          ...vnode.attrs,
          key: `${vnode.attrs.id}-${vnode.attrs.v1}-${vnode.attrs.v2}`,
        }),
      ),
  },
  "/executions/:id": {
    render: (vnode) =>
      m(
        Layout,
        { breadcrumb: "Execution Details" },
        m(ExecutionDetail, { ...vnode.attrs, key: vnode.attrs.id }),
      ),
  },
  "/preview": {
    render: () => m(Layout, { breadcrumb: "Component Preview" }, m(Preview)),
  },
  "/preview/:component": {
    render: (vnode) =>
      m(Layout, { breadcrumb: "Component Preview" }, m(Preview, vnode.attrs)),
  },
});
