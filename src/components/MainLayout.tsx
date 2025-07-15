import React, { ReactNode } from 'react';
import Header from './Header';
import { useApi } from '../hooks/useApi';
import { analyticsService } from '../services/analyticsService';
import { mockStats, mockTrendingTopics, shouldUseMockData } from '../utils/mockData';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showHero?: boolean;
  showTabs?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: Array<{ id: string; label: string; icon: string }>;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'Plataforma Ciudadana',
  showHero = false,
  showTabs = false,
  activeTab,
  onTabChange,
  tabs = []
}) => {
  // Fetch dashboard stats and trending topics
  const { 
    data: dashboardStats, 
    loading: statsLoading, 
    error: statsError 
  } = useApi(
    () => shouldUseMockData() 
      ? Promise.resolve(mockStats) 
      : analyticsService.getDashboardStats(),
    []
  );

  const { 
    data: trendingTopics, 
    loading: trendsLoading 
  } = useApi(
    () => shouldUseMockData() 
      ? Promise.resolve(mockTrendingTopics) 
      : analyticsService.getTrendingTopics(),
    []
  );

  const { 
    data: userStats, 
    loading: userLoading 
  } = useApi(
    () => shouldUseMockData() 
      ? Promise.resolve({ complaintsSubmitted: 12, transparencyPoints: 1247, level: 5, nextLevelPoints: 500 }) 
      : analyticsService.getUserStats(),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      
      {/* Hero Section */}
      {showHero && (
        <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                Plataforma Ciudadana de Transparencia
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Conecta datos públicos y personales para promover transparencia 
                y fomentar la participación ciudadana activa
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => onTabChange?.('create')}
                  className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary/10 transition-all transform hover:scale-105"
                >
                  Crear Reclamo
                </button>
                <button 
                  onClick={() => onTabChange?.('analytics')}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary transition-all"
                >
                  Explorar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {showTabs && tabs.length > 0 && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas Rápidas</h3>
                {statsLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : statsError ? (
                  <div className="text-red-500 text-sm">Error al cargar estadísticas</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reclamos Hoy</span>
                      <span className="font-bold text-primary">
                        {dashboardStats?.todayComplaints || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">En Proceso</span>
                      <span className="font-bold text-blue-600">
                        {dashboardStats?.inProcess || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resueltas</span>
                      <span className="font-bold text-green-600">
                        {dashboardStats?.resolved || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Temas Tendencia</h3>
                {trendsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(trendingTopics || []).map((trend) => (
                      <div key={trend.tag} className="flex justify-between items-center">
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                          {trend.tag}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {trend.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Your Progress */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Progreso</h3>
                {userLoading ? (
                  <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {userStats?.transparencyPoints?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Puntos de Transparencia</div>
                    <div className="bg-white rounded-full p-1">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" 
                        style={{
                          width: userStats?.nextLevelPoints 
                            ? `${Math.min((userStats.transparencyPoints % 1000) / 10, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Próximo nivel: {userStats?.nextLevelPoints || 500} puntos
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;