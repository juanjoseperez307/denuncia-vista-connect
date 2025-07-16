// Real implementation of notification service that calls actual API
import { INotificationService, Notification } from '../interfaces/INotificationService';
import { apiService } from '../api';

export class RealNotificationService implements INotificationService {
  
  async getNotifications(): Promise<Notification[]> {
    return apiService.get('/notifications');
  }

  async markAsRead(id: string): Promise<void> {
    return apiService.put(`/notifications/${id}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    return apiService.put('/notifications/read-all', {});
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get('/notifications/unread-count');
    return response.count;
  }

  async addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>): Promise<void> {
    return apiService.post('/notifications', notification);
  }

  async deleteNotification(id: string): Promise<void> {
    return apiService.delete(`/notifications/${id}`);
  }
}