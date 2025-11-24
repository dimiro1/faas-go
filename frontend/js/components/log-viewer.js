// Log viewer component

export const LogViewer = {
  view(vnode) {
    const { logs = [], maxHeight = "300px", noBorder = false } = vnode.attrs;

    return m(
      ".log-viewer",
      {
        class: noBorder ? "log-viewer--no-border" : "",
        style: maxHeight ? `max-height: ${maxHeight}` : "",
      },
      [
        logs.length === 0
          ? m(".log-viewer__empty", "No logs available")
          : logs.map((log, i) =>
              m(
                ".log-viewer__entry",
                {
                  key: log.id || i,
                  class: i === logs.length - 1 ? "log-viewer__entry--last" : "",
                },
                [
                  log.timestamp &&
                    m("span.log-viewer__timestamp", log.timestamp),
                  m(
                    "span.log-viewer__level",
                    {
                      class: `log-viewer__level--${(log.level || "info").toLowerCase()}`,
                    },
                    (log.level || "INFO").toUpperCase(),
                  ),
                  m("span.log-viewer__message", log.message),
                ],
              ),
            ),
      ],
    );
  },
};
