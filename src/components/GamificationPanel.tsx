
import React from 'react';
import { Trophy, Star, Award, Target, TrendingUp, Users } from 'lucide-react';

const GamificationPanel = () => {
  const topUsers = [
    { rank: 1, name: 'María González', points: 2847, badge: '🏆', level: 'Activista Elite', contributions: 45 },
    { rank: 2, name: 'Carlos Rodríguez', points: 2156, badge: '🥈', level: 'Ciudadano Comprometido', contributions: 38 },
    { rank: 3, name: 'Ana Martínez', points: 1923, badge: '🥉', level: 'Defensor Público', contributions: 32 },
    { rank: 4, name: 'Luis Fernández', points: 1654, badge: '⭐', level: 'Vigilante Social', contributions: 28 },
    { rank: 5, name: 'Sofia Pérez', points: 1432, badge: '💎', level: 'Ciudadano Activo', contributions: 24 }
  ];

  const achievements = [
    { icon: '🎯', name: 'Primera Denuncia', description: 'Realizaste tu primera denuncia ciudadana', rarity: 'common', unlocked: true },
    { icon: '🔥', name: 'Racha de Fuego', description: '5 denuncias en una semana', rarity: 'uncommon', unlocked: true },
    { icon: '👥', name: 'Voz del Pueblo', description: '100+ likes en una denuncia', rarity: 'rare', unlocked: false },
    { icon: '🎖️', name: 'Investigador', description: 'Conectaste 10+ entidades diferentes', rarity: 'epic', unlocked: true },
    { icon: '👑', name: 'Líder Comunitario', description: 'Top 10 del ranking mensual', rarity: 'legendary', unlocked: false }
  ];

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      uncommon: 'bg-green-100 text-green-800 border-green-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || 'bg-gray-100 text-gray-800';
  };

  const currentUser = {
    rank: 15,
    name: 'Juan Pérez',
    points: 1247,
    level: 'Ciudadano Activo',
    nextLevel: 'Vigilante Social',
    pointsToNext: 253,
    contributions: 18
  };

  return (
    <div className="space-y-8">
      {/* User Progress Card */}
      <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg shadow-lg text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tu Progreso</h2>
            <p className="opacity-90">Nivel: {currentUser.level}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentUser.points}</div>
            <div className="text-sm opacity-90">Puntos de Transparencia</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso al siguiente nivel</span>
            <span>{currentUser.pointsToNext} puntos restantes</span>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${((currentUser.points % 500) / 500) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm mt-2 opacity-90">
            Próximo nivel: {currentUser.nextLevel}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold">#{currentUser.rank}</div>
            <div className="text-sm opacity-90">Ranking</div>
          </div>
          <div>
            <div className="text-xl font-bold">{currentUser.contributions}</div>
            <div className="text-sm opacity-90">Denuncias</div>
          </div>
          <div>
            <div className="text-xl font-bold">89%</div>
            <div className="text-sm opacity-90">Precisión</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Logros</h3>
          <span className="text-sm text-gray-600">3 de 5 desbloqueados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                achievement.unlocked 
                  ? `${getRarityColor(achievement.rarity)} shadow-md` 
                  : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className="font-semibold mb-1">{achievement.name}</h4>
                <p className="text-xs mb-2">{achievement.description}</p>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Ranking de Transparencia</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Semanal
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              Mensual
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              Anual
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {topUsers.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                user.rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${
                  user.rank <= 3 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {user.badge}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.level}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{user.points.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{user.contributions} denuncias</div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Position */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">#{currentUser.rank}</div>
              <div>
                <div className="font-semibold text-gray-800">{currentUser.name} (Tú)</div>
                <div className="text-sm text-gray-600">{currentUser.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">{currentUser.points.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{currentUser.contributions} denuncias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Desafíos Activos</h3>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-800">🌱 Eco-Warrior</h4>
              <span className="text-sm text-green-600">2/5 completo</span>
            </div>
            <p className="text-sm text-green-700 mb-3">Realiza 5 denuncias sobre temas ambientales</p>
            <div className="bg-green-200 rounded-full h-2">
              <div className="bg-green-500 rounded-full h-2" style={{width: '40%'}}></div>
            </div>
            <div className="text-xs text-green-600 mt-1">+500 puntos al completar</div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-800">🤝 Colaborador</h4>
              <span className="text-sm text-blue-600">7/10 completo</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">Comenta en 10 denuncias de otros usuarios</p>
            <div className="bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 rounded-full h-2" style={{width: '70%'}}></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">+300 puntos al completar</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
