// src/services/notifications/notificationGenerator.ts - VERSION CORRIGÉE
import { NotificationService, UserRole } from './notificationService';

export const generateNotificationsFromData = (
  service: NotificationService, 
  role: UserRole, 
  volunteerShifts: any[], 
  performanceTeams: any[]
) => {
  console.log(`🔔 Génération notifications pour ${role}:`, {
    volunteerShifts: volunteerShifts?.length || 0,
    performanceTeams: performanceTeams?.length || 0
  });

  // ✅ Validation des données d'entrée
  if (!Array.isArray(volunteerShifts)) volunteerShifts = [];
  if (!Array.isArray(performanceTeams)) performanceTeams = [];

  try {
    // 🔥 NOTIFICATIONS ADMIN/ORGANIZER
    if (role === 'organizer' || role === 'admin') {
      generateManagerNotifications(service, role, volunteerShifts, performanceTeams);
    }

    // 🙋‍♀️ NOTIFICATIONS BÉNÉVOLE
    if (role === 'volunteer') {
      generateVolunteerNotifications(service, role, volunteerShifts);
    }

    // 💃 NOTIFICATIONS TEAM DIRECTOR
    if (role === 'team_director') {
      generateTeamDirectorNotifications(service, role, performanceTeams);
    }

  } catch (error) {
    console.error('Erreur génération notifications:', error);
  }
};

// ✅ Notifications pour les gestionnaires
const generateManagerNotifications = (
  service: NotificationService,
  role: UserRole,
  shifts: any[],
  teams: any[]
) => {
  // 🚨 CRÉNEAUX SANS BÉNÉVOLES (CRITIQUE)
  const emptyShifts = shifts.filter(shift => 
    shift?.status === 'live' && 
    (shift.current_volunteers === 0 || shift.current_volunteers == null)
  );
  
  if (emptyShifts.length > 0) {
    service.addTask(role, {
      type: 'critical',
      category: 'volunteer',
      title: `${emptyShifts.length} créneaux sans bénévoles`,
      description: `Créneaux urgents: ${emptyShifts.slice(0, 3).map(s => s.title || 'Sans titre').join(', ')}${emptyShifts.length > 3 ? '...' : ''}`,
      count: emptyShifts.length,
      urgency: 'high',
      deadline: 'Action immédiate',
      action: 'Voir créneaux',
      icon: 'Users',
      color: 'red',
      relatedData: { shiftIds: emptyShifts.map(s => s.id) }
    });
  }

  // ⚠️ CRÉNEAUX SOUS-REMPLIS
  const partialShifts = shifts.filter(shift => 
    shift?.status === 'live' && 
    shift.current_volunteers > 0 && 
    shift.max_volunteers > 0 &&
    shift.current_volunteers < shift.max_volunteers * 0.7
  );
  
  if (partialShifts.length > 0) {
    service.addTask(role, {
      type: 'urgent',
      category: 'volunteer',
      title: `${partialShifts.length} créneaux sous-remplis`,
      description: `Créneaux nécessitant plus de bénévoles (< 70% de capacité)`,
      count: partialShifts.length,
      urgency: 'medium',
      deadline: 'À surveiller',
      action: 'Promouvoir',
      icon: 'Users',
      color: 'orange',
      relatedData: { shiftIds: partialShifts.map(s => s.id) }
    });
  }

  // 🎵 ÉQUIPES SANS MUSIQUE
  const teamsWithoutMusic = teams.filter(team => 
    team && 
    (team.status === 'submitted' || team.status === 'approved') && 
    !team.music_file_url
  );
  
  if (teamsWithoutMusic.length > 0) {
    service.addTask(role, {
      type: 'urgent',
      category: 'team',
      title: `${teamsWithoutMusic.length} équipes sans musique`,
      description: `Équipes qui doivent encore uploader leur fichier musical`,
      count: teamsWithoutMusic.length,
      urgency: 'high',
      deadline: 'Deadline proche',
      action: 'Contacter équipes',
      icon: 'Music',
      color: 'orange',
      relatedData: { teamIds: teamsWithoutMusic.map(t => t.id) }
    });
  }

  // 📋 ÉQUIPES À APPROUVER
  const pendingTeams = teams.filter(team => team?.status === 'submitted');
  
  if (pendingTeams.length > 0) {
    service.addTask(role, {
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
      relatedData: { teamIds: pendingTeams.map(t => t.id) }
    });
  }

  // 📊 BROUILLONS À PUBLIER
  const draftShifts = shifts.filter(shift => shift?.status === 'draft');
  
  if (draftShifts.length > 0) {
    service.addTask(role, {
      type: 'reminder',
      category: 'event',
      title: `${draftShifts.length} créneaux en brouillon`,
      description: `Créneaux prêts à être publiés pour les bénévoles`,
      count: draftShifts.length,
      urgency: 'low',
      deadline: 'Quand prêt',
      action: 'Publier',
      icon: 'Calendar',
      color: 'blue',
      relatedData: { shiftIds: draftShifts.map(s => s.id) }
    });
  }
};

