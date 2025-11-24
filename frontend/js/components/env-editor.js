import { Button, ButtonVariant, ButtonSize } from "./button.js";
import { FormInput, PasswordInput } from "./form.js";

// Environment variable editor component
// Tracks state: 'original' (existing), 'added' (new), 'removed' (marked for deletion)
export const EnvEditor = {
  view(vnode) {
    const { envVars = [], onAdd, onToggleRemove, onChange } = vnode.attrs;

    return m(".env-editor", [
      m(
        ".env-editor__rows",
        envVars.length === 0
          ? m(
              ".env-editor__empty",
              'No environment variables. Click "Add Variable" to add one.',
            )
          : envVars.map((envVar, i) =>
              m(EnvRow, {
                key: envVar.originalKey || i,
                envVar,
                onToggleRemove: () => onToggleRemove(i),
                onChange: (key, value) => onChange(i, key, value),
              }),
            ),
      ),
      m(".env-editor__actions", [
        m(
          Button,
          {
            variant: ButtonVariant.SECONDARY,
            size: ButtonSize.SM,
            icon: "plus",
            onclick: onAdd,
          },
          "Add Variable",
        ),
      ]),
    ]);
  },
};

const EnvRow = {
  view(vnode) {
    const { envVar, onToggleRemove, onChange } = vnode.attrs;
    const state = envVar.state || "original";
    const isRemoved = state === "removed";

    return m(
      ".env-editor__row",
      {
        "data-state": state,
        class:
          state === "removed"
            ? "env-editor__row--removed"
            : state === "added"
              ? "env-editor__row--added"
              : "",
      },
      [
        m(".env-editor__inputs", [
          m(".env-editor__key", [
            m(FormInput, {
              value: envVar.key,
              placeholder: "KEY",
              mono: true,
              disabled: isRemoved,
              oninput: (e) => onChange(e.target.value, envVar.value),
            }),
          ]),
          m(".env-editor__value", [
            m(PasswordInput, {
              value: envVar.value,
              placeholder: "Value",
              mono: true,
              disabled: isRemoved,
              oninput: (e) => onChange(envVar.key, e.target.value),
            }),
          ]),
        ]),
        m(Button, {
          variant: ButtonVariant.GHOST,
          size: ButtonSize.ICON,
          icon: isRemoved ? "undo" : "trash",
          title: isRemoved ? "Restore" : "Remove",
          onclick: onToggleRemove,
        }),
      ],
    );
  },
};
