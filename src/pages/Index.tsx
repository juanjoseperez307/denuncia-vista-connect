
import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintFeed from '../components/ComplaintFeed';
import DataVisualization from '../components/DataVisualization';
import GamificationPanel from '../components/GamificationPanel';
import StatsDashboard from '../components/StatsDashboard';
import { useApi } from '../hooks/useApi';
import { serviceFactory } from '../services/ServiceFactory';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
  // Fetch dashboard stats and trending topics
  const { 
    data: dashboardStats, 
    loading: statsLoading, 
    error: statsError 
  } = useApi(
    () => Promise.resolve(serviceFactory.getAnalyticsService().getDashboardStats()),
    []
  );

  const { 
    data: trendingTopics, 
    loading: trendsLoading 
  } = useApi(
    () => Promise.resolve(serviceFactory.getAnalyticsService().getTrendingTopics()),
    []
  );

  const { 
    data: userStats, 
    loading: userLoading 
  } = useApi(
    () => Promise.resolve({
      ...serviceFactory.getGamificationService().getUserProfile(),
      nextLevelPoints: 500
    }),
    []
  );

  return (
    <MainLayout showHero={true} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'feed' && <ComplaintFeed />}
          {activeTab === 'create' && <ComplaintForm />}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <StatsDashboard />
              <DataVisualization />
            </div>
          )}
          {activeTab === 'ranking' && <GamificationPanel />}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Quick Stats */}
            <div className="bg-card rounded-lg shadow-md p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Estadísticas Rápidas</h3>
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : statsError ? (
                <div className="text-destructive text-sm">Error al cargar estadísticas</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reclamos Hoy</span>
                    <span className="font-bold text-primary">
                      {dashboardStats?.todayComplaints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En Proceso</span>
                    <span className="font-bold text-blue-600">
                      {dashboardStats?.inProcess || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resueltas</span>
                    <span className="font-bold text-green-600">
                      {dashboardStats?.resolved || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Trending Topics */}
            <div className="bg-card rounded-lg shadow-md p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Temas Tendencia</h3>
              {trendsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(trendingTopics || []).map((trend) => (
                    <div key={trend.tag} className="flex justify-between items-center">
                      <span className="text-primary hover:text-primary/80 cursor-pointer font-medium">
                        {trend.tag}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded-full text-xs">
                        {trend.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Your Progress */}
            <div className="bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Tu Progreso</h3>
              {userLoading ? (
                <div className="text-center">
                  <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="h-2 bg-muted rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {userStats?.transparencyPoints?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">Puntos de Transparencia</div>
                  <div className="bg-background rounded-full p-1">
                    <div 
                      className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{
                        width: userStats?.nextLevelPoints 
                          ? `${Math.min((userStats.transparencyPoints % 1000) / 10, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Próximo nivel: {userStats?.nextLevelPoints || 500} puntos
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
