// API Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  baseUrl: {
    development: 'http://localhost/api',
    production: 'https://your-domain.com/api',
  },
  
  // API endpoints
  endpoints: {
    // Complaints
    complaints: '/complaints',
    complaintById: (id: string) => `/complaints/${id}`,
    complaintLike: (id: string) => `/complaints/${id}/like`,
    complaintComments: (id: string) => `/complaints/${id}/comments`,
    complaintShare: (id: string) => `/complaints/${id}/share`,
    complaintCategories: '/complaints/categories',
    complaintSearch: '/complaints/search',
    complaintTrending: '/complaints/trending',
    complaintUpload: '/complaints/upload',
    complaintDetectEntities: '/complaints/detect-entities',
    
    // Analytics
    analyticsStats: '/analytics/dashboard',
    analyticsCategories: '/analytics/categories',
    analyticsTimeline: '/analytics/timeline',
    analyticsLocations: '/analytics/locations',
    analyticsTrending: '/analytics/trending',
    analyticsAlerts: '/analytics/alerts',
    analyticsPatterns: '/analytics/patterns',
    analyticsSystemHealth: '/analytics/system-health',
    analyticsUserStats: '/analytics/users/me',
    analyticsReports: '/analytics/reports',
    
    // Gamification
    gamificationProfile: '/gamification/profile',
    gamificationLeaderboard: '/gamification/leaderboard',
    gamificationRankings: '/gamification/rankings',
    gamificationBadges: '/gamification/badges',
    gamificationAchievements: '/gamification/achievements',
    gamificationChallenges: '/gamification/challenges',
    gamificationAwardPoints: '/gamification/award-points',
    gamificationTransparencyScore: '/gamification/transparency-score',
    gamificationLevels: '/gamification/levels',
    
    // User management (for future implementation)
    userLogin: '/auth/login',
    userRegister: '/auth/register',
    userProfile: '/users/profile',
    userLogout: '/auth/logout',
  },
  
  // Request timeouts
  timeout: {
    default: 10000, // 10 seconds
    upload: 30000,  // 30 seconds for file uploads
    report: 60000,  // 1 minute for report generation
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000, // 1 second
  },
  
  // Cache configuration
  cache: {
    defaultTTL: 300000, // 5 minutes
    categories: 3600000, // 1 hour
    stats: 60000, // 1 minute
  },
};

// Get the appropriate base URL based on environment
export const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV as keyof typeof API_CONFIG.baseUrl;
  return API_CONFIG.baseUrl[env] || API_CONFIG.baseUrl.development;
};

// Helper to build full URLs
export const buildUrl = (endpoint: string): string => {
  return `${getBaseUrl()}${endpoint}`;
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;