/**
 * @fileoverview Execution detail view with logs and error information.
 */

import { icons } from "../icons.js";
import { API } from "../api.js";
import { Pagination } from "../components/pagination.js";
import { formatUnixTimestamp } from "../utils.js";
import { routes } from "../routes.js";
import { BackButton } from "../components/button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardVariant,
} from "../components/card.js";
import {
  Badge,
  BadgeSize,
  BadgeVariant,
  IDBadge,
  StatusBadge,
} from "../components/badge.js";
import { LogViewer } from "../components/log-viewer.js";
import { CodeViewer } from "../components/code-viewer.js";

/**
 * @typedef {import('../types.js').FaaSFunction} FaaSFunction
 * @typedef {import('../types.js').Execution} Execution
 * @typedef {import('../types.js').ExecutionLog} ExecutionLog
 */

/**
 * Execution detail view component.
 * Displays execution information, logs, errors, and input event data.
 * @type {Object}
 */
export const ExecutionDetail = {
  /**
   * Parent function of the execution.
   * @type {FaaSFunction|null}
   */
  func: null,

  /**
   * Currently loaded execution.
   * @type {Execution|null}
   */
  execution: null,

  /**
   * Execution logs.
   * @type {ExecutionLog[]}
   */
  logs: [],

  /**
   * Whether the view is loading.
   * @type {boolean}
   */
  loading: true,

  /**
   * Number of logs per page.
   * @type {number}
   */
  logsLimit: 20,

  /**
   * Current logs pagination offset.
   * @type {number}
   */
  logsOffset: 0,

  /**
   * Total number of log entries.
   * @type {number}
   */
  logsTotal: 0,

  /**
   * Initializes the view and loads execution data.
   * @param {Object} vnode - Mithril vnode
   */
  oninit: (vnode) => {
    ExecutionDetail.loadExecution(vnode.attrs.id);
  },

  /**
   * Loads execution data and associated function.
   * @param {string} id - Execution ID
   * @returns {Promise<void>}
   */
  loadExecution: async (id) => {
    ExecutionDetail.loading = true;
    try {
      const [execution, logsData] = await Promise.all([
        API.executions.get(id),
        API.executions.getLogs(
          id,
          ExecutionDetail.logsLimit,
          ExecutionDetail.logsOffset,
        ),
      ]);
      ExecutionDetail.execution = execution;
      ExecutionDetail.logs = logsData.logs || [];
      ExecutionDetail.logsTotal = logsData.pagination?.total || 0;

      // Load function details
      ExecutionDetail.func = await API.functions.get(execution.function_id);
    } catch (e) {
      console.error("Failed to load execution:", e);
    } finally {
      ExecutionDetail.loading = false;
      m.redraw();
    }
  },

  /**
   * Reloads logs with current pagination.
   * @returns {Promise<void>}
   */
  loadLogs: async () => {
    try {
      const logsData = await API.executions.getLogs(
        ExecutionDetail.execution.id,
        ExecutionDetail.logsLimit,
        ExecutionDetail.logsOffset,
      );
      ExecutionDetail.logs = logsData.logs || [];
      ExecutionDetail.logsTotal = logsData.pagination?.total || 0;
      m.redraw();
    } catch (e) {
      console.error("Failed to load logs:", e);
    }
  },

  /**
   * Handles page change from logs pagination.
   * @param {number} newOffset - New pagination offset
   */
  handleLogsPageChange: (newOffset) => {
    ExecutionDetail.logsOffset = newOffset;
    ExecutionDetail.loadLogs();
  },

  /**
   * Handles limit change from logs pagination.
   * @param {number} newLimit - New items per page limit
   */
  handleLogsLimitChange: (newLimit) => {
    ExecutionDetail.logsLimit = newLimit;
    ExecutionDetail.logsOffset = 0;
    ExecutionDetail.loadLogs();
  },

  /**
   * Renders the execution detail view.
   * @returns {Object} Mithril vnode
   */
  view: () => {
    if (ExecutionDetail.loading) {
      return m(".loading", [
        m.trust(icons.spinner()),
        m("p", "Loading execution..."),
      ]);
    }

    if (!ExecutionDetail.execution) {
      return m(".fade-in", m(Card, m(CardContent, "Execution not found")));
    }

    const exec = ExecutionDetail.execution;
    const func = ExecutionDetail.func;

    return m(".fade-in", [
      // Header
      m(".function-details-header", [
        m(".function-details-left", [
          m(BackButton, { href: routes.functionExecutions(exec.function_id) }),
          m(".function-details-divider"),
          m(".function-details-info", [
            m("h1.function-details-title", [
              func ? func.name : "Function",
              func && m(IDBadge, { id: func.id }),
              m(
                Badge,
                {
                  variant: BadgeVariant.SECONDARY,
                  size: BadgeSize.SM,
                  mono: true,
                },
                `exec: ${exec.id.substring(0, 8)}`,
              ),
              m(
                Badge,
                {
                  variant: exec.status === "success"
                    ? BadgeVariant.SUCCESS
                    : BadgeVariant.DESTRUCTIVE,
                  size: BadgeSize.SM,
                },
                exec.status.toUpperCase(),
              ),
              exec.duration_ms &&
              m(
                Badge,
                {
                  variant: BadgeVariant.OUTLINE,
                  size: BadgeSize.SM,
                  mono: true,
                },
                `${exec.duration_ms}ms`,
              ),
            ]),
            m(
              "p.function-details-description",
              formatUnixTimestamp(exec.created_at),
            ),
          ]),
        ]),
        m(".function-details-actions", [
          func && m(StatusBadge, { enabled: !func.disabled, glow: true }),
        ]),
      ]),

      m(".execution-details-panels", [
        // Error Details
        exec.status === "error" &&
        exec.error_message &&
        (() => {
          // Parse error message sections
          const parts = exec.error_message.split(/\[CODE\]|\[\/CODE\]/);
          const errorDescription = parts[0] || "";
          const codeSnippet = parts[1] || "";
          const tipSection = parts[2] || "";

          // Only trim trailing whitespace to preserve line number alignment
          const trimmedCode = codeSnippet
            .replace(/^\n+/, "")
            .replace(/\n+$/, "");

          return m(
            Card,
            { variant: CardVariant.DANGER, style: "margin-bottom: 1.5rem" },
            [
              m(CardHeader, {
                title: "Execution Error",
                icon: "exclamationTriangle",
                variant: CardVariant.DANGER,
              }),
              m(CardContent, [
                // Error description
                errorDescription &&
                m(
                  "pre.error-description",
                  {
                    style:
                      "white-space: pre-wrap; font-family: monospace; margin: 0 0 1rem 0;",
                  },
                  errorDescription.trim(),
                ),

                // Code snippet with line numbers and syntax highlighting
                trimmedCode &&
                m("div", { style: "margin: 1rem 0;" }, [
                  m(CodeViewer, {
                    code: trimmedCode,
                    language: "lua",
                    maxHeight: "300px",
                    noBorder: false,
                    padded: true,
                  }),
                ]),

                // Tip section
                tipSection &&
                m(
                  "pre.error-tip",
                  {
                    style:
                      "white-space: pre-wrap; font-family: monospace; margin: 1rem 0 0 0; padding: 1rem; background: var(--color-background); border-radius: 6px;",
                  },
                  tipSection.trim(),
                ),
              ]),
            ],
          );
        })(),

        // Event Data
        exec.event_json &&
        m(Card, { style: "margin-bottom: 1.5rem" }, [
          m(CardHeader, { title: "Input Event (JSON)" }),
          m(CardContent, { noPadding: true }, [
            m(CodeViewer, {
              code: JSON.stringify(JSON.parse(exec.event_json), null, 2),
              language: "json",
              maxHeight: "200px",
              noBorder: true,
              padded: true,
            }),
          ]),
        ]),

        // Execution Logs
        m(Card, [
          m(CardHeader, {
            title: "Execution Logs",
            subtitle: `${ExecutionDetail.logsTotal} log entries`,
          }),
          m(CardContent, { noPadding: true }, [
            m(LogViewer, {
              logs: ExecutionDetail.logs.map((log) => ({
                ...log,
                timestamp: formatUnixTimestamp(log.created_at, "time"),
              })),
              maxHeight: "300px",
              noBorder: true,
            }),
          ]),
          ExecutionDetail.logsTotal > ExecutionDetail.logsLimit &&
          m(Pagination, {
            total: ExecutionDetail.logsTotal,
            limit: ExecutionDetail.logsLimit,
            offset: ExecutionDetail.logsOffset,
            onPageChange: ExecutionDetail.handleLogsPageChange,
            onLimitChange: ExecutionDetail.handleLogsLimitChange,
          }),
        ]),
      ]),
    ]);
  },
};
