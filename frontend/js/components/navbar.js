import { icons } from "../icons.js";
import { Kbd } from "./kbd.js";

/**
 * Navbar component
 */
export const Navbar = {
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;

    return m(
      "header.navbar",
      {
        class: className,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Navbar Section component
 */
export const NavbarSection = {
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;

    return m(
      "div.navbar__section",
      {
        class: className,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Navbar Brand component
 */
export const NavbarBrand = {
  view(vnode) {
    const {
      name = "Dashboard",
      href = "#!/",
      icon = "bolt",
      class: className = "",
      ...attrs
    } = vnode.attrs;

    return m(
      "a.navbar__brand",
      {
        href,
        class: className,
        ...attrs,
      },
      [
        m(".navbar__brand-icon", m.trust(icons[icon]())),
        m("span.navbar__brand-name", name),
      ],
    );
  },
};

/**
 * Navbar Breadcrumb component
 */
export const NavbarBreadcrumb = {
  view(vnode) {
    const { items = [], class: className = "" } = vnode.attrs;

    return m(
      "nav.navbar__breadcrumb",
      {
        class: className,
        "aria-label": "Breadcrumb",
      },
      items
        .map((item, i) => [
          i > 0 &&
            m(
              "span.navbar__breadcrumb-separator",
              { "aria-hidden": "true" },
              "/",
            ),
          item.active
            ? m(
                "span.navbar__breadcrumb-current",
                { "aria-current": "page" },
                item.label,
              )
            : m("a.navbar__breadcrumb-link", { href: item.href }, item.label),
        ])
        .flat(),
    );
  },
};

/**
 * Navbar Search button component
 */
export const NavbarSearch = {
  view(vnode) {
    const {
      placeholder = "Search",
      shortcut = "⌘K",
      onclick,
      class: className = "",
    } = vnode.attrs;

    return m(
      "button.navbar__search",
      {
        class: className,
        onclick,
      },
      [m("span", placeholder), shortcut && m(Kbd, { small: true }, shortcut)],
    );
  },
};

/**
 * Navbar Divider component
 */
export const NavbarDivider = {
  view() {
    return m(".navbar__divider", { "aria-hidden": "true" });
  },
};

/**
 * Navbar Action component
 */
export const NavbarAction = {
  view(vnode) {
    const {
      label,
      href,
      icon,
      onclick,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const content = [icon && m.trust(icons[icon]()), label];

    if (href) {
      return m(
        "a.navbar__action",
        {
          href,
          class: className,
          ...attrs,
        },
        content,
      );
    }

    return m(
      "button.navbar__action",
      {
        onclick,
        class: className,
        ...attrs,
      },
      content,
    );
  },
};

/**
 * Standard Header component - convenience wrapper
 */
export const Header = {
  view(vnode) {
    const { breadcrumb, onLogout, onSearch } = vnode.attrs;

    return m(Navbar, [
      m(NavbarSection, [
        m(NavbarBrand, { name: "Dashboard", href: "#!/" }),
        breadcrumb &&
          m(
            "span.navbar__breadcrumb-separator",
            { "aria-hidden": "true" },
            "/",
          ),
        breadcrumb &&
          m(NavbarBreadcrumb, {
            items: [{ label: breadcrumb, active: true }],
          }),
      ]),
      m(NavbarSection, [
        m(NavbarSearch, {
          placeholder: "Search",
          shortcut: "⌘K",
          onclick: onSearch,
        }),
        m(NavbarDivider),
        m(NavbarAction, {
          label: "Logout",
          onclick: onLogout,
        }),
      ]),
    ]);
  },
};

export default {
  Navbar,
  NavbarSection,
  NavbarBrand,
  NavbarBreadcrumb,
  NavbarSearch,
  NavbarDivider,
  NavbarAction,
  Header,
};
