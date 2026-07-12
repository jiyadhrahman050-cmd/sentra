import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  exportUsers,
  getRoles,
} from "../api/users";
import { toast } from "react-toastify";
import Loading from "../components/common/Loading";
import "../styles/users.css";

const PAGE_SIZE = 4;

function Users() {
  // State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
  username: "",
  email: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  role_ids: [],
  is_active: true,
});

  const [formErrors, setFormErrors] = useState({});

  // Load users and roles on mount
  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  // Load users when page or search changes
  useEffect(() => {
    loadUsers();
  }, [page, search]);

    // Get role name
  const getRoleName = (user) => {
  if (!Array.isArray(user.roles) || user.roles.length === 0) {
    return "No Role";
  }

  return user.roles
    .map(role => role.name)
    .join(", ");
};

  const filteredUsers = useMemo(() => {
  return users.filter((user) => {

    const roleMatch =
      !roleFilter ||
      user.roles?.some(role => role.name === roleFilter);

    const statusMatch =
      statusFilter === "active"
        ? user.is_active
        : statusFilter === "inactive"
        ? !user.is_active
        : true;

    return roleMatch && statusMatch;
  });
}, [users, roleFilter, statusFilter]);



  const loadUsers = async () => {
  try {
    setLoading(true);

    const data = await getUsers(page, search);

    console.log("Current page:", page);
    console.log("Users returned:", data.results || data);

    setUsers(data.results || data);
    setTotalCount(data.count || 0);
    setNextPage(data.next);
    setPreviousPage(data.previous);
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    setLoading(false);
  }
};


  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (modalMode === "create" && !formData.password) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode("create");
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      role_ids: [],
      is_active: true,
    });
    setFormErrors({});
    setShowModal(true);
  };





  const openEditModal = (user) => {
  setModalMode("edit");
  setEditingUser(user);

  setFormData({
    username: user.username || "",
    email: user.email || "",
    password: "",
    confirm_password: "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",

    // IMPORTANT
    role_ids: user.roles?.map(role => role.id) || [],

    is_active: user.is_active,
  });

  setFormErrors({});
  setShowModal(true);
};


  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      role_ids: [],
      is_active: true,
    });
    setFormErrors({});
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
  return;
}

    if (
  modalMode === "create" &&
  formData.password !== formData.confirm_password
) {
  setFormErrors({
    ...formErrors,
    confirm_password: "Passwords do not match.",
  });

  toast.error("Passwords do not match.");
  return;
}

    try {
      const submitData = { ...formData };

// Remove confirm_password (backend doesn't need it)
delete submitData.confirm_password;

// Don't send password if empty (edit mode)
if (!submitData.password) {
  delete submitData.password;
}

if (modalMode === "create") {
  await createUser(submitData);
} else {
  await updateUser(editingUser.id, submitData);
}

      closeModal();
      setPage(1); // Reset to first page
      loadUsers();
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data) {
        // Handle backend validation errors
        Object.keys(error.response.data).forEach((key) => {
          toast.error(`${key}: ${error.response.data[key]}`);
        });
      } else {
        toast.error(
          modalMode === "create"
            ? "Failed to create user."
            : "Failed to update user."
        );
      }
    }
  };

  // Delete handlers
  const openDeleteModal = (user) => {
  setSelectedUser(user);
  setShowDeleteModal(true);
};

  const confirmDelete = async () => {
  try {
    await deleteUser(selectedUser.id);

    // Remove deleted user immediately from the table
    setUsers(prevUsers =>
      prevUsers.filter(user => user.id !== selectedUser.id)
    );

    toast.success("User deleted successfully!");

    setShowDeleteModal(false);
    setSelectedUser(null);

    // Reload the latest data from the server
    await loadUsers();
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user.");
  }
};

const confirmDeactivate = async () => {
  try {
    await updateUser(selectedUser.id, {
      username: selectedUser.username,
      email: selectedUser.email,
      first_name: selectedUser.first_name,
      last_name: selectedUser.last_name,
      role_ids: selectedUser.roles.map(role => role.id),
      is_active: false,
    });

    toast.success("User deactivated successfully!");

    setShowDeleteModal(false);
    setSelectedUser(null);

    loadUsers();
  } catch (error) {
    console.error(error);
    toast.error("Failed to deactivate user.");
  }
};


