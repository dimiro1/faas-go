import { icons } from "../icons.js";

/**
 * Tabs component
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with {id, label} or {id, name, href}
 * @param {string} [props.activeTab] - Currently active tab ID (for click-based tabs)
 * @param {Function} [props.onTabChange] - Callback when tab is clicked (for click-based tabs)
 */
export const Tabs = {
  view(vnode) {
    const {
      tabs = [],
      activeTab,
      onTabChange,
      class: className = "",
    } = vnode.attrs;

    return m(
      "div.tabs",
      {
        class: className,
        role: "tablist",
      },
      tabs.map((tab) => {
        const tabId = tab.id;
        const tabLabel = tab.label || tab.name;
        const isActive = activeTab ? activeTab === tabId : tab.active;
        const isDisabled = tab.disabled;

        return m(
          "a.tabs__item",
          {
            href: tab.href || "#",
            class: [
              isActive && "tabs__item--active",
              isDisabled && "tabs__item--disabled",
            ]
              .filter(Boolean)
              .join(" "),
            role: "tab",
            "aria-selected": isActive ? "true" : "false",
            "aria-controls": `tab-${tabId}`,
            "aria-disabled": isDisabled || undefined,
            tabindex: isDisabled ? -1 : undefined,
            "data-tab": "true",
            "data-tab-active": isActive || undefined,
            "data-tab-disabled": isDisabled || undefined,
            onclick: (e) => {
              if (isDisabled) {
                e.preventDefault();
                return;
              }
              if (onTabChange) {
                e.preventDefault();
                onTabChange(tabId);
              }
            },
          },
          [
            tab.icon && m("span.tabs__icon", m.trust(icons[tab.icon]())),
            tabLabel,
            tab.badge &&
              m(
                "span.tabs__badge",
                {
                  class: isActive ? "tabs__badge--active" : "",
                },
                tab.badge,
              ),
          ],
        );
      }),
    );
  },
};

/**
 * Tab Content wrapper
 */
export const TabContent = {
  view(vnode) {
    const { id, active = false, class: className = "" } = vnode.attrs;

    // If no id provided, just render children (container mode)
    if (!id) {
      return m("div.tab-content", { class: className }, vnode.children);
    }

    return m(
      "div.tab-content",
      {
        id: `tab-${id}`,
        class: [className, active ? "tab-content--active" : ""]
          .filter(Boolean)
          .join(" "),
        role: "tabpanel",
        "aria-labelledby": `tab-${id}`,
        hidden: !active || undefined,
      },
      vnode.children,
    );
  },
};

export default Tabs;
