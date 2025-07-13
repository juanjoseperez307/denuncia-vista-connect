import apiService from './api';

export interface Complaint {
  id: string;
  author: string;
  avatar?: string;
  time: string;
  category: string;
  location: string;
  content: string;
  entities: Array<{
    type: string;
    value: string;
    icon: string;
  }>;
  likes: number;
  comments: number;
  shares: number;
  trending: boolean;
  verified: boolean;
  isAnonymous?: boolean;
  files?: File[];
}

export interface ComplaintFormData {
  content: string;
  category: string;
  location: string;
  isAnonymous: boolean;
  files?: File[];
}

export interface ComplaintFilters {
  category?: string;
  location?: string;
  trending?: boolean;
  timeRange?: string;
  limit?: number;
  offset?: number;
}

class ComplaintsService {
  // Get complaints feed with optional filters
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

  // Get single complaint by ID
  async getComplaint(id: string): Promise<Complaint> {
    return apiService.get(`/complaints/${id}`);
  }

  // Create new complaint
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

  // Update complaint
  async updateComplaint(id: string, data: Partial<ComplaintFormData>): Promise<Complaint> {
    return apiService.put(`/complaints/${id}`, data);
  }

  // Delete complaint
  async deleteComplaint(id: string): Promise<void> {
    return apiService.delete(`/complaints/${id}`);
  }

  // Like/unlike complaint
  async toggleLike(id: string): Promise<{ liked: boolean; totalLikes: number }> {
    return apiService.post(`/complaints/${id}/like`, {});
  }

  // Get complaint comments
  async getComments(complaintId: string): Promise<any[]> {
    return apiService.get(`/complaints/${complaintId}/comments`);
  }

  // Add comment to complaint
  async addComment(complaintId: string, content: string): Promise<any> {
    return apiService.post(`/complaints/${complaintId}/comments`, { content });
  }

  // Share complaint
  async shareComplaint(id: string): Promise<{ shareUrl: string }> {
    return apiService.post(`/complaints/${id}/share`, {});
  }

  // Get trending complaints
  async getTrendingComplaints(): Promise<Complaint[]> {
    return apiService.get('/complaints/trending');
  }

  // Search complaints
  async searchComplaints(query: string, filters: ComplaintFilters = {}): Promise<any> {
    return apiService.post('/complaints/search', { query, ...filters });
  }

  // Get complaint by ID with extended data
  async getComplaintById(id: number): Promise<any> {
    return apiService.get(`/complaints/${id}/details`);
  }

  // Get complaint categories
  async getCategories(): Promise<Array<{ id: string; label: string; icon: string; color: string }>> {
    return apiService.get('/complaints/categories');
  }

  // Detect entities in text
  async detectEntities(text: string): Promise<Array<{ type: string; value: string; icon: string }>> {
    return apiService.post('/complaints/detect-entities', { text });
  }
}

export const complaintsService = new ComplaintsService();
export default complaintsService;