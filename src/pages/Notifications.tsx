import React, { useState } from 'react';
import { Bell, Check, Clock, MessageCircle, Heart, Flag, Settings } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { shouldUseMockData } from '../utils/mockData';

const Notifications = () => {
  const [filter, setFilter] = useState('all');

  const { data: notifications, loading } = useApi(
    () => shouldUseMockData() 
      ? Promise.resolve([
          {
            id: 1,
            type: 'comment',
            title: 'Nuevo comentario en tu reclamo',
            message: 'Ana López comentó en "Problemas en Hospital Italiano"',
            time: '5 minutos',
            read: false,
            icon: MessageCircle,
            color: 'text-blue-600'
          },
          {
            id: 2,
            type: 'like',
            title: 'Tu reclamo recibió un like',
            message: 'A Pedro Silva le gustó tu reclamo sobre transporte',
            time: '1 hora',
            read: false,
            icon: Heart,
            color: 'text-red-600'
          },
          {
            id: 3,
            type: 'system',
            title: 'Reclamo actualizado',
            message: 'El estado de tu reclamo "Demoras en colectivos" cambió a "En revisión"',
            time: '2 horas',
            read: true,
            icon: Flag,
            color: 'text-orange-600'
          },
          {
            id: 4,
            type: 'achievement',
            title: '¡Felicitaciones!',
            message: 'Alcanzaste el Nivel 5 y ganaste 100 puntos de transparencia',
            time: '1 día',
            read: true,
            icon: Bell,
            color: 'text-green-600'
          }
        ])
      : fetch('/api/notifications').then(res => res.json()),
    []
  );

  const markAsRead = (id: number) => {
    // Implementar llamada al API para marcar como leído
    console.log('Marking notification as read:', id);
  };

  const markAllAsRead = () => {
    // Implementar llamada al API para marcar todas como leídas
    console.log('Marking all notifications as read');
  };

  const filteredNotifications = notifications?.filter((notif: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Marcar todas como leídas</span>
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 flex-wrap">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'unread', label: 'No leídas' },
                { key: 'comment', label: 'Comentarios' },
                { key: 'like', label: 'Likes' },
                { key: 'system', label: 'Sistema' },
                { key: 'achievement', label: 'Logros' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications?.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes notificaciones</p>
                </div>
              ) : (
                filteredNotifications?.map((notification: any) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                        !notification.read ? 'border-l-4 border-orange-500' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full bg-gray-100 ${notification.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{notification.time}</span>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;