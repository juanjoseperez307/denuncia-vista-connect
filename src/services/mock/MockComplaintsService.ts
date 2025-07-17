// Mock implementation of complaints service using SQL.js database
import { IComplaintsService, Complaint, ComplaintFormData, ComplaintFilters, ComplaintComment, ComplaintStatus } from '../interfaces/IComplaintsService';
import { databaseService } from '../database/DatabaseService';

export class MockComplaintsService implements IComplaintsService {
  
  async getComplaints(filters: ComplaintFilters = {}): Promise<Complaint[]> {
    let sql = `
      SELECT * FROM complaints 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (filters.category) {
      sql += ` AND category = ?`;
      params.push(filters.category);
    }
    
    if (filters.location) {
      sql += ` AND location LIKE ?`;
      params.push(`%${filters.location}%`);
    }
    
    if (filters.trending !== undefined) {
      sql += ` AND trending = ?`;
      params.push(filters.trending);
    }
    
    sql += ` ORDER BY created_at DESC`;
    
    if (filters.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ` OFFSET ?`;
      params.push(filters.offset);
    }
    
    console.log(sql);
    const results = await databaseService.query(sql, params);
    console.log(results);
    
    return results.map(row => ({
      id: row.id,
      author: row.author,
      avatar: row.avatar,
      time: row.time,
      category: row.category,
      location: row.location,
      content: row.content,
      entities: row.entities ? JSON.parse(row.entities) : [],
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      trending: !!row.trending,
      verified: !!row.verified,
      isAnonymous: !!row.is_anonymous,
      files: row.files ? JSON.parse(row.files) : [],
      status: row.status as ComplaintStatus,
      statusUpdatedAt: row.status_updated_at,
      statusUpdatedBy: row.status_updated_by
    }));
  }

  async getComplaint(id: string): Promise<Complaint> {
    const results = await databaseService.query(
      'SELECT * FROM complaints WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      throw new Error(`Complaint with id ${id} not found`);
    }
    
    const row = results[0];
    return {
      id: row.id,
      author: row.author,
      avatar: row.avatar,
      time: row.time,
      category: row.category,
      location: row.location,
      content: row.content,
      entities: row.entities ? JSON.parse(row.entities) : [],
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      trending: !!row.trending,
      verified: !!row.verified,
      isAnonymous: !!row.is_anonymous,
      files: row.files ? JSON.parse(row.files) : [],
      status: row.status as ComplaintStatus,
      statusUpdatedAt: row.status_updated_at,
      statusUpdatedBy: row.status_updated_by
    };
  }

  async createComplaint(complaintData: ComplaintFormData): Promise<Complaint> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const entities = await this.detectEntities(complaintData.content);
    
    const complaint: Complaint = {
      id,
      author: complaintData.isAnonymous ? 'Usuario Anónimo' : 'Juan Pérez',
      avatar: complaintData.isAnonymous ? '👤' : '👨‍💼',
      time: 'hace pocos segundos',
      category: complaintData.category,
      location: complaintData.location,
      content: complaintData.content,
      entities,
      likes: 0,
      comments: 0,
      shares: 0,
      trending: false,
      verified: false,
      isAnonymous: complaintData.isAnonymous,
      files: complaintData.files ? complaintData.files.map(f => f.name) : [],
      status: 'pending',
      statusUpdatedAt: now,
      statusUpdatedBy: "author"
    };

    await databaseService.execute(`
      INSERT INTO complaints (id, author, avatar, time, category, location, content, entities, likes, comments, shares, trending, verified, is_anonymous, files, status, status_updated_at, status_updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      complaint.id,
      complaint.author,
      complaint.avatar,
      complaint.time,
      complaint.category,
      complaint.location,
      complaint.content,
      JSON.stringify(complaint.entities),
      complaint.likes,
      complaint.comments,
      complaint.shares,
      complaint.trending,
      complaint.verified,
      complaint.isAnonymous,
      JSON.stringify(complaint.files),
      complaint.status,
      complaint.statusUpdatedAt,
      complaint.statusUpdatedBy
    ]);

