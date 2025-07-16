import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Clock, Flag, Edit3 } from 'lucide-react';
import { serviceFactory } from '../services/ServiceFactory';
import { useApi } from '../hooks/useApi';
import MainLayout from '../components/MainLayout';
import { ComplaintComment, ComplaintStatus } from '../services/interfaces/IComplaintsService';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);

  const mockComplaint = {
    id: id || '1',
    author: 'María González',
    avatar: '👩‍💼',
    time: '2 horas',
    category: 'Salud',
    location: 'Hospital Italiano, Palermo',
    content: 'En el Hospital Italiano de Palermo la espera en guardia supera las 4 horas. Los pacientes con dolor están sin atención adecuada. Es urgente mejorar la cantidad de médicos de guardia.',
    entities: [
      { text: 'Hospital Italiano', type: 'institution', value: 'Hospital Italiano', icon: '🏢' },
      { text: 'Palermo', type: 'location', value: 'Palermo', icon: '📍' }
    ],
    likes: 47,
    comments: 12,
    shares: 8,
    trending: true,
    verified: true,
    fullDescription: 'Descripción completa del reclamo con más detalles...',
    attachments: [],
    commentsList: [
      { id: 1, author: 'Pedro Silva', content: 'Mismo problema la semana pasada', time: '1 hora' },
      { id: 2, author: 'Ana López', content: 'Deberíamos hacer una petición formal', time: '30 min' }
    ]
  };

  const { 
    data: complaint, 
    loading, 
    error 
  } = useApi<any>(
    () => {
      const stored = serviceFactory.getComplaintsService().getComplaint(id || '');
      return Promise.resolve(stored || mockComplaint);
    },
    [id]
  );

  // Load comments
  useEffect(() => {
    if (id) {
      const loadComments = async () => {
        try {
          const loadedComments = await serviceFactory.getComplaintsService().getComments(id);
          setComments(loadedComments);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      };
      loadComments();
    }
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !id) return;
    
    setIsSubmittingComment(true);
    try {
      const comment = await serviceFactory.getComplaintsService().addComment(id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Add notification for the comment
      await serviceFactory.getNotificationService().addNotification({
        title: 'Nuevo comentario',
        message: `Se agregó un comentario en el reclamo: "${complaint?.content?.substring(0, 50)}..."`,
        type: 'info'
      });
      
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ComplaintStatus) => {
    if (!id) return;
    
    setIsUpdatingStatus(true);
    try {
      await serviceFactory.getComplaintsService().updateComplaintStatus(id, newStatus, 'Administrador');
      
      // Add notification for status change
      await serviceFactory.getNotificationService().addNotification({
        title: 'Estado actualizado',
        message: `El reclamo cambió a estado: ${getStatusLabel(newStatus)}`,
        type: 'success'
      });
      
      setShowStatusEditor(false);
      // Refresh the complaint data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
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

  const getStatusColor = (status: ComplaintStatus) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <MainLayout><div className="text-center py-8">Cargando...</div></MainLayout>;
  if (error) return <MainLayout><div className="text-center py-8 text-destructive">Error al cargar el reclamo</div></MainLayout>;
  if (!complaint) return <MainLayout><div className="text-center py-8">Reclamo no encontrado</div></MainLayout>;

  return (
    <MainLayout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </button>

      <div className="bg-card rounded-lg shadow-md border">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{complaint.avatar}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">{complaint.author}</span>
                    {complaint.verified && <span className="text-blue-500">✓</span>}
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
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {complaint.category}
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-4">Detalle del Reclamo</h1>
            <p className="text-gray-700 leading-relaxed">{complaint.content}</p>
            
            {/* Entities */}
            <div className="flex flex-wrap gap-2 mt-4">
              {complaint?.entities?.map((entity: any, idx: number) => (
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

          {/* Actions */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{complaint.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{complaint.comments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>{complaint.shares}</span>
                </button>
              </div>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                <Flag className="w-5 h-5" />
                <span>Reportar</span>
              </button>
            </div>
          </div>

          {/* Status Management */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Estado del Reclamo</h3>
              <button
                onClick={() => setShowStatusEditor(!showStatusEditor)}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Cambiar Estado</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status || 'pending')}`}>
                {getStatusLabel(complaint.status || 'pending')}
              </span>
              {complaint.statusUpdatedAt && (
                <span className="text-sm text-gray-500">
                  Actualizado: {complaint.statusUpdatedAt}
                </span>
              )}
            </div>

            {showStatusEditor && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Selecciona el nuevo estado:</p>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'in-progress', 'resolved', 'rejected'] as ComplaintStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={isUpdatingStatus || complaint.status === status}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        complaint.status === status
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {isUpdatingStatus ? 'Actualizando...' : getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Comentarios ({comments.length})</h3>
            
            {/* New Comment Form */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                rows={3}
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isSubmittingComment || !newComment.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } text-white`}
                >
                  {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment: ComplaintComment) => (
                <div key={comment.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-800">{comment.author}</span>
                    <span className="text-sm text-gray-500">{comment.time}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </div>
              )}
            </div>
          </div>
        </div>
    </MainLayout>
  );
};

export default ComplaintDetail;