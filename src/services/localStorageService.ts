// Enhanced mock data service with localStorage persistence
export interface Complaint {
  id: string;
  author: string;
  avatar: string;
  time: string;
  category: string;
  location: string;
  content: string;
  entities?: any[];
  likes: number;
  comments: number;
  shares: number;
  trending?: boolean;
  verified?: boolean;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  transparencyPoints: number;
  level: number;
  complaintsSubmitted: number;
  commentsGiven: number;
  helpfulVotes: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

class LocalStorageService {
  private readonly COMPLAINTS_KEY = 'transparency_complaints';
  private readonly USER_PROFILE_KEY = 'transparency_user_profile';
  private readonly NOTIFICATIONS_KEY = 'transparency_notifications';
  private readonly STATS_KEY = 'transparency_stats';

  // Complaints management
  getComplaints(): Complaint[] {
    const stored = localStorage.getItem(this.COMPLAINTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize with default data if nothing exists
    const defaultComplaints: Complaint[] = [
      {
        id: '1',
        author: 'María García',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
        time: 'hace 2 horas',
        category: 'Transporte',
        location: 'Buenos Aires, CABA',
        content: 'El colectivo 152 no pasa desde hace 3 horas en la parada de Av. Corrientes y Callao. Los usuarios estamos esperando sin información oficial.',
        entities: [
          { type: 'transport_line', value: '152', icon: '🚌' },
          { type: 'location', value: 'Av. Corrientes y Callao', icon: '📍' }
        ],
        likes: 23,
        comments: 8,
        shares: 5,
        trending: true,
        verified: false
      },
      {
        id: '2',
        author: 'Carlos Mendoza',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        time: 'hace 4 horas',
        category: 'Salud',
        location: 'Córdoba Capital',
        content: 'Hospital público sin medicamentos básicos. Pacientes diabéticos sin insulina desde hace una semana.',
        entities: [
          { type: 'health_institution', value: 'Hospital público', icon: '🏥' },
          { type: 'medicine', value: 'insulina', icon: '💊' }
        ],
        likes: 45,
        comments: 12,
        shares: 18,
        trending: true,
        verified: true
      }
    ];
    
    this.saveComplaints(defaultComplaints);
    return defaultComplaints;
  }

  saveComplaints(complaints: Complaint[]): void {
    localStorage.setItem(this.COMPLAINTS_KEY, JSON.stringify(complaints));
  }

  addComplaint(complaint: Omit<Complaint, 'id' | 'time' | 'likes' | 'comments' | 'shares'>): Complaint {
    const complaints = this.getComplaints();
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      author: complaint.author,
      avatar: complaint.avatar,
      time: 'hace pocos segundos',
      category: complaint.category,
      location: complaint.location,
      content: complaint.content,
      entities: complaint.entities,
      likes: 0,
      comments: 0,
      shares: 0,
      trending: complaint.trending,
      verified: complaint.verified
    };
    
    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    
    // Update user stats
    this.incrementUserStat('complaintsSubmitted');
    this.addNotification({
      title: 'Reclamo publicado',
      message: 'Tu reclamo ha sido publicado exitosamente',
      type: 'success'
    });
    
    return newComplaint;
  }

  getComplaint(id: string): Complaint | null {
    const complaints = this.getComplaints();
    return complaints.find(c => c.id === id) || null;
  }

  updateComplaint(id: string, updates: Partial<Complaint>): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    complaints[index] = { ...complaints[index], ...updates };
    this.saveComplaints(complaints);
    return complaints[index];
  }

  likeComplaint(id: string): void {
    const complaint = this.getComplaint(id);
    if (complaint) {
      this.updateComplaint(id, { likes: complaint.likes + 1 });
    }
  }

