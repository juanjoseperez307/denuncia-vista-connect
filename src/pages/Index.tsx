
import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintFeed from '../components/ComplaintFeed';
import DataVisualization from '../components/DataVisualization';
import GamificationPanel from '../components/GamificationPanel';
import StatsDashboard from '../components/StatsDashboard';
import { initializeMockData } from '../utils/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
  React.useEffect(() => {
    initializeMockData();
  }, []);

  const tabs = [
    { id: 'feed', label: 'Feed de Reclamos', icon: '📢' },
    { id: 'create', label: 'Nuevo Reclamo', icon: '✍️' },
    { id: 'analytics', label: 'Análisis', icon: '📊' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' }
  ];

  return (
    <MainLayout 
      showHero={true} 
      showTabs={true} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === 'feed' && <ComplaintFeed />}
      {activeTab === 'create' && <ComplaintForm />}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <StatsDashboard />
          <DataVisualization />
        </div>
      )}
      {activeTab === 'ranking' && <GamificationPanel />}
    </MainLayout>
  );
};

export default Index;
};

export default Index;
