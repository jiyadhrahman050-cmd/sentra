import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Get user data from localStorage or context
  useEffect(() => {
    if (user) {
      setUserData(user);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch {
          // Use email from localStorage if stored
          const email = localStorage.getItem("user_email");
          if (email) {
            setUserData({ email, username: email.split("@")[0] });
          }
        }
      }
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    // Navigate to profile page if it exists
    navigate("/profile");
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!userData) return "U";

    const firstName = userData.first_name || userData.username || userData.email || "";
    const lastName = userData.last_name || "";

    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }

    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (!userData) return "User";

    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }

    if (userData.first_name) {
      return userData.first_name;
    }

    if (userData.username) {
      return userData.username;
    }

    return userData.email?.split("@")[0] || "User";
  };

  // Get email
  const getEmail = () => {
    return userData?.email || userData?.username || "user@example.com";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        {/* Brand / Logo */}
        <span className="navbar-brand d-flex align-items-center gap-2">
          <i className="fas fa-shield-alt text-primary"></i>
          <strong>Sentra</strong>
        </span>

        {/* Right Side - User Info */}
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown user-dropdown">
            {/* User Avatar and Name Button */}
            <button
              className="btn btn-link nav-link d-flex align-items-center gap-2 p-0"
              id="userDropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {/* Avatar */}
              <div className="user-avatar">
                {getInitials()}
              </div>

              {/* User Info */}
              <div className="user-info d-none d-md-block">
                <div className="user-name">{getDisplayName()}</div>
                <div className="user-email">{getEmail()}</div>
              </div>

              {/* Dropdown Icon */}
              <i
                className={`fas fa-chevron-down ms-2 ${
                  dropdownOpen ? "rotate" : ""
                }`}
              ></i>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`dropdown-menu dropdown-menu-end user-dropdown-menu ${
                dropdownOpen ? "show" : ""
              }`}
              style={{ display: dropdownOpen ? "block" : "none" }}
            >
              {/* User Info Header (Mobile) */}
              <div className="dropdown-header d-md-none border-bottom">
                <div className="fw-bold">{getDisplayName()}</div>
                <small className="text-muted">{getEmail()}</small>
              </div>

              {/* Profile Option */}
              <button
                className="dropdown-item dropdown-item-custom"
                onClick={handleProfileClick}
              >
                <i className="fas fa-user-circle me-2 text-primary"></i>
                <span>My Profile</span>
              </button>

              {/* Divider */}
              <hr className="dropdown-divider my-2" />

              {/* Logout Option */}
              <button
                className="dropdown-item dropdown-item-custom logout"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2 text-danger"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for dropdown on mobile */}
      {dropdownOpen && (
        <div
          className="dropdown-backdrop d-md-none"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
}

export default Navbar;

