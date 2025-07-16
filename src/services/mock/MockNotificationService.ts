// Mock implementation of notification service using SQL.js database
import { INotificationService, Notification } from '../interfaces/INotificationService';
import { databaseService } from '../database/DatabaseService';

export class MockNotificationService implements INotificationService {
  
  async getNotifications(): Promise<Notification[]> {
    const results = await databaseService.query(`
      SELECT * FROM notifications ORDER BY created_at DESC
    `);
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      time: row.time,
      read: !!row.read,
      type: row.type
    }));
  }

  async markAsRead(id: string): Promise<void> {
    await databaseService.execute(`
      UPDATE notifications SET read = true WHERE id = ?
    `, [id]);
  }

  async markAllAsRead(): Promise<void> {
    await databaseService.execute(`
      UPDATE notifications SET read = true
    `);
  }

  async getUnreadCount(): Promise<number> {
    const results = await databaseService.query(`
      SELECT COUNT(*) as count FROM notifications WHERE read = false
    `);
    
    return results[0].count;
  }

  async addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>): Promise<void> {
    const id = Date.now().toString();
    
    await databaseService.execute(`
      INSERT INTO notifications (id, title, message, time, read, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      notification.title,
      notification.message,
      'hace pocos segundos',
      false,
      notification.type
    ]);
  }

  async deleteNotification(id: string): Promise<void> {
    await databaseService.execute(`
      DELETE FROM notifications WHERE id = ?
    `, [id]);
  }
}