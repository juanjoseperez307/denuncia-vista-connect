import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { serviceFactory } from '../services/ServiceFactory';

const Notifications = () => {
  const notificationService = serviceFactory.getNotificationService();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    };
    
    // Initial load
    loadNotifications();
    
    // Set up interval to check for new notifications every 1 second
    const interval = setInterval(loadNotifications, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const deleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-6 border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Marcar todas como leídas</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-card rounded-lg shadow-md p-8 text-center border">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card rounded-lg shadow-md p-6 border transition-all hover:shadow-lg ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-muted">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{notification.time}</span>
                        </div>
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-primary hover:text-primary/80 transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            title="Eliminar notificación"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;