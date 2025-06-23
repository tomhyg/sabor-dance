// src/components/AuthRouter.tsx - Composant pour gérer les routes auth
import React, { useEffect, useState } from 'react';
import { EmailConfirmation, PasswordReset } from './AuthPages';

// Fonctions utilitaires pour la navigation - Corrigées pour SSR
const getAuthPageFromUrl = (): string => {
  // Vérifier si on est côté client
  if (typeof window === 'undefined') {
    return 'app'; // Valeur par défaut côté serveur
  }
  
  const path = window.location.pathname;
  
  if (path.includes('/auth/confirm')) {
    return 'confirm-email';
  }
  
  if (path.includes('/auth/reset-password')) {
    return 'reset-password';
  }
  
  return 'app';
};

const navigateToHome = () => {
  // Vérifier si on est côté client
  if (typeof window === 'undefined') {
    return;
  }
  
  window.history.pushState({}, '', '/');
  window.location.reload();
};

interface AuthRouterProps {
  children: React.ReactNode;
}

export const AuthRouter: React.FC<AuthRouterProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('app');
  const [isClient, setIsClient] = useState(false);
  
  // Effet pour détecter côté client et récupérer la page
  useEffect(() => {
    setIsClient(true);
    setCurrentPage(getAuthPageFromUrl());
  }, []);
  
  const handleBackToHome = () => {
    navigateToHome();
  };
  
  const handleAuthSuccess = () => {
    navigateToHome();
  };
  
  // Côté serveur ou pendant l'hydratation, on affiche toujours l'app principale
  if (!isClient) {
    return <>{children}</>;
  }
  
  // Côté client, on peut maintenant gérer les routes
  switch (currentPage) {
    case 'confirm-email':
      return (
        <EmailConfirmation 
          onBackToHome={handleBackToHome}
          onSuccess={handleAuthSuccess}
        />
      );
      
    case 'reset-password':
      return (
        <PasswordReset 
          onBackToHome={handleBackToHome}
          onSuccess={handleAuthSuccess}
        />
      );
      
    default:
      return <>{children}</>;
  }
};