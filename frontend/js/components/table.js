import { icons } from "../icons.js";

/**
 * Table wrapper component
 */
export const Table = {
  view(vnode) {
    const {
      hoverable = true,
      striped = false,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    return m(".table-wrapper", { class: className }, [
      m(".table-responsive", [
        m(
          "table.table",
          {
            "data-table-hoverable": hoverable || undefined,
            "data-table-striped": striped || undefined,
            ...attrs,
          },
          vnode.children,
        ),
      ]),
    ]);
  },
};

/**
 * Table Header component
 */
export const TableHeader = {
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;
    return m(
      "thead.table__header",
      {
        class: className,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Table Body component
 */
export const TableBody = {
  view(vnode) {
    const { class: className = "", ...attrs } = vnode.attrs;
    return m(
      "tbody.table__body",
      {
        class: className,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Table Row component
 */
export const TableRow = {
  view(vnode) {
    const {
      selected = false,
      onclick,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "table__row",
      selected && "table__row--selected",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m(
      "tr",
      {
        class: classes,
        onclick,
        "aria-selected": selected || undefined,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Table Head cell component
 */
export const TableHead = {
  view(vnode) {
    const { width, class: className = "", ...attrs } = vnode.attrs;

    return m(
      "th.table__head",
      {
        class: className,
        scope: "col",
        style: width ? { width } : undefined,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Table Cell component
 */
export const TableCell = {
  view(vnode) {
    const {
      mono = false,
      align,
      class: className = "",
      ...attrs
    } = vnode.attrs;

    const classes = [
      "table__cell",
      mono && "table__cell--mono",
      align === "center" && "table__cell--center",
      align === "right" && "table__cell--right",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m(
      "td",
      {
        class: classes,
        ...attrs,
      },
      vnode.children,
    );
  },
};

/**
 * Table Empty state component
 */
export const TableEmpty = {
  view(vnode) {
    const {
      colspan = 1,
      message = "No data available",
      icon = "inbox",
      class: className = "",
    } = vnode.attrs;

    return m("tr", [
      m(
        "td.table__empty",
        {
          colspan,
          class: className,
        },
        [
          icon && m(".table__empty-icon", m.trust(icons[icon]())),
          m("p.table__empty-message", message),
        ],
      ),
    ]);
  },
};

/**
 * Helper to create a header row from column definitions
 */
export const TableHeaderRow = {
  view(vnode) {
    const { columns = [] } = vnode.attrs;

    return m(
      TableRow,
      {},
      columns.map((col) => {
        const name = typeof col === "string" ? col : col.name;
        const width = typeof col === "object" ? col.width : undefined;
        return m(TableHead, { width }, name);
      }),
    );
  },
};

export default {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableHeaderRow,
};
