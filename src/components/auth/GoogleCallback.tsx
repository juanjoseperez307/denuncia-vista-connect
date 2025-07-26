
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const GoogleCallback: React.FC = () => {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleGoogleCallback(code)
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Procesando login con Google...</p>
      </div>
    </div>
  );
};
