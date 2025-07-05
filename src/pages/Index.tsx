
import React, { useState } from 'react';
import Header from '../components/Header';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintFeed from '../components/ComplaintFeed';
import DataVisualization from '../components/DataVisualization';
import GamificationPanel from '../components/GamificationPanel';
import StatsDashboard from '../components/StatsDashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');

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
              Conecta datos públicos y personales para revelar patrones, promover transparencia 
              y fomentar la participación ciudadana activa
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105">
                Crear Denuncia
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all">
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
              { id: 'feed', label: 'Feed de Denuncias', icon: '📢' },
              { id: 'create', label: 'Nueva Denuncia', icon: '✍️' },
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Denuncias Hoy</span>
                    <span className="font-bold text-orange-600">147</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">En Proceso</span>
                    <span className="font-bold text-blue-600">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resueltas</span>
                    <span className="font-bold text-green-600">1,234</span>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Temas Tendencia</h3>
                <div className="space-y-2">
                  {[
                    { tag: '#TransportePublico', count: 45 },
                    { tag: '#Salud', count: 32 },
                    { tag: '#Seguridad', count: 28 },
                    { tag: '#Educacion', count: 19 }
                  ].map((trend) => (
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
              </div>

              {/* Your Progress */}
              <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Progreso</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">1,247</div>
                  <div className="text-sm text-gray-600 mb-4">Puntos de Transparencia</div>
                  <div className="bg-white rounded-full p-1">
                    <div className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full" style={{width: '67%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Próximo nivel: 500 puntos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
