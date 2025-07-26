
import { IAuthService, User, AuthResponse, SignupData, LoginData } from '../interfaces/IAuthService';

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Usuario Demo',
    email: 'demo@example.com',
    username: 'demo_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    is_verified: true,
    reputation: 150,
    level: 3,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export class MockAuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;
  private users: User[] = [...mockUsers];

  constructor() {
    // Initialize from localStorage on startup
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = JSON.parse(savedUser);
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === data.email || u.username === data.username);
    if (existingUser) {
      throw new Error('El email o username ya está registrado');
    }
    
    // Create new user
    const newUser: User = {
      id: this.users.length + 1,
      name: data.name,
      email: data.email,
      username: data.username || `user_${Date.now()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      is_verified: false,
      reputation: 0,
      level: 1,
      created_at: new Date().toISOString()
    };
    
    this.users.push(newUser);
    this.user = newUser;
    this.token = `mock_token_${Date.now()}`;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return {
      user: this.user,
      token: this.token,
      message: 'Usuario registrado exitosamente'
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user
    const user = this.users.find(u => u.username === data.username);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    
    this.user = user;
    this.token = `mock_token_${Date.now()}`;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return {
      user: this.user,
      token: this.token,
      message: 'Login exitoso'
    };
  }

  async logout(): Promise<{ message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear local state and storage
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    return { message: 'Logout exitoso' };
  }

  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock Google OAuth URL
    return {
      auth_url: `https://accounts.google.com/oauth/authorize?mock=true&redirect_uri=${window.location.origin}`
    };
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock Google user
    const googleUser: User = {
      id: this.users.length + 1,
      name: 'Usuario Google',
      email: 'google@example.com',
      username: `google_user_${Date.now()}`,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      is_verified: true,
      reputation: 50,
      level: 2,
      created_at: new Date().toISOString()
    };
    
    this.users.push(googleUser);
    this.user = googleUser;
    this.token = `mock_google_token_${Date.now()}`;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return {
      user: this.user,
      token: this.token,
      message: 'Login con Google exitoso'
    };
  }

  async getProfile(): Promise<{ user: User }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.user) {
      throw new Error('No authenticated user');
    }
    
    return { user: this.user };
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.user) {
      throw new Error('No authenticated user');
    }
    
    // Update user data
    this.user = { ...this.user, ...data };
    
    // Update in users array
    const userIndex = this.users.findIndex(u => u.id === this.user!.id);
    if (userIndex >= 0) {
      this.users[userIndex] = this.user;
    }
    
    // Save to localStorage
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return {
      user: this.user,
      message: 'Perfil actualizado exitosamente'
    };
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }
}
