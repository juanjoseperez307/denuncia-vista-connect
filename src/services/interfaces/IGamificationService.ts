// Interface for gamification service
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  points: number;
  level: number;
  change: number;
}

export interface IGamificationService {
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  
  getUserBadges(): Promise<Badge[]>;
  getAchievements(): Promise<Achievement[]>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  
  awardPoints(userId: string, points: number, reason: string): Promise<void>;
  checkLevelUp(userId: string): Promise<{ leveledUp: boolean; newLevel?: number }>;
  
  incrementUserStat(stat: keyof Pick<UserProfile, 'complaintsSubmitted' | 'commentsGiven' | 'helpfulVotes'>): Promise<void>;
}