// Mock implementation of gamification service using SQL.js database
import { IGamificationService, UserProfile, Badge, Achievement, LeaderboardEntry } from '../interfaces/IGamificationService';
import { databaseService } from '../database/DatabaseService';

export class MockGamificationService implements IGamificationService {
  
  async getUserProfile(): Promise<UserProfile> {
    const results = await databaseService.query('SELECT * FROM users WHERE id = ?', ['1']);
    
    if (results.length === 0) {
      throw new Error('User not found');
    }
    
    const user = results[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      transparencyPoints: user.transparency_points,
      level: user.level,
      complaintsSubmitted: user.complaints_submitted,
      commentsGiven: user.comments_given,
      helpfulVotes: user.helpful_votes
    };
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      params.push(updates.name);
    }
    
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      params.push(updates.email);
    }
    
    if (updates.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(updates.phone);
    }
    
    if (updates.location !== undefined) {
      updateFields.push('location = ?');
      params.push(updates.location);
    }
    
    if (updates.bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(updates.bio);
    }
    
    if (updates.avatar !== undefined) {
      updateFields.push('avatar = ?');
      params.push(updates.avatar);
    }
    
    params.push('1'); // user id
    
    await databaseService.execute(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `, params);
    
    return this.getUserProfile();
  }

  async getUserBadges(): Promise<Badge[]> {
    const results = await databaseService.query(`
      SELECT b.*, ub.unlocked_at 
      FROM badges b 
      JOIN user_badges ub ON b.id = ub.badge_id 
      WHERE ub.user_id = ?
    `, ['1']);
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      rarity: row.rarity,
      unlockedAt: row.unlocked_at
    }));
  }

  async getAchievements(): Promise<Achievement[]> {
    const results = await databaseService.query(`
      SELECT a.*, ua.progress, ua.completed, ua.completed_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    `, ['1']);
    
    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      progress: row.progress || 0,
      target: row.target,
      completed: !!row.completed,
      completedAt: row.completed_at
    }));
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const results = await databaseService.query(`
      SELECT id, name, avatar, transparency_points, level
      FROM users
      ORDER BY transparency_points DESC
      LIMIT ?
    `, [limit]);
    
    return results.map((row, index) => ({
      rank: index + 1,
      userId: row.id,
      username: row.name,
      avatar: row.avatar,
      points: row.transparency_points,
      level: row.level,
      change: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 5) - 1
    }));
  }

  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    await databaseService.execute(`
      UPDATE users SET transparency_points = transparency_points + ? WHERE id = ?
    `, [points, userId]);
    
    // Check for level up
    const levelUpResult = await this.checkLevelUp(userId);
    if (levelUpResult.leveledUp) {
      // Add notification for level up
      await databaseService.execute(`
        INSERT INTO notifications (id, title, message, time, read, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        Date.now().toString(),
        'Nivel alcanzado!',
        `¡Felicidades! Alcanzaste el nivel ${levelUpResult.newLevel}`,
        'hace pocos segundos',
        false,
        'success'
      ]);
    }
  }

  async checkLevelUp(userId: string): Promise<{ leveledUp: boolean; newLevel?: number }> {
    const results = await databaseService.query(`
      SELECT transparency_points, level FROM users WHERE id = ?
    `, [userId]);
    
    if (results.length === 0) {
      return { leveledUp: false };
    }
    
    const user = results[0];
    const newLevel = Math.floor(user.transparency_points / 250) + 1;
    
    if (newLevel > user.level) {
      await databaseService.execute(`
        UPDATE users SET level = ? WHERE id = ?
      `, [newLevel, userId]);
      
      return { leveledUp: true, newLevel };
    }
    
    return { leveledUp: false };
  }

  async incrementUserStat(stat: keyof Pick<UserProfile, 'complaintsSubmitted' | 'commentsGiven' | 'helpfulVotes'>): Promise<void> {
    const columnMap = {
      complaintsSubmitted: 'complaints_submitted',
      commentsGiven: 'comments_given',
      helpfulVotes: 'helpful_votes'
    };
    
    const column = columnMap[stat];
    
    await databaseService.execute(`
      UPDATE users SET ${column} = ${column} + 1, transparency_points = transparency_points + 10 WHERE id = ?
    `, ['1']);
    
    // Check for level up after incrementing stats
    await this.checkLevelUp('1');
  }
}