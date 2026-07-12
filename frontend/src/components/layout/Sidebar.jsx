import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import "../styles/sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user: userData } = useContext(AuthContext) || {};

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 992) {
      setIsOpen(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (user) => {
    if (!user) return "U";

    const firstName = user.first_name || user.username || user.email || "";
    const lastName = user.last_name || "";

    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }

    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  // Get display name
  const getDisplayName = (user) => {
    if (!user) return "User";

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    if (user.first_name) {
      return user.first_name;
    }

    if (user.username) {
      return user.username;
    }

    return user.email?.split("@")[0] || "User";
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "fas fa-th-large",
    },
    {
      name: "Users",
      path: "/users",
      icon: "fas fa-users",
    },
    {
      name: "Roles & Permissions",
      path: "/roles-permissions",
      icon: "fas fa-shield-alt",
    },
    {
      name: "Audit Log",
      path: "/auditlogs",
      icon: "fas fa-history",
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-toggle d-lg-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Section */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            S
          </div>
          <div>
            <h5 className="brand-text mb-0">Sentra</h5>
          </div>
          <button
            className="sidebar-close d-lg-none ms-auto"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-grow-1">
          <div className="nav-section">
            <ul className="nav flex-column">
              {menuItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={handleNavClick}
                  >
                    <span className="nav-icon">
                      <i className={item.icon}></i>
                    </span>
                    <span className="nav-text">{item.name}</span>
                    <span className="nav-indicator"></span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer - User Profile and Logout Button */}
        <div className="sidebar-footer">
          {/* User Profile Section */}
          <div className="user-profile-footer">
            <div className="user-avatar-footer">
              {getInitials(userData)}
            </div>
            <div className="user-info-footer">
              <div className="user-name-footer">
                {getDisplayName(userData)}
              </div>
              <div className="user-role-footer">
                {userData?.is_staff ? "Admin" : userData?.role?.name || "User"}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="btn btn-logout"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
