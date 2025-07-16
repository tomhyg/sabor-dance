// src/components/notifications/UrgentTasksBadge.tsx - VERSION ÉPURÉE
import React from 'react';
import { Bell, BellRing, AlertCircle } from 'lucide-react';

interface UrgentTasksBadgeProps {
  taskCount: number;
  urgentCount: number;
  criticalCount: number;
  loading?: boolean;
  onClick: () => void;
}

export const UrgentTasksBadge: React.FC<UrgentTasksBadgeProps> = ({ 
  taskCount, 
  urgentCount,
  criticalCount,
  loading = false,
  onClick 
}) => {
  // Pas de notifications
  if (taskCount === 0) {
    return (
      <button
        onClick={onClick}
        className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {loading && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
        )}
      </button>
    );
  }

  // Déterminer le style selon l'urgence
  const getStyle = () => {
    if (criticalCount > 0) {
      return {
        textColor: 'text-red-400 hover:text-red-300',
        badgeColor: 'bg-red-500',
        icon: <AlertCircle className="w-6 h-6" />,
        animation: 'animate-pulse'
      };
    }
    
    if (urgentCount > 0) {
      return {
        textColor: 'text-orange-400 hover:text-orange-300',
        badgeColor: 'bg-orange-500',
        icon: <BellRing className="w-6 h-6" />,
        animation: 'animate-bounce'
      };
    }
    
    return {
      textColor: 'text-blue-400 hover:text-blue-300',
      badgeColor: 'bg-blue-500',
      icon: <Bell className="w-6 h-6" />,
      animation: ''
    };
  };

  const style = getStyle();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 transition-all duration-200 ${style.textColor} ${style.animation}`}
      title={`${taskCount} notification${taskCount > 1 ? 's' : ''}`}
    >
      {style.icon}
      
      {/* Badge de compteur */}
      <span className={`absolute -top-1 -right-1 ${style.badgeColor} text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg`}>
        {taskCount > 9 ? '9+' : taskCount}
      </span>
      
      {/* Indicateur de chargement */}
      {loading && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
      )}
    </button>
  );
};