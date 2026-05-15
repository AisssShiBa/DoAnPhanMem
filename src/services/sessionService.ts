import api from "../lib/axios";

export const sessionService = {
  getSessions: () => api.get("/auth/sessions"),
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
  logoutAll: () => api.post("/auth/logout-all"),
};
