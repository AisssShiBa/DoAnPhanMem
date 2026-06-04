import api from "../lib/axios";

export interface NotificationItem {
  id: number;
  title: string | null;
  content: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const notificationService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<{
    notifications: NotificationItem[];
    unreadCount: number;
    pagination?: NotificationPagination;
  }> => {
    const res = await api.get("/notifications", { params });
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  clearRead: async (): Promise<void> => {
    await api.delete("/notifications/read");
  },
};
