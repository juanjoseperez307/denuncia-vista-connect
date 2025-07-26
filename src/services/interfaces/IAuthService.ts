
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  is_verified: boolean;
  reputation: number;
  level: number;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SignupData {
  name: string;
  email: string;
  username?: string;
  password?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface IAuthService {
  signup(data: SignupData): Promise<AuthResponse>;
  login(data: LoginData): Promise<AuthResponse>;
  logout(): Promise<{ message: string }>;
  getGoogleAuthUrl(): Promise<{ auth_url: string }>;
  handleGoogleCallback(code: string): Promise<AuthResponse>;
  getProfile(): Promise<{ user: User }>;
  updateProfile(data: Partial<User>): Promise<{ user: User; message: string }>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  getToken(): string | null;
}
