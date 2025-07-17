// Mock implementation of analytics service using SQL.js database
import { IAnalyticsService, DashboardStats, CategoryStats, LocationStats, TrendingTopic, TimelineData } from '../interfaces/IAnalyticsService';
import { databaseService } from '../database/DatabaseService';

export class MockAnalyticsService implements IAnalyticsService {
  
  async getDashboardStats(): Promise<DashboardStats> {
    // Simulate changing values over time for real-time updates
    const baseTime = Date.now();
    const timeVariation = Math.floor(baseTime / 5000) % 100; // Changes every 5 seconds
    const secondVariation = Math.floor(baseTime / 1000) % 10; // Changes every second
    
    const totalResults = await databaseService.query('SELECT COUNT(*) as total FROM complaints');
    const total = totalResults[0].total + timeVariation + secondVariation;
    
    const resolved = Math.floor(total * 0.7) + (secondVariation % 2); 
    const inProcess = total - resolved + (secondVariation % 3);
    
    const todayResults = await databaseService.query(
      "SELECT COUNT(*) as today FROM complaints WHERE time LIKE '%hora%'"
    );
    const todayComplaints = todayResults[0].today + (secondVariation % 5);
    
    return {
      totalComplaints: total,
      inProcess,
      resolved,
      resolutionRate: Math.floor((resolved / total) * 100) + (timeVariation % 8),
      todayComplaints,
      trends: {
        complaints: 12 + (timeVariation % 5),
        resolution: -5 + (timeVariation % 3)
      }
    };
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    const results = await databaseService.query(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    const totalResults = await databaseService.query('SELECT COUNT(*) as total FROM complaints');
    const total = totalResults[0].total;
    
    return results.map(row => ({
      name: row.category,
      count: row.count,
      percentage: Math.round((row.count / total) * 100),
      trend: Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 20)
    }));
  }

  async getLocationStats(): Promise<LocationStats[]> {
    const results = await databaseService.query(`
      SELECT location, COUNT(*) as count 
      FROM complaints 
      GROUP BY location 
      ORDER BY count DESC
    `);
    
    const totalResults = await databaseService.query('SELECT COUNT(*) as total FROM complaints');
    const total = totalResults[0].total;
    
    return results.map(row => ({
      location: row.location,
      count: row.count,
      percentage: Math.round((row.count / total) * 100),
      coordinates: undefined // Mock coordinates would be added here
    }));
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    const results = await databaseService.query(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 4
    `);
    
    return results.map(row => ({
      tag: `#${row.category}`,
      count: row.count,
      trend: Math.floor(Math.random() * 50) + 1
    }));
  }

  async getTimelineData(days: number = 30): Promise<TimelineData[]> {
    // Mock timeline data - in real implementation this would query by date ranges
    const data: TimelineData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const complaints = Math.floor(Math.random() * 20) + 1;
      const resolved = Math.floor(complaints * 0.7);
      
      data.push({
        date: date.toISOString().split('T')[0],
        complaints,
        resolved
      });
    }
    
    return data;
  }

  async getSystemHealth(): Promise<any> {
    const totalComplaints = await databaseService.query('SELECT COUNT(*) as total FROM complaints');
    const totalUsers = await databaseService.query('SELECT COUNT(*) as total FROM users');
    
    return {
      status: 'healthy',
      uptime: '99.9%',
      totalComplaints: totalComplaints[0].total,
      totalUsers: totalUsers[0].total,
      responseTime: '120ms',
      lastUpdate: new Date().toISOString()
    };
  }

  async generateReport(type: string, filters: any = {}): Promise<any> {
    // Mock report generation
    const complaints = await databaseService.query('SELECT * FROM complaints');
    
    return {
      type,
      filters,
      generatedAt: new Date().toISOString(),
      data: complaints,
      summary: {
        totalComplaints: complaints.length,
        categories: [...new Set(complaints.map(c => c.category))],
        locations: [...new Set(complaints.map(c => c.location))]
      }
    };
  }
}