// ✅ Notifications pour les bénévoles
const generateVolunteerNotifications = (
  service: NotificationService,
  role: UserRole,
  shifts: any[]
) => {
  // 🙋‍♀️ CRÉNEAUX AYANT BESOIN D'AIDE
  const urgentShifts = shifts.filter(shift => 
    shift?.status === 'live' && 
    shift.max_volunteers > 0 &&
    shift.current_volunteers < shift.max_volunteers * 0.5
  );
  
  if (urgentShifts.length > 0) {
    service.addTask(role, {
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
      relatedData: { shiftIds: urgentShifts.map(s => s.id) }
    });
  }

  // 📅 CRÉNEAUX BIENTÔT DISPONIBLES
  const upcomingShifts = shifts.filter(shift => {
    if (shift?.status !== 'live' || !shift.shift_date) return false;
    
    const shiftDate = new Date(shift.shift_date);
    const today = new Date();
    const diffDays = Math.ceil((shiftDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    return diffDays <= 3 && diffDays >= 0 && shift.current_volunteers < shift.max_volunteers;
  });

  if (upcomingShifts.length > 0) {
    service.addTask(role, {
      type: 'reminder',
      category: 'shift',
      title: `${upcomingShifts.length} créneaux cette semaine`,
      description: `Créneaux disponibles dans les 3 prochains jours`,
      count: upcomingShifts.length,
      urgency: 'low',
      deadline: 'Cette semaine',
      action: 'Voir planning',
      icon: 'Calendar',
      color: 'blue',
      relatedData: { shiftIds: upcomingShifts.map(s => s.id) }
    });
  }
};

// ✅ Notifications pour les directeurs d'équipe
const generateTeamDirectorNotifications = (
  service: NotificationService,
  role: UserRole,
  teams: any[]
) => {
  // 💃 ÉQUIPES INCOMPLÈTES
  const incompleteTeams = teams.filter(team => 
    team && 
    (team.status === 'draft' || team.status === 'submitted') && 
    !team.music_file_url
  );
  
  incompleteTeams.forEach(team => {
    service.addTask(role, {
      type: 'urgent',
      category: 'submission',
      title: 'Musique manquante',
      description: `Votre équipe "${team.team_name || 'Sans nom'}" doit soumettre sa musique`,
      count: 1,
      urgency: 'high',
      deadline: 'Deadline proche',
      action: 'Uploader',
      icon: 'Music',
      color: 'red',
      relatedData: { teamId: team.id }
    });
  });

  // 📝 ÉQUIPES EN BROUILLON
  const draftTeams = teams.filter(team => team?.status === 'draft');
  
  if (draftTeams.length > 0) {
    service.addTask(role, {
      type: 'reminder',
      category: 'submission',
      title: `${draftTeams.length} équipe(s) en brouillon`,
      description: `Finalisez et soumettez vos équipes pour approbation`,
      count: draftTeams.length,
      urgency: 'medium',
      deadline: 'Avant la deadline',
      action: 'Finaliser',
      icon: 'FileText',
      color: 'orange',
      relatedData: { teamIds: draftTeams.map(t => t.id) }
    });
  }
};