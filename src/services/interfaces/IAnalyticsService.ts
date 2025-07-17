export interface DashboardStats {
  totalComplaints: number;
  todayComplaints: number;
  inProcess: number;
  resolved: number;
  resolutionRate: number;
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

export interface TimelineData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface TrendingTopic {
  tag: string;
  count: number;
  trend: number;
}

export interface IAnalyticsService {
  getDashboardStats(): Promise<DashboardStats>;
  getCategoryStats(): Promise<CategoryStats[]>;
  getLocationStats(): Promise<LocationStats[]>;
  getTimelineData(days?: number): Promise<TimelineData[]>;
  getTrendingTopics(): Promise<TrendingTopic[]>;
  getSystemHealth(): Promise<any>;
  generateReport(type: string, filters?: any): Promise<any>;
}