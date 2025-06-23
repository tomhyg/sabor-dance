// src/services/notifications/realNotificationGenerator.ts
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

  // 🔄 GÉNÉRATION COMPLÈTE DEPUIS LE BACKEND
  async generateAllNotifications(userRole: UserRole) {
    console.log(`🔔 Génération notifications RÉELLES pour ${userRole}`, this.options);

    try {
      // 📊 Charger les données réelles depuis Supabase
      const [shiftsData, teamsData] = await Promise.all([
        this.loadShiftsData(),
        this.loadTeamsData()
      ]);

      // 🔄 Effacer les anciennes notifications
      this.notificationService.clearAllTasks(userRole);

      // 🎯 Générer selon le rôle
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
        case 'assistant':
          await this.generateAssistantNotifications(userRole, shiftsData, teamsData);
          break;
      }

      console.log(`✅ Notifications générées pour ${userRole}`);
    } catch (error) {
      console.error('❌ Erreur génération notifications:', error);
    }
  }

  // 📊 CHARGEMENT DES DONNÉES SHIFTS
  private async loadShiftsData() {
    try {
      const { data: shifts, error } = await volunteerService.getShifts(this.options.eventId);
      
      if (error) throw error;
      return shifts || [];
    } catch (error) {
      console.error('Erreur chargement shifts:', error);
      return [];
    }
  }

  // 📊 CHARGEMENT DES DONNÉES ÉQUIPES
  private async loadTeamsData() {
    try {
      const result = await teamService.getTeamsByEvent(this.options.eventId);
      
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    } catch (error) {
      console.error('Erreur chargement équipes:', error);
      return [];
    }
  }

  // 👨‍💼 NOTIFICATIONS ORGANIZER/ADMIN
  private async generateOrganizerNotifications(role: UserRole, shifts: any[], teams: any[]) {
    // 🚨 CRÉNEAUX CRITIQUES SANS BÉNÉVOLES
    const emptyShifts = shifts.filter(shift => 
      shift.status === 'live' && 
      (shift.current_volunteers === 0 || !shift.current_volunteers)
    );

    if (emptyShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'critical',
        category: 'volunteer',
        title: `${emptyShifts.length} créneaux sans bénévoles`,
        description: `URGENT: ${emptyShifts.slice(0, 3).map(s => s.title).join(', ')}${emptyShifts.length > 3 ? '...' : ''}`,
        count: emptyShifts.length,
        urgency: 'high',
        deadline: 'Action immédiate',
        action: 'Assigner maintenant',
        icon: 'Users',
        color: 'red',
        relatedData: { 
          shiftIds: emptyShifts.map(s => s.id),
          shifts: emptyShifts.map(s => ({ id: s.id, title: s.title, date: s.shift_date }))
        }
      });
    }

    // ⚠️ CRÉNEAUX SOUS-REMPLIS (<70%)
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
        title: `${underStaffedShifts.length} créneaux sous-remplis`,
        description: `Créneaux à moins de 70% de capacité`,
        count: underStaffedShifts.length,
        urgency: 'medium',
        deadline: 'À surveiller',
        action: 'Voir détails',
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

    // 🎵 ÉQUIPES SANS MUSIQUE
    const teamsWithoutMusic = teams.filter(team => 
      ['submitted', 'approved'].includes(team.status) && 
      !team.music_file_url
    );

    if (teamsWithoutMusic.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'team',
        title: `${teamsWithoutMusic.length} équipes sans musique`,
        description: `Équipes approuvées qui n'ont pas encore uploadé leur musique`,
        count: teamsWithoutMusic.length,
        urgency: 'high',
        deadline: 'Deadline approche',
        action: 'Contacter équipes',
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

    // 📋 ÉQUIPES À APPROUVER
    const pendingTeams = teams.filter(team => team.status === 'submitted');

    if (pendingTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'action',
        category: 'approval',
        title: `${pendingTeams.length} équipes à examiner`,
        description: `Nouvelles soumissions en attente d'approbation`,
        count: pendingTeams.length,
        urgency: 'medium',
        deadline: 'À traiter sous 48h',
        action: 'Examiner',
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

    // 📊 BROUILLONS À PUBLIER
    const draftShifts = shifts.filter(shift => shift.status === 'draft');

    if (draftShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder',
        category: 'event',
        title: `${draftShifts.length} créneaux en brouillon`,
        description: `Créneaux prêts à être publiés`,
        count: draftShifts.length,
        urgency: 'low',
        deadline: 'Quand prêt',
        action: 'Publier',
        icon: 'Calendar',
        color: 'blue',
        relatedData: { 
          shiftIds: draftShifts.map(s => s.id),
          shifts: draftShifts.map(s => ({ id: s.id, title: s.title, date: s.shift_date }))
        }
      });
    }

    // 📈 STATISTIQUES GÉNÉRALES
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
        type: 'info',
        category: 'event',
        title: `Taux de remplissage: ${fillRate}%`,
        description: `${totalVolunteersAssigned}/${totalVolunteersNeeded} bénévoles assignés`,
        count: 1,
        urgency: fillRate < 60 ? 'high' : 'medium',
        deadline: 'Objectif 80%+',
        action: 'Voir dashboard',
        icon: 'BarChart3',
        color: fillRate < 60 ? 'red' : 'orange',
        relatedData: { 
          stats: { totalNeeded: totalVolunteersNeeded, totalAssigned: totalVolunteersAssigned, fillRate }
        }
      });
    }
  }

  // 🙋‍♀️ NOTIFICATIONS BÉNÉVOLES
  private async generateVolunteerNotifications(role: UserRole, shifts: any[]) {
    // Récupérer les inscriptions du bénévole
    let userSignups: any[] = [];
    if (this.options.currentUserId) {
      try {
        const { data } = await volunteerService.getVolunteerSignups(
          this.options.currentUserId, 
          this.options.eventId
        );
        userSignups = data || [];
      } catch (error) {
        console.error('Erreur chargement inscriptions:', error);
      }
    }

    // 🆘 CRÉNEAUX AYANT BESOIN D'AIDE
    const urgentShifts = shifts.filter(shift => 
      shift.status === 'live' && 
      shift.max_volunteers > 0 &&
      (shift.current_volunteers || 0) < shift.max_volunteers * 0.5
    );

    if (urgentShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'opportunity',
        category: 'shift',
        title: `${urgentShifts.length} créneaux ont besoin d'aide`,
        description: `Des créneaux importants manquent de bénévoles. Votre aide est précieuse !`,
        count: urgentShifts.length,
        urgency: 'medium',
        deadline: 'Inscrivez-vous !',
        action: 'Voir créneaux',
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

    // ⏰ RAPPELS MES CRÉNEAUX
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
        title: `${myUpcomingShifts.length} créneaux cette semaine`,
        description: `N'oubliez pas vos créneaux à venir`,
        count: myUpcomingShifts.length,
        urgency: 'medium',
        deadline: 'Prochains jours',
        action: 'Voir mes créneaux',
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

    // 📊 PROGRÈS HEURES REQUISES
    const eventData = await this.getEventRequirements();
    const completedHours = this.calculateCompletedHours(userSignups, shifts);
    const requiredHours = eventData?.required_volunteer_hours || 8;

    if (completedHours < requiredHours) {
      const remainingHours = requiredHours - completedHours;
      this.notificationService.addTask(role, {
        type: 'info',
        category: 'hours',
        title: `${remainingHours}h restantes`,
        description: `Vous avez complété ${completedHours}h sur ${requiredHours}h requises`,
        count: 1,
        urgency: remainingHours > 4 ? 'low' : 'medium',
        deadline: remainingHours > 4 ? 'Pas urgent' : 'Bientôt requis',
        action: 'Voir créneaux disponibles',
        icon: 'Clock',
        color: remainingHours > 4 ? 'blue' : 'orange',
        relatedData: { 
          progress: { completed: completedHours, required: requiredHours, remaining: remainingHours }
        }
      });
    }
  }

  // 💃 NOTIFICATIONS TEAM DIRECTOR
  private async generateTeamDirectorNotifications(role: UserRole, teams: any[]) {
    // Filtrer les équipes du directeur actuel
    const myTeams = teams.filter(team => 
      team.created_by === this.options.currentUserId || 
      team.director_email === this.getCurrentUserEmail()
    );

    // 🎵 ÉQUIPES SANS MUSIQUE
    const teamsNeedingMusic = myTeams.filter(team => 
      ['draft', 'submitted'].includes(team.status) && !team.music_file_url
    );

    teamsNeedingMusic.forEach(team => {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'submission',
        title: 'Musique manquante',
        description: `Votre équipe "${team.team_name}" doit soumettre sa musique`,
        count: 1,
        urgency: 'high',
        deadline: 'Deadline proche',
        action: 'Uploader musique',
        icon: 'Music',
        color: 'red',
        relatedData: { teamId: team.id, teamName: team.team_name }
      });
    });

    // 📋 ÉQUIPES EN BROUILLON
    const draftTeams = myTeams.filter(team => team.status === 'draft');

    if (draftTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'reminder',
        category: 'submission',
        title: `${draftTeams.length} équipe(s) en brouillon`,
        description: 'Finalisez et soumettez vos équipes pour approbation',
        count: draftTeams.length,
        urgency: 'medium',
        deadline: 'Avant deadline',
        action: 'Finaliser équipes',
        icon: 'FileText',
        color: 'orange',
        relatedData: { 
          teams: draftTeams.map(t => ({ id: t.id, name: t.team_name }))
        }
      });
    }

    // ✅ ÉQUIPES APPROUVÉES
    const approvedTeams = myTeams.filter(team => team.status === 'approved');

    if (approvedTeams.length > 0) {
      this.notificationService.addTask(role, {
        type: 'info',
        category: 'status',
        title: `${approvedTeams.length} équipe(s) approuvée(s)`,
        description: 'Félicitations ! Vos équipes sont confirmées',
        count: approvedTeams.length,
        urgency: 'low',
        deadline: 'Aucune action requise',
        action: 'Voir détails',
        icon: 'CheckCircle',
        color: 'green',
        relatedData: { 
          teams: approvedTeams.map(t => ({ id: t.id, name: t.team_name }))
        }
      });
    }
  }

  // 👥 NOTIFICATIONS ASSISTANT
  private async generateAssistantNotifications(role: UserRole, shifts: any[], teams: any[]) {
    // Mix entre organizer et volunteer selon les responsabilités
    const urgentShifts = shifts.filter(shift => 
      shift.status === 'live' && (shift.current_volunteers || 0) === 0
    );

    if (urgentShifts.length > 0) {
      this.notificationService.addTask(role, {
        type: 'urgent',
        category: 'volunteer',
        title: `${urgentShifts.length} créneaux critiques`,
        description: 'Créneaux sans bénévoles nécessitant attention',
        count: urgentShifts.length,
        urgency: 'high',
        deadline: 'À traiter',
        action: 'Voir créneaux',
        icon: 'Users',
        color: 'orange',
        relatedData: { shiftIds: urgentShifts.map(s => s.id) }
      });
    }
  }

  // 🔧 MÉTHODES UTILITAIRES
  private async getEventRequirements() {
    // TODO: Implémenter récupération depuis events table
    return { required_volunteer_hours: 8 };
  }

  private calculateCompletedHours(signups: any[], shifts: any[]): number {
    return signups
      .filter(signup => signup.status === 'checked_in')
      .map(signup => {
        const shift = shifts.find(s => s.id === signup.shift_id);
        if (!shift) return 0;
        
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // heures
      })
      .reduce((sum, hours) => sum + hours, 0);
  }

  private getCurrentUserEmail(): string {
    // TODO: Récupérer depuis le contexte d'auth
    return '';
  }
}

// 🔄 FONCTION D'EXPORT POUR INTÉGRATION
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
