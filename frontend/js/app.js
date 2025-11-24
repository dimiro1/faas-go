import { icons } from "./icons.js";
import { Toast } from "./components/toast.js";
import { Header } from "./components/navbar.js";
import { Login } from "./views/login.js";
import { FunctionsList } from "./views/functions-list.js";
import { FunctionCreate } from "./views/function-create.js";
import { FunctionDetail } from "./views/function-detail.js";
import { FunctionEdit } from "./views/function-edit.js";
import { FunctionEnv } from "./views/function-env.js";
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
                onLogout: Layout.handleLogout
            }),
            m("main", vnode.children),
            m(Toast)
        ];
    }
};

// Routes
m.route(document.getElementById("app"), "/functions", {
    "/login": {
        render: () => m(Login)
    },
    "/functions": {
        render: () => m(Layout, m(FunctionsList))
    },
    "/functions/new": {
        render: () => m(Layout, { breadcrumb: "New Function" }, m(FunctionCreate))
    },
    "/functions/:id": {
        render: (vnode) => m(Layout, { breadcrumb: "Function Details" }, m(FunctionDetail, vnode.attrs))
    },
    "/functions/:id/edit": {
        render: (vnode) => m(Layout, { breadcrumb: "Edit Function" }, m(FunctionEdit, vnode.attrs))
    },
    "/functions/:id/env": {
        render: (vnode) => m(Layout, { breadcrumb: "Environment" }, m(FunctionEnv, vnode.attrs))
    },
    "/functions/:id/diff/:v1/:v2": {
        render: (vnode) => m(Layout, { breadcrumb: "Version Diff" }, m(VersionDiff, vnode.attrs))
    },
    "/executions/:id": {
        render: (vnode) => m(Layout, { breadcrumb: "Execution Details" }, m(ExecutionDetail, vnode.attrs))
    },
    "/preview": {
        render: () => m(Layout, { breadcrumb: "Component Preview" }, m(Preview))
    },
    "/preview/:component": {
        render: (vnode) => m(Layout, { breadcrumb: "Component Preview" }, m(Preview, vnode.attrs))
    }
});
