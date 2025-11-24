// Simple code viewer component (non-editable)

export const CodeViewer = {
  view(vnode) {
    const {
      code = "",
      language = "",
      maxHeight = "",
      noBorder = false,
      padded = false,
      showHeader = false,
    } = vnode.attrs;

    return m(
      ".code-viewer",
      {
        class: noBorder ? "code-viewer--no-border" : "",
      },
      [
        showHeader &&
          language &&
          m(".code-viewer__header", [
            m("span.code-viewer__language", language.toUpperCase()),
          ]),
        m(
          ".code-viewer__content",
          {
            style: maxHeight ? `max-height: ${maxHeight}` : "",
          },
          [
            m(
              "pre.code-viewer__pre",
              {
                class: padded ? "code-viewer__pre--padded" : "",
              },
              [
                m(
                  "code",
                  {
                    class: language ? `language-${language}` : "",
                    oncreate: (vnode) => {
                      if (window.hljs) {
                        hljs.highlightElement(vnode.dom);
                      }
                    },
                    onupdate: (vnode) => {
                      if (window.hljs) {
                        vnode.dom.removeAttribute("data-highlighted");
                        hljs.highlightElement(vnode.dom);
                      }
                    },
                  },
                  code,
                ),
              ],
            ),
          ],
        ),
      ],
    );
  },
};
