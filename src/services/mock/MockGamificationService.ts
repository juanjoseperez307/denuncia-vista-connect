// Mock implementation of gamification service using SQL.js database
import { IGamificationService, UserProfile, Badge, Achievement, LeaderboardEntry, Challenge, LeaderboardUser } from '../interfaces/IGamificationService';
import { databaseService } from '../database/DatabaseService';

export class MockGamificationService implements IGamificationService {
  
  async getUserProfile(): Promise<UserProfile> {
    const results = await databaseService.query('SELECT * FROM users WHERE id = ?', ['1']);
    
    if (results.length === 0) {
      // Return default profile if user not found with updated stats
      const baseTime = Date.now();
      const timeVariation = Math.floor(baseTime / 5000) % 10; // Changes every 5 seconds
      
      return {
        id: '1',
        name: 'Juan Pérez',
        username: 'jperez',
        email: 'juan.perez@ejemplo.com',
        phone: '+54 11 1234-5678',
        location: 'Palermo, Buenos Aires',
        bio: 'Ciudadano comprometido con la transparencia y la mejora de la comunidad',
        avatar: '👤',
        transparencyPoints: 850 + (timeVariation * 10),
        level: 4,
        complaintsSubmitted: 12 + Math.floor(timeVariation / 2),
        commentsGiven: 28 + timeVariation,
        helpfulVotes: 45 + (timeVariation * 2),
        nextLevelPoints: 1000,
        pointsToNext: 150 - (timeVariation * 10),
        rank: 8,
        contributions: 12 + Math.floor(timeVariation / 2),
        points: 850 + (timeVariation * 10),
        change: timeVariation % 2 === 0 ? 5 : -2,
        nextLevel: 5
      };
    }
    
    const user = results[0];
    const baseTime = Date.now();
    const timeVariation = Math.floor(baseTime / 5000) % 10;
    
    return {
      id: user.id,
      name: user.name,
      username: user.username || 'jperez',
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      transparencyPoints: user.transparency_points + (timeVariation * 5),
      level: user.level,
      complaintsSubmitted: user.complaints_submitted ,
      commentsGiven: user.comments_given ,
      helpfulVotes: user.helpful_votes + timeVariation,
      nextLevelPoints: 500,
      pointsToNext: Math.max(0, 500 - ((user.transparency_points + (timeVariation * 5)) % 500)),
      rank: Math.max(1, 10 - Math.floor(timeVariation / 2)),
      contributions: user.complaints_submitted ,
      points: user.transparency_points + (timeVariation * 5),
      change: timeVariation % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : -Math.floor(Math.random() * 5) - 1,
      nextLevel: user.level + 1
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

  async getChallenges(): Promise<Challenge[]> {
    // Simulate real-time challenge progress based on user actions
    const baseTime = Date.now();
    const timeVariation = Math.floor(baseTime / 12000) % 8; // Changes every 12 seconds
    
    return [
      {
        id: '1',
        title: 'Eco-Warrior',
        description: 'Realiza 5 denuncias sobre temas ambientales',
        icon: '🌱',
        progress: Math.min(5, 2 + Math.floor(timeVariation / 2)),
        target: 5,
        reward: 500,
        category: 'environmental',
        type: 'create',
        isActive: true,
        endsAt: '2024-12-31'
      },
      {
        id: '2',
        title: 'Colaborador',
        description: 'Comenta en 10 denuncias de otros usuarios',
        icon: '🤝',
        progress: Math.min(10, 7 + Math.floor(timeVariation / 1.5)),
        target: 10,
        reward: 300,
        category: 'social',
        type: 'comment',
        isActive: true,
        endsAt: '2024-12-31'
      },
      {
        id: '3',
        title: 'Resolutor Rápido',
        description: 'Ayuda a resolver 3 casos en menos de 24 horas',
        icon: '⚡',
        progress: Math.min(3, Math.floor(timeVariation / 3)),
        target: 3,
        reward: 750,
        category: 'efficiency',
        type: 'resolve',
        isActive: true,
        endsAt: '2024-12-31'
      },
      {
        id: '4',
        title: 'Verificador Experto',
        description: 'Vota en 15 denuncias para verificar su validez',
        icon: '✅',
        progress: Math.min(15, 3 + timeVariation),
        target: 15,
        reward: 400,
        category: 'verification',
        type: 'vote',
        isActive: true,
        endsAt: '2024-12-31'
      }
    ];
  }

  async updateUserProgress(action: string, data: any): Promise<void> {
    // Mock implementation to update user progress based on actions
    console.log('User progress updated:', action, data);
  }
}