    // Update user stats
    await databaseService.execute(`
      UPDATE users SET 
        complaints_submitted = complaints_submitted + 1,
        transparency_points = transparency_points + 10
      WHERE id = '1'
    `);

    return complaint;
  }

  async updateComplaint(id: string, data: Partial<ComplaintFormData>): Promise<Complaint> {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }
    
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }
    
    if (data.location !== undefined) {
      updates.push('location = ?');
      params.push(data.location);
    }
    
    params.push(id);
    
    await databaseService.execute(`
      UPDATE complaints SET ${updates.join(', ')} WHERE id = ?
    `, params);
    
    return this.getComplaint(id);
  }

  async deleteComplaint(id: string): Promise<void> {
    await databaseService.execute('DELETE FROM complaints WHERE id = ?', [id]);
    await databaseService.execute('DELETE FROM comments WHERE complaint_id = ?', [id]);
  }

  async toggleLike(id: string): Promise<{ liked: boolean; totalLikes: number }> {
    const complaint = await this.getComplaint(id);
    const newLikes = complaint.likes + 1;
    
    await databaseService.execute(`
      UPDATE complaints SET likes = ? WHERE id = ?
    `, [newLikes, id]);
    
    return { liked: true, totalLikes: newLikes };
  }

  async shareComplaint(id: string, platform?: string): Promise<{ shareUrl: string; totalShares: number }> {
    await databaseService.execute(`
      UPDATE complaints SET shares = shares + 1 WHERE id = ?
    `, [id]);
    
    // Get updated share count
    const results = await databaseService.query(`
      SELECT shares FROM complaints WHERE id = ?
    `, [id]);
    
    const totalShares = results.length > 0 ? results[0].shares : 0;
    
    return {
      shareUrl: `${window.location.origin}/complaint/${id}`,
      totalShares
    };
  }

  async getComments(complaintId: string): Promise<ComplaintComment[]> {
    const results = await databaseService.query(
      'SELECT * FROM comments WHERE complaint_id = ? ORDER BY created_at DESC',
      [complaintId]
    );
    
    return results.map(row => ({
      id: row.id,
      complaintId: row.complaint_id,
      author: row.author,
      content: row.content,
      time: row.time,
      likes: row.likes
    }));
  }

  async addComment(complaintId: string, content: string): Promise<ComplaintComment> {
    const id = Date.now().toString();
    const comment: ComplaintComment = {
      id,
      complaintId,
      author: 'Juan Pérez',
      content,
      time: 'hace pocos segundos',
      likes: 0
    };

    await databaseService.execute(`
      INSERT INTO comments (id, complaint_id, author, content, time, likes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [comment.id, comment.complaintId, comment.author, comment.content, comment.time, comment.likes]);

    // Update complaint comment count
    await databaseService.execute(`
      UPDATE complaints SET comments = comments + 1 WHERE id = ?
    `, [complaintId]);

    return comment;
  }

  async searchComplaints(query: string, filters: ComplaintFilters = {}): Promise<{
    complaints: Complaint[];
    totalResults: number;
    suggestions: string[];
    filters: { categories: string[]; locations: string[]; };
  }> {
    let sql = `
      SELECT * FROM complaints 
      WHERE (content LIKE ? OR author LIKE ? OR category LIKE ? OR location LIKE ?)
    `;
    const searchTerm = `%${query}%`;
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];
    
    if (filters.category) {
      sql += ` AND category = ?`;
      params.push(filters.category);
    }
    
    if (filters.location) {
      sql += ` AND location LIKE ?`;
      params.push(`%${filters.location}%`);
    }
    
    sql += ` ORDER BY created_at DESC`;
    
    const complaints = await databaseService.query(sql, params);
    
    // Get filter options
    const categories = await databaseService.query('SELECT DISTINCT category FROM complaints');
    const locations = await databaseService.query('SELECT DISTINCT location FROM complaints');
    
    return {
      complaints: complaints.map(row => ({
        id: row.id,
        author: row.author,
        avatar: row.avatar,
        time: row.time,
        category: row.category,
        location: row.location,
        content: row.content,
        entities: row.entities ? JSON.parse(row.entities) : [],
        likes: row.likes,
        comments: row.comments,
        shares: row.shares,
        trending: !!row.trending,
        verified: !!row.verified,
        isAnonymous: !!row.is_anonymous,
        files: row.files ? JSON.parse(row.files) : [],
        status: row.status as ComplaintStatus,
        statusUpdatedAt: row.status_updated_at,
        statusUpdatedBy: row.status_updated_by
      })),
      totalResults: complaints.length,
      suggestions: categories.map(c => c.category).slice(0, 5),
      filters: {
        categories: categories.map(c => c.category),
        locations: locations.map(l => l.location.split(',')[0])
      }
    };
  }

  async getTrendingComplaints(): Promise<Complaint[]> {
    return this.getComplaints({ trending: true });
  }

  async getCategories(): Promise<Array<{ id: string; label: string; icon: string; color: string }>> {
    const results = await databaseService.query('SELECT * FROM categories');
    return results.map(row => ({
      id: row.id,
      label: row.label,
      icon: row.icon,
      color: row.color
    }));
  }

  async detectEntities(text: string): Promise<Array<{ type: string; value: string; icon: string }>> {
    const entities: Array<{ type: string; value: string; icon: string }> = [];
    
    // Simple entity detection based on keywords
    const transportWords = ['colectivo', 'bus', 'metro', 'tren', 'taxi'];
    const healthWords = ['hospital', 'medicamento', 'doctor', 'salud', 'insulina'];
    const locationWords = ['avenida', 'calle', 'plaza', 'barrio', 'av.'];
    
    const words = text.toLowerCase().split(' ');
    
    words.forEach(word => {
      if (transportWords.some(tw => word.includes(tw))) {
        entities.push({ type: 'transport', value: word, icon: '🚌' });
      } else if (healthWords.some(hw => word.includes(hw))) {
        entities.push({ type: 'health', value: word, icon: '🏥' });
      } else if (locationWords.some(lw => word.includes(lw))) {
        entities.push({ type: 'location', value: word, icon: '📍' });
      }
    });
    
    return entities;
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus, updatedBy?: string): Promise<Complaint> {
    const now = new Date().toISOString();
    
    await databaseService.execute(`
      UPDATE complaints 
      SET status = ?, status_updated_at = ?, status_updated_by = ? 
      WHERE id = ?
    `, [status, now, updatedBy, id]);
    
    return this.getComplaint(id);
  }

  async getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    const results = await databaseService.query(
      'SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    
    return results.map(row => ({
      id: row.id,
      author: row.author,
      avatar: row.avatar,
      time: row.time,
      category: row.category,
      location: row.location,
      content: row.content,
      entities: row.entities ? JSON.parse(row.entities) : [],
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      trending: !!row.trending,
      verified: !!row.verified,
      isAnonymous: !!row.is_anonymous,
      files: row.files ? JSON.parse(row.files) : [],
      status: row.status as ComplaintStatus,
      statusUpdatedAt: row.status_updated_at,
      statusUpdatedBy: row.status_updated_by
    }));
  }

  async getComplaintStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    resolutionRate: number;
  }> {
    const stats = await databaseService.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM complaints
    `);
    
    const result = stats[0];
    const total = result.total || 0;
    const resolved = result.resolved || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    return {
      total,
      pending: result.pending || 0,
      inProgress: result.inProgress || 0,
      resolved,
      rejected: result.rejected || 0,
      resolutionRate
    };
  }
}