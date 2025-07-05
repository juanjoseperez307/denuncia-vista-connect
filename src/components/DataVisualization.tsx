
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DataVisualization = () => {
  const categoryData = [
    { name: 'Salud', value: 245, color: '#EF4444' },
    { name: 'Transporte', value: 189, color: '#3B82F6' },
    { name: 'Seguridad', value: 156, color: '#F59E0B' },
    { name: 'Educación', value: 123, color: '#10B981' },
    { name: 'Ambiente', value: 89, color: '#06B6D4' },
    { name: 'Corrupción', value: 67, color: '#8B5CF6' }
  ];

  const timelineData = [
    { month: 'Ene', denuncias: 120, resueltas: 45 },
    { month: 'Feb', denuncias: 145, resueltas: 67 },
    { month: 'Mar', denuncias: 180, resueltas: 89 },
    { month: 'Abr', denuncias: 165, resueltas: 98 },
    { month: 'May', denuncias: 220, resueltas: 123 },
    { month: 'Jun', denuncias: 195, resueltas: 134 }
  ];

  const locationData = [
    { zona: 'Palermo', denuncias: 89 },
    { zona: 'Recoleta', denuncias: 67 },
    { zona: 'Belgrano', denuncias: 56 },
    { zona: 'San Telmo', denuncias: 45 },
    { zona: 'Barracas', denuncias: 34 },
    { zona: 'Villa Crespo', denuncias: 23 }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Visualización de Datos</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">1,247</div>
            <div className="text-sm text-red-800">Total Denuncias</div>
            <div className="text-xs text-red-600 mt-1">+12% vs mes anterior</div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">687</div>
            <div className="text-sm text-blue-800">En Proceso</div>
            <div className="text-xs text-blue-600 mt-1">55% del total</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">456</div>
            <div className="text-sm text-green-800">Resueltas</div>
            <div className="text-xs text-green-600 mt-1">37% del total</div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">72%</div>
            <div className="text-sm text-orange-800">Tasa Resolución</div>
            <div className="text-xs text-orange-600 mt-1">+5% vs trimestre</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Denuncias por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolución Temporal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="denuncias" stroke="#EF4444" strokeWidth={3} name="Nuevas Denuncias" />
              <Line type="monotone" dataKey="resueltas" stroke="#10B981" strokeWidth={3} name="Resueltas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Location Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Denuncias por Zona</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="zona" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="denuncias" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Network Visualization Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Red de Conexiones</h3>
          <div className="h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Mock network nodes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central node */}
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse">
                  🏥
                </div>
                
                {/* Connected nodes */}
                <div className="absolute -top-20 -left-10 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white animate-bounce" style={{animationDelay: '0.5s'}}>
                  📍
                </div>
                <div className="absolute -top-20 left-10 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white animate-bounce" style={{animationDelay: '1s'}}>
                  👥
                </div>
                <div className="absolute top-20 -left-16 w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-white animate-bounce" style={{animationDelay: '1.5s'}}>
                  💰
                </div>
                <div className="absolute top-20 left-16 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white animate-bounce" style={{animationDelay: '2s'}}>
                  📋
                </div>
                
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full -z-10" style={{width: '200px', height: '200px', left: '-84px', top: '-84px'}}>
                  <line x1="100" y1="100" x2="90" y2="60" stroke="#E5E7EB" strokeWidth="2" className="animate-pulse" />
                  <line x1="100" y1="100" x2="110" y2="60" stroke="#E5E7EB" strokeWidth="2" className="animate-pulse" />
                  <line x1="100" y1="100" x2="68" y2="140" stroke="#E5E7EB" strokeWidth="2" className="animate-pulse" />
                  <line x1="100" y1="100" x2="132" y2="140" stroke="#E5E7EB" strokeWidth="2" className="animate-pulse" />
                </svg>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 text-sm text-gray-600">
              <p className="font-medium">Red de entidades conectadas</p>
              <p className="text-xs">Instituciones, ubicaciones y personas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Detection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Patrones Detectados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center">
              <div className="text-yellow-600 text-xl mr-3">⚠️</div>
              <div>
                <p className="font-medium text-yellow-800">Aumento en Salud</p>
                <p className="text-sm text-yellow-700">+25% denuncias hospitalarias</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-center">
              <div className="text-blue-600 text-xl mr-3">🔍</div>
              <div>
                <p className="font-medium text-blue-800">Correlación Detectada</p>
                <p className="text-sm text-blue-700">Palermo-Transporte vinculado</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex items-center">
              <div className="text-green-600 text-xl mr-3">✅</div>
              <div>
                <p className="font-medium text-green-800">Mejora Detectada</p>
                <p className="text-sm text-green-700">Resoluciones más rápidas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
