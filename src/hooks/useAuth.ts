
import { useState, useEffect, useCallback } from 'react';
import { serviceFactory } from '../services/ServiceFactory';
import { User, SignupData, LoginData } from '../services/interfaces/IAuthService';
import { useToast } from './use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authService = serviceFactory.getAuthService();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [authService]);

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    try {
      const response = await authService.signup(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: "¡Registro exitoso!",
        description: response.message,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el registro';
      toast({
        title: "Error en el registro",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, toast]);

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: "¡Login exitoso!",
        description: response.message,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login';
      toast({
        title: "Error en el login",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "Logout exitoso",
        description: response.message,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el logout';
      toast({
        title: "Error en el logout",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, toast]);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const { auth_url } = await authService.getGoogleAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al inicializar login con Google';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [authService, toast]);

  const handleGoogleCallback = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const response = await authService.handleGoogleCallback(code);
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: "¡Login con Google exitoso!",
        description: response.message,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login con Google';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, toast]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      setUser(response.user);
      toast({
        title: "Perfil actualizado",
        description: response.message,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, toast]);

  return {
    user,
    isAuthenticated,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile,
  };
};
