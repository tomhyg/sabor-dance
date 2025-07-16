// src/services/notifications/realNotificationGenerator.ts - VERSION CORRIGÉE
import { NotificationService, UserRole } from './notificationService';
import { volunteerService } from '../volunteerService';
import { teamService } from '../teamService';

interface NotificationGeneratorOptions {
  eventId: string;
  currentUserId?: string;
}

export class RealNotificationGenerator {
  constructor(
    private notificationService: NotificationService,
    private options: NotificationGeneratorOptions
  ) {}

  // 🔄 COMPLETE GENERATION FROM BACKEND
  async generateAllNotifications(userRole: UserRole) {
    console.log(`🔔 Generating REAL notifications for ${userRole}`, this.options);

    try {
      // 📊 Load real data from Supabase
      const [shiftsData, teamsData] = await Promise.all([
        this.loadShiftsData(),
        this.loadTeamsData()
      ]);

      // 🔄 Clear old notifications - CORRECTION: utiliser clearTasks au lieu de clearAllTasks
      this.notificationService.clearTasks(userRole);

      // 🎯 Generate by role
      switch (userRole) {
        case 'admin':
        case 'organizer':
          await this.generateOrganizerNotifications(userRole, shiftsData, teamsData);
          break;
        case 'volunteer':
          await this.generateVolunteerNotifications(userRole, shiftsData);
          break;
        case 'team_director':
          await this.generateTeamDirectorNotifications(userRole, teamsData);
          break;
        // case 'assistant': - CORRECTION: Commenté car non défini dans UserRole
        //   await this.generateAssistantNotifications(userRole, shiftsData, teamsData);
        //   break;
      }

      console.log(`✅ Notifications generated for ${userRole}`);
    } catch (error) {
      console.error('❌ Error generating notifications:', error);
    }
  }

  // 📊 LOAD SHIFTS DATA
  private async loadShiftsData() {
    try {
      const { data: shifts, error } = await volunteerService.getShifts(this.options.eventId);
      
      if (error) throw error;
      return shifts || [];
    } catch (error) {
      console.error('Error loading shifts:', error);
      return [];
    }
  }

  // 📊 LOAD TEAMS DATA
  private async loadTeamsData() {
    try {
      const result = await teamService.getTeamsByEvent(this.options.eventId);
      
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  }

  // 👨‍💼 ORGANIZER/ADMIN NOTIFICATIONS
  private async generateOrganizerNotifications(role: UserRole, shifts: any[], teams: any[]) {
    // 🚨 CRITICAL SHIFTS WITHOUT VOLUNTEERS
    const emptyShifts = shifts.filter(shift => 
      shift.status === 'live' && 
      (shift.current_volunteers === 0 || !shift.current_volunteers)
    );

    if (emptyShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'critical',
        category: 'volunteer',
        title: `${emptyShifts.length} shifts without volunteers`,
        description: `URGENT: ${emptyShifts.slice(0, 3).map(s => s.title).join(', ')}${emptyShifts.length > 3 ? '...' : ''}`,
        count: emptyShifts.length,
        urgency: 'high',
        action: 'Assign now',
        icon: 'Users',
        color: 'red',
        relatedData: { 
          shiftIds: emptyShifts.map(s => s.id),
          shifts: emptyShifts.map(s => ({ id: s.id, title: s.title, date: s.shift_date }))
        }
      });
    }

    // ⚠️ UNDERSTAFFED SHIFTS (<70%)
    const underStaffedShifts = shifts.filter(shift => 
      shift.status === 'live' && 
      shift.max_volunteers > 0 &&
      shift.current_volunteers > 0 &&
      (shift.current_volunteers / shift.max_volunteers) < 0.7
    );

