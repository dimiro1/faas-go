/**
 * @fileoverview Template card components for function creation wizard.
 */

import { icons } from "../icons.js";

/**
 * @typedef {Object} FunctionTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} description - Template description
 * @property {string} icon - Icon name from icons module
 * @property {string} code - Template Lua code
 */

/**
 * Template card component for function creation.
 * Displays a selectable card with icon, name, and description.
 * @type {Object}
 */
export const TemplateCard = {
  /**
   * Renders the template card component.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {string} vnode.attrs.name - Template name
   * @param {string} [vnode.attrs.description] - Template description
   * @param {string} [vnode.attrs.icon='code'] - Icon name
   * @param {boolean} [vnode.attrs.selected=false] - Whether card is selected
   * @param {function} [vnode.attrs.onclick] - Click handler
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const {
      name,
      description,
      icon = "code",
      selected = false,
      onclick,
      class: className = "",
    } = vnode.attrs;

    const classes = [
      "template-card",
      selected && "template-card--selected",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return m(
      "div",
      {
        class: classes,
        onclick,
        role: "button",
        tabindex: 0,
        "aria-pressed": selected,
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onclick && onclick(e);
          }
        },
      },
      [
        m(".template-card__header", [
          m(".template-card__icon", m.trust(icons[icon]())),
          m(".template-card__name", name),
        ]),
        description && m("p.template-card__description", description),
      ],
    );
  },
};

/**
 * Template cards grid container.
 * Provides CSS grid layout for template cards.
 * @type {Object}
 */
export const TemplateCards = {
  /**
   * Renders the template cards container.
   * @param {Object} vnode - Mithril vnode
   * @param {Object} vnode.attrs - Component attributes
   * @param {string} [vnode.attrs.class] - Additional CSS classes
   * @returns {Object} Mithril vnode
   */
  view(vnode) {
    const { class: className = "" } = vnode.attrs;

    return m(
      ".template-cards",
      {
        class: className,
      },
      vnode.children,
    );
  },
};

/**
 * Pre-defined templates for function creation.
 * Each template includes sample Lua code for common use cases.
 * @type {FunctionTemplate[]}
 */
export const FunctionTemplates = [
  {
    id: "http",
    name: "HTTP Template",
    description: "Handle HTTP requests with custom logic",
    icon: "globe",
    code: `-- HTTP Handler
function handler(ctx, event)
    local method = event.method
    local path = event.path

    log.info("Received " .. method .. " request to " .. path)

    return {
        statusCode = 200,
        headers = { ["Content-Type"] = "application/json" },
        body = json.encode({
            message = "Hello from Lua!",
            method = method,
            path = path
        })
    }
end`,
  },
  {
    id: "scheduled",
    name: "Scheduled Task",
    description: "Run code on a schedule",
    icon: "clock",
    code: `-- Scheduled Task
function handler(ctx, event)
    -- This function runs on schedule
    local timestamp = time.format(time.now(), "2006-01-02 15:04:05")

    log.info("Task executed at " .. timestamp)

    return {
        statusCode = 200,
        headers = { ["Content-Type"] = "application/json" },
        body = json.encode({
            status = "completed",
            timestamp = timestamp
        })
    }
end`,
  },
  {
    id: "webhook",
    name: "Webhook Handler",
    description: "Process incoming webhooks",
    icon: "arrowPath",
    code: `-- Webhook Handler
function handler(ctx, event)
    local body = event.body
    local headers = event.headers

    -- Process webhook payload
    log.info("Received webhook")

    return {
        statusCode = 200,
        headers = { ["Content-Type"] = "application/json" },
        body = json.encode({
            received = true,
            body_length = #body
        })
    }
end`,
  },
  {
    id: "api",
    name: "REST API",
    description: "Build RESTful API endpoints",
    icon: "server",
    code: `-- REST API Endpoint
function handler(ctx, event)
    local method = event.method

    if method == "GET" then
        return {
            statusCode = 200,
            headers = { ["Content-Type"] = "application/json" },
            body = json.encode({
                items = {},
                total = 0
            })
        }
    elseif method == "POST" then
        local data = json.decode(event.body)
        return {
            statusCode = 201,
            headers = { ["Content-Type"] = "application/json" },
            body = json.encode({
                id = crypto.uuid(),
                created = true
            })
        }
    else
        return {
            statusCode = 405,
            headers = { ["Content-Type"] = "application/json" },
            body = json.encode({
                error = "Method not allowed"
            })
        }
    end
end`,
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start with empty template",
    icon: "document",
    code: `-- Your function code here
function handler(ctx, event)
    return {
        statusCode = 200,
        headers = { ["Content-Type"] = "text/plain" },
        body = "Hello, World!"
    }
end`,
  },
];

export default {
  TemplateCard,
  TemplateCards,
  FunctionTemplates,
};
