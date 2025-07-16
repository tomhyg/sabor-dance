// src/services/notifications/notificationService.ts - VERSION CORRIGÉE AVEC HEURES D'INSCRIPTION
import { supabase } from '../../lib/supabase';

export interface UrgentTask {
  id: string;
  type: 'critical' | 'urgent' | 'reminder';
  category: 'volunteer' | 'team' | 'shift' | 'approval';
  title: string;
  description: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
  action: string;
  icon: string;
  color: 'red' | 'orange' | 'blue' | 'green';
  createdAt: Date;
  relatedData?: any;
}

export type UserRole = 'organizer' | 'volunteer' | 'team_director' | 'admin';

export class NotificationService {
  private tasks: Record<UserRole, UrgentTask[]> = {
    organizer: [],
    volunteer: [],
    team_director: [],
    admin: []
  };

  private listeners: Array<() => void> = [];

  constructor() {
    console.log('🔔 NotificationService initialized (real version)');
  }

  // ✅ Generate real notifications based on data
  async generateRealNotifications(role: UserRole, userId: string) {
    console.log(`🔔 Generating real notifications for ${role} (${userId})`);
    
    // Clear old notifications
    this.clearTasks(role);
    
    try {
      switch (role) {
        case 'volunteer':
          await this.generateVolunteerNotifications(userId);
          break;
        case 'team_director':
          await this.generateTeamDirectorNotifications(userId);
          break;
        case 'organizer':
        case 'admin':
          await this.generateOrganizerNotifications(userId);
          break;
      }
      
      // Notify listeners
      this.notifyListeners();
      
    } catch (error) {
      console.error('❌ Error generating notifications:', error);
    }
  }

  // 🙋‍♀️ Real volunteer notifications
  private async generateVolunteerNotifications(userId: string) {
    console.log('🙋‍♀️ Generating volunteer notifications for:', userId);
    
    // Get volunteer signups
    const { data: signups } = await supabase
      .from('volunteer_signups')
      .select(`
        *,
        volunteer_shifts (*)
      `)
      .eq('volunteer_id', userId)
      .in('status', ['signed_up', 'confirmed', 'checked_in']); // 🎯 CORRECTION: Inclure tous les statuts actifs

    if (!signups) {
      console.log('No signups found');
      return;
    }

    // Calculate hours (same logic as dashboard/volunteers page)
    const completedHours = this.calculateUserHours(signups);
    const requiredHours = await this.getRequiredHours();

    console.log(`📊 Hours: ${completedHours}/${requiredHours}`);

    // 🎯 CORRECTION: Notification with hours counting all active signups
    if (completedHours < requiredHours) {
      const hoursNeeded = requiredHours - completedHours;
      
      this.addTask('volunteer', {
        type: 'urgent',
        category: 'shift',
        title: `You need ${hoursNeeded} more hours`,
        description: `You have ${completedHours}h out of ${requiredHours}h required`,
        count: 1,
        urgency: completedHours < requiredHours / 2 ? 'high' : 'medium',
        action: 'View shifts',
        icon: 'Clock',
        color: completedHours === 0 ? 'red' : 'orange'
      });
    }

    // Shifts this week
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const userShifts = signups.filter(signup => {
      const shift = signup.volunteer_shifts;
      if (!shift) return false;
      const shiftDate = new Date(shift.shift_date);
      return shiftDate >= new Date() && shiftDate <= oneWeekFromNow;
    });

    if (userShifts.length > 0) {
      this.addTask('volunteer', {
        type: 'reminder',
        category: 'shift',
        title: `${userShifts.length} shift${userShifts.length > 1 ? 's' : ''} this week`,
        description: userShifts.map(s => {
          const shift = s.volunteer_shifts;
          return `${shift.title} on ${new Date(shift.shift_date).toLocaleDateString()}`;
        }).join(', '),
        count: userShifts.length,
        urgency: 'low',
        action: 'View schedule',
        icon: 'Calendar',
        color: 'blue'
      });
    }

    // Shifts today
    const today = new Date().toISOString().split('T')[0];
    const todayShifts = signups.filter(signup => {
      const shift = signup.volunteer_shifts;
      return shift && shift.shift_date === today;
    });

    if (todayShifts.length > 0) {
      this.addTask('volunteer', {
        type: 'critical',
        category: 'shift',
        title: `${todayShifts.length} shift${todayShifts.length > 1 ? 's' : ''} today`,
        description: todayShifts.map(s => {
          const shift = s.volunteer_shifts;
          return `${shift.title} at ${shift.start_time}`;
        }).join(', '),
        count: todayShifts.length,
        urgency: 'high',
        action: 'View details',
        icon: 'AlertCircle',
        color: 'red'
      });
    }
  }

