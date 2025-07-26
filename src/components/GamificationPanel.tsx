
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, TrendingUp, Users } from 'lucide-react';
import { serviceFactory } from '../services/ServiceFactory';

const GamificationPanel = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRanking, setActiveRanking] = useState('weekly');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaderboard, userProfile, userAchievements, userChallenges] = await Promise.all([
          serviceFactory.getGamificationService().getLeaderboard(10),
          serviceFactory.getGamificationService().getUserProfile(),
          serviceFactory.getGamificationService().getAchievements(),
          serviceFactory.getGamificationService().getChallenges()
        ]);

        setTopUsers(leaderboard);
        setCurrentUser(userProfile);
        setAchievements(userAchievements);
        setChallenges(userChallenges);
      } catch (error) {
        console.error('Error loading gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeRanking]);

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '⭐';
    return '💎';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-100 rounded-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Progress Card */}
      <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg shadow-lg text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tu Progreso</h2>
            <p className="opacity-90">Nivel: {currentUser?.level}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentUser?.transparencyPoints?.toLocaleString()}</div>
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
            <div className="text-xl font-bold">{currentUser?.complaintsSubmitted || 0}</div>
            <div className="text-sm opacity-90">Reclamos Enviados</div>
          </div>
          <div>
            <div className="text-xl font-bold">{currentUser?.commentsGiven || 0}</div>
            <div className="text-sm opacity-90">Comentarios</div>
          </div>
          <div>
            <div className="text-xl font-bold">{currentUser?.helpfulVotes || 0}</div>
            <div className="text-sm opacity-90">Votos Útiles</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Logros</h3>
          <span className="text-sm text-gray-600">
            {achievements.filter(a => a.completed).length} de {achievements.length} desbloqueados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                achievement.completed 
                  ? `bg-green-50 border-green-200 shadow-md` 
                  : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`text-3xl mb-2 ${achievement.completed ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className="font-semibold mb-1">{achievement.title}</h4>
                <p className="text-xs mb-2">{achievement.description}</p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
                {achievement.completed && achievement.completedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    Completado: {achievement.completedAt}
                  </div>
                )}
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
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setActiveRanking(period)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeRanking === period
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
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
                  {getRankBadge(user.rank)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{user.username}</div>
                  <div className="text-sm text-gray-600">Nivel {user.level}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{user.points.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{user.change >= 0 ? '+' : ''}{user.change} esta semana</div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Position */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">#{currentUser?.level || 'N/A'}</div>
              <div>
                <div className="font-semibold text-gray-800">{currentUser?.name || 'Usuario'} (Tú)</div>
                <div className="text-sm text-gray-600">Nivel {currentUser?.level || 1}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">{currentUser?.transparencyPoints?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600">{currentUser?.complaintsSubmitted || 0} denuncias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Desafíos Activos</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.filter(challenge => challenge.isActive).map((challenge) => {
              const progressPercentage = (challenge.progress / challenge.target) * 100;
              const getChallengeColor = (category: string) => {
                const colors: { [key: string]: string } = {
                  environmental: 'from-green-50 to-emerald-50 border-green-200',
                  social: 'from-blue-50 to-cyan-50 border-blue-200',
                  efficiency: 'from-yellow-50 to-amber-50 border-yellow-200',
                  verification: 'from-purple-50 to-violet-50 border-purple-200'
                };
                return colors[category] || 'from-gray-50 to-gray-100 border-gray-200';
              };
              
              const getTextColor = (category: string) => {
                const colors: { [key: string]: string } = {
                  environmental: 'text-green-800',
                  social: 'text-blue-800',
                  efficiency: 'text-yellow-800',
                  verification: 'text-purple-800'
                };
                return colors[category] || 'text-gray-800';
              };
              
              const getProgressColor = (category: string) => {
                const colors: { [key: string]: string } = {
                  environmental: 'bg-green-500',
                  social: 'bg-blue-500',
                  efficiency: 'bg-yellow-500',
                  verification: 'bg-purple-500'
                };
                return colors[category] || 'bg-gray-500';
              };

              return (
                <div key={challenge.id} className={`bg-gradient-to-r ${getChallengeColor(challenge.category)} border rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${getTextColor(challenge.category)}`}>
                      {challenge.icon} {challenge.title}
                    </h4>
                    <span className={`text-sm ${getTextColor(challenge.category)}`}>
                      {challenge.progress}/{challenge.target} completo
                    </span>
                  </div>
                  <p className={`text-sm ${getTextColor(challenge.category)} mb-3`}>
                    {challenge.description}
                  </p>
                  <div className={`${getChallengeColor(challenge.category).split(' ')[2]} rounded-full h-2`}>
                    <div 
                      className={`${getProgressColor(challenge.category)} rounded-full h-2 transition-all duration-500`} 
                      style={{width: `${Math.min(progressPercentage, 100)}%`}}
                    ></div>
                  </div>
                  <div className={`text-xs ${getTextColor(challenge.category)} mt-1`}>
                    +{challenge.reward} puntos al completar
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationPanel;
