export interface UserProfile {
  id: string;
  name: string;
  username?: string;
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
  nextLevelPoints: number;
  pointsToNext?: number;
  rank?: number;
  contributions?: number;
  points?: number;
  change?: number;
  nextLevel?: number;
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
  title: string;
  description: string;
  icon: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  reward: number;
  category: string;
  type: 'create' | 'resolve' | 'comment' | 'vote';
  isActive: boolean;
  endsAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  name?: string;
  avatar?: string;
  points: number;
  level: number;
  change: number;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  name: string;
  level: number;
  points: number;
  change: number;
}

export interface IGamificationService {
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  getUserBadges(): Promise<Badge[]>;
  getAchievements(): Promise<Achievement[]>;
  getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
  getChallenges?(): Promise<Challenge[]>;
  awardPoints(userId: string, points: number, reason: string): Promise<void>;
  checkLevelUp(userId: string): Promise<{ leveledUp: boolean; newLevel?: number }>;
  incrementUserStat(stat: keyof Pick<UserProfile, 'complaintsSubmitted' | 'commentsGiven' | 'helpfulVotes'>): Promise<void>;
  updateUserProgress?(action: string, data: any): Promise<void>;
}