// Real implementation of complaints service that calls actual API
import { IComplaintsService, Complaint, ComplaintFormData, ComplaintFilters, ComplaintComment, ComplaintStatus } from '../interfaces/IComplaintsService';
import { apiService } from '../api';

export class RealComplaintsService implements IComplaintsService {
  
  async getComplaints(filters: ComplaintFilters = {}): Promise<Complaint[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/complaints${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiService.get(endpoint);
  }

  async getComplaint(id: string): Promise<Complaint> {
    return apiService.get(`/complaints/${id}`);
  }

  async createComplaint(complaintData: ComplaintFormData): Promise<Complaint> {
    if (complaintData.files && complaintData.files.length > 0) {
      // Handle file uploads
      const uploadPromises = complaintData.files.map(file =>
        apiService.uploadFile('/complaints/upload', file)
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      const fileUrls = uploadResults.map(result => result.url);
      
      return apiService.post('/complaints', {
        ...complaintData,
        files: fileUrls
      });
    }
    
    return apiService.post('/complaints', complaintData);
  }

  async updateComplaint(id: string, data: Partial<ComplaintFormData>): Promise<Complaint> {
    return apiService.put(`/complaints/${id}`, data);
  }

  async deleteComplaint(id: string): Promise<void> {
    return apiService.delete(`/complaints/${id}`);
  }

  async toggleLike(id: string): Promise<{ liked: boolean; totalLikes: number }> {
    return apiService.post(`/complaints/${id}/like`, {});
  }

  async shareComplaint(id: string, platform?: string): Promise<{ shareUrl: string; totalShares: number }> {
    return apiService.post(`/complaints/${id}/share`, { platform });
  }

  async getComments(complaintId: string): Promise<ComplaintComment[]> {
    return apiService.get(`/complaints/${complaintId}/comments`);
  }

  async addComment(complaintId: string, content: string): Promise<ComplaintComment> {
    return apiService.post(`/complaints/${complaintId}/comments`, { content });
  }

  async searchComplaints(query: string, filters: ComplaintFilters = {}): Promise<{
    complaints: Complaint[];
    totalResults: number;
    suggestions: string[];
    filters: { categories: string[]; locations: string[]; };
  }> {
    return apiService.post('/complaints/search', { query, ...filters });
  }

  async getTrendingComplaints(): Promise<Complaint[]> {
    return apiService.get('/complaints/trending');
  }

  async getCategories(): Promise<Array<{ id: string; label: string; icon: string; color: string }>> {
    return apiService.get('/complaints/categories');
  }

  async detectEntities(text: string): Promise<Array<{ type: string; value: string; icon: string }>> {
    return apiService.post('/complaints/detect-entities', { text });
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus, updatedBy?: string): Promise<Complaint> {
    return apiService.put(`/complaints/${id}/status`, { status, updatedBy });
  }

  async getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    return apiService.get(`/complaints?status=${status}`);
  }

  async getComplaintStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    resolutionRate: number;
  }> {
    return apiService.get('/complaints/stats');
  }
}