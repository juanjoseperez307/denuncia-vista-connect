
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Settings, Trophy, Star } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <CardTitle className="text-base">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
        {user.is_verified && (
          <Badge variant="secondary" className="ml-auto">
            ✓ Verificado
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Nivel {user.level}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-blue-500" />
            <span>{user.reputation} pts</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className="flex-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loading ? 'Saliendo...' : 'Salir'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
