
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { serviceFactory } from '../services/ServiceFactory';
import { toast } from 'sonner';

const StatsDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Denuncias',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Usuarios Activos',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Tiempo Promedio',
      value: '0 días',
      change: '0%',
      changeType: 'decrease',
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Tasa Resolución',
      value: '0%',
      change: '+0%',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateStats = async () => {
      try {
        const dashboardStats = await serviceFactory.getAnalyticsService().getDashboardStats();
        
        setStats([
          {
            title: 'Total Denuncias',
            value: dashboardStats.totalComplaints.toLocaleString(),
            change: `+${dashboardStats.trends.complaints}%`,
            changeType: 'increase',
            icon: TrendingUp,
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Usuarios Activos',
            value: Math.floor(dashboardStats.totalComplaints * 0.8).toLocaleString(),
            change: '+8%',
            changeType: 'increase',
            icon: Users,
            color: 'from-green-500 to-green-600'
          },
          {
            title: 'Tiempo Promedio',
            value: `${(5 - (dashboardStats.resolutionRate / 20)).toFixed(1)} días`,
            change: '-15%',
            changeType: 'decrease',
            icon: Clock,
            color: 'from-orange-500 to-orange-600'
          },
          {
            title: 'Tasa Resolución',
            value: `${dashboardStats.resolutionRate}%`,
            change: `+${dashboardStats.trends.resolution}%`,
            changeType: 'increase',
            icon: CheckCircle,
            color: 'from-purple-500 to-purple-600'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    // Initial load
    updateStats();
    
    // Update every second
    const interval = setInterval(updateStats, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const urgentAlerts = [
    {
      id: 1,
      title: 'Pico de denuncias en Salud',
      description: 'Aumento del 40% en denuncias hospitalarias en las últimas 48h',
      severity: 'high',
      time: '2 horas',
      location: 'Palermo, CABA'
    },
    {
      id: 2,
      title: 'Patrón detectado',
      description: 'Correlación entre ubicación y tipo de denuncia identificada',
      severity: 'medium',
      time: '6 horas',
      location: 'Múltiples zonas'
    },
    {
      id: 3,
      title: 'Meta de resolución alcanzada',
      description: '75% de las denuncias del mes fueron resueltas exitosamente',
      severity: 'low',
      time: '1 día',
      location: 'Ciudad completa'
    }
  ];

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'high') return '🚨';
    if (severity === 'medium') return '⚠️';
    return '✅';
  };

  const handleGenerateReport = async () => {
    try {
      toast.info('Generando reporte semanal...');
      // Mock API call for report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Reporte generado exitosamente y enviado por email');
    } catch (error) {
      toast.error('Error al generar el reporte');
    }
  };

  const handleAdvancedAnalysis = async () => {
    try {
      toast.info('Iniciando análisis avanzado...');
      // Mock API call for advanced analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Análisis completado. Se detectaron 3 patrones nuevos');
    } catch (error) {
      toast.error('Error en el análisis avanzado');
    }
  };

  const handleNotifyAuthorities = async () => {
    try {
      toast.info('Enviando notificación a autoridades...');
      // Mock API call for notifying authorities
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Autoridades notificadas sobre casos urgentes');
    } catch (error) {
      toast.error('Error al notificar autoridades');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="bg-gray-300 p-4">
                <div className="h-4 bg-gray-400 rounded mb-2"></div>
                <div className="h-8 bg-gray-400 rounded"></div>
              </div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 opacity-80" />
                </div>
              </div>
              <div className="p-4">
                <div className={`inline-flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {stat.changeType === 'increase' ? '↗️' : '↘️'}
                  </span>
                  {stat.change} vs mes anterior
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Alertas del Sistema</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Ver todas →
          </button>
        </div>

        <div className="space-y-4">
          {urgentAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`border-l-4 ${getSeverityColor(alert.severity)} p-4 rounded-r-lg border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-xl">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Hace {alert.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleGenerateReport()}
            className="flex items-center justify-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
          >
            <div className="text-2xl">📊</div>
            <div className="text-left">
              <p className="font-medium text-blue-800">Generar Reporte</p>
              <p className="text-sm text-blue-600">Resumen semanal</p>
            </div>
          </button>

          <button 
            onClick={() => handleAdvancedAnalysis()}
            className="flex items-center justify-center space-x-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
          >
            <div className="text-2xl">🔍</div>
            <div className="text-left">
              <p className="font-medium text-green-800">Análisis Avanzado</p>
              <p className="text-sm text-green-600">Patrones y tendencias</p>
            </div>
          </button>

          <button 
            onClick={() => handleNotifyAuthorities()}
            className="flex items-center justify-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group"
          >
            <div className="text-2xl">📧</div>
            <div className="text-left">
              <p className="font-medium text-orange-800">Notificar Autoridades</p>
              <p className="text-sm text-orange-600">Casos urgentes</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Rendimiento</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Detección de entidades</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">94%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conexión de datos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">87%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categorización</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '91%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-orange-600">91%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Actividad Reciente</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Sistema actualizado (hace 2 horas)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Nuevo patrón detectado (hace 4 horas)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Mantenimiento programado (hace 1 día)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
