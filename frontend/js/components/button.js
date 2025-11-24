import { icons } from "../icons.js";

// Button variants
export const ButtonVariant = {
  PRIMARY: "primary",
  DESTRUCTIVE: "destructive",
  OUTLINE: "outline",
  SECONDARY: "secondary",
  GHOST: "ghost",
  LINK: "link",
};

// Button sizes
export const ButtonSize = {
  DEFAULT: "default",
  SM: "sm",
  LG: "lg",
  ICON: "icon",
};

/**
 * Button component
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button variant
 * @param {string} [props.size='default'] - Button size
 * @param {boolean} [props.fullWidth=false] - Full width button
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.href] - If provided, renders as anchor
 * @param {string} [props.target] - Link target
 * @param {Function} [props.onclick] - Click handler
 * @param {string} [props.type='button'] - Button type
 * @param {string} [props.icon] - Icon name (left position)
 * @param {string} [props.iconRight] - Icon name (right position)
 * @param {string} [props.class] - Additional classes
 * @param {string} [props.ariaLabel] - Aria label
 */
export const Button = {
  view(vnode) {
    const {
      variant = ButtonVariant.PRIMARY,
      size = ButtonSize.DEFAULT,
      fullWidth = false,
      disabled = false,
      loading = false,
      href,
      target,
      onclick,
      type = "button",
      icon,
      iconRight,
      class: className = "",
      ariaLabel,
      ...attrs
    } = vnode.attrs;

    const classes = [
      "btn",
      `btn--${size}`,
      `btn--${variant}`,
      fullWidth && "btn--full-width",
      (disabled || loading) && "btn--disabled",
      loading && "btn--loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = [
      loading && m("span.btn__spinner", m.trust(icons.spinner())),
      !loading && icon && m.trust(icons[icon]()),
      vnode.children,
      !loading && iconRight && m.trust(icons[iconRight]()),
    ];

    if (href) {
      return m(
        "a",
        {
          href,
          target,
          class: classes,
          "aria-disabled": disabled || loading || undefined,
          "aria-busy": loading || undefined,
          "aria-label": ariaLabel,
          rel: target === "_blank" ? "noopener noreferrer" : undefined,
          onclick: disabled || loading ? (e) => e.preventDefault() : onclick,
          ...attrs,
        },
        content,
      );
    }

    return m(
      "button",
      {
        type,
        class: classes,
        disabled: disabled || loading,
        "aria-busy": loading || undefined,
        "aria-label": ariaLabel,
        onclick,
        ...attrs,
      },
      content,
    );
  },
};

/**
 * Back button component
 */
export const BackButton = {
  view(vnode) {
    const { href = "#!/" } = vnode.attrs;

    return m("a.back-btn", { href }, [m.trust(icons.chevronLeft()), "Back"]);
  },
};

export default Button;
