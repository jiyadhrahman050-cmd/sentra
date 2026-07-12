import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleForm from "../components/forms/RoleForm";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../api/roles";

import { toast } from "react-toastify";

function Roles() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data.results || data);
    } catch (error) {
      console.error(error);
     toast.error("Failed to load roles.");
    }
  };

  const handleCreateRole = async (form) => {
    try {
      await createRole(form);
      toast.success("Role created successfully!");
      loadRoles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create role.");
    }
  };

  const handleEditRole = async (role) => {
  const name = prompt("Edit Role Name", role.name);

  if (!name) return;

  try {
    await updateRole(role.id, {
      ...role,
      name,
    });

    toast.success("Role updated successfully!");
    loadRoles();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update role.");
  }
};

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;

    try {
      await deleteRole(id);
      toast.success("Role deleted successfully!");
      loadRoles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role.");
    }
  };

  return (
    <DashboardLayout>
      <h2>Roles</h2>

      <RoleForm onSubmit={handleCreateRole} />

      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>
  <button
    className="btn btn-warning btn-sm me-2"
    onClick={() => handleEditRole(role)}
  >
    Edit
  </button>

  <button
    className="btn btn-danger btn-sm"
    onClick={() => handleDeleteRole(role.id)}
  >
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default Roles;