  // 💃 Real team director notifications
  private async generateTeamDirectorNotifications(userId: string) {
    console.log('💃 Generating team director notifications for:', userId);
    
    // Get director's teams
    const { data: teams } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('created_by', userId);

    if (!teams || teams.length === 0) {
      console.log('No teams found');
      return;
    }

    console.log(`📊 ${teams.length} team(s) found`);

    for (const team of teams) {
      const missingElements = this.checkTeamCompleteness(team);
      
      if (missingElements.length > 0) {
        this.addTask('team_director', {
          type: 'urgent',
          category: 'team',
          title: `${team.team_name} - ${missingElements.length} missing element${missingElements.length > 1 ? 's' : ''}`,
          description: `Missing: ${missingElements.join(', ')}`,
          count: missingElements.length,
          urgency: 'high',
          action: 'Complete',
          icon: 'AlertTriangle',
          color: 'red',
          relatedData: { teamId: team.id }
        });
      }

      // Draft team
      if (team.status === 'draft') {
        this.addTask('team_director', {
          type: 'reminder',
          category: 'team',
          title: `${team.team_name} is draft`,
          description: 'Team not submitted for approval',
          count: 1,
          urgency: 'medium',
          action: 'Submit',
          icon: 'FileText',
          color: 'orange',
          relatedData: { teamId: team.id }
        });
      }

      // Rejected team
      if (team.status === 'rejected') {
        this.addTask('team_director', {
          type: 'critical',
          category: 'team',
          title: `${team.team_name} rejected`,
          description: team.rejection_reason || 'Team rejected by organizers',
          count: 1,
          urgency: 'high',
          action: 'View reason',
          icon: 'X',
          color: 'red',
          relatedData: { teamId: team.id }
        });
      }
    }
  }

  // 👔 Real organizer notifications
  private async generateOrganizerNotifications(userId: string) {
    console.log('👔 Generating organizer notifications for:', userId);
    
    // Critical shifts (no volunteers)
    const { data: criticalShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'live')
      .eq('current_volunteers', 0)
      .gte('shift_date', new Date().toISOString().split('T')[0]);

    if (criticalShifts && criticalShifts.length > 0) {
      this.addTask('organizer', {
        type: 'critical',
        category: 'volunteer',
        title: `${criticalShifts.length} shift${criticalShifts.length > 1 ? 's' : ''} without volunteer${criticalShifts.length > 1 ? 's' : ''}`,
        description: `Critical shifts: ${criticalShifts.slice(0, 3).map(s => s.title).join(', ')}${criticalShifts.length > 3 ? '...' : ''}`,
        count: criticalShifts.length,
        urgency: 'high',
        action: 'View shifts',
        icon: 'AlertTriangle',
        color: 'red',
        relatedData: { shiftIds: criticalShifts.map(s => s.id) }
      });
    }

    // Understaffed shifts - 🎯 CORRECTION: Supprimer .raw() et filtrer côté client
    const { data: allShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'live')
      .gt('current_volunteers', 0)
      .gte('shift_date', new Date().toISOString().split('T')[0]);

    const understaffedShifts = allShifts?.filter(shift => 
      shift.current_volunteers < shift.max_volunteers / 2
    ) || [];

    if (understaffedShifts.length > 0) {
      this.addTask('organizer', {
        type: 'urgent',
        category: 'volunteer',
        title: `${understaffedShifts.length} understaffed shift${understaffedShifts.length > 1 ? 's' : ''}`,
        description: `Shifts needing more volunteers`,
        count: understaffedShifts.length,
        urgency: 'medium',
        action: 'View shifts',
        icon: 'Users',
        color: 'orange',
        relatedData: { shiftIds: understaffedShifts.map(s => s.id) }
      });
    }

    // Teams pending approval
    const { data: pendingTeams } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('status', 'submitted');

    if (pendingTeams && pendingTeams.length > 0) {
      this.addTask('organizer', {
        type: 'urgent',
        category: 'approval',
        title: `${pendingTeams.length} team${pendingTeams.length > 1 ? 's' : ''} pending`,
        description: `Teams to approve: ${pendingTeams.slice(0, 3).map(t => t.team_name).join(', ')}${pendingTeams.length > 3 ? '...' : ''}`,
        count: pendingTeams.length,
        urgency: 'high',
        action: 'Approve',
        icon: 'UserCheck',
        color: 'orange',
        relatedData: { teamIds: pendingTeams.map(t => t.id) }
      });
    }

    // Draft shifts
    const { data: draftShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'draft');

    if (draftShifts && draftShifts.length > 0) {
      this.addTask('organizer', {
        type: 'reminder',
        category: 'shift',
        title: `${draftShifts.length} draft shift${draftShifts.length > 1 ? 's' : ''}`,
        description: `Shifts ready to be published`,
        count: draftShifts.length,
        urgency: 'low',
        action: 'Publish',
        icon: 'Calendar',
        color: 'blue',
        relatedData: { shiftIds: draftShifts.map(s => s.id) }
      });
    }
  }

