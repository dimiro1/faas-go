/**
 * @fileoverview Keyboard shortcut display and separator components.
 */

/**
 * Keyboard shortcut display component.
 * @type {Object}
 * @example
 * m(Kbd, "⌘K")
 * m(Kbd, { small: true }, "Enter")
 */
export const Kbd = {
  /**
   * Renders the keyboard shortcut display.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {boolean} [vnode.attrs.small=false] - Small size variant
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const { small = false, class: className = "" } = vnode.attrs;

    const classes = ["kbd", small && "kbd--sm", className]
      .filter(Boolean)
      .join(" ");

    return m("kbd", { class: classes }, vnode.children);
  },
};

/**
 * Separator/divider component.
 * @type {Object}
 */
export const Separator = {
  /**
   * Renders the separator.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {boolean} [vnode.attrs.vertical=false] - Vertical orientation
   * @param {boolean} [vnode.attrs.withMargin=false] - Add margin around separator
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
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
