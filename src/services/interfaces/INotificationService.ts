// Interface for notification service
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface INotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<number>;
  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}