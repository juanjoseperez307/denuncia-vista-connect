
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceFactory } from '../services/ServiceFactory';
import { useApi } from '../hooks/useApi';
import { ComplaintStatus } from '../services/interfaces/IComplaintsService';
import ShareModal from './ShareModal';
import { toast } from 'sonner';

const ComplaintFeed = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; complaintId: string; title: string }>({
    isOpen: false,
    complaintId: '',
    title: ''
  });
  const [likedComplaints, setLikedComplaints] = useState<Set<string>>(new Set());

  const { data: complaints, loading, refetch } = useApi<any>(
    () => {
      const filters: any = {};
      
      // Apply active filter
      if (activeFilter === 'trending') {
        filters.trending = true;
      } else if (activeFilter === 'recent') {
        filters.timeRange = 'recent';
      } else if (activeFilter === 'nearby') {
        filters.location = 'nearby';
      }
      // 'all' filter doesn't need any specific filter
      
      // Apply category filter
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      
      return serviceFactory.getComplaintsService().getComplaints(filters);
    },
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

  const getStatusColor = (status: ComplaintStatus) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: ComplaintStatus) => {
    const labels = {
      'pending': 'Pendiente',
      'in-progress': 'En Proceso',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado'
    };
    return labels[status] || status;
  };

  const handleLike = async (complaintId: string) => {
    try {
      const result = await serviceFactory.getComplaintsService().toggleLike(complaintId);
      
      if (result.liked) {
        setLikedComplaints(prev => new Set([...prev, complaintId]));
        toast.success('¡Me gusta agregado!');
        // Award points for liking
        await serviceFactory.getGamificationService().incrementUserStat('helpfulVotes');
      } else {
        setLikedComplaints(prev => {
          const newSet = new Set(prev);
          newSet.delete(complaintId);
          return newSet;
        });
        toast.info('Me gusta removido');
      }
      
      // Refresh the complaints to reflect updated like count
      await refetch();
    } catch (error) {
      toast.error('Error al procesar el me gusta');
    }
  };

  const handleShare = async (complaintId: string, title: string) => {
    setShareModal({ isOpen: true, complaintId, title });
  };

  const executeShare = async (platform: string) => {
    try {
      const shareResult = await serviceFactory.getComplaintsService().shareComplaint(shareModal.complaintId);
      
      // Here you would integrate with actual sharing APIs
      const url = `${window.location.origin}/complaint/${shareModal.complaintId}`;
      const text = `Mira este reclamo: ${shareModal.title}`;
      
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent('Reclamo importante')}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
          break;
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
          break;
      }
      
      // Award points for sharing
      await serviceFactory.getGamificationService().awardPoints('1', 5, 'Compartir reclamo');
      
      // Refresh the complaints to reflect updated share count
      await refetch();
      
      toast.success('¡Reclamo compartido exitosamente!');
    } catch (error) {
      toast.error('Error al compartir el reclamo');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Feed de Reclamos</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleFilterClick('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              📋 Todos
            </button>
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
              <div className="flex flex-col space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                  {complaint.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status || 'pending')}`}>
                  {getStatusLabel(complaint.status || 'pending')}
                </span>
              </div>
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
                <button 
                  onClick={() => handleLike(complaint.id)}
                  className={`flex items-center space-x-2 transition-colors group ${
                    likedComplaints.has(complaint.id) 
                      ? 'text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedComplaints.has(complaint.id) ? 'fill-current' : 'group-hover:fill-current'}`} />
                  <span className="text-sm font-medium">{complaint.likes}</span>
                </button>
                <Link 
                  to={`/complaint/${complaint.id}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{complaint.comments}</span>
                </Link>
                <button 
                  onClick={() => handleShare(complaint.id, complaint.content.substring(0, 50) + '...')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
                >
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

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, complaintId: '', title: '' })}
        complaintId={shareModal.complaintId}
        complaintTitle={shareModal.title}
        onShare={executeShare}
      />
    </div>
  );
};

export default ComplaintFeed;