  // User Profile management
  getUserProfile(): UserProfile {
    const stored = localStorage.getItem(this.USER_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultProfile: UserProfile = {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      location: 'Buenos Aires, Argentina',
      bio: 'Ciudadano comprometido con la transparencia y la participación cívica',
      avatar: '👨‍💼',
      transparencyPoints: 1247,
      level: 5,
      complaintsSubmitted: 12,
      commentsGiven: 45,
      helpfulVotes: 89
    };
    
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile));
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const profile = this.getUserProfile();
    const updatedProfile = { ...profile, ...updates };
    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  incrementUserStat(stat: keyof Pick<UserProfile, 'complaintsSubmitted' | 'commentsGiven' | 'helpfulVotes'>): void {
    const profile = this.getUserProfile();
    const updatedProfile = {
      ...profile,
      [stat]: profile[stat] + 1,
      transparencyPoints: profile.transparencyPoints + 10 // Award points
    };
    
    // Check level up
    const newLevel = Math.floor(updatedProfile.transparencyPoints / 250) + 1;
    if (newLevel > profile.level) {
      updatedProfile.level = newLevel;
      this.addNotification({
        title: 'Nivel alcanzado!',
        message: `¡Felicidades! Alcanzaste el nivel ${newLevel}`,
        type: 'success'
      });
    }
    
    this.saveUserProfile(updatedProfile);
  }

  // Notifications management
  getNotifications(): Notification[] {
    const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nuevo comentario',
        message: 'Alguien comentó en tu reclamo sobre transporte',
        time: 'hace 1 hora',
        read: false,
        type: 'info'
      },
      {
        id: '2',
        title: 'Reclamo actualizado',
        message: 'Tu reclamo sobre salud ha sido actualizado por las autoridades',
        time: 'hace 3 horas',
        read: false,
        type: 'success'
      }
    ];
    
    this.saveNotifications(defaultNotifications);
    return defaultNotifications;
  }

  saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>): void {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: 'hace pocos segundos',
      read: false
    };
    
    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  }

  getUnreadNotificationsCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  // Search functionality
  searchComplaints(query: string, filters: any = {}): any {
    const complaints = this.getComplaints();
    let filtered = complaints;

    // Filter by search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(complaint => 
        complaint.content.toLowerCase().includes(searchTerm) ||
        complaint.author.toLowerCase().includes(searchTerm) ||
        complaint.category.toLowerCase().includes(searchTerm) ||
        complaint.location.toLowerCase().includes(searchTerm)
      );
    }

    // Apply additional filters
    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    if (filters.location) {
      filtered = filtered.filter(c => c.location.includes(filters.location));
    }

    // Sort results
    switch (filters.sortBy) {
      case 'date':
        // For now, keep current order (newest first)
        break;
      case 'popularity':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      default: // relevance
        // Keep search result order
        break;
    }

    return {
      complaints: filtered,
      totalResults: filtered.length,
      suggestions: this.generateSearchSuggestions(query),
      filters: {
        categories: [...new Set(complaints.map(c => c.category))],
        locations: [...new Set(complaints.map(c => c.location.split(',')[0]))]
      }
    };
  }

  private generateSearchSuggestions(query: string): string[] {
    const complaints = this.getComplaints();
    const categories = [...new Set(complaints.map(c => c.category))];
    const commonTerms = ['Hospital', 'Transporte', 'Educación', 'Seguridad'];
    
    return [...categories, ...commonTerms]
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  // Statistics
  getStats(): any {
    const complaints = this.getComplaints();
    const total = complaints.length;
    const resolved = Math.floor(total * 0.7); // Mock 70% resolution rate
    const inProcess = total - resolved;
    
    return {
      totalComplaints: total,
      inProcess,
      resolved,
      resolutionRate: Math.floor((resolved / total) * 100),
      todayComplaints: complaints.filter(c => c.time.includes('hora')).length,
      trends: {
        complaints: 12,
        resolution: -5
      }
    };
  }

  getTrendingTopics(): any[] {
    const complaints = this.getComplaints();
    const categoryCount: { [key: string]: number } = {};
    
    complaints.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([tag, count]) => ({ tag: `#${tag}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  // Filter complaints by category/tab
  getComplaintsByCategory(category?: string): Complaint[] {
    const complaints = this.getComplaints();
    if (!category || category === 'all') return complaints;
    return complaints.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  // Paginated complaints
  getPaginatedComplaints(offset: number = 0, limit: number = 10, category?: string): any {
    const allComplaints = this.getComplaintsByCategory(category);
    const complaints = allComplaints.slice(offset, offset + limit);
    
    return {
      data: complaints,
      total: allComplaints.length
    };
  }
}

export const localStorageService = new LocalStorageService();
