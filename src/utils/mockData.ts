// Mock data for development - remove this when PHP APIs are ready
// This file provides fallback data when APIs are not available

export const mockComplaints = [
  {
    id: '1',
    author: 'María García__',
    avatar: '👩‍💼',
    time: 'hace 2 horas',
    category: 'Transporte',
    location: 'Buenos Aires, CABA',
    content: 'El colectivo 152 no pasa desde hace 3 horas en la parada de Av. Corrientes y Callao. Los usuarios estamos esperando sin información oficial.',
    entities: [
      { type: 'transport_line', value: '152', icon: '🚌' },
      { type: 'location', value: 'Av. Corrientes y Callao', icon: '📍' }
    ],
    likes: 23,
    comments: 8,
    shares: 5,
    trending: true,
    verified: false
  },
  {
    id: '2',
    author: 'Carlos Mendoza__',
    avatar: '👨‍🔧',
    time: 'hace 4 horas',
    category: 'Salud',
    location: 'Córdoba Capital',
    content: 'Hospital público sin medicamentos básicos. Pacientes diabéticos sin insulina desde hace una semana.',
    entities: [
      { type: 'health_institution', value: 'Hospital público', icon: '🏥' },
      { type: 'medicine', value: 'insulina', icon: '💊' }
    ],
    likes: 45,
    comments: 12,
    shares: 18,
    trending: true,
    verified: true
  }
];

export const mockStats = {
  totalComplaints: 1247,
  inProcess: 89,
  resolved: 1234,
  resolutionRate: 67,
  todayComplaints: 147,
  trends: {
    complaints: 12,
    resolution: -5
  }
};

export const mockCategories = [
  { id: 'transporte', label: 'Transporte', icon: '🚌', color: 'bg-blue-500' },
  { id: 'salud', label: 'Salud', icon: '🏥', color: 'bg-red-500' },
  { id: 'educacion', label: 'Educación', icon: '🎓', color: 'bg-green-500' },
  { id: 'seguridad', label: 'Seguridad', icon: '🚨', color: 'bg-yellow-500' },
  { id: 'servicios', label: 'Servicios', icon: '🔧', color: 'bg-purple-500' },
  { id: 'ambiente', label: 'Ambiente', icon: '🌱', color: 'bg-emerald-500' }
];

export const mockTrendingTopics = [
  { tag: '#TransportePublico', count: 45 },
  { tag: '#Salud', count: 32 },
  { tag: '#Seguridad', count: 28 },
  { tag: '#Educacion', count: 19 }
];

export const mockUserProfile = {
  id: '1',
  name: 'Usuario',
  avatar: '',
  transparencyPoints: 1247,
  level: 5,
  rank: 23,
  complaintsCount: 12,
  resolutionsCount: 8,
  badges: [],
  achievements: []
};

// Helper function to simulate API delay
export const mockApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to check if we should use mock data
export const shouldUseMockData = (): boolean => {
  return process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API;
};