import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAuditLogs, exportAuditLogs } from "../api/audit";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import "../styles/auditLog.css";

const PAGE_SIZE = 6;

function AuditLogs() {
  // State
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Get unique action types for filter dropdown
  const actionTypes = useMemo(() => {
    const actions = new Set();
    logs.forEach((log) => {
      if (log.action) {
        actions.add(log.action);
      }
    });
    return Array.from(actions).sort();
  }, [logs]);

  // Load logs on mount and when filters change
  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page, search, actionFilter, ordering]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(page, search, actionFilter, ordering);

      setLogs(data.results || data);
      setTotalCount(data.count || 0);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportAuditLogs();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit_logs_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully!");
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      toast.error("Failed to export audit logs.");
    } finally {
      setExporting(false);
    }
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const parts = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const getPart = (type) => parts.find((part) => part.type === type)?.value;
    return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
  };

  // Get action badge color
  const getActionBadgeColor = (action) => {
    const colorMap = {
      CREATE: "success",
      READ: "info",
      UPDATE: "primary",
      DELETE: "danger",
      LOGIN: "info",
      LOGOUT: "secondary",
      ASSIGN_ROLE: "warning",
      ASSIGN_PERMISSION: "info",
      USER_UPDATE: "primary",
      USER_CREATE: "success",
      USER_DELETE: "danger",
      ROLE_UPDATE: "primary",
      ROLE_CREATE: "success",
      ROLE_DELETE: "danger",
      PERMISSION_UPDATE: "primary",
      PERMISSION_CREATE: "success",
      PERMISSION_DELETE: "danger",
    };

    return colorMap[action?.toUpperCase()] || "secondary";
  };

  // Format action name
  const formatActionName = (action) => {
    return action?.replace(/_/g, ".").toLowerCase() || "";
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <DashboardLayout>
      <div className="audit-log-container">
        <div className="audit-header">
          <div>
            <h1 className="audit-title">Audit Log</h1>
            <p className="audit-subtitle text-muted">
              Append-only record of every sensitive action
            </p>
          </div>
          <div className="audit-actions">
            <select
              className="form-select audit-action-select"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {formatActionName(action)}
                </option>
              ))}
            </select>
            <button
              className="btn btn-audit-export"
              onClick={handleExport}
              disabled={exporting || loading}
            >
              {exporting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <i className="fas fa-inbox fa-2x mb-3 d-block text-muted"></i>
            <p className="mb-0">No audit logs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="audit-table-card">
              <div className="table-responsive">
                <table className="table audit-table">
                  <thead>
                    <tr>
                      <th>
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setOrdering(
                              ordering === "-created_at"
                                ? "created_at"
                                : "-created_at"
                            )
                          }
                          title="Click to toggle sort order"
                        >
                          TIMESTAMP{" "}
                          {ordering === "-created_at" ? (
                            <i className="fas fa-arrow-down"></i>
                          ) : ordering === "created_at" ? (
                            <i className="fas fa-arrow-up"></i>
                          ) : null}
                        </span>
                      </th>
                      <th>ACTOR</th>
                      <th>ACTION</th>
                      <th>DETAIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id || index}>
                        <td className="audit-timestamp">
                          {formatDateTime(log.created_at || log.timestamp)}
                        </td>

                        <td className="audit-actor">
                          {log.actor || log.user || log.email || "-"}
                        </td>

                        <td>
                          <span
                            className={`audit-action-badge bg-${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {formatActionName(log.action)}
                          </span>
                        </td>

                        <td className="audit-detail">{log.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {(nextPage || previousPage) && (
              <div className="audit-pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-info">
                    Showing {showingStart}-{showingEnd} of {totalCount}
                    <code>server-side · page_size={PAGE_SIZE}</code>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="btn btn-page"
                      disabled={!previousPage}
                      onClick={() => setPage(page - 1)}
                    >
                      ← Prev
                    </button>
                    <span className="page-count">
                      {page} / {totalPages}
                    </span>
                    <button
                      className="btn btn-page"
                      disabled={!nextPage}
                      onClick={() => setPage(page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AuditLogs;
