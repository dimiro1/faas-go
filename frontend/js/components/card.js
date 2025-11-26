/**
 * @fileoverview Card components for content containers.
 */

import { icons } from "../icons.js";

/**
 * @typedef {import('../types.js').IconName} IconName
 */

/**
 * Available card color variants.
 * @enum {string}
 */
export const CardVariant = {
  DEFAULT: "default",
  DANGER: "danger",
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Card container component.
 * @type {Object}
 */
export const Card = {
  /**
   * Renders the card container.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {string} [vnode.attrs.variant='default'] - Color variant from CardVariant
   * @param {boolean} [vnode.attrs.padded=false] - Add padding to card body
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const {
      variant = CardVariant.DEFAULT,
      padded = false,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "card",
      variant !== CardVariant.DEFAULT && `card--${variant}`,
      padded && "card--padded",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m("div", { class: classes, ...attrs }, vnode.children);
  },
};

/**
 * Card Header component with title and optional subtitle.
 * @type {Object}
 */
export const CardHeader = {
  /**
   * Renders the card header.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {string} vnode.attrs.title - Header title text
   * @param {string} [vnode.attrs.subtitle] - Optional subtitle text
   * @param {IconName} [vnode.attrs.icon] - Optional icon name
   * @param {string} [vnode.attrs.variant='default'] - Color variant from CardVariant
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const {
      title,
      subtitle,
      icon,
      variant = CardVariant.DEFAULT,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "card__header",
      variant === CardVariant.DANGER && "card__header--danger",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const titleClasses = [
      "card__title",
      variant === CardVariant.DANGER && "card__title--danger",
    ]
      .filter(Boolean)
      .join(" ");

    const iconClasses = [
      "card__header-icon",
      variant === CardVariant.DANGER && "card__header-icon--danger",
    ]
      .filter(Boolean)
      .join(" ");

    return m("div", { class: classes, ...attrs }, [
      m(".card__header-title-wrapper", [
        icon && m("span", { class: iconClasses }, m.trust(icons[icon]())),
        subtitle
          ? m(".card__header-title-group", [
            m("h3", { class: titleClasses }, title),
            m("p.card__subtitle", subtitle),
          ])
          : m("h3", { class: titleClasses }, title),
      ]),
      m(".card__header-title-wrapper", vnode.children),
    ]);
  },
};

/**
 * Card Content component for the main body.
 * @type {Object}
 */
export const CardContent = {
  /**
   * Renders the card content.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {boolean} [vnode.attrs.dark=false] - Dark background
   * @param {boolean} [vnode.attrs.large=false] - Large padding
   * @param {boolean} [vnode.attrs.noPadding=false] - Remove padding
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const {
      dark = false,
      large = false,
      noPadding = false,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "card__content",
      large && "card__content--large",
      dark && "card__content--dark",
      noPadding && "card__content--no-padding",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m("div", { class: classes, ...attrs }, vnode.children);
  },
};

/**
 * Card Footer component.
 * @type {Object}
 */
export const CardFooter = {
  /**
   * Renders the card footer.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;

    return m(
      "div",
      {
        class: `card__footer ${className}`.trim(),
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Card Divider component - horizontal line separator.
 * @type {Object}
 */
export const CardDivider = {
  /**
   * Renders the card divider.
   * @returns {Object} Mithril vnode
   */
  view() {
    return m("hr.card__divider");
  },
};

export default Card;
