import { icons } from "../icons.js";

// Card variants
export const CardVariant = {
  DEFAULT: "default",
  DANGER: "danger",
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Card component
 */
export const Card = {
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
 * Card Header component
 */
export const CardHeader = {
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
 * Card Content component
 */
export const CardContent = {
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
 * Card Footer component
 */
export const CardFooter = {
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
 * Card Divider component
 */
export const CardDivider = {
  view() {
    return m("hr.card__divider");
  },
};

export default Card;
