
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintFeed from '../components/ComplaintFeed';
import DataVisualization from '../components/DataVisualization';
import GamificationPanel from '../components/GamificationPanel';
import StatsDashboard from '../components/StatsDashboard';
import { useApi } from '../hooks/useApi';
import { analyticsService } from '../services/analyticsService';
import { mockStats, mockTrendingTopics, shouldUseMockData } from '../utils/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-16">
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
                onClick={() => setActiveTab('create')}
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105"
              >
                Crear Reclamo
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all"
              >
                Explorar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'feed', label: 'Feed de Reclamos', icon: '📢' },
              { id: 'create', label: 'Nuevo Reclamo', icon: '✍️' },
              { id: 'analytics', label: 'Análisis', icon: '📊' },
              { id: 'ranking', label: 'Ranking', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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
                      <span className="font-bold text-orange-600">
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
              <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Progreso</h3>
                {userLoading ? (
                  <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {userStats?.transparencyPoints?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Puntos de Transparencia</div>
                    <div className="bg-white rounded-full p-1">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full transition-all duration-500" 
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

export default Index;
