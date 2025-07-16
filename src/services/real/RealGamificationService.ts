// Real implementation of gamification service that calls actual API
import { IGamificationService, UserProfile, Badge, Achievement, LeaderboardEntry } from '../interfaces/IGamificationService';
import { apiService } from '../api';

export class RealGamificationService implements IGamificationService {
  
  async getUserProfile(): Promise<UserProfile> {
    return apiService.get('/gamification/profile');
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return apiService.put('/gamification/profile', updates);
  }

  async getUserBadges(): Promise<Badge[]> {
    return apiService.get('/gamification/badges');
  }

  async getAchievements(): Promise<Achievement[]> {
    return apiService.get('/gamification/achievements');
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return apiService.get(`/gamification/leaderboard?limit=${limit}`);
  }

  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    return apiService.post('/gamification/award-points', { userId, points, reason });
  }

  async checkLevelUp(userId: string): Promise<{ leveledUp: boolean; newLevel?: number }> {
    return apiService.get(`/gamification/level-up/${userId}`);
  }

  async incrementUserStat(stat: keyof Pick<UserProfile, 'complaintsSubmitted' | 'commentsGiven' | 'helpfulVotes'>): Promise<void> {
    return apiService.post('/gamification/increment-stat', { stat });
  }
}