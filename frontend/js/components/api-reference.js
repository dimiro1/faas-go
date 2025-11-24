// API Reference component with tabbed sections

export const APIReference = {
  view(vnode) {
    const { sections = [], activeSection, onSectionChange } = vnode.attrs;
    const active = activeSection || sections[0]?.id;

    return m(".api-reference", [
      // Tab headers
      m(
        ".api-reference__tabs",
        sections.map((section) =>
          m(
            "button.api-reference__tab",
            {
              key: section.id,
              class: section.id === active ? "api-reference__tab--active" : "",
              onclick: () => onSectionChange && onSectionChange(section.id),
            },
            section.name,
          ),
        ),
      ),
      // Content
      m(
        ".api-reference__content",
        sections
          .filter((section) => section.id === active)
          .map((section) =>
            m(".api-reference__panel", { key: section.id }, [
              section.description &&
                m("p.api-reference__description", section.description),
              section.items &&
                section.items.map((item) =>
                  m(DocItem, { key: item.name, item }),
                ),
              section.groups &&
                section.groups.map((group, i) =>
                  m(".api-reference__group", { key: group.name }, [
                    m(
                      "h4.api-reference__group-header",
                      {
                        class:
                          i === 0 ? "api-reference__group-header--first" : "",
                      },
                      group.name,
                    ),
                    group.items.map((item) =>
                      m(DocItem, { key: item.name, item }),
                    ),
                  ]),
                ),
            ]),
          ),
      ),
    ]);
  },
};

const DocItem = {
  view(vnode) {
    const { item } = vnode.attrs;
    const typeClass = getTypeClass(item.type);

    return m(".api-doc-item", [
      m(".api-doc-item__header", [
        m("span.api-doc-item__name", item.name),
        m("span.api-doc-item__type", { class: typeClass }, item.type),
      ]),
      m("p.api-doc-item__description", item.description),
    ]);
  },
};

function getTypeClass(type) {
  switch (type) {
    case "string":
      return "api-doc-item__type--string";
    case "number":
      return "api-doc-item__type--number";
    case "table":
      return "api-doc-item__type--table";
    case "function":
      return "api-doc-item__type--function";
    case "module":
      return "api-doc-item__type--module";
    default:
      return "api-doc-item__type--default";
  }
}

// Default API sections for Lua functions
export const LuaAPISections = [
  {
    id: "http",
    name: "HTTP",
    description: "HTTP client for making web requests",
    items: [
      {
        name: "http.get(url, opts)",
        type: "function",
        description: "Perform GET request",
      },
      {
        name: "http.post(url, body, opts)",
        type: "function",
        description: "Perform POST request",
      },
      {
        name: "http.put(url, body, opts)",
        type: "function",
        description: "Perform PUT request",
      },
      {
        name: "http.delete(url, opts)",
        type: "function",
        description: "Perform DELETE request",
      },
    ],
  },
  {
    id: "log",
    name: "Log",
    description: "Logging utilities for debugging",
    items: [
      {
        name: "log.info(msg)",
        type: "function",
        description: "Log info message",
      },
      {
        name: "log.error(msg)",
        type: "function",
        description: "Log error message",
      },
      {
        name: "log.warn(msg)",
        type: "function",
        description: "Log warning message",
      },
      {
        name: "log.debug(msg)",
        type: "function",
        description: "Log debug message",
      },
    ],
  },
  {
    id: "env",
    name: "Env",
    description: "Environment variable management",
    items: [
      {
        name: "env.get(key)",
        type: "function",
        description: "Get environment variable",
      },
      {
        name: "env.set(key, value)",
        type: "function",
        description: "Set environment variable",
      },
      {
        name: "env.delete(key)",
        type: "function",
        description: "Delete environment variable",
      },
    ],
  },
  {
    id: "json",
    name: "JSON",
    description: "JSON encoding and decoding",
    items: [
      {
        name: "json.encode(value)",
        type: "function",
        description: "Encode value to JSON string",
      },
      {
        name: "json.decode(str)",
        type: "function",
        description: "Decode JSON string to value",
      },
    ],
  },
];
