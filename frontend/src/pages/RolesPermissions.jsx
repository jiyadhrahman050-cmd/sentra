import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getRoles, updateRolePermissions } from "../api/roles";
import { getPermissions } from "../api/permissions";
import { toast } from "react-toastify";
import "../styles/rolesPermissions.css";

function RolesPermissions() {
  // State
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleName, setRoleName] = useState("");


  const currentUserRole = localStorage.getItem("role");

const canEditRole = (role) => {
  if (!role) return false;

  if (currentUserRole === "Admin") {
    return true;
  }

  if (currentUserRole === "Manager") {
    return role.name !== "Admin";
  }

  return false; // Viewer cannot edit any role
};


  // Load roles and permissions on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rolesData, permissionsData] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      const rolesArray = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
      setRoles(rolesArray);
      
      const permissionsArray = Array.isArray(permissionsData)
        ? permissionsData
        : permissionsData.results || [];
      setAllPermissions(permissionsArray);

      // Select first role by default
      if (rolesArray.length > 0) {
        selectRole(rolesArray[0]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load roles and permissions");
      toast.error("Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  // Select role and load its permissions
  const selectRole = (role) => {
    setSelectedRole(role);
    

    // Load permissions assigned to this role
    if (role.permissions && Array.isArray(role.permissions)) {
      const permissionIds = new Set(
        role.permissions.map((p) => (typeof p === "object" ? p.id : p))
      );
      setSelectedPermissions(permissionIds);
    } else {
      setSelectedPermissions(new Set());
    }
  };

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups = {};

    allPermissions.forEach((permission) => {
      const category = permission.codename?.split(/[._]/)?.[0]?.toUpperCase() || "OTHER";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });

    const groupOrder = ["USERS", "ROLES", "AUDIT"];

    return Object.keys(groups)
      .sort((a, b) => {
        const aIndex = groupOrder.indexOf(a);
        const bIndex = groupOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {});
  }, [allPermissions]);

  // Handle permission toggle
  const togglePermission = async (permissionId) => {
  if (selectedRole?.is_locked) return;

  // Create updated permission list
  const newPermissions = new Set(selectedPermissions);

  if (newPermissions.has(permissionId)) {
    newPermissions.delete(permissionId);
  } else {
    newPermissions.add(permissionId);
  }

  // Update UI immediately
  setSelectedPermissions(newPermissions);

  try {
    // Save to Django
    await updateRolePermissions(
      selectedRole.id,
      Array.from(newPermissions)
    );

    // Update selected role
    const updatedRole = {
      ...selectedRole,
      permissions: allPermissions.filter((p) =>
        newPermissions.has(p.id)
      ),
    };

    setSelectedRole(updatedRole);

    // Update roles list
    setRoles((prev) =>
      prev.map((role) =>
        role.id === updatedRole.id ? updatedRole : role
      )
    );

    toast.success("Permission updated");
  } catch (err) {
    toast.error("Failed to update permission");
  }
};





  // Get user count for a role
  const getUserCount = (role) => {
    return role.users_count || 0;
  };

  // Get permission description
  const getPermissionDescription = (codename) => {
    const descriptions = {
      "users.view": "See the user list",
      "users.create": "Invite / add users",
      "users.edit": "Edit users & assign roles",
      "users.delete": "Deactivate users",
      "roles.view": "See roles",
      "roles.manage": "Create/edit roles & permissions",
      "permissions.view": "See permission catalogue",
      "audit.view": "Read the audit log",
    };
    return descriptions[codename] || "";
  };

  const formatCodename = (codename) => {
    return codename.replace(/_/g, " ");
  };

  const handleCreateRole = async () => {
  if (!roleName.trim()) {
    toast.error("Role name is required");
    return;
  }

  try {
    // Replace this with your API later
    const newRole = {
      id: Date.now(),
      name: roleName,
      description: "",
      permissions: [],
      users_count: 0,
    };

    setRoles((prev) => [...prev, newRole]);

    setShowRoleModal(false);
    setRoleName("");

    toast.success("Role created");
  } catch (err) {
    toast.error("Failed to create role");
  }
};



  return (
    <DashboardLayout>


      {showRoleModal && (
  <div className="modal-overlay">
    <div className="role-modal">
      <h3>Create Role</h3>

      <input
        type="text"
        placeholder="Role name"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        className="form-control"
      />

      <div className="modal-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowRoleModal(false);
            setRoleName("");
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-success"
          onClick={handleCreateRole}
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}


      <div className="roles-permissions-container">
        <div className="roles-header">
          <div>
            <h1 className="roles-title">Roles & Permissions</h1>
            <p className="roles-subtitle text-muted">
              Changes apply immediately and are written to the audit log
            </p>
          </div>
          <button
  className="btn btn-new-role"
  onClick={() => setShowRoleModal(true)}
>
  + New role
</button>
        </div>

        {/* Error Alert */}
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

        {/* Main Content */}
        <div className="roles-permissions-content">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "500px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="roles-permissions-grid">
              {/* Left Panel - Roles */}
              <div>
                <div className="roles-panel">
                  <div className="roles-list">
                    {roles.length === 0 ? (
                      <p className="text-muted text-center py-4">No roles found</p>
                    ) : (
                      roles.map((role) => (
                        <div
                          key={role.id}
                          className={`role-card ${
                            selectedRole?.id === role.id ? "active" : ""
                          }`}
                          onClick={() => selectRole(role)}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <div className="role-card-content">
                            <h6 className="role-name mb-1">{role.name}</h6>
                            <p className="role-description mb-0">
                              {role.description || "No description"}
                            </p>
                          </div>
                          <div className="role-users-count">
                            <span className="badge bg-light text-dark">
                              {getUserCount(role)} users
                            </span>
                          </div>
                          {selectedRole?.id === role.id && (
                            <div className="role-card-indicator">
                              <div className="indicator-line"></div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Permissions */}
              <div>
                {selectedRole ? (
                  <div className="permissions-panel">
                    {/* Role Header */}
                    <div className="permissions-header">
                      <div>
                        <h3 className="role-selected-name mb-1">{selectedRole.name}</h3>
                        <p className="role-selected-desc text-muted mb-0">
                          {selectedRole.description || "No description"}
                        </p>
                      </div>
                      {selectedRole.is_locked && (
                        <div className="badge bg-secondary">System role — locked</div>
                      )}
                    </div>

                    {/* Permissions by Group */}
                    <div className="permissions-groups">
                      {Object.keys(groupedPermissions).length === 0 ? (
                        <p className="text-muted text-center py-4">
                          No permissions available
                        </p>
                      ) : (
                        Object.entries(groupedPermissions).map(
                          ([category, permissions]) => (
                            <div key={category} className="permission-group mb-4">
                              <h6 className="permission-group-title text-muted mb-3">
                                {category}
                              </h6>
                              <div className="permission-cards">
                                {permissions.map((permission) => (
                                  <div
  key={permission.id}
  className={`permission-card ${
    selectedPermissions.has(permission.id)
      ? "checked"
      : ""
  } ${
    !canEditRole(selectedRole)
      ? "disabled"
      : ""
  }`}
  onClick={() => {
    if (canEditRole(selectedRole)) {
      togglePermission(permission.id);
    }
  }}
>
                                    <div className="permission-checkbox">
                                    <input
  type="checkbox"
  checked={selectedPermissions.has(permission.id)}
  readOnly
  disabled={
    selectedRole.is_locked ||
    !canEditRole(selectedRole)
  }
  id={`perm-${permission.id}`}
/>
                                      <label htmlFor={`perm-${permission.id}`}>
                                        <span className="checkmark"></span>
                                      </label>
                                    </div>
                                    <div className="permission-info">
                                      <div className="permission-name">
                                        {formatCodename(permission.codename)}
                                      </div>
                                      <div className="permission-description">
                                        {getPermissionDescription(permission.codename)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>

                    
                   
                      </div>
                    
                  
                ) : (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                    <p className="text-muted">Select a role to view permissions</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RolesPermissions;
