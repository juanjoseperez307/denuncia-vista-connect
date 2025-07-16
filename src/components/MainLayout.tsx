import React from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showHero = false, 
  activeTab,
  setActiveTab 
}) => {
  const tabs = [
    { id: 'feed', label: 'Feed de Reclamos', icon: '📢' },
    { id: 'create', label: 'Nuevo Reclamo', icon: '✍️' },
    { id: 'analytics', label: 'Análisis', icon: '📊' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      {/* Hero Section - solo en página principal */}
      {showHero && (
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                Plataforma Ciudadana de Transparencia
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Para promover transparencia 
                y fomentar la participación ciudadana activa
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setActiveTab?.('create')}
                  className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all transform hover:scale-105"
                >
                  Crear Reclamo
                </button>
                <button 
                  onClick={() => setActiveTab?.('analytics')}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all"
                >
                  Explorar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - solo en página principal */}
      {activeTab && setActiveTab && (
        <div className="bg-background shadow-sm border-b">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
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
        {children}
      </div>
    </div>
  );
};

export default MainLayout;