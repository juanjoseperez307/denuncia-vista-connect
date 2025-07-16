// Interface for complaints service
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
  files?: string[];
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

export interface ComplaintComment {
  id: string;
  complaintId: string;
  author: string;
  content: string;
  time: string;
  likes: number;
}

export interface IComplaintsService {
  // Core CRUD operations
  getComplaints(filters?: ComplaintFilters): Promise<Complaint[]>;
  getComplaint(id: string): Promise<Complaint>;
  createComplaint(complaintData: ComplaintFormData): Promise<Complaint>;
  updateComplaint(id: string, data: Partial<ComplaintFormData>): Promise<Complaint>;
  deleteComplaint(id: string): Promise<void>;
  
  // Interactions
  toggleLike(id: string): Promise<{ liked: boolean; totalLikes: number }>;
  shareComplaint(id: string): Promise<{ shareUrl: string }>;
  
  // Comments
  getComments(complaintId: string): Promise<ComplaintComment[]>;
  addComment(complaintId: string, content: string): Promise<ComplaintComment>;
  
  // Search and discovery
  searchComplaints(query: string, filters?: ComplaintFilters): Promise<{
    complaints: Complaint[];
    totalResults: number;
    suggestions: string[];
    filters: {
      categories: string[];
      locations: string[];
    };
  }>;
  getTrendingComplaints(): Promise<Complaint[]>;
  
  // Metadata
  getCategories(): Promise<Array<{ id: string; label: string; icon: string; color: string }>>;
  detectEntities(text: string): Promise<Array<{ type: string; value: string; icon: string }>>;
}