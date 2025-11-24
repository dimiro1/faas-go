export const Pagination = {
  view: function (vnode) {
    const {
      total,
      limit,
      offset,
      onPageChange,
      onLimitChange,
      showPerPage = true,
    } = vnode.attrs;

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const start = offset + 1;
    const end = Math.min(offset + limit, total);

    if (total === 0) {
      return null;
    }

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const perPageOptions = [10, 20, 50];

    return m(
      "nav.pagination",
      { role: "navigation", "aria-label": "Pagination" },
      [
        m(".pagination__info", [
          "Showing ",
          m("span.pagination__highlight", start),
          " to ",
          m("span.pagination__highlight", end),
          " of ",
          m("span.pagination__highlight", total),
          " results",
        ]),

        m(".pagination__controls", [
          showPerPage &&
            m(
              "select.pagination__select",
              {
                "aria-label": "Results per page",
                value: limit,
                onchange: (e) => onLimitChange(parseInt(e.target.value)),
              },
              perPageOptions.map((opt) =>
                m(
                  "option",
                  { value: opt, selected: opt === limit },
                  `${opt} per page`,
                ),
              ),
            ),

          m(".pagination__buttons", [
            m(
              "button.pagination__btn.pagination__btn--prev",
              {
                disabled: !hasPrev,
                onclick: () => hasPrev && onPageChange(offset - limit),
                "aria-label": "Go to previous page",
              },
              "Previous",
            ),
            m(
              "button.pagination__btn",
              {
                disabled: !hasNext,
                onclick: () => hasNext && onPageChange(offset + limit),
                "aria-label": "Go to next page",
              },
              "Next",
            ),
          ]),
        ]),
      ],
    );
  },
};

// Simple pagination without info text
export const SimplePagination = {
  view: function (vnode) {
    const { hasPrev, hasNext, onPrev, onNext } = vnode.attrs;

    return m(".pagination__controls", [
      m(".pagination__buttons", [
        m(
          "button.pagination__btn.pagination__btn--prev",
          {
            disabled: !hasPrev,
            onclick: () => hasPrev && onPrev(),
            "aria-label": "Go to previous page",
          },
          "Previous",
        ),
        m(
          "button.pagination__btn",
          {
            disabled: !hasNext,
            onclick: () => hasNext && onNext(),
            "aria-label": "Go to next page",
          },
          "Next",
        ),
      ]),
    ]);
  },
};
