import api from "./axios";

export const getAuditLogs = async (page = 1, search = "", action = "", ordering = "-created_at") => {
  const params = {
    page,
    ordering,
  };

  if (search) {
    params.search = search;
  }

  if (action) {
    params.action = action;
  }

  const response = await api.get("/audit-logs/", { params });
  return response.data;
};

export const exportAuditLogs = async () => {
  const response = await api.get("/export/audit-logs/", {
    responseType: "blob",
  });
  return response.data;
};

