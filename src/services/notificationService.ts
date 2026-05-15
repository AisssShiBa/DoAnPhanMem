import api from "../lib/axios";

export interface NotificationItem {
  id: number;
  title: string | null;
  content: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
}

export const notificationService = {
  getAll: async (): Promise<{
    notifications: NotificationItem[];
    unreadCount: number;
  }> => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
};
