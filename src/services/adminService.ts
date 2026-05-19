import api from "../lib/axios";

// ── Types ──────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "BANNED" | "PENDING";
  provider: string | null;
  created_at: string;
  role: { name: string } | null;
  _count: { tasks: number };
}

export interface SystemStats {
  taskGrowth: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dau: any;
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  totalCategories: number;
  dauToday: number;
  mauThisMonth: { value: number; change: string };
  userGrowth: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface LogEntry {
  id: number;
  user_name: string;
  user_email: string;
  role: string;
  action: string | null;
  action_type: "CREATE" | "UPDATE" | "DELETE" | "ALERT" | "SYSTEM";
  created_at: string;
}

export interface DefaultTag {
  id: number;
  name: string | null;
  color_code: string | null;
}

export interface NotifHistoryItem {
  id: number;
  action: string;
  action_type: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  role?: string;
}

export interface UserTaskStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  completionRate: number;
  recentTasks: { title: string; status: string; due: string | null }[];
  categories: { name: string; color: string; count: number }[];
}

export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

// ── Service ────────────────────────────────────────────────────

export const adminService = {
  // Stats & Charts
  getSystemStats: async (): Promise<SystemStats> => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  getDauChart: async (days = 30): Promise<ChartPoint[]> => {
    const res = await api.get("/admin/dashboard/dau", { params: { days } });
    return res.data.dau;
  },

  getMauChart: async (months = 5): Promise<ChartPoint[]> => {
    const res = await api.get("/admin/dashboard/mau", { params: { months } });
    return res.data.mau;
  },

  // Users
  getUsers: async (params: {
    search?: string;
    status?: string;
    page?: number;
  }): Promise<{ users: AdminUser[]; pagination: Pagination }> => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },

  updateUserStatus: async (
    id: number,
    status: "ACTIVE" | "BANNED",
    reason?: string,
  ): Promise<{ message: string }> => {
    const res = await api.patch(`/admin/users/${id}/status`, {
      status,
      reason,
    });
    return res.data;
  },

  resetUserPassword: async (id: number): Promise<{ message: string }> => {
    const res = await api.post(`/admin/users/${id}/reset-password`);
    return res.data;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // User Task Stats (for admin drawer)
  getUserTaskStats: async (id: number): Promise<UserTaskStats> => {
    const res = await api.get(`/admin/users/${id}/task-stats`);
    return res.data;
  },

  // Notifications
  broadcastNotification: async (payload: {
    title: string;
    content: string;
    type: "INFO" | "WARNING" | "MAINTENANCE";
  }): Promise<{ message: string; reachCount: number }> => {
    const res = await api.post("/admin/notifications/broadcast", payload);
    return res.data;
  },

  getNotificationHistory: async (
    page = 1,
  ): Promise<{ history: NotifHistoryItem[]; pagination: Pagination }> => {
    const res = await api.get("/admin/notifications/history", {
      params: { page },
    });
    return res.data;
  },

  // Tags
  getDefaultTags: async (): Promise<{ tags: DefaultTag[] }> => {
    const res = await api.get("/admin/tags");
    return res.data;
  },

  createDefaultTag: async (payload: {
    name: string;
    color: string;
  }): Promise<{ tag: DefaultTag; message: string }> => {
    const res = await api.post("/admin/tags", payload);
    return res.data;
  },

  deleteDefaultTag: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/admin/tags/${id}`);
    return res.data;
  },

  // Logs
  getAuditLogs: async (params: {
    search?: string;
    role?: string;
    page?: number;
  }): Promise<{ logs: LogEntry[]; pagination: Pagination }> => {
    const res = await api.get("/admin/logs", { params });
    return res.data;
  },

  getActivityHeatmap: async (): Promise<{
    cells: { day: number; hour: number; count: number }[];
  }> => {
    const res = await api.get("/admin/heatmap");
    return res.data;
  },
};
