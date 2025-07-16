// Interface for analytics service
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

export interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  trend: number;
}

export interface LocationStats {
  location: string;
  count: number;
  percentage: number;
  coordinates?: { lat: number; lng: number };
}

export interface TrendingTopic {
  tag: string;
  count: number;
  trend: number;
}

export interface TimelineData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface IAnalyticsService {
  getDashboardStats(): Promise<DashboardStats>;
  getCategoryStats(): Promise<CategoryStats[]>;
  getLocationStats(): Promise<LocationStats[]>;
  getTrendingTopics(): Promise<TrendingTopic[]>;
  getTimelineData(days?: number): Promise<TimelineData[]>;
  getSystemHealth(): Promise<any>;
  generateReport(type: string, filters?: any): Promise<any>;
}