  // 🔧 Utility functions
  // 🎯 CORRECTION: Calcul des heures identique au dashboard/volunteers page
  private calculateUserHours(signups: any[]): number {
    return signups
      // 🎯 CORRECTION: Compter tous les statuts actifs comme dans le dashboard
      .filter(s => ['signed_up', 'confirmed', 'checked_in'].includes(s.status) && s.volunteer_shifts)
      .reduce((total, signup) => {
        const shift = signup.volunteer_shifts;
        if (!shift) return total;
        
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
  }

  // 🎯 CORRECTION: Retourner 9h au lieu de 8h par défaut
  private async getRequiredHours(): Promise<number> {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('required_volunteer_hours')
        .eq('status', 'live')
        .single();
      
      return event?.required_volunteer_hours || 9; // 🎯 CHANGÉ: 9 au lieu de 8
    } catch (error) {
      console.warn('Error fetching required hours:', error);
      return 9; // 🎯 CHANGÉ: 9 au lieu de 8 par défaut
    }
  }

  private checkTeamCompleteness(team: any): string[] {
    const missing: string[] = [];
    
    if (!team.music_file_url) missing.push('Music');
    if (!team.team_photo_url) missing.push('Photo');
    if (!team.song_title) missing.push('Song title');
    if (!team.song_artist) missing.push('Artist');
    if (!team.performance_video_url) missing.push('Video');
    if (team.group_size > 0 && (!team.performers || team.performers.length === 0)) {
      missing.push('Members');
    }
    
    return missing;
  }

  // 📊 Task management
  addTask(role: UserRole, task: Omit<UrgentTask, 'id' | 'createdAt'> & { id?: string }) {
    const { id, ...taskData } = task;
    const newTask: UrgentTask = {
      ...taskData,
      id: id || `task_${Date.now()}`,
      createdAt: new Date()
    };
    
    this.tasks[role].push(newTask);
    console.log(`✅ Task added for ${role}: ${newTask.title}`);
  }

  getTasks(role: UserRole): UrgentTask[] {
    return this.tasks[role] || [];
  }

  getTask(role: UserRole, taskId: string): UrgentTask | undefined {
    return this.tasks[role]?.find(task => task.id === taskId);
  }

  removeTask(role: UserRole, taskId: string) {
    const tasks = this.tasks[role] || [];
    this.tasks[role] = tasks.filter(task => task.id !== taskId);
    this.notifyListeners();
  }

  clearTasks(role: UserRole) {
    this.tasks[role] = [];
    console.log(`🗑️ Tasks cleared for ${role}`);
  }

  clearAllTasks(role: UserRole) {
    this.tasks[role] = [];
    console.log(`🗑️ All tasks cleared for ${role}`);
  }

  getTaskCount(role: UserRole): number {
    return this.tasks[role]?.length || 0;
  }

  getUrgentTaskCount(role: UserRole): number {
    return this.tasks[role]?.filter(task => task.urgency === 'high').length || 0;
  }

  // 📊 Subscriptions
  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    console.log(`📝 New subscription (total: ${this.listeners.length})`);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      console.log(`📝 Unsubscription (remaining: ${this.listeners.length})`);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((callback, index) => {
      try {
        callback();
      } catch (error) {
        console.error(`❌ Error in notification callback ${index}:`, error);
      }
    });
  }

  // 🧪 Test functions
  async testNotifications(role: UserRole, userId: string) {
    console.log(`🧪 Testing notifications for ${role}`);
    
    // Add some test tasks
    this.addTask(role, {
      type: 'urgent',
      category: 'volunteer',
      title: 'Test notification',
      description: 'This is a test notification',
      count: 1,
      urgency: 'medium',
      action: 'Test',
      icon: 'Bell',
      color: 'blue'
    });

    // Generate real notifications
    await this.generateRealNotifications(role, userId);
    
    return this.getTasks(role);
  }

  // 📊 Statistics
  getStats(): Record<UserRole, { total: number; urgent: number; critical: number }> {
    const stats = {} as Record<UserRole, { total: number; urgent: number; critical: number }>;
    
    (['volunteer', 'team_director', 'organizer', 'admin'] as UserRole[]).forEach(role => {
      const tasks = this.getTasks(role);
      stats[role] = {
        total: tasks.length,
        urgent: tasks.filter(t => t.urgency === 'high').length,
        critical: tasks.filter(t => t.type === 'critical').length
      };
    });
    
    return stats;
  }

  // 🔄 Refresh
  async refresh(role: UserRole, userId: string) {
    console.log(`🔄 Refreshing notifications for ${role}`);
    await this.generateRealNotifications(role, userId);
  }
}