import { icons } from "../icons.js";
import { API } from "../api.js";
import { paths } from "../routes.js";

export const CommandPalette = {
  isOpen: false,
  query: "",
  results: [],
  selectedIndex: 0,
  functions: [],
  loading: false,

  open: () => {
    CommandPalette.isOpen = true;
    CommandPalette.query = "";
    CommandPalette.selectedIndex = 0;
    CommandPalette.loadFunctions();
    m.redraw();
    // Focus input after render
    setTimeout(() => {
      const input = document.querySelector(".command-palette__input");
      if (input) input.focus();
    }, 10);
  },

  close: () => {
    CommandPalette.isOpen = false;
    CommandPalette.query = "";
    CommandPalette.results = [];
    m.redraw();
  },

  loadFunctions: async () => {
    CommandPalette.loading = true;
    try {
      const response = await API.functions.list(100, 0);
      CommandPalette.functions = response.functions || [];
      CommandPalette.updateResults();
    } catch (e) {
      console.error("Failed to load functions:", e);
      CommandPalette.functions = [];
    } finally {
      CommandPalette.loading = false;
      m.redraw();
    }
  },

  updateResults: () => {
    const q = CommandPalette.query.toLowerCase().trim();

    // Navigation items
    const navItems = [
      {
        type: "nav",
        label: "Functions",
        description: "View all functions",
        path: paths.functions(),
        icon: "bolt",
      },
      {
        type: "nav",
        label: "Create Function",
        description: "Create a new function",
        path: paths.functionCreate(),
        icon: "plus",
      },
    ];

    // Function items with actions for each function
    const functionItems = [];
    CommandPalette.functions.forEach((func) => {
      // Main function entry - goes to code
      functionItems.push({
        type: "function",
        label: func.name,
        description: "Go to Code",
        path: paths.functionCode(func.id),
        icon: "code",
        id: func.id,
        disabled: func.disabled,
      });
      // Additional actions for each function
      functionItems.push({
        type: "action",
        label: `${func.name} → Versions`,
        description: "View version history",
        path: paths.functionVersions(func.id),
        icon: "listBullet",
        id: func.id,
        disabled: func.disabled,
      });
      functionItems.push({
        type: "action",
        label: `${func.name} → Executions`,
        description: "View execution logs",
        path: paths.functionExecutions(func.id),
        icon: "chartBar",
        id: func.id,
        disabled: func.disabled,
      });
      functionItems.push({
        type: "action",
        label: `${func.name} → Settings`,
        description: "Configure function",
        path: paths.functionSettings(func.id),
        icon: "cog",
        id: func.id,
        disabled: func.disabled,
      });
      functionItems.push({
        type: "action",
        label: `${func.name} → Test`,
        description: "Test function",
        path: paths.functionTest(func.id),
        icon: "beaker",
        id: func.id,
        disabled: func.disabled,
      });
    });

    // Combine and filter
    const allItems = [...navItems, ...functionItems];

    if (q) {
      CommandPalette.results = allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)),
      );
    } else {
      CommandPalette.results = allItems;
    }

    // Reset selection if out of bounds
    if (CommandPalette.selectedIndex >= CommandPalette.results.length) {
      CommandPalette.selectedIndex = Math.max(
        0,
        CommandPalette.results.length - 1,
      );
    }
  },

  scrollToSelected: () => {
    setTimeout(() => {
      const selected = document.querySelector(
        ".command-palette__item--selected",
      );
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }, 0);
  },

  handleKeyDown: (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      CommandPalette.selectedIndex = Math.min(
        CommandPalette.selectedIndex + 1,
        CommandPalette.results.length - 1,
      );
      m.redraw();
      CommandPalette.scrollToSelected();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      CommandPalette.selectedIndex = Math.max(
        CommandPalette.selectedIndex - 1,
        0,
      );
      m.redraw();
      CommandPalette.scrollToSelected();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = CommandPalette.results[CommandPalette.selectedIndex];
      if (selected) {
        CommandPalette.selectItem(selected);
      }
    } else if (e.key === "Escape") {
      CommandPalette.close();
    }
  },

  selectItem: (item) => {
    CommandPalette.close();
    m.route.set(item.path);
  },

  // Initialize global keyboard listener
  init: () => {
    document.addEventListener("keydown", (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (CommandPalette.isOpen) {
          CommandPalette.close();
        } else {
          CommandPalette.open();
        }
      }
    });
  },

  view: () => {
    if (!CommandPalette.isOpen) return null;

    return m(
      ".command-palette-overlay",
      {
        onclick: (e) => {
          if (e.target.classList.contains("command-palette-overlay")) {
            CommandPalette.close();
          }
        },
      },
      [
        m(".command-palette", [
          m(".command-palette__header", [
            m(".command-palette__input-wrapper", [
              m("span.command-palette__search-icon", m.trust(icons.search())),
              m("input.command-palette__input", {
                type: "text",
                placeholder: "Search functions...",
                value: CommandPalette.query,
                oninput: (e) => {
                  CommandPalette.query = e.target.value;
                  CommandPalette.selectedIndex = 0;
                  CommandPalette.updateResults();
                },
                onkeydown: CommandPalette.handleKeyDown,
              }),
            ]),
          ]),
          m(".command-palette__results", [
            CommandPalette.loading
              ? m(".command-palette__loading", [
                  m.trust(icons.spinner()),
                  " Loading...",
                ])
              : CommandPalette.results.length === 0
                ? m(".command-palette__empty", "No results found")
                : CommandPalette.results.map((item, index) =>
                    m(
                      ".command-palette__item",
                      {
                        class: [
                          index === CommandPalette.selectedIndex
                            ? "command-palette__item--selected"
                            : "",
                          item.disabled
                            ? "command-palette__item--disabled"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" "),
                        onclick: () => CommandPalette.selectItem(item),
                        onmouseenter: () => {
                          CommandPalette.selectedIndex = index;
                          m.redraw();
                        },
                      },
                      [
                        m(
                          "span.command-palette__item-icon",
                          m.trust(icons[item.icon]()),
                        ),
                        m(".command-palette__item-content", [
                          m("span.command-palette__item-label", item.label),
                          item.description &&
                            m(
                              "span.command-palette__item-description",
                              item.description,
                            ),
                        ]),
                        item.type === "function" &&
                          item.disabled &&
                          m("span.command-palette__item-badge", "Disabled"),
                      ],
                    ),
                  ),
          ]),
          m(".command-palette__footer", [
            m("span.command-palette__hint", [m("kbd", "↑↓"), " to navigate"]),
            m("span.command-palette__hint", [m("kbd", "↵"), " to select"]),
            m("span.command-palette__hint", [m("kbd", "esc"), " to close"]),
          ]),
        ]),
      ],
    );
  },
};

// Initialize on load
CommandPalette.init();
