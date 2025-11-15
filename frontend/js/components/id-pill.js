import { Toast } from "./toast.js";
import { Icons } from "../icons.js";

// ID Pill component - displays IDs in monospace with copy button
export const IdPill = {
  oninit: (vnode) => {
    vnode.state.copied = false;
  },

  view: (vnode) => {
    const id = vnode.attrs.id;

    const handleCopy = (e) => {
      e.stopPropagation();
      navigator.clipboard
        .writeText(id)
        .then(() => {
          vnode.state.copied = true;
          Toast.show("Copied to clipboard", "success");
          setTimeout(() => {
            vnode.state.copied = false;
            m.redraw();
          }, 2000);
        })
        .catch(() => {
          Toast.show("Failed to copy", "error");
        });
    };

    return m(".id-pill", [
      m("span", id),
      m(
        "span.id-pill-copy",
        {
          onclick: handleCopy,
          title: "Copy to clipboard",
        },
        vnode.state.copied ? Icons.clipboardCheck() : Icons.clipboard(),
      ),
    ]);
  },
};
