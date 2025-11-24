import { icons } from "../icons.js";

/**
 * Form Group component - wrapper for form fields
 */
export const FormGroup = {
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;
    return m(
      "div",
      {
        class: `form-group ${className}`.trim(),
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Form Label component
 */
export const FormLabel = {
  view(vnode) {
    const {
      for: htmlFor,
      text,
      required = false,
      disabled = false,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "form-label",
      disabled && "form-label--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m(
      "label",
      {
        for: htmlFor,
        class: classes,
        ...attrs,
      },
      [
        text,
        required &&
          m("span.form-label__required", { "aria-hidden": "true" }, "*"),
      ],
    );
  },
};

/**
 * Form Input component
 */
export const FormInput = {
  view(vnode) {
    const {
      type = "text",
      placeholder,
      value,
      name,
      id,
      mono = false,
      error = false,
      disabled = false,
      readonly = false,
      required = false,
      icon,
      oninput,
      onchange,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const inputClasses = [
      "form-input",
      mono && "form-input--mono",
      error && "form-input--error",
      disabled && "form-input--disabled",
      icon && "form-input--with-icon",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inputElement = m("input", {
      type,
      id,
      name,
      placeholder,
      value,
      class: inputClasses,
      disabled,
      readonly,
      required,
      oninput,
      onchange,
      ...attrs,
    });

    if (icon) {
      return m(".form-input-wrapper", [
        m(
          "span.form-input__icon",
          { "aria-hidden": "true" },
          m.trust(icons[icon]()),
        ),
        inputElement,
      ]);
    }

    return inputElement;
  },
};

/**
 * Password Input with visibility toggle
 */
export const PasswordInput = {
  oninit(vnode) {
    vnode.state.visible = false;
  },

  view(vnode) {
    const {
      placeholder,
      value,
      name,
      id,
      mono = false,
      error = false,
      disabled = false,
      required = false,
      oninput,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const inputClasses = [
      "form-input",
      "form-input--password",
      mono && "form-input--mono",
      error && "form-input--error",
      disabled && "form-input--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m(".form-password-wrapper", [
      m("input", {
        type: vnode.state.visible ? "text" : "password",
        id,
        name,
        placeholder,
        value,
        class: inputClasses,
        disabled,
        required,
        oninput,
        ...attrs,
      }),
      m(
        "button.form-password-toggle",
        {
          type: "button",
          title: vnode.state.visible ? "Hide password" : "Show password",
          onclick: () => {
            vnode.state.visible = !vnode.state.visible;
          },
        },
        [
          vnode.state.visible
            ? m.trust(icons.eyeSlash())
            : m.trust(icons.eye()),
        ],
      ),
    ]);
  },
};

/**
 * Copy Input with copy to clipboard button
 */
export const CopyInput = {
  oninit(vnode) {
    vnode.state.copied = false;
  },

  view(vnode) {
    const {
      value,
      name,
      id,
      mono = true,
      disabled = false,
      readonly = true,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const inputClasses = [
      "form-input",
      "form-input--copy",
      mono && "form-input--mono",
      disabled && "form-input--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        vnode.state.copied = true;
        setTimeout(() => {
          vnode.state.copied = false;
          m.redraw();
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };

    return m(".form-copy-wrapper", [
      m("input", {
        type: "text",
        id,
        name,
        value,
        class: inputClasses,
        disabled,
        readonly,
        ...attrs,
      }),
      m(
        "button.form-copy-button",
        {
          type: "button",
          title: vnode.state.copied ? "Copied!" : "Copy to clipboard",
          "aria-label": "Copy to clipboard",
          onclick: handleCopy,
        },
        [
          vnode.state.copied
            ? m(
                "span",
                { style: "color: var(--color-success)" },
                m.trust(icons.check()),
              )
            : m.trust(icons.copy()),
        ],
      ),
    ]);
  },
};

/**
 * Form Textarea component
 */
export const FormTextarea = {
  view(vnode) {
    const {
      placeholder,
      value,
      name,
      id,
      rows,
      error = false,
      disabled = false,
      readonly = false,
      required = false,
      oninput,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = ["form-textarea", error && "form-input--error", className]
      .filter(Boolean)
      .join(" ");

    return m(
      "textarea",
      {
        id,
        name,
        placeholder,
        rows,
        class: classes,
        disabled,
        readonly,
        required,
        oninput,
        ...attrs,
      },
      value,
    );
  },
};

/**
 * Form Select component
 */
export const FormSelect = {
  view(vnode) {
    const {
      options = [],
      selected,
      name,
      id,
      disabled = false,
      required = false,
      onchange,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    return m(
      "select",
      {
        id,
        name,
        class: `form-select ${className}`.trim(),
        disabled,
        required,
        onchange,
        ...attrs,
      },
      options.map((opt) => {
        const value = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        return m(
          "option",
          {
            value,
            selected: value === selected,
          },
          label,
        );
      }),
    );
  },
};

/**
 * Form Checkbox component
 */
export const FormCheckbox = {
  view(vnode) {
    const {
      label,
      description,
      checked = false,
      name,
      id,
      value,
      disabled = false,
      required = false,
      onchange,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "form-checkbox",
      disabled && "form-checkbox--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m("label", { class: classes }, [
      m("input.form-checkbox__input", {
        type: "checkbox",
        id,
        name,
        value,
        checked,
        disabled,
        required,
        onchange,
        ...attrs,
      }),
      label && m("span.form-checkbox__label", label),
      description && m("span.form-checkbox__description", description),
    ]);
  },
};

/**
 * Form Help Text component
 */
export const FormHelp = {
  view(vnode) {
    const {
      text,
      error = false,
      success = false,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "form-help",
      error && "form-help--error",
      success && "form-help--success",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m("p", { class: classes, ...attrs }, text || vnode.children);
  },
};

export default {
  FormGroup,
  FormLabel,
  FormInput,
  PasswordInput,
  CopyInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormHelp,
};
