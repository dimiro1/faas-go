import { icons } from "../icons.js";

// Badge variants
export const BadgeVariant = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DESTRUCTIVE: "destructive",
  OUTLINE: "outline",
  SUCCESS: "success",
  WARNING: "warning",
};

// Badge sizes
export const BadgeSize = {
  SM: "sm",
  DEFAULT: "default",
  LG: "lg",
};

/**
 * Badge component
 */
export const Badge = {
  view(vnode) {
    const {
      variant = BadgeVariant.PRIMARY,
      size = BadgeSize.DEFAULT,
      uppercase = false,
      mono = false,
      dot = false,
      dotGlow = false,
      icon,
      iconRight,
      href,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "badge",
      `badge--${size}`,
      `badge--${variant}`,
      uppercase && "badge--uppercase",
      mono && "badge--mono",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = [
      dot &&
        m("span", {
          class: `badge__dot ${dotGlow ? "badge__dot--glow" : ""}`.trim(),
        }),
      icon && m("span.badge__icon", m.trust(icons[icon]())),
      vnode.children,
      iconRight && m("span.badge__icon", m.trust(icons[iconRight]())),
    ];

    if (href) {
      return m("a", { href, class: classes, ...attrs }, content);
    }

    return m("span", { class: classes, ...attrs }, content);
  },
};

/**
 * ID Badge component - displays an ID with hashtag icon
 */
export const IDBadge = {
  view(vnode) {
    const { id, href } = vnode.attrs;

    return m(
      Badge,
      {
        variant: href ? BadgeVariant.OUTLINE : BadgeVariant.SECONDARY,
        size: BadgeSize.SM,
        icon: "hashtag",
        mono: true,
        href,
      },
      id,
    );
  },
};

/**
 * Status Badge component - displays enabled/disabled status
 */
export const StatusBadge = {
  view(vnode) {
    const { enabled, glow = false } = vnode.attrs;

    return m(
      Badge,
      {
        variant: enabled ? BadgeVariant.SUCCESS : BadgeVariant.WARNING,
        size: glow ? BadgeSize.DEFAULT : BadgeSize.SM,
        dot: true,
        dotGlow: glow && enabled,
        uppercase: true,
        mono: true,
      },
      enabled ? "Enabled" : "Disabled",
    );
  },
};

/**
 * Method Badges component - displays a list of HTTP methods
 */
export const MethodBadges = {
  view(vnode) {
    const { methods = [] } = vnode.attrs;

    return m(
      ".badge__methods",
      methods.map((method) =>
        m(
          Badge,
          {
            variant: BadgeVariant.SECONDARY,
            size: BadgeSize.SM,
            mono: true,
          },
          method,
        ),
      ),
    );
  },
};

/**
 * Log Level Badge - for execution logs
 */
export const LogLevelBadge = {
  view(vnode) {
    const { level } = vnode.attrs;

    const variantMap = {
      INFO: BadgeVariant.SUCCESS,
      WARN: BadgeVariant.WARNING,
      ERROR: BadgeVariant.DESTRUCTIVE,
      DEBUG: BadgeVariant.SECONDARY,
    };

    return m(
      Badge,
      {
        variant: variantMap[level] || BadgeVariant.SECONDARY,
        size: BadgeSize.SM,
        uppercase: true,
        mono: true,
      },
      level,
    );
  },
};

export default Badge;
