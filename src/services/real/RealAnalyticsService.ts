// Real implementation of analytics service that calls actual API
import { IAnalyticsService, DashboardStats, CategoryStats, LocationStats, TrendingTopic, TimelineData } from '../interfaces/IAnalyticsService';
import { apiService } from '../api';

export class RealAnalyticsService implements IAnalyticsService {
  
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get('/analytics/dashboard');
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    return apiService.get('/analytics/categories');
  }

  async getLocationStats(): Promise<LocationStats[]> {
    return apiService.get('/analytics/locations');
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return apiService.get('/analytics/trending');
  }

  async getTimelineData(days: number = 30): Promise<TimelineData[]> {
    return apiService.get(`/analytics/timeline?days=${days}`);
  }

  async getSystemHealth(): Promise<any> {
    return apiService.get('/analytics/system-health');
  }

  async generateReport(type: string, filters: any = {}): Promise<any> {
    return apiService.post('/analytics/reports', { type, filters });
  }
}