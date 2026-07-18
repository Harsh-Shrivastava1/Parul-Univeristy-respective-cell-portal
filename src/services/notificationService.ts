import type { Notification } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/mock/db';

const notificationService = {
  getNotificationsByCell: async (): Promise<Notification[]> => {
    return Promise.resolve([...MOCK_NOTIFICATIONS]);
  },

  getUnreadCount: async (): Promise<number> => {
    return Promise.resolve(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    const notification = MOCK_NOTIFICATIONS.find(n => n.notificationId === notificationId);
    if (notification) {
      notification.isRead = true;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  markAllAsRead: async (): Promise<boolean> => {
    MOCK_NOTIFICATIONS.forEach(n => { n.isRead = true; });
    return Promise.resolve(true);
  }
};

export default notificationService;