const confirmActivate = async () => {
  try {
    await updateUser(selectedUser.id, {
      username: selectedUser.username,
      email: selectedUser.email,
      first_name: selectedUser.first_name,
      last_name: selectedUser.last_name,
      role_ids: selectedUser.roles.map(role => role.id),
      is_active: true,
    });

    toast.success("User activated successfully!");

    setShowDeleteModal(false);
    setSelectedUser(null);

    loadUsers();
  } catch (error) {
    console.error(error);
    toast.error("Failed to activate user.");
  }
};




  // Export handler
  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportUsers();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Users exported successfully!");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users.");
    } finally {
      setExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
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

  // Get user initials for avatar
  const getInitials = (user) => {
    const firstName = user.first_name || user.username || "";
    const lastName = user.last_name || "";
    const initials = (firstName[0] || "") + (lastName[0] || "") || "U";
    return initials.toUpperCase();
  };

  const getDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    return user.username;
  };


  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <DashboardLayout>
      <div className="users-container">
        <div className="users-header">
          <div>
            <h1 className="users-title">Users</h1>
            <p className="users-subtitle text-muted">
              {totalCount} of {totalCount} users match
            </p>
          </div>
          <button className="btn btn-add-user" onClick={openCreateModal}>
            + Add user
          </button>
        </div>

        <div className="users-controls">
          <div className="users-filter-group">
            <input
              type="text"
              className="form-control users-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="form-select users-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              className="form-select users-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            className="btn btn-export-users"
            onClick={handleExport}
            disabled={exporting || loading}
          >
            {exporting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
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

        {loading ? (
          <Loading />
        ) : filteredUsers.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <p className="mb-0">No users found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="users-table-card">
            <div className="table-responsive">
              <table className="table users-table">
                <thead>
                  <tr>
                    <th>USER <span aria-hidden="true">&uarr;</span></th>
                    <th>ROLES</th>
                    <th>STATUS</th>
                    <th>LAST LOGIN</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className={`user-avatar avatar-${index % 4}`}>
                            {getInitials(user)}
                          </div>
                          <div className="user-identity">
                            <div className="user-name">{getDisplayName(user)}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge-role">
                          {getRoleName(user)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          <span className="status-dot"></span>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="last-login">
                        {formatDate(user.last_login)}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-table-action"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>
                          <button
  className="btn btn-table-action danger-action"
  onClick={() => openDeleteModal(user)}
>
  Actions
</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="users-pagination">
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
                    <span className="page-count">{page} / {totalPages}</span>
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
      </div>

      {/* Add/Edit User Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        id="userModal"
        style={{ display: showModal ? "block" : "none", background: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">
                {modalMode === "create" ? "Add New User" : "Edit User"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Username */}
                <div className="mb-3">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.username ? "is-invalid" : ""
                    }`}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                  />
                  {formErrors.username && (
                    <div className="invalid-feedback d-block">
                      {formErrors.username}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${
                      formErrors.email ? "is-invalid" : ""
                    }`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback d-block">
                      {formErrors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">
                    Password {modalMode === "create" ? "*" : "(leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      formErrors.password ? "is-invalid" : ""
                    }`}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <div className="invalid-feedback d-block">
                      {formErrors.password}
                    </div>
                  )}
                </div>


                {/* Confirm Password */}
<div className="mb-3">
  <label className="form-label">
    Confirm Password {modalMode === "create" ? "*" : ""}
  </label>

  <input
    type="password"
    className={`form-control ${
      formErrors.confirm_password ? "is-invalid" : ""
    }`}
    name="confirm_password"
    value={formData.confirm_password}
    onChange={handleInputChange}
    placeholder="Confirm password"
  />

  {formErrors.confirm_password && (
    <div className="invalid-feedback d-block">
      {formErrors.confirm_password}
    </div>
  )}
</div>

                

               {/* Role */}
<div className="mb-3">
  <label className="form-label">Roles</label>

  <div className="role-buttons">
    {roles.map((role) => (
      <button
        key={role.id}
        type="button"
        className={`role-btn ${
          formData.role_ids.includes(role.id) ? "active" : ""
        }`}
        onClick={() => {
          const exists = formData.role_ids.includes(role.id);

          setFormData({
            ...formData,
            role_ids: exists
              ? formData.role_ids.filter(id => id !== role.id)
              : [...formData.role_ids, role.id],
          });
        }}
      >
        {role.name}
      </button>
    ))}
  </div>
</div>

                {/* Active Status */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      id="activeCheck"
                    />
                    <label className="form-check-label" htmlFor="activeCheck">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === "create" ? "Create User" : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteModal ? "show" : ""}`}
        id="deleteModal"
        style={{ display: showDeleteModal ? "block" : "none", background: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">User Actions</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Choose what you want to do with this user.
              </p>
            </div>
            <div className="modal-footer border-0">
  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={() => setShowDeleteModal(false)}
  >
    Cancel
  </button>

 {selectedUser?.is_active ? (
  <button
    type="button"
    className="btn btn-warning"
    onClick={confirmDeactivate}
  >
    Deactivate
  </button>
) : (
  <button
    type="button"
    className="btn btn-success"
    onClick={confirmActivate}
  >
    Activate
  </button>
)}

  <button
    type="button"
    className="btn btn-danger"
    onClick={confirmDelete}
  >
    Delete
  </button>
</div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}

export default Users;
