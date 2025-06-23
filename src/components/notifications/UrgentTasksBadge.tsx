// src/components/notifications/UrgentTasksBadge.tsx - VERSION CORRIGÉE FINALE
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { notificationService, UserRole } from '../../services/notifications/notificationService';

interface UrgentTasksBadgeProps {
  userRole: UserRole;
  onClick: () => void;
  className?: string;
}

export const UrgentTasksBadge: React.FC<UrgentTasksBadgeProps> = ({
  userRole,
  onClick,
  className = ''
}) => {
  const [urgentCount, setUrgentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  
  // ✅ Utiliser useRef pour éviter les dépendances cycliques
  const previousUrgentCount = useRef(0);

  // ✅ Fonction stable sans dépendances problématiques
  const updateCounts = useCallback(() => {
    try {
      const urgent = notificationService.getUrgentCount(userRole);
      const total = notificationService.getTotalCount(userRole);
      
      // ✅ Animation pulse seulement si urgent augmente
      if (urgent > previousUrgentCount.current && previousUrgentCount.current >= 0) {
        setPulse(true);
        const timer = setTimeout(() => setPulse(false), 2000);
        return () => clearTimeout(timer);
      }
      
      // ✅ Mettre à jour la référence
      previousUrgentCount.current = urgent;
      
      setUrgentCount(urgent);
      setTotalCount(total);
    } catch (error) {
      console.error('Erreur mise à jour compteurs badge:', error);
    }
  }, [userRole]); // ✅ Seulement userRole comme dépendance

  useEffect(() => {
    // ✅ Initialisation
    const urgent = notificationService.getUrgentCount(userRole);
    const total = notificationService.getTotalCount(userRole);
    
    previousUrgentCount.current = urgent;
    setUrgentCount(urgent);
    setTotalCount(total);
    
    // ✅ Abonnement aux changements
    const unsubscribe = notificationService.subscribe(updateCounts);
    
    return unsubscribe;
  }, [userRole, updateCounts]);

  const getBadgeColor = () => {
    if (urgentCount > 0) return 'bg-red-500';
    if (totalCount > 0) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getBadgeIcon = () => {
    if (urgentCount > 0) {
      return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
    return <Bell className="w-4 h-4 text-gray-600" />;
  };

  // ✅ Ne pas afficher si aucune notification
  if (totalCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
      title={`${urgentCount} tâches urgentes, ${totalCount} total`}
      aria-label={`Notifications: ${urgentCount} urgentes sur ${totalCount} total`}
    >
      <div className="relative">
        {getBadgeIcon()}
        
        {/* Badge principal */}
        <div 
          className={`absolute -top-2 -right-2 min-w-[20px] h-5 ${getBadgeColor()} rounded-full flex items-center justify-center transition-all duration-300`}
        >
          <span className="text-xs text-white font-bold px-1">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        </div>
        
        {/* Indicateur d'urgence */}
        {urgentCount > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
        )}
      </div>
    </button>
  );
};