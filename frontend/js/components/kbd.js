/**
 * Keyboard shortcut display component
 */
export const Kbd = {
  view(vnode) {
    const { small = false, class: className = "" } = vnode.attrs;

    const classes = ["kbd", small && "kbd--sm", className]
      .filter(Boolean)
      .join(" ");

    return m("kbd", { class: classes }, vnode.children);
  },
};

/**
 * Separator component
 */
export const Separator = {
  view(vnode) {
    const {
      vertical = false,
      withMargin = false,
      class: className = "",
    } = vnode.attrs;

    const classes = [
      "separator",
      vertical ? "separator--vertical" : "separator--horizontal",
      withMargin && "separator--with-margin",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m("div", { class: classes, "aria-hidden": "true" });
  },
};

export default { Kbd, Separator };
