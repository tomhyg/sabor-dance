// src/hooks/useNotifications.ts - CLEAN REAL VERSION
import { useState, useEffect } from 'react';
import { NotificationService, UrgentTask, UserRole } from '../services/notifications/notificationService';
import { EmailService } from '../services/emailService';

export const useNotifications = (userRole: UserRole | undefined, userId: string | undefined) => {
  const [notificationService] = useState(() => new NotificationService());
  const [emailService] = useState(() => new EmailService());
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications at startup and periodically
  useEffect(() => {
    if (!userRole || !userId) {
      setUrgentTasks([]);
      return;
    }

    let isMounted = true;
    
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await notificationService.generateRealNotifications(userRole, userId);
        
        if (isMounted) {
          setUrgentTasks(notificationService.getTasks(userRole));
        }
      } catch (err) {
        console.error('❌ Error loading notifications:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load immediately
    loadNotifications();
    
    // Reload every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    // Subscribe to changes
    const unsubscribe = notificationService.subscribe(() => {
      if (isMounted) {
        setUrgentTasks(notificationService.getTasks(userRole));
      }
    });
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [userRole, userId, notificationService]);

  // Refresh manually
  const refresh = async () => {
    if (!userRole || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await notificationService.refresh(userRole, userId);
      setUrgentTasks(notificationService.getTasks(userRole));
    } catch (err) {
      console.error('❌ Error refreshing:', err);
      setError(err instanceof Error ? err.message : 'Refresh error');
    } finally {
      setLoading(false);
    }
  };

  // Mark a task as handled
  const dismissTask = (taskId: string) => {
    if (!userRole) return;
    
    notificationService.removeTask(userRole, taskId);
    setUrgentTasks(notificationService.getTasks(userRole));
  };

  // Send a test email
  const sendTestEmail = async (type: 'volunteer' | 'team_director' | 'organizer'): Promise<{ success: boolean; error?: string }> => {
    try {
      const testEmail = 'test@example.com';
      const result = await emailService.sendTestEmail(type, testEmail);
      return result;
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  // Get statistics
  const getStats = () => {
    const stats = notificationService.getStats();
    return userRole ? stats[userRole] : { total: 0, urgent: 0, critical: 0 };
  };

  // Get a specific task
  const getTask = (taskId: string): UrgentTask | undefined => {
    return userRole ? notificationService.getTask(userRole, taskId) : undefined;
  };

  // Test functions for development
  const testNotifications = async () => {
    if (!userRole || !userId) return [];
    
    try {
      const testTasks = await notificationService.testNotifications(userRole, userId);
      setUrgentTasks(testTasks);
      return testTasks;
    } catch (error) {
      console.error('❌ Error testing notifications:', error);
      return [];
    }
  };

  // Clear all notifications
  const clearAll = () => {
    if (!userRole) return;
    
    notificationService.clearTasks(userRole);
    setUrgentTasks([]);
  };

  return {
    // Main data
    urgentTasks,
    taskCount: urgentTasks.length,
    urgentCount: urgentTasks.filter(t => t.urgency === 'high').length,
    criticalCount: urgentTasks.filter(t => t.type === 'critical').length,
    
    // States
    loading,
    error,
    
    // Actions
    refresh,
    dismissTask,
    getTask,
    clearAll,
    
    // Statistics
    getStats,
    
    // Email functions
    sendTestEmail,
    
    // Test functions (development)
    testNotifications,
    
    // Additional data
    hasUrgentTasks: urgentTasks.some(t => t.urgency === 'high'),
    hasCriticalTasks: urgentTasks.some(t => t.type === 'critical'),
    
    // Filters
    getTasksByType: (type: UrgentTask['type']) => urgentTasks.filter(t => t.type === type),
    getTasksByCategory: (category: UrgentTask['category']) => urgentTasks.filter(t => t.category === category),
    getTasksByUrgency: (urgency: UrgentTask['urgency']) => urgentTasks.filter(t => t.urgency === urgency)
  };
};