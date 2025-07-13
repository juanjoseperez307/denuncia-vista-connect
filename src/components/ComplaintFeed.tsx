
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintsService } from '../services/complaintsService';
import { useApi } from '../hooks/useApi';
import { shouldUseMockData } from '../utils/mockData';

const ComplaintFeed = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('trending');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: complaints, loading } = useApi<any>(
    () => shouldUseMockData() 
      ? Promise.resolve([
    {
      id: 1,
      author: 'María González',
      avatar: '👩‍💼',
      time: '2 horas',
      category: 'Salud',
      location: 'Hospital Italiano, Palermo',
      content: 'En el Hospital Italiano de Palermo la espera en guardia supera las 4 horas. Los pacientes con dolor están sin atención adecuada. Es urgente mejorar la cantidad de médicos de guardia.',
      entities: [
        { text: 'Hospital Italiano', type: 'institution' },
        { text: 'Palermo', type: 'location' }
      ],
      likes: 47,
      comments: 12,
      shares: 8,
      trending: true,
      verified: true
    },
    {
      id: 2,
      author: 'Carlos Rodríguez',
      avatar: '👨‍🔧',
      time: '4 horas',
      category: 'Transporte',
      location: 'Plaza Italia, CABA',
      content: 'Los colectivos de la línea 152 no respetan los horarios. Hace 45 minutos esperando en Plaza Italia. ANSES debería controlar mejor las concesiones.',
      entities: [
        { text: 'Plaza Italia', type: 'location' },
        { text: 'ANSES', type: 'government' }
      ],
      likes: 23,
      comments: 7,
      shares: 4,
      trending: false,
      verified: false
    },
    {
      id: 3,
      author: 'Ana Martínez',
      avatar: '👩‍🏫',
      time: '6 horas',
      category: 'Educación',
      location: 'Escuela N°12, Belgrano',
      content: 'La Escuela N°12 de Belgrano no tiene calefacción funcionando. Los chicos están con camperas en clase. El Ministerio de Educación debe actuar urgente.',
      entities: [
        { text: 'Belgrano', type: 'location' },
        { text: 'Ministerio', type: 'government' }
      ],
      likes: 89,
      comments: 23,
      shares: 15,
      trending: true,
      verified: true
    }
  ])
      : complaintsService.getComplaints({ trending: activeFilter === 'trending', category: categoryFilter }),
    [activeFilter, categoryFilter]
  );

  const handleLoadMore = () => {
    navigate('/?tab=create');
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category === categoryFilter ? '' : category);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Salud': 'bg-red-100 text-red-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Educación': 'bg-green-100 text-green-800',
      'Seguridad': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Feed de Reclamos</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleFilterClick('trending')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'trending' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              🔥 Trending
            </button>
            <button 
              onClick={() => handleFilterClick('recent')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'recent' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              🕒 Recientes
            </button>
            <button 
              onClick={() => handleFilterClick('nearby')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'nearby' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              📍 Cerca tuyo
            </button>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {['Todas', 'Salud', 'Transporte', 'Educación', 'Seguridad', 'Ambiente'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleCategoryFilter(filter === 'Todas' ? '' : filter)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (filter === 'Todas' && !categoryFilter) || filter === categoryFilter
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        (complaints || []).map((complaint) => (
        <div key={complaint.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          {/* Complaint Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{complaint.avatar}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">{complaint.author}</span>
                    {complaint.verified && <span className="text-blue-500">✓</span>}
                    {complaint.trending && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">TRENDING</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{complaint.time}</span>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{complaint.location}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                {complaint.category}
              </span>
            </div>

            {/* Complaint Content */}
            <div className="mb-4">
              <p className="text-gray-800 leading-relaxed">{complaint.content}</p>
            </div>

            {/* Detected Entities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {complaint.entities.map((entity, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    entity.type === 'institution' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {entity.type === 'institution' ? '🏢' : '📍'} {entity.text}
                </span>
              ))}
            </div>
          </div>

          {/* Interaction Bar */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group">
                  <Heart className="w-5 h-5 group-hover:fill-current" />
                  <span className="text-sm font-medium">{complaint.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{complaint.comments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{complaint.shares}</span>
                </button>
              </div>
              <Link 
                to={`/complaint/${complaint.id}`}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
              >
                Ver detalles →
              </Link>
            </div>
          </div>
        </div>
      ))
      )}

      {/* Load More */}
      <div className="text-center py-8">
        <button 
          onClick={handleLoadMore}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-semibold rounded-full transition-all transform hover:scale-105"
        >
          Cargar más reclamos
        </button>
      </div>
    </div>
  );
};

export default ComplaintFeed;