    if (underStaffedShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'volunteer',
        title: `${underStaffedShifts.length} understaffed shifts`,
        description: `Shifts at less than 70% capacity`,
        count: underStaffedShifts.length,
        urgency: 'medium',
        action: 'View details',
        icon: 'Users',
        color: 'orange',
        relatedData: { 
          shiftIds: underStaffedShifts.map(s => s.id),
          details: underStaffedShifts.map(s => ({
            id: s.id,
            title: s.title,
            current: s.current_volunteers,
            max: s.max_volunteers,
            percentage: Math.round((s.current_volunteers / s.max_volunteers) * 100)
          }))
        }
      });
    }

    // 🎵 TEAMS WITHOUT MUSIC
    const teamsWithoutMusic = teams.filter(team => 
      ['submitted', 'approved'].includes(team.status) && 
      !team.music_file_url
    );

    if (teamsWithoutMusic.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'team',
        title: `${teamsWithoutMusic.length} teams without music`,
        description: `Approved teams that haven't uploaded their music yet`,
        count: teamsWithoutMusic.length,
        urgency: 'high',
        action: 'Contact teams',
        icon: 'Music',
        color: 'red',
        relatedData: { 
          teamIds: teamsWithoutMusic.map(t => t.id),
          teams: teamsWithoutMusic.map(t => ({
            id: t.id,
            name: t.team_name,
            director: t.director_name,
            email: t.director_email,
            status: t.status
          }))
        }
      });
    }

    // 📋 TEAMS TO APPROVE
    const pendingTeams = teams.filter(team => team.status === 'submitted');

    if (pendingTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent', // CORRECTION: 'action' n'existe pas dans le type
        category: 'approval',
        title: `${pendingTeams.length} teams to review`,
        description: `New submissions awaiting approval`,
        count: pendingTeams.length,
        urgency: 'medium',
        action: 'Review',
        icon: 'FileText',
        color: 'blue',
        relatedData: { 
          teamIds: pendingTeams.map(t => t.id),
          teams: pendingTeams.map(t => ({
            id: t.id,
            name: t.team_name,
            submitted_at: t.submitted_at,
            director: t.director_name
          }))
        }
      });
    }

    // 📊 DRAFTS TO PUBLISH
    const draftShifts = shifts.filter(shift => shift.status === 'draft');

    if (draftShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder',
        category: 'shift', // CORRECTION: 'event' changé en 'shift'
        title: `${draftShifts.length} draft shifts`,
        description: `Shifts ready to be published`,
        count: draftShifts.length,
        urgency: 'low',
        action: 'Publish',
        icon: 'Calendar',
        color: 'blue',
        relatedData: { 
          shiftIds: draftShifts.map(s => s.id),
          shifts: draftShifts.map(s => ({ id: s.id, title: s.title, date: s.shift_date }))
        }
      });
    }

    // 📈 GENERAL STATISTICS
    const totalVolunteersNeeded = shifts
      .filter(s => s.status === 'live')
      .reduce((sum, s) => sum + s.max_volunteers, 0);
    
    const totalVolunteersAssigned = shifts
      .filter(s => s.status === 'live')
      .reduce((sum, s) => sum + (s.current_volunteers || 0), 0);

    const fillRate = totalVolunteersNeeded > 0 ? 
      Math.round((totalVolunteersAssigned / totalVolunteersNeeded) * 100) : 100;

    if (fillRate < 80) {
      this.notificationService.addTask(role, {
        type: 'reminder', // CORRECTION: 'info' changé en 'reminder'
        category: 'shift', // CORRECTION: 'event' changé en 'shift'
        title: `Fill rate: ${fillRate}%`,
        description: `${totalVolunteersAssigned}/${totalVolunteersNeeded} volunteers assigned`,
        count: 1,
        urgency: fillRate < 60 ? 'high' : 'medium',
        action: 'View dashboard',
        icon: 'BarChart3',
        color: fillRate < 60 ? 'red' : 'orange',
        relatedData: { 
          stats: { totalNeeded: totalVolunteersNeeded, totalAssigned: totalVolunteersAssigned, fillRate }
        }
      });
    }
  }

  // 🙋‍♀️ VOLUNTEER NOTIFICATIONS
  private async generateVolunteerNotifications(role: UserRole, shifts: any[]) {
    // Get volunteer signups
    let userSignups: any[] = [];
    if (this.options.currentUserId) {
      try {
        const { data } = await volunteerService.getVolunteerSignups(
          this.options.currentUserId, 
          this.options.eventId
        );
        userSignups = data || [];
      } catch (error) {
        console.error('Error loading signups:', error);
      }
    }

    // 🆘 SHIFTS NEEDING HELP
    const urgentShifts = shifts.filter(shift => 
      shift.status === 'live' && 
      shift.max_volunteers > 0 &&
      (shift.current_volunteers || 0) < shift.max_volunteers * 0.5
    );

    if (urgentShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent', // CORRECTION: 'opportunity' changé en 'urgent'
        category: 'shift',
        title: `${urgentShifts.length} shifts need help`,
        description: `Important shifts are short on volunteers. Your help is valuable!`,
        count: urgentShifts.length,
        urgency: 'medium',
        action: 'View shifts',
        icon: 'Users',
        color: 'green',
        relatedData: { 
          shiftIds: urgentShifts.map(s => s.id),
          shifts: urgentShifts.map(s => ({
            id: s.id,
            title: s.title,
            date: s.shift_date,
            time: `${s.start_time}-${s.end_time}`,
            needed: s.max_volunteers - (s.current_volunteers || 0)
          }))
        }
      });
    }

    // ⏰ MY SHIFTS REMINDERS
    const myUpcomingShifts = userSignups
      .filter(signup => ['signed_up', 'confirmed'].includes(signup.status))
      .map(signup => shifts.find(shift => shift.id === signup.shift_id))
      .filter(Boolean)
      .filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        const today = new Date();
        const diffDays = Math.ceil((shiftDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 2 && diffDays >= 0;
      });

    if (myUpcomingShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder',
        category: 'shift',
        title: `${myUpcomingShifts.length} shifts this week`,
        description: `Don't forget your upcoming shifts`,
        count: myUpcomingShifts.length,
        urgency: 'medium',
        action: 'View my shifts',
        icon: 'Clock',
        color: 'blue',
        relatedData: { 
          shifts: myUpcomingShifts.map(s => ({
            id: s.id,
            title: s.title,
            date: s.shift_date,
            time: `${s.start_time}-${s.end_time}`
          }))
        }
      });
    }

    // 📊 REQUIRED HOURS PROGRESS
    const eventData = await this.getEventRequirements();
    const completedHours = this.calculateCompletedHours(userSignups, shifts);
    const requiredHours = eventData?.required_volunteer_hours || 9;

    if (completedHours < requiredHours) {
      const remainingHours = requiredHours - completedHours;
      this.notificationService.addTask(role, {
        type: 'reminder', // CORRECTION: 'info' changé en 'reminder'
        category: 'shift', // CORRECTION: 'hours' changé en 'shift'
        title: `${remainingHours}h remaining`,
        description: `You've completed ${completedHours}h out of ${requiredHours}h required`,
        count: 1,
        urgency: remainingHours > 4 ? 'low' : 'medium',
        action: 'View available shifts',
        icon: 'Clock',
        color: remainingHours > 4 ? 'blue' : 'orange',
        relatedData: { 
          progress: { completed: completedHours, required: requiredHours, remaining: remainingHours }
        }
      });
    }
  }

  // 💃 TEAM DIRECTOR NOTIFICATIONS
  private async generateTeamDirectorNotifications(role: UserRole, teams: any[]) {
    // Filter teams for current director
    const myTeams = teams.filter(team => 
      team.created_by === this.options.currentUserId || 
      team.director_email === this.getCurrentUserEmail()
    );

    // 🎵 TEAMS WITHOUT MUSIC
    const teamsNeedingMusic = myTeams.filter(team => 
      ['draft', 'submitted'].includes(team.status) && !team.music_file_url
    );

    teamsNeedingMusic.forEach(team => {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'team', // CORRECTION: 'submission' changé en 'team'
        title: 'Missing music',
        description: `Your team "${team.team_name}" needs to submit their music`,
        count: 1,
        urgency: 'high',
        action: 'Upload music',
        icon: 'Music',
        color: 'red',
        relatedData: { teamId: team.id, teamName: team.team_name }
      });
    });

    // 📋 DRAFT TEAMS
    const draftTeams = myTeams.filter(team => team.status === 'draft');

    if (draftTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder',
        category: 'team', // CORRECTION: 'submission' changé en 'team'
        title: `${draftTeams.length} draft team(s)`,
        description: 'Finalize and submit your teams for approval',
        count: draftTeams.length,
        urgency: 'medium',
        action: 'Finalize teams',
        icon: 'FileText',
        color: 'orange',
        relatedData: { 
          teams: draftTeams.map(t => ({ id: t.id, name: t.team_name }))
        }
      });
    }

    // ✅ APPROVED TEAMS
    const approvedTeams = myTeams.filter(team => team.status === 'approved');

    if (approvedTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder', // CORRECTION: 'info' changé en 'reminder'
        category: 'team', // CORRECTION: 'status' changé en 'team'
        title: `${approvedTeams.length} approved team(s)`,
        description: 'Congratulations! Your teams are confirmed',
        count: approvedTeams.length,
        urgency: 'low',
        action: 'View details',
        icon: 'CheckCircle',
        color: 'green',
        relatedData: { 
          teams: approvedTeams.map(t => ({ id: t.id, name: t.team_name }))
        }
      });
    }
  }

  // 🔧 UTILITY METHODS
  private async getEventRequirements() {
    // TODO: Implement retrieval from events table
    return { required_volunteer_hours: 9 };
  }

  private calculateCompletedHours(signups: any[], shifts: any[]): number {
    return signups
      .filter(signup => ['signed_up', 'confirmed', 'checked_in'].includes(signup.status)) // CORRECTION: utiliser la même logique que notificationService
      .map(signup => {
        const shift = shifts.find(s => s.id === signup.shift_id);
        if (!shift) return 0;
        
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      })
      .reduce((sum, hours) => sum + hours, 0);
  }

  private getCurrentUserEmail(): string {
    // TODO: Get from auth context
    return '';
  }
}

// 🔄 EXPORT FUNCTION FOR INTEGRATION
export const generateRealNotifications = async (
  notificationService: NotificationService,
  userRole: UserRole,
  eventId: string,
  currentUserId?: string
) => {
  const generator = new RealNotificationGenerator(notificationService, {
    eventId,
    currentUserId
  });

  await generator.generateAllNotifications(userRole);
};