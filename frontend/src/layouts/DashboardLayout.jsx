import Sidebar from "../components/layout/Sidebar";
import "../components/styles/dashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;