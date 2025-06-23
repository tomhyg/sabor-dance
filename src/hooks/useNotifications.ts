// src/hooks/useNotifications.ts - CORRECTION FINALE BOUCLE INFINIE
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, UrgentTask, UserRole } from '../services/notifications/notificationService';

interface UseNotificationsOptions {
  eventId?: string;
  currentUserId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useNotifications = (
  userRole: UserRole, 
  options: UseNotificationsOptions = {}
) => {
  const {
    eventId = 'a9d1c983-1456-4007-9aec-b297dd095ff7',
    currentUserId,
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [tasks, setTasks] = useState<UrgentTask[]>([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ✅ Refs pour éviter les re-renders
  const isInitialized = useRef(false);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const isUpdating = useRef(false); // Protection contre les updates multiples

  // ✅ Fonction stable SANS dépendances qui changent
  const updateData = useCallback(() => {
    // ✅ Protection contre les appels multiples
    if (isUpdating.current) {
      console.log('⏭️ Update déjà en cours, ignoré');
      return;
    }

    try {
      isUpdating.current = true;
      
      const roleTasks = notificationService.getTasksForRole(userRole);
      const urgent = notificationService.getUrgentCount(userRole);
      const total = notificationService.getTotalCount(userRole);
      
      // ✅ Batch updates pour éviter les re-renders multiples
      React.startTransition(() => {
        setTasks(roleTasks);
        setUrgentCount(urgent);
        setTotalCount(total);
        setLoading(false);
        setLastRefresh(new Date());
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Notifications mises à jour pour ${userRole}:`, {
          tasks: roleTasks.length,
          urgent,
          total
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour notifications:', error);
      React.startTransition(() => {
        setLoading(false);
      });
    } finally {
      // ✅ Reset de la protection après un délai
      setTimeout(() => {
        isUpdating.current = false;
      }, 100);
    }
  }, [userRole]); // ✅ SEULEMENT userRole comme dépendance

  // ✅ Fonction de refresh backend séparée et protégée
  const refreshFromBackend = useCallback(async () => {
    if (loading || isUpdating.current) {
      console.log('⏭️ Refresh déjà en cours, ignoré');
      return;
    }

    try {
      console.log(`🔄 Refresh backend pour ${userRole}`);
      
      const { generateRealNotifications } = await import('../services/notifications/realNotificationGenerator');
      await generateRealNotifications(notificationService, userRole, eventId, currentUserId);
      
      console.log(`✅ Refresh backend terminé pour ${userRole}`);
    } catch (error) {
      console.error('❌ Erreur refresh backend:', error);
    }
  }, [userRole, eventId, currentUserId, loading]);

  // ✅ Initialisation UNE SEULE FOIS
  useEffect(() => {
    if (isInitialized.current) return;
    
    console.log(`🚀 Initialisation UNIQUE pour ${userRole}`);
    
    // Initialisation immédiate des données
    updateData();
    
    // Marquer comme initialisé AVANT le refresh pour éviter les doubles appels
    isInitialized.current = true;
    
    // Refresh initial après un délai pour éviter les conflits
    if (autoRefresh) {
      setTimeout(() => {
        refreshFromBackend();
      }, 1000); // 1 seconde de délai
    }
  }, [userRole]); // ✅ SEULEMENT userRole

  // ✅ Abonnement séparé et stable
  useEffect(() => {
    console.log(`🔗 Abonnement notifications pour ${userRole}`);
    
    const unsubscribe = notificationService.subscribe(() => {
      // ✅ Délai pour éviter les appels en cascade
      setTimeout(updateData, 50);
    });
    
    return () => {
      console.log(`🔌 Désabonnement notifications pour ${userRole}`);
      unsubscribe();
    };
  }, [userRole, updateData]);

  // ✅ Auto-refresh séparé et contrôlé
  useEffect(() => {
    if (!autoRefresh || !isInitialized.current) return;

    console.log(`⏰ Démarrage auto-refresh pour ${userRole} (${refreshInterval}ms)`);

    refreshTimeout.current = setInterval(() => {
      console.log(`🔄 Auto-refresh déclenché pour ${userRole}`);
      refreshFromBackend();
    }, refreshInterval);

    return () => {
      if (refreshTimeout.current) {
        console.log(`⏰ Arrêt auto-refresh pour ${userRole}`);
        clearInterval(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, userRole]); // ✅ PAS refreshFromBackend dans les deps

  // ✅ Nettoyage final
  useEffect(() => {
    return () => {
      if (refreshTimeout.current) {
        clearInterval(refreshTimeout.current);
      }
      isInitialized.current = false;
      isUpdating.current = false;
    };
  }, []);

  // ✅ Actions stables
  const addTask = useCallback((task: Omit<UrgentTask, 'id' | 'createdAt'>) => {
    try {
      notificationService.addTask(userRole, task);
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
    }
  }, [userRole]);

  const completeTask = useCallback((taskId: string) => {
    try {
      notificationService.markTaskCompleted(userRole, taskId);
    } catch (error) {
      console.error('Erreur complétion tâche:', error);
    }
  }, [userRole]);

  const clearAllTasks = useCallback(() => {
    try {
      notificationService.clearAllTasks(userRole);
    } catch (error) {
      console.error('Erreur effacement tâches:', error);
    }
  }, [userRole]);

  // ✅ Refresh manuel protégé
  const refreshNotifications = useCallback(async () => {
    console.log(`🔄 Refresh manuel demandé pour ${userRole}`);
    await refreshFromBackend();
  }, [userRole, eventId, currentUserId]); // ✅ Dépendances fixes

  // 🔄 Génération depuis données (DEPRECATED)
  const generateFromData = useCallback((volunteerShifts: any[], performanceTeams: any[]) => {
    console.warn('⚠️ generateFromData est obsolète - utiliser le système de refresh automatique');
    
    try {
      if (!Array.isArray(volunteerShifts) || !Array.isArray(performanceTeams)) {
        console.warn('Données invalides pour génération notifications');
        return;
      }

      notificationService.generateNotificationsFromData(userRole, volunteerShifts, performanceTeams);
    } catch (error) {
      console.error('Erreur génération notifications:', error);
    }
  }, [userRole]);

  // 📊 Statistiques stables
  const getTasksByCategory = useCallback(() => {
    const categories: Record<string, UrgentTask[]> = {};
    tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = [];
      }
      categories[task.category].push(task);
    });
    return categories;
  }, [tasks]);

  const getTasksByUrgency = useCallback(() => {
    return {
      high: tasks.filter(t => t.urgency === 'high'),
      medium: tasks.filter(t => t.urgency === 'medium'),
      low: tasks.filter(t => t.urgency === 'low')
    };
  }, [tasks]);

  // 🔧 Debug amélioré
  const debugNotifications = useCallback(() => {
    console.group(`🔍 Debug notifications - ${userRole}`);
    console.log('Configuration:', {
      userRole,
      eventId,
      currentUserId,
      autoRefresh,
      refreshInterval
    });
    console.log('État actuel:', {
      tasks: tasks.length,
      urgent: urgentCount,
      total: totalCount,
      lastRefresh: lastRefresh?.toLocaleTimeString(),
      loading,
      isInitialized: isInitialized.current,
      isUpdating: isUpdating.current
    });
    console.log('Détail des tâches:', tasks);
    console.table(tasks.map(t => ({
      title: t.title,
      category: t.category,
      urgency: t.urgency,
      count: t.count
    })));
    console.groupEnd();
    
    notificationService.debugState();
  }, [userRole, eventId, currentUserId, autoRefresh, refreshInterval, tasks, urgentCount, totalCount, lastRefresh, loading]);

  return {
    // Données principales
    tasks,
    urgentCount,
    totalCount,
    loading,
    lastRefresh,
    
    // Actions
    addTask,
    completeTask,
    clearAllTasks,
    refreshNotifications,
    
    // Compatibilité
    generateFromData,
    
    // Statistiques
    getTasksByCategory,
    getTasksByUrgency,
    
    // Debug
    debugNotifications
  };
};