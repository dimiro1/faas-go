import { icons } from "../icons.js";
import { API } from "../api.js";
import { Pagination } from "../components/pagination.js";
import { formatUnixTimestamp } from "../utils.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
import { Card, CardHeader, CardContent } from "../components/card.js";
import { Badge, BadgeVariant, BadgeSize, IDBadge } from "../components/badge.js";
import { LogViewer } from "../components/log-viewer.js";
import { CodeViewer } from "../components/code-viewer.js";

export const ExecutionDetail = {
    execution: null,
    logs: [],
    loading: true,
    logsLimit: 20,
    logsOffset: 0,
    logsTotal: 0,

    oninit: (vnode) => {
        ExecutionDetail.loadExecution(vnode.attrs.id);
    },

    loadExecution: async (id) => {
        ExecutionDetail.loading = true;
        try {
            const [execution, logsData] = await Promise.all([
                API.executions.get(id),
                API.executions.getLogs(id, ExecutionDetail.logsLimit, ExecutionDetail.logsOffset),
            ]);
            ExecutionDetail.execution = execution;
            ExecutionDetail.logs = logsData.logs || [];
            ExecutionDetail.logsTotal = logsData.pagination?.total || 0;
        } catch (e) {
            console.error("Failed to load execution:", e);
        } finally {
            ExecutionDetail.loading = false;
            m.redraw();
        }
    },

    loadLogs: async () => {
        try {
            const logsData = await API.executions.getLogs(
                ExecutionDetail.execution.id,
                ExecutionDetail.logsLimit,
                ExecutionDetail.logsOffset
            );
            ExecutionDetail.logs = logsData.logs || [];
            ExecutionDetail.logsTotal = logsData.pagination?.total || 0;
            m.redraw();
        } catch (e) {
            console.error("Failed to load logs:", e);
        }
    },

    handleLogsPageChange: (newOffset) => {
        ExecutionDetail.logsOffset = newOffset;
        ExecutionDetail.loadLogs();
    },

    handleLogsLimitChange: (newLimit) => {
        ExecutionDetail.logsLimit = newLimit;
        ExecutionDetail.logsOffset = 0;
        ExecutionDetail.loadLogs();
    },

    view: () => {
        if (ExecutionDetail.loading) {
            return m(".loading", [
                m.trust(icons.spinner()),
                m("p", "Loading execution...")
            ]);
        }

        if (!ExecutionDetail.execution) {
            return m(".fade-in", m(Card, m(CardContent, "Execution not found")));
        }

        const exec = ExecutionDetail.execution;

        return m(".fade-in", [
            // Header
            m(".execution-details-header", [
                m(BackButton, { href: `#!/functions/${exec.function_id}` }),
                m(".execution-details-info", [
                    m("h3.execution-details-title", m(IDBadge, { id: exec.id })),
                    m(Badge, {
                        variant: exec.status === "success" ? BadgeVariant.SUCCESS : BadgeVariant.DESTRUCTIVE,
                        size: BadgeSize.SM
                    }, exec.status.toUpperCase()),
                    m("span.execution-details-duration", exec.duration_ms ? `${exec.duration_ms}ms` : "N/A")
                ])
            ]),

            m(".execution-details-panels", [
                // Event Data
                exec.event_json && m(Card, { style: "margin-bottom: 1.5rem" }, [
                    m(CardHeader, { title: "Input Event (JSON)" }),
                    m(CardContent, { noPadding: true }, [
                        m(CodeViewer, {
                            code: JSON.stringify(JSON.parse(exec.event_json), null, 2),
                            language: 'json',
                            maxHeight: '200px',
                            noBorder: true,
                            padded: true
                        })
                    ])
                ]),

                // Execution Logs
                m(Card, [
                    m(CardHeader, {
                        title: "Execution Logs",
                        subtitle: `${ExecutionDetail.logsTotal} log entries`
                    }),
                    m(CardContent, { noPadding: true }, [
                        m(LogViewer, {
                            logs: ExecutionDetail.logs.map(log => ({
                                ...log,
                                timestamp: formatUnixTimestamp(log.created_at, "time")
                            })),
                            maxHeight: '300px',
                            noBorder: true
                        })
                    ]),
                    ExecutionDetail.logsTotal > ExecutionDetail.logsLimit && m(Pagination, {
                        total: ExecutionDetail.logsTotal,
                        limit: ExecutionDetail.logsLimit,
                        offset: ExecutionDetail.logsOffset,
                        onPageChange: ExecutionDetail.handleLogsPageChange,
                        onLimitChange: ExecutionDetail.handleLogsLimitChange
                    })
                ])
            ])
        ]);
    }
};
