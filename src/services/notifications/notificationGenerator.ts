// src/services/notifications/notificationGenerator.ts - VERSION CORRIGÉE
import { NotificationService, UserRole } from './notificationService';

export const generateNotificationsFromData = (
  service: NotificationService, 
  role: UserRole, 
  volunteerShifts: any[], 
  performanceTeams: any[]
) => {
  console.log(`🔔 Generating notifications for ${role}:`, {
    volunteerShifts: volunteerShifts?.length || 0,
    performanceTeams: performanceTeams?.length || 0
  });

  // ✅ Validate input data
  if (!Array.isArray(volunteerShifts)) volunteerShifts = [];
  if (!Array.isArray(performanceTeams)) performanceTeams = [];

  try {
    // 🔥 ADMIN/ORGANIZER NOTIFICATIONS
    if (role === 'organizer' || role === 'admin') {
      generateManagerNotifications(service, role, volunteerShifts, performanceTeams);
    }

    // 🙋‍♀️ VOLUNTEER NOTIFICATIONS
    if (role === 'volunteer') {
      generateVolunteerNotifications(service, role, volunteerShifts);
    }

    // 💃 TEAM DIRECTOR NOTIFICATIONS
    if (role === 'team_director') {
      generateTeamDirectorNotifications(service, role, performanceTeams);
    }

  } catch (error) {
    console.error('Error generating notifications:', error);
  }
};

// ✅ Notifications for managers
const generateManagerNotifications = (
  service: NotificationService,
  role: UserRole,
  shifts: any[],
  teams: any[]
) => {
  // 🚨 SHIFTS WITHOUT VOLUNTEERS (CRITICAL)
  const emptyShifts = shifts.filter(shift => 
    shift?.status === 'live' && 
    (shift.current_volunteers === 0 || shift.current_volunteers == null)
  );
  
  if (emptyShifts.length > 0) {
    service.addTask(role, {
      type: 'critical',
      category: 'volunteer',
      title: `${emptyShifts.length} shifts without volunteers`,
      description: `Urgent shifts: ${emptyShifts.slice(0, 3).map(s => s.title || 'Untitled').join(', ')}${emptyShifts.length > 3 ? '...' : ''}`,
      count: emptyShifts.length,
      urgency: 'high',
      action: 'View shifts',
      icon: 'Users',
      color: 'red',
      relatedData: { shiftIds: emptyShifts.map(s => s.id) }
    });
  }

  // ⚠️ UNDERSTAFFED SHIFTS
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
      title: `${partialShifts.length} understaffed shifts`,
      description: `Shifts needing more volunteers (< 70% capacity)`,
      count: partialShifts.length,
      urgency: 'medium',
      action: 'Promote',
      icon: 'Users',
      color: 'orange',
      relatedData: { shiftIds: partialShifts.map(s => s.id) }
    });
  }

  // 🎵 TEAMS WITHOUT MUSIC
  const teamsWithoutMusic = teams.filter(team => 
    team && 
    (team.status === 'submitted' || team.status === 'approved') && 
    !team.music_file_url
  );
  
  if (teamsWithoutMusic.length > 0) {
    service.addTask(role, {
      type: 'urgent',
      category: 'team',
      title: `${teamsWithoutMusic.length} teams without music`,
      description: `Teams that still need to upload their music file`,
      count: teamsWithoutMusic.length,
      urgency: 'high',
      action: 'Contact teams',
      icon: 'Music',
      color: 'orange',
      relatedData: { teamIds: teamsWithoutMusic.map(t => t.id) }
    });
  }

  // 📋 TEAMS TO APPROVE
  const pendingTeams = teams.filter(team => team?.status === 'submitted');
  
  if (pendingTeams.length > 0) {
    service.addTask(role, {
      type: 'urgent', // CORRECTION: 'action' changé en 'urgent'
      category: 'approval',
      title: `${pendingTeams.length} teams to review`,
      description: `New submissions awaiting approval`,
      count: pendingTeams.length,
      urgency: 'medium',
      action: 'Review',
      icon: 'FileText',
      color: 'blue',
      relatedData: { teamIds: pendingTeams.map(t => t.id) }
    });
  }

  // 📊 DRAFTS TO PUBLISH
  const draftShifts = shifts.filter(shift => shift?.status === 'draft');
  
  if (draftShifts.length > 0) {
    service.addTask(role, {
      type: 'reminder',
      category: 'shift', // CORRECTION: 'event' changé en 'shift'
      title: `${draftShifts.length} draft shifts`,
      description: `Shifts ready to be published for volunteers`,
      count: draftShifts.length,
      urgency: 'low',
      action: 'Publish',
      icon: 'Calendar',
      color: 'blue',
      relatedData: { shiftIds: draftShifts.map(s => s.id) }
    });
  }
};

// ✅ Notifications for volunteers
const generateVolunteerNotifications = (
  service: NotificationService,
  role: UserRole,
  shifts: any[]
) => {
  // 🙋‍♀️ SHIFTS NEEDING HELP
  const urgentShifts = shifts.filter(shift => 
    shift?.status === 'live' && 
    shift.max_volunteers > 0 &&
    shift.current_volunteers < shift.max_volunteers * 0.5
  );
  
  if (urgentShifts.length > 0) {
    service.addTask(role, {
      type: 'urgent', // CORRECTION: 'opportunity' changé en 'urgent'
      category: 'shift',
      title: `${urgentShifts.length} shifts need help`,
      description: `Important shifts are short on volunteers. Your help is valuable!`,
      count: urgentShifts.length,
      urgency: 'medium',
      action: 'View shifts',
      icon: 'Users',
      color: 'green',
      relatedData: { shiftIds: urgentShifts.map(s => s.id) }
    });
  }

  // 📅 UPCOMING SHIFTS
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
      title: `${upcomingShifts.length} shifts this week`,
      description: `Shifts available in the next 3 days`,
      count: upcomingShifts.length,
      urgency: 'low',
      action: 'View schedule',
      icon: 'Calendar',
      color: 'blue',
      relatedData: { shiftIds: upcomingShifts.map(s => s.id) }
    });
  }
};

// ✅ Notifications for team directors
const generateTeamDirectorNotifications = (
  service: NotificationService,
  role: UserRole,
  teams: any[]
) => {
  // 💃 INCOMPLETE TEAMS
  const incompleteTeams = teams.filter(team => 
    team && 
    (team.status === 'draft' || team.status === 'submitted') && 
    !team.music_file_url
  );
  
  incompleteTeams.forEach(team => {
    service.addTask(role, {
      type: 'urgent',
      category: 'team', // CORRECTION: 'submission' changé en 'team'
      title: 'Missing music',
      description: `Your team "${team.team_name || 'Unnamed'}" needs to submit their music`,
      count: 1,
      urgency: 'high',
      action: 'Upload',
      icon: 'Music',
      color: 'red',
      relatedData: { teamId: team.id }
    });
  });

  // 📝 DRAFT TEAMS
  const draftTeams = teams.filter(team => team?.status === 'draft');
  
  if (draftTeams.length > 0) {
    service.addTask(role, {
      type: 'reminder',
      category: 'team', // CORRECTION: 'submission' changé en 'team'
      title: `${draftTeams.length} draft team(s)`,
      description: `Finalize and submit your teams for approval`,
      count: draftTeams.length,
      urgency: 'medium',
      action: 'Finalize',
      icon: 'FileText',
      color: 'orange',
      relatedData: { teamIds: draftTeams.map(t => t.id) }
    });
  }
};