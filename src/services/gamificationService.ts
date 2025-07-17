import apiService from './api';

export interface User {
  id: string;
  name: string;
  avatar: string;
  transparencyPoints: number;
  level: number;
  rank: number;
  complaintsCount: number;
  resolutionsCount: number;
  badges: Badge[];
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: {
    points: number;
    badge?: Badge;
  };
  completed: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  change: 'up' | 'down' | 'same';
}

export interface Leaderboard {
  period: 'week' | 'month' | 'all-time';
  entries: LeaderboardEntry[];
  userPosition?: LeaderboardEntry;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: {
    type: 'complaints' | 'resolutions' | 'engagement';
    target: number;
    current: number;
  };
  rewards: {
    points: number;
    badges?: Badge[];
  };
  startDate: string;
  endDate: string;
  participants: number;
  completed: boolean;
}

class GamificationService {
  // Get current user profile
  async getUserProfile(): Promise<User> {
    return apiService.get('/gamification/profile');
  }

  // Get leaderboard
  async getLeaderboard(period: 'week' | 'month' | 'all-time' = 'week'): Promise<Leaderboard> {
    return apiService.get(`/gamification/leaderboard?period=${period}`);
  }

  // Get user rankings by category
  async getCategoryRankings(): Promise<{
    complaints: LeaderboardEntry[];
    resolutions: LeaderboardEntry[];
    engagement: LeaderboardEntry[];
  }> {
    return apiService.get('/gamification/rankings');
  }

  // Get available badges
  async getBadges(): Promise<Badge[]> {
    return apiService.get('/gamification/badges');
  }

  // Get user achievements
  async getAchievements(): Promise<Achievement[]> {
    return apiService.get('/gamification/achievements');
  }

  // Get active challenges
  async getChallenges(): Promise<Challenge[]> {
    return apiService.get('/gamification/challenges');
  }

  // Join a challenge
  async joinChallenge(challengeId: string): Promise<{ success: boolean; message: string }> {
    return apiService.post(`/gamification/challenges/${challengeId}/join`, {});
  }

  // Complete a challenge
  async completeChallenge(challengeId: string): Promise<{
    success: boolean;
    rewards: {
      points: number;
      badges?: Badge[];
    };
  }> {
    return apiService.post(`/gamification/challenges/${challengeId}/complete`, {});
  }

  // Award points for actions
  async awardPoints(action: string, data?: any): Promise<{
    pointsAwarded: number;
    totalPoints: number;
    levelUp?: boolean;
    newLevel?: number;
    badgesUnlocked?: Badge[];
  }> {
    return apiService.post('/gamification/award-points', { action, data });
  }

  // Get transparency score breakdown
  async getTransparencyScore(): Promise<{
    total: number;
    breakdown: {
      complaints: number;
      resolutions: number;
      engagement: number;
      verification: number;
    };
    history: Array<{
      date: string;
      points: number;
      action: string;
    }>;
  }> {
    return apiService.get('/gamification/transparency-score');
  }

  // Get level progression info
  async getLevelProgression(): Promise<{
    currentLevel: number;
    currentPoints: number;
    pointsForNextLevel: number;
    totalPointsForNextLevel: number;
    levelsUnlocked: Array<{
      level: number;
      name: string;
      description: string;
      perks: string[];
    }>;
  }> {
    return apiService.get('/gamification/levels');
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;