// Enhanced localStorage service for intelligent data management
// Stores and manages modifications to mock data while maintaining API-like behavior

interface StorageItem {
  data: any;
  timestamp: number;
  modified: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class LocalStorageService {
  private keyPrefix = 'transparency_app_';
  
  // Get key with prefix
  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  // Set data with metadata
  setData(key: string, data: any, modified: boolean = false): void {
    const item: StorageItem = {
      data,
      timestamp: Date.now(),
      modified
    };
    localStorage.setItem(this.getKey(key), JSON.stringify(item));
  }

  // Get data with metadata
  getData<T>(key: string): T | null {
    const item = localStorage.getItem(this.getKey(key));
    if (!item) return null;
    
    try {
      const parsed: StorageItem = JSON.parse(item);
      return parsed.data;
    } catch {
      return null;
    }
  }

  // Check if data was modified
  isModified(key: string): boolean {
    const item = localStorage.getItem(this.getKey(key));
    if (!item) return false;
    
    try {
      const parsed: StorageItem = JSON.parse(item);
      return parsed.modified;
    } catch {
      return false;
    }
  }

  // Remove data
  removeData(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  // Complaints management
  getComplaints(): any[] {
    return this.getData('complaints') || [];
  }

  setComplaints(complaints: any[]): void {
    this.setData('complaints', complaints, true);
  }

  addComplaint(complaint: any): void {
    const complaints = this.getComplaints();
    const newComplaint = {
      ...complaint,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0
    };
    complaints.unshift(newComplaint);
    this.setComplaints(complaints);
  }

  getComplaint(id: string): any | null {
    const complaints = this.getComplaints();
    return complaints.find(c => c.id === id) || null;
  }

  updateComplaint(id: string, updates: any): void {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], ...updates };
      this.setComplaints(complaints);
    }
  }

  deleteComplaint(id: string): void {
    const complaints = this.getComplaints();
    const filtered = complaints.filter(c => c.id !== id);
    this.setComplaints(filtered);
  }

  // Paginated complaints
  getPaginatedComplaints(page: number = 1, limit: number = 10, filters?: any): PaginatedResponse<any> {
    let complaints = this.getComplaints();
    
    // Apply filters
    if (filters?.category) {
      complaints = complaints.filter(c => c.category === filters.category);
    }
    if (filters?.location) {
      complaints = complaints.filter(c => c.location?.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters?.trending) {
      complaints = complaints.filter(c => c.trending === true);
    }
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      complaints = complaints.filter(c => 
        c.content?.toLowerCase().includes(searchTerm) ||
        c.author?.toLowerCase().includes(searchTerm) ||
        c.location?.toLowerCase().includes(searchTerm)
      );
    }

    const total = complaints.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = complaints.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit
    };
  }

  // User profile management
  getUserProfile(): any {
    return this.getData('user_profile') || {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      location: 'Buenos Aires, Argentina',
      bio: 'Ciudadano comprometido con la transparencia',
      avatar: '👨‍💼'
    };
  }

  setUserProfile(profile: any): void {
    this.setData('user_profile', profile, true);
  }

  // Notifications management
  getNotifications(): any[] {
    return this.getData('notifications') || [
      {
        id: '1',
        title: 'Nuevo reclamo similar al tuyo',
        message: 'Se reportó un problema similar en tu zona',
        type: 'info',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        title: 'Tu reclamo fue revisado',
        message: 'El Hospital Italiano respondió a tu reclamo',
        type: 'success',
        read: false,
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        title: 'Subiste de nivel',
        message: 'Felicitaciones, alcanzaste el nivel 5',
        type: 'achievement',
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  setNotifications(notifications: any[]): void {
    this.setData('notifications', notifications, true);
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.setNotifications(notifications);
    }
  }

  getUnreadNotificationsCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Comments management
  getComments(complaintId: string): any[] {
    return this.getData(`comments_${complaintId}`) || [];
  }

  addComment(complaintId: string, comment: any): void {
    const comments = this.getComments(complaintId);
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    comments.push(newComment);
    this.setData(`comments_${complaintId}`, comments, true);
  }

  // Stats management
  updateStats(key: string, value: any): void {
    this.setData(`stats_${key}`, value, true);
  }

  getStats(key: string): any {
    return this.getData(`stats_${key}`);
  }

  // Clear all app data
  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Initialize with default data if empty
  initializeWithDefaults(defaultData: any): void {
    if (this.getComplaints().length === 0) {
      this.setComplaints(defaultData.complaints || []);
    }
  }
}

export const localStorageService = new LocalStorageService();