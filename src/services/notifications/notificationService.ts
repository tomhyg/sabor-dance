// src/services/notifications/notificationService.ts - PROTECTION CONTRE BOUCLES

export interface UrgentTask {
  id: string;
  type: 'critical' | 'urgent' | 'action' | 'reminder' | 'opportunity' | 'info';
  category: 'volunteer' | 'team' | 'shift' | 'approval' | 'event' | 'submission' | 'rehearsal' | 'hours' | 'status';
  title: string;
  description: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
  deadline: string;
  action: string;
  icon: string;
  color: 'red' | 'orange' | 'blue' | 'green' | 'purple';
  createdAt: Date;
  userId?: string;
  relatedData?: any;
}

export type UserRole = 'organizer' | 'volunteer' | 'team_director' | 'admin' | 'assistant';

export class NotificationService {
  private tasks: Record<UserRole, UrgentTask[]> = {
    organizer: [],
    volunteer: [],
    team_director: [],
    admin: [],
    assistant: []
  };

  private listeners: Array<() => void> = [];
  private refreshIntervals: Map<UserRole, NodeJS.Timeout> = new Map();
  
  // ✅ Protection contre les notifications en cascade
  private isNotifying = false;
  private notifyQueue: Array<() => void> = [];

  constructor() {
    console.log('🏗️ NotificationService initialisé');
  }

  // ✅ Gestion d'abonnements avec protection
  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    console.log(`📝 Nouvel abonnement (total: ${this.listeners.length})`);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      console.log(`📝 Désabonnement (restant: ${this.listeners.length})`);
    };
  }

  // ✅ Notification protégée contre les boucles
  private notify() {
    // Si déjà en cours de notification, ajouter à la queue
    if (this.isNotifying) {
      console.log('⚠️ Notification déjà en cours, ajout à la queue');
      return;
    }

    this.isNotifying = true;
    
    try {
      console.log(`📢 Notification de ${this.listeners.length} listeners`);
      
      this.listeners.forEach((callback, index) => {
        try {
          callback();
        } catch (error) {
          console.error(`❌ Erreur callback notification ${index}:`, error);
        }
      });
    } catch (error) {
      console.error('❌ Erreur notification globale:', error);
    } finally {
      this.isNotifying = false;
      
      // Traiter la queue si nécessaire
      if (this.notifyQueue.length > 0) {
        console.log(`🔄 Traitement queue notifications (${this.notifyQueue.length})`);
        const nextNotify = this.notifyQueue.shift();
        setTimeout(() => nextNotify?.(), 10);
      }
    }
  }

  // ✅ Méthodes publiques avec validation
  getTasksForRole(role: UserRole): UrgentTask[] {
    return [...(this.tasks[role] || [])]; // Copie pour éviter les mutations
  }

  getUrgentCount(role: UserRole): number {
    return (this.tasks[role] || []).filter(task => task.urgency === 'high').length;
  }

  getTotalCount(role: UserRole): number {
    return (this.tasks[role] || []).reduce((total, task) => total + task.count, 0);
  }

  // ✅ Ajout de tâche avec déduplication intelligente
  addTask(role: UserRole, task: Omit<UrgentTask, 'id' | 'createdAt'>) {
    try {
      const newTask: UrgentTask = {
        ...task,
        id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };

      if (!this.tasks[role]) {
        this.tasks[role] = [];
      }

      // ✅ Déduplication basée sur title + category + urgency
      const existingIndex = this.tasks[role].findIndex(t => 
        t.title === newTask.title && 
        t.category === newTask.category &&
        t.urgency === newTask.urgency
      );

      let wasUpdated = false;

      if (existingIndex >= 0) {
        // ✅ Mise à jour si changements significatifs
        const existing = this.tasks[role][existingIndex];
        if (
          existing.count !== newTask.count || 
          existing.description !== newTask.description ||
          existing.deadline !== newTask.deadline
        ) {
          this.tasks[role][existingIndex] = {
            ...existing,
            ...newTask,
            id: existing.id, // Garder l'ancien ID
            createdAt: existing.createdAt // Garder la date de création
          };
          wasUpdated = true;
          console.log(`🔄 Tâche mise à jour: ${newTask.title}`);
        }
      } else {
        // ✅ Nouvelle tâche
        this.tasks[role].unshift(newTask);
        wasUpdated = true;
        console.log(`✅ Nouvelle tâche ajoutée: ${newTask.title}`);
      }

      // ✅ Notification seulement si vraiment changé
      if (wasUpdated) {
        // Délai pour éviter les cascades
        setTimeout(() => this.notify(), 10);
      }
    } catch (error) {
      console.error('❌ Erreur ajout tâche:', error);
    }
  }

  markTaskCompleted(role: UserRole, taskId: string) {
    try {
      if (this.tasks[role]) {
        const initialLength = this.tasks[role].length;
        this.tasks[role] = this.tasks[role].filter(task => task.id !== taskId);
        
        if (this.tasks[role].length !== initialLength) {
          console.log(`✅ Tâche supprimée: ${taskId}`);
          setTimeout(() => this.notify(), 10);
        }
      }
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  }

  clearAllTasks(role: UserRole) {
    try {
      if (this.tasks[role] && this.tasks[role].length > 0) {
        const count = this.tasks[role].length;
        this.tasks[role] = [];
        console.log(`🧹 ${count} tâches supprimées pour ${role}`);
        setTimeout(() => this.notify(), 10);
      }
    } catch (error) {
      console.error('❌ Erreur effacement tâches:', error);
    }
  }

  // ✅ Auto-refresh contrôlé
  startAutoRefresh(userRole: UserRole, eventId: string, currentUserId?: string) {
    console.log(`🔄 Démarrage auto-refresh pour ${userRole}`);
    
    // Arrêter l'ancien interval
    this.stopAutoRefresh(userRole);

    // Refresh initial après un délai
    setTimeout(() => {
      this.refreshFromBackend(userRole, eventId, currentUserId);
    }, 2000);

    // Interval de refresh
    const interval = setInterval(() => {
      this.refreshFromBackend(userRole, eventId, currentUserId);
    }, 30000);

    this.refreshIntervals.set(userRole, interval);
  }

  stopAutoRefresh(userRole: UserRole) {
    const interval = this.refreshIntervals.get(userRole);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(userRole);
      console.log(`⏹️ Auto-refresh arrêté pour ${userRole}`);
    }
  }

  // ✅ Refresh backend protégé
  private async refreshFromBackend(userRole: UserRole, eventId: string, currentUserId?: string) {
    try {
      console.log(`🔄 Refresh backend: ${userRole}`);
      
      const { generateRealNotifications } = await import('./realNotificationGenerator');
      await generateRealNotifications(this, userRole, eventId, currentUserId);
      
      console.log(`✅ Refresh terminé: ${userRole}`);
    } catch (error) {
      console.error(`❌ Erreur refresh ${userRole}:`, error);
    }
  }

  // ✅ Méthode publique pour initialisation
  async initializeRealNotifications(userRole: UserRole, eventId: string, currentUserId?: string) {
    console.log(`🚀 Initialisation notifications réelles pour ${userRole}`);
    
    try {
      this.startAutoRefresh(userRole, eventId, currentUserId);
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
    }
  }

  // ✅ Génération depuis données (ancien système)
  async generateNotificationsFromData(role: UserRole, volunteerShifts: any[], performanceTeams: any[]) {
    try {
      console.log(`📊 Génération notifications depuis données pour ${role}`);
      
      const { generateNotificationsFromData } = await import('./notificationGenerator');
      generateNotificationsFromData(this, role, volunteerShifts, performanceTeams);
    } catch (error) {
      console.error('❌ Erreur génération depuis données:', error);
    }
  }

  // ✅ Nettoyage complet
  cleanup() {
    console.log('🧹 Nettoyage NotificationService');
    
    // Arrêter tous les intervals
    this.refreshIntervals.forEach((interval, role) => {
      clearInterval(interval);
    });
    this.refreshIntervals.clear();
    
    // Vider toutes les tâches
    Object.keys(this.tasks).forEach(role => {
      this.tasks[role as UserRole] = [];
    });
    
    // Vider les listeners
    this.listeners = [];
    
    // Reset des flags
    this.isNotifying = false;
    this.notifyQueue = [];
    
    console.log('✅ Nettoyage terminé');
  }

  // ✅ Debug amélioré
  debugState() {
    console.group('📊 État NotificationService');
    console.log('Tâches par rôle:', this.tasks);
    console.log('Listeners actifs:', this.listeners.length);
    console.log('Refresh actifs:', Array.from(this.refreshIntervals.keys()));
    console.log('État notification:', {
      isNotifying: this.isNotifying,
      queueSize: this.notifyQueue.length
    });
    
    // Statistiques par rôle
    Object.entries(this.tasks).forEach(([role, tasks]) => {
      if (tasks.length > 0) {
        console.log(`${role}:`, {
          total: tasks.length,
          urgent: tasks.filter(t => t.urgency === 'high').length,
          categories: [...new Set(tasks.map(t => t.category))]
        });
      }
    });
    
    console.groupEnd();
  }
}

export const notificationService = new NotificationService();