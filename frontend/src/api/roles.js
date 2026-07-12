import api from "./axios";

export const getRoles = async () => {
  const response = await api.get("/roles/");
  return response.data;
};

export const createRole = async (data) => {
  const response = await api.post("/roles/", data);
  return response.data;
};

export const updateRole = async (id, data) => {
  const response = await api.put(`/roles/${id}/`, data);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}/`);
  return response.data;
};

export const updateRolePermissions = async (id, permissionIds) => {
  const response = await api.put(
    `/roles/${id}/assign-permissions/`,
    {
      permission_ids: permissionIds,
    }
  );

  return response.data;
};