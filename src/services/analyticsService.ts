import apiService from './api';

export interface DashboardStats {
  totalComplaints: number;
  inProcess: number;
  resolved: number;
  resolutionRate: number;
  todayComplaints: number;
  trends: {
    complaints: number;
    resolution: number;
  };
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TimelineData {
  date: string;
  denuncias: number;
  resueltas: number;
}

export interface LocationData {
  location: string;
  count: number;
  color: string;
}

export interface TrendingTopic {
  tag: string;
  count: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'alta' | 'media' | 'baja';
  location: string;
  timestamp: string;
}

export interface Pattern {
  id: string;
  type: 'increase' | 'correlation' | 'improvement';
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

class AnalyticsService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get('/analytics/dashboard');
  }

  // Get category distribution data
  async getCategoryData(): Promise<CategoryData[]> {
    return apiService.get('/analytics/categories');
  }

  // Get timeline data
  async getTimelineData(period: 'week' | 'month' | 'year' = 'week'): Promise<TimelineData[]> {
    return apiService.get(`/analytics/timeline?period=${period}`);
  }

  // Get location data
  async getLocationData(): Promise<LocationData[]> {
    return apiService.get('/analytics/locations');
  }

  // Get trending topics
  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return apiService.get('/analytics/trending');
  }

  // Get urgent alerts
  async getUrgentAlerts(): Promise<Alert[]> {
    return apiService.get('/analytics/alerts');
  }

  // Get detected patterns
  async getDetectedPatterns(): Promise<Pattern[]> {
    return apiService.get('/analytics/patterns');
  }

  // Get system health metrics
  async getSystemHealth(): Promise<{
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  }> {
    return apiService.get('/analytics/system-health');
  }

  // Get user statistics for a specific user
  async getUserStats(userId?: string): Promise<{
    complaintsSubmitted: number;
    resolutionsHelped: number;
    transparencyPoints: number;
    level: number;
    nextLevelPoints: number;
    badges: Array<{ id: string; name: string; icon: string; description: string }>;
  }> {
    const endpoint = userId ? `/analytics/users/${userId}` : '/analytics/users/me';
    return apiService.get(endpoint);
  }

  // Generate custom report
  async generateReport(params: {
    type: 'category' | 'location' | 'timeline' | 'full';
    dateFrom: string;
    dateTo: string;
    categories?: string[];
    locations?: string[];
  }): Promise<{
    reportId: string;
    downloadUrl: string;
  }> {
    return apiService.post('/analytics/reports', params);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;