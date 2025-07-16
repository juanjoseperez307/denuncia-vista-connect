import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceFactory } from '../services/ServiceFactory';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifications = await serviceFactory.getNotificationService().getNotifications();
        const unread = notifications.filter(n => !n.read);
        setUnreadCount(unread.length);
        setRecentNotifications(notifications.slice(0, 3)); // Show last 3 notifications
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    // Initial load
    loadNotifications();
    
    // Set up interval to check for new notifications every 1 second
    const interval = setInterval(loadNotifications, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await serviceFactory.getNotificationService().markAsRead(id);
      // Reload notifications after marking as read
      const notifications = await serviceFactory.getNotificationService().getNotifications();
      const unread = notifications.filter(n => !n.read);
      setUnreadCount(unread.length);
      setRecentNotifications(notifications.slice(0, 3));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Notificaciones</h3>
              <Link
                to="/notifications"
                className="text-sm text-orange-600 hover:text-orange-700"
                onClick={() => setShowDropdown(false)}
              >
                Ver todas
              </Link>
            </div>
            
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
