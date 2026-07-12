import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDashboard } from "../api/dashboard";
import "../styles/dashboard.css";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Unable to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
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

  const handleViewAuditLog = () => {
    window.location.href = "/auditlogs";
  };

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle text-muted">
            Signed in as Admin - 8 of 8 permissions granted
          </p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            <div className="row g-4 dashboard-stats">
              <div className="col-md-6 col-lg-3">
                <div className="stat-card card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="stat-label text-muted mb-2">TOTAL USERS</p>
                    <h2 className="stat-value mb-0">{dashboardData.total_users}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="stat-card card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="stat-label text-muted mb-2">ACTIVE</p>
                    <h2 className="stat-value stat-value-accent mb-0">{dashboardData.active_users}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="stat-card card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="stat-label text-muted mb-2">ROLES</p>
                    <h2 className="stat-value mb-0">{dashboardData.roles}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="stat-card card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="stat-label text-muted mb-2">AUDIT EVENTS</p>
                    <h2 className="stat-value mb-0">{dashboardData.audit_logs}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="card recent-activity-card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Activity</h5>
                <button
                  className="btn btn-sm activity-link"
                  onClick={handleViewAuditLog}
                >
                  View audit log &rarr;
                </button>
              </div>
              <div className="card-body p-0">
                {dashboardData.recent_activity && dashboardData.recent_activity.length > 0 ? (
                  <div className="activity-list">
                    {dashboardData.recent_activity.slice(0, 4).map((activity, index) => (
                      <div className="activity-row" key={index}>
                        <time className="activity-time" dateTime={activity.created_at}>
                          {formatDate(activity.created_at)}
                        </time>
                        <span className={`badge badge-${getActionBadgeColor(activity.action)}`}>
                          {activity.action}
                        </span>
                        <span className="activity-description">{activity.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted">
                    <p>No recent activity found.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function getActionBadgeColor(action) {
  const normalized = action?.toUpperCase() || "";

  if (normalized.includes("USER")) return "success";
  if (normalized.includes("ROLE")) return "info";
  if (normalized === "CREATE") return "success";
  if (normalized === "UPDATE") return "info";
  if (normalized === "DELETE") return "danger";

  return "secondary";
}

export default Dashboard;
