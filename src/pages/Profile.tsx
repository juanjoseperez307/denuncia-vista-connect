import React, { useState } from 'react';
import { User, Edit3, Settings, Bell, Shield, Award } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 11 1234-5678',
    location: 'Buenos Aires, Argentina',
    bio: 'Ciudadano comprometido con la transparencia y la participación cívica',
    avatar: '👨‍💼'
  });

  const [stats] = useState({
    complaintsSubmitted: 12,
    transparencyPoints: 1247,
    level: 5,
    commentsGiven: 45,
    helpfulVotes: 89
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aquí iría la llamada al API para guardar los cambios
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
                </button>
              </div>

              <div className="flex items-start space-x-6 mb-8">
                <div className="text-6xl">{profile.avatar}</div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{profile.name}</h2>
                      <p className="text-gray-600 mb-1">{profile.email}</p>
                      <p className="text-gray-600 mb-1">{profile.phone}</p>
                      <p className="text-gray-600 mb-3">{profile.location}</p>
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Cuenta</h3>
                <div className="space-y-3">
                  <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">Notificaciones</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">Privacidad y Seguridad</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">Configuración General</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Level and Points */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">Tu Progreso</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  Nivel {stats.level}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {stats.transparencyPoints.toLocaleString()} Puntos de Transparencia
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full" 
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  350 puntos para el próximo nivel
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reclamos Enviados</span>
                  <span className="font-bold text-gray-800">{stats.complaintsSubmitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comentarios</span>
                  <span className="font-bold text-gray-800">{stats.commentsGiven}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Votos Útiles</span>
                  <span className="font-bold text-gray-800">{stats.helpfulVotes}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-800">Enviaste un reclamo sobre transporte</p>
                  <p className="text-gray-500">Hace 2 horas</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-800">Comentaste en un reclamo de salud</p>
                  <p className="text-gray-500">Hace 1 día</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-800">Alcanzaste el Nivel 5</p>
                  <p className="text-gray-500">Hace 3 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;