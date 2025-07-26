
import { IAuthService, User, AuthResponse, SignupData, LoginData } from '../interfaces/IAuthService';
import { apiService } from '../api';
import { API_CONFIG } from '../../config/api';

export class RealAuthService implements IAuthService {
  private user: User | null = null;
  private token: string | null = null;

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
    const response = await apiService.post(`${API_CONFIG.endpoints.userRegister}?action=signup`, data);
    
    this.token = response.token;
    this.user = response.user;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post(`${API_CONFIG.endpoints.userLogin}?action=login`, data);
    
    this.token = response.token;
    this.user = response.user;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    if (this.token) {
      try {
        await apiService.post(`${API_CONFIG.endpoints.userLogout}?action=logout`, {}, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      } catch (error) {
        console.warn('Error during logout:', error);
      }
    }
    
    // Clear local state and storage
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    return { message: 'Logout exitoso' };
  }

  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    return await apiService.get(`/api/user.php?action=google_signup`);
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await apiService.get(`/api/user.php?action=google_callback&code=${code}`);
    
    this.token = response.token;
    this.user = response.user;
    
    // Save to localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return response;
  }

  async getProfile(): Promise<{ user: User }> {
    if (!this.token) {
      throw new Error('No authenticated user');
    }
    
    const response = await apiService.get(`${API_CONFIG.endpoints.userProfile}?action=profile`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    this.user = response.user;
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return response;
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    if (!this.token) {
      throw new Error('No authenticated user');
    }
    
    const response = await apiService.put(`${API_CONFIG.endpoints.userProfile}?action=profile`, data, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    this.user = response.user;
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    return response;
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
