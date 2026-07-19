import type { Notification } from '@/types';
import { api } from '@/lib/apiClient';

/** Thin client for the coordinator's notification feed (shared collection). */
const notificationService = {
  getNotificationsByCell: async (): Promise<Notification[]> => {
    return api.get<Notification[]>('/me/notifications');
  },

  getUnreadCount: async (): Promise<number> => {
    const all = await notificationService.getNotificationsByCell();
    return all.filter((n) => !n.isRead).length;
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    await api.patch(`/notifications/${notificationId}/read`);
    return true;
  },

  markAllAsRead: async (): Promise<boolean> => {
    await api.patch('/notifications/read-all');
    return true;
  },
};

export default notificationService;
