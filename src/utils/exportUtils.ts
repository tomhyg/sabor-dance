import * as XLSX from 'xlsx';

// Types pour les données d'export
interface ExportVolunteerData {
  shift_title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  current_volunteers: number;
  status: string;
  description: string;
  volunteers: {
    name: string;
    email: string;
    phone?: string;
    status: string;
    remaining_hours: number;
    signed_up_date: string;
  }[];
}

interface ExportTeamData {
  team_name: string;
  director_name: string;
  director_email: string;
  studio_name: string;
  city: string;
  country: string;
  group_size: number;
  dance_styles: string[];
  song_title: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  video_url?: string;
  performance_order?: number;
  organizer_notes?: string;
}

// Fonctions utilitaires
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'draft': 'Brouillon',
    'live': 'Publié', 
    'full': 'Complet',
    'cancelled': 'Annulé'
  };
  return labels[status] || status;
};

const getTeamStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'draft': 'Brouillon',
    'submitted': 'Soumise',
    'approved': 'Approuvée',
    'rejected': 'Rejetée'
  };
  return labels[status] || status;
};

const calculateRemainingHours = (volunteerId: string, volunteerSignups: any[], volunteerShifts: any[]): number => {
  const requiredHours = 8;
  const userSignups = volunteerSignups.filter(signup => 
    signup.volunteer_id === volunteerId && signup.status !== 'cancelled'
  );
  
  const completedHours = userSignups.reduce((total, signup) => {
    const shift = volunteerShifts.find(s => s.id === signup.shift_id);
    if (shift) {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }
    return total;
  }, 0);
  
  return Math.max(0, requiredHours - completedHours);
};
// Export spécifique pour la vue grille
export const exportGridToExcel = (
  volunteerShifts: any[],
  volunteerSignups: any[],
  volunteers: any[] = [],
  selectedWeek: Date = new Date() // 🆕 PARAMÈTRE OPTIONNEL
) => {
  const workbook = XLSX.utils.book_new();
  
  // 1. CRÉER LA GRILLE HEBDOMADAIRE
  const getWeekDates = (date: Date = new Date()) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedWeek); // 🆕 UTILISER selectedWeek
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Filtrer les créneaux pour la semaine sélectionnée uniquement
  const weekStartStr = weekDates[0].toISOString().split('T')[0];
  const weekEndStr = weekDates[6].toISOString().split('T')[0];
  
  const weekShifts = volunteerShifts.filter(shift => {
    return shift.shift_date >= weekStartStr && shift.shift_date <= weekEndStr;
  });

  // Grouper par type de rôle et horaires (UNIQUEMENT pour cette semaine)
  const timeBlocks = new Map();
  weekShifts.forEach(shift => {
    const key = `${shift.role_type}_${shift.start_time}-${shift.end_time}`;
    if (!timeBlocks.has(key)) {
      timeBlocks.set(key, {
        role_type: shift.role_type,
        time_range: `${shift.start_time}-${shift.end_time}`,
        title: shift.title,
        shifts_by_date: new Map()
      });
    }
    timeBlocks.get(key).shifts_by_date.set(shift.shift_date, shift);
  });

  // 2. DONNÉES DE LA GRILLE
  const gridData = [
    ['📊 GRILLE PLANNING BÉNÉVOLES - BOSTON SALSA FESTIVAL 2025'],
    ['Période:', `${weekDates[0].toLocaleDateString('fr-FR')} - ${weekDates[6].toLocaleDateString('fr-FR')}`],
    ['Généré le:', new Date().toLocaleDateString('fr-FR')],
    [''],
    // Header avec les jours
    ['Créneaux / Jours', ...daysOfWeek]
  ];

  // Ajouter chaque bloc de temps
  Array.from(timeBlocks.values()).forEach(block => {
    const row = [
      `${block.time_range}\n${block.title}\n(${block.role_type.replace('_', ' ')})`
    ];
    
    // Pour chaque jour de la semaine
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const shift = block.shifts_by_date.get(dateStr);
      
      if (shift) {
        const fillRate = shift.current_volunteers / shift.max_volunteers;
        const ratio = `${shift.current_volunteers}/${shift.max_volunteers}`;
        const status = fillRate === 0 ? '🔴' : fillRate < 0.8 ? '🟡' : '🟢';
        row.push(`${status} ${ratio}`);
      } else {
        row.push('-');
      }
    });
    
    gridData.push(row);
  });

  // Ajouter la légende
  gridData.push(['']);
  gridData.push(['LÉGENDE:']);
  gridData.push(['🔴 = Vide (0-30%)', '🟡 = Partiel (31-80%)', '🟢 = Complet (81-100%)']);

  const gridSheet = XLSX.utils.aoa_to_sheet(gridData);
  XLSX.utils.book_append_sheet(workbook, gridSheet, 'Grille Hebdomadaire');

  // 3. FEUILLE DÉTAILS PAR CRÉNEAU (UNIQUEMENT SEMAINE SÉLECTIONNÉE)
  const detailsData = [
    ['DÉTAILS PAR CRÉNEAU - SEMAINE SÉLECTIONNÉE'],
    [''],
    ['Créneau', 'Date', 'Horaire', 'Rôle', 'Inscrits/Max', 'Statut', 'Bénévoles Inscrits', 'Emails']
  ];

  weekShifts.forEach(shift => {
    const shiftSignups = volunteerSignups.filter(signup => 
      signup.shift_id === shift.id && signup.status !== 'cancelled'
    );
    
    const volunteerNames = shiftSignups.map(signup => {
      const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
      return volunteer?.full_name || `ID: ${signup.volunteer_id}`;
    }).join(', ') || 'Aucun';
    
    const volunteerEmails = shiftSignups.map(signup => {
      const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
      return volunteer?.email || '';
    }).join(', ');

    const fillRate = shift.current_volunteers / shift.max_volunteers;
    const statusText = fillRate === 0 ? 'VIDE 🔴' : fillRate < 0.8 ? 'PARTIEL 🟡' : 'COMPLET 🟢';

    detailsData.push([
      shift.title,
      new Date(shift.shift_date).toLocaleDateString('fr-FR'),
      `${shift.start_time} - ${shift.end_time}`,
      shift.role_type.replace('_', ' '),
      `${shift.current_volunteers}/${shift.max_volunteers}`,
      statusText,
      volunteerNames,
      volunteerEmails
    ]);
  });

  const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Détails Créneaux');

  // 4. FEUILLE ACTIONS URGENTES (UNIQUEMENT SEMAINE SÉLECTIONNÉE)
  const urgentData = [
    ['🚨 ACTIONS URGENTES REQUISES - SEMAINE SÉLECTIONNÉE'],
    [''],
    ['CRÉNEAUX VIDES (Action immédiate requise)'],
    ['Créneau', 'Date', 'Horaire', 'Bénévoles Manquants', 'Contact Urgence']
  ];

  const emptyShifts = weekShifts.filter(shift => shift.current_volunteers === 0 && shift.status === 'live');
  emptyShifts.forEach(shift => {
    urgentData.push([
      shift.title,
      new Date(shift.shift_date).toLocaleDateString('fr-FR'),
      `${shift.start_time} - ${shift.end_time}`,
      `${shift.max_volunteers} bénévoles requis`,
      'hernan@bostonsalsafest.com' // Contact organisateur
    ]);
  });

  urgentData.push(['']);
  urgentData.push(['CRÉNEAUX CRITIQUES (< 50% remplis)']);
  urgentData.push(['Créneau', 'Date', 'Horaire', 'Statut', 'Action']);

  const criticalShifts = weekShifts.filter(shift => {
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    return fillRate > 0 && fillRate < 0.5 && shift.status === 'live';
  });

  criticalShifts.forEach(shift => {
    const missing = shift.max_volunteers - shift.current_volunteers;
    urgentData.push([
      shift.title,
      new Date(shift.shift_date).toLocaleDateString('fr-FR'),
      `${shift.start_time} - ${shift.end_time}`,
      `${shift.current_volunteers}/${shift.max_volunteers}`,
      `Recruter ${missing} bénévoles`
    ]);
  });

  const urgentSheet = XLSX.utils.aoa_to_sheet(urgentData);
  XLSX.utils.book_append_sheet(workbook, urgentSheet, 'Actions Urgentes');

  // Télécharger
  const filename = `grille_planning_BSF_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Fonction principale d'export des bénévoles
export const exportVolunteersToExcel = (
  volunteerShifts: any[],
  volunteerSignups: any[],
  volunteers: any[] = []
) => {
  // Créer le workbook
  const workbook = XLSX.utils.book_new();
  
  // 1. FEUILLE RÉSUMÉ
  const summaryData = [
    ['RAPPORT BÉNÉVOLES - BOSTON SALSA FESTIVAL 2025'],
    ['Généré le:', new Date().toLocaleDateString('fr-FR')],
    [],
    ['STATISTIQUES GÉNÉRALES'],
    ['Total créneaux:', volunteerShifts.length],
    ['Créneaux publiés:', volunteerShifts.filter(s => s.status === 'live').length],
    ['Créneaux complets:', volunteerShifts.filter(s => s.status === 'full').length],
    ['Total inscriptions:', volunteerSignups.filter(s => s.status !== 'cancelled').length],
    ['Total bénévoles uniques:', volunteers.length],
    [],
    ['CRÉNEAUX CRITIQUES (moins de 50% remplis)'],
    ['Titre', 'Date', 'Inscrits/Max', 'Pourcentage']
  ];
  
  // Ajouter les créneaux critiques
  const criticalShifts = volunteerShifts.filter(shift => 
    (shift.current_volunteers / shift.max_volunteers) < 0.5 && shift.status === 'live'
  );
  
  criticalShifts.forEach(shift => {
    summaryData.push([
      shift.title,
      new Date(shift.shift_date).toLocaleDateString('fr-FR'),
      `${shift.current_volunteers}/${shift.max_volunteers}`,
      `${Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%`
    ]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
  
  // 2. FEUILLE DÉTAIL DES CRÉNEAUX
  const detailHeaders = [
    'Titre Créneau',
    'Date',
    'Heure Début',
    'Heure Fin',
    'Bénévoles Max',
    'Inscrits',
    'Statut',
    'Description',
    'Bénévoles Inscrits (Noms)',
    'Emails des Bénévoles',
    'Téléphones'
  ];
  
  const detailRows = volunteerShifts.map(shift => {
    const shiftSignups = volunteerSignups.filter(signup => 
      signup.shift_id === shift.id && signup.status !== 'cancelled'
    );
    
    const volunteerNames = shiftSignups.map(signup => {
      const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
      return volunteer?.full_name || `ID: ${signup.volunteer_id}`;
    }).join('; ') || 'Aucun bénévole inscrit';
    
    const volunteerEmails = shiftSignups.map(signup => {
      const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
      return volunteer?.email || '';
    }).join('; ');
    
    const volunteerPhones = shiftSignups.map(signup => {
      const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
      return volunteer?.phone || '';
    }).join('; ');

    return [
      shift.title,
      new Date(shift.shift_date).toLocaleDateString('fr-FR'),
      shift.start_time,
      shift.end_time,
      shift.max_volunteers,
      shift.current_volunteers,
      getStatusLabel(shift.status),
      shift.description,
      volunteerNames,
      volunteerEmails,
      volunteerPhones
    ];
  });
  
  const detailData = [detailHeaders, ...detailRows];
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Détail Créneaux');
  
  // 3. FEUILLE LISTE DES BÉNÉVOLES
  const volunteerHeaders = [
    'Nom Complet',
    'Email',
    'Téléphone',
    'Créneaux Inscrits',
    'Heures Complétées',
    'Heures Restantes',
    'Statut Progression',
    'Dernière Inscription'
  ];
  
  const volunteerRows = volunteers.map(volunteer => {
    const userSignups = volunteerSignups.filter(signup => 
      signup.volunteer_id === volunteer.id && signup.status !== 'cancelled'
    );
    
    const completedHours = userSignups.reduce((total, signup) => {
      const shift = volunteerShifts.find(s => s.id === signup.shift_id);
      if (shift) {
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      return total;
    }, 0);
    
    const remainingHours = Math.max(0, 8 - completedHours);
    const status = remainingHours === 0 ? 'Terminé ✅' : 
                  completedHours > 0 ? 'En cours 🟡' : 'Non commencé ⭕';
    
    const lastSignup = userSignups.length > 0 ? 
      new Date(Math.max(...userSignups.map(s => new Date(s.signed_up_at).getTime()))).toLocaleDateString('fr-FR') : 
      'Aucune';
    
    return [
      volunteer.full_name || volunteer.email,
      volunteer.email,
      volunteer.phone || 'Non renseigné',
      userSignups.length,
      Math.round(completedHours * 10) / 10,
      Math.round(remainingHours * 10) / 10,
      status,
      lastSignup
    ];
  });
  
  const volunteerData = [volunteerHeaders, ...volunteerRows];
  const volunteerSheet = XLSX.utils.aoa_to_sheet(volunteerData);
  XLSX.utils.book_append_sheet(workbook, volunteerSheet, 'Liste Bénévoles');
  
  // Télécharger le fichier
  const filename = `benevolat_BSF_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Fonction d'export des équipes
export const exportTeamsToExcel = (performanceTeams: any[]) => {
  const workbook = XLSX.utils.book_new();
  
  // 1. FEUILLE RÉSUMÉ
  const summaryData = [
    ['RAPPORT ÉQUIPES PERFORMANCE - BOSTON SALSA FESTIVAL 2025'],
    ['Généré le:', new Date().toLocaleDateString('fr-FR')],
    [],
    ['STATISTIQUES'],
    ['Total équipes:', performanceTeams.length],
    ['Approuvées:', performanceTeams.filter(t => t.status === 'approved').length],
    ['En attente:', performanceTeams.filter(t => t.status === 'submitted').length],
    ['Brouillons:', performanceTeams.filter(t => t.status === 'draft').length],
    ['Rejetées:', performanceTeams.filter(t => t.status === 'rejected').length],
    [],
    ['🚨 ÉQUIPES EN ATTENTE D\'ACTION (À TRAITER EN PRIORITÉ)'],
    ['Nom Équipe', 'Directeur', 'Email', 'Studio']
  ];
  
  // Ajouter les équipes en attente
  const pendingTeams = performanceTeams.filter(team => team.status === 'submitted');
  pendingTeams.forEach(team => {
    summaryData.push([team.team_name, team.director_name, team.director_email, team.studio_name]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
  
  // 2. FEUILLE DÉTAIL DE TOUTES LES ÉQUIPES
  const detailHeaders = [
    'Nom Équipe',
    'Directeur',
    'Email Directeur',
    'Studio',
    'Ville',
    'Pays',
    'Nb Membres',
    'Styles de Danse',
    'Titre Chanson',
    'Statut',
    'Vidéo URL',
    'Notes Organisateur',
    'Action Requise'
  ];
  
  const detailRows = performanceTeams.map(team => {
    let actionRequise = '';
    if (team.status === 'submitted') actionRequise = '👀 À RÉVISER';
    else if (team.status === 'approved' && !team.performance_order) actionRequise = '📋 ASSIGNER ORDRE';
    else if (team.status === 'approved') actionRequise = '✅ PRÊT';
    else if (team.status === 'rejected') actionRequise = '📧 CONTACTER';
    else actionRequise = '⏳ EN ATTENTE';
    
    return [
      team.team_name,
      team.director_name,
      team.director_email,
      team.studio_name,
      team.city,
      team.country,
      team.group_size,
      team.dance_styles.join(', '),
      team.song_title || 'Non spécifié',
      getTeamStatusLabel(team.status),
      team.performance_video_url || 'Non fournie',
      team.organizer_notes || 'Aucune note',
      actionRequise
    ];
  });
  
  const detailData = [detailHeaders, ...detailRows];
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Toutes les Équipes');
  
  // 3. FEUILLE ORDRE DE PASSAGE (équipes approuvées uniquement)
  const approvedTeams = performanceTeams.filter(t => t.status === 'approved');
  
  const showData = [
    ['🎭 ORDRE DE PASSAGE - SPECTACLE BOSTON SALSA FESTIVAL 2025'],
    ['Généré le:', new Date().toLocaleDateString('fr-FR')],
    [],
    ['INFORMATIONS SPECTACLE'],
    ['Total équipes approuvées:', approvedTeams.length],
    ['Durée estimée spectacle:', `${approvedTeams.length * 4} minutes`],
    [],
    ['ORDRE DE PASSAGE'],
    [
      'Ordre',
      'Nom Équipe',
      'Directeur',
      'Contact Directeur',
      'Titre Chanson',
      'Nb Danseurs',
      'Styles',
      'Notes Technique',
      'Statut Musique'
    ]
  ];
  
  const showRows = approvedTeams
    .sort((a, b) => (a.performance_order || 999) - (b.performance_order || 999))
    .map((team, index) => [
      team.performance_order || index + 1,
      team.team_name,
      team.director_name,
      team.director_email,
      team.song_title || '⚠️ MANQUANT',
      team.group_size,
      team.dance_styles.join(', '),
      team.organizer_notes || 'RAS',
      team.song_title ? '✅ OK' : '❌ MANQUANT'
    ]);
  
  showData.push(...showRows);
  
  const showSheet = XLSX.utils.aoa_to_sheet(showData);
  XLSX.utils.book_append_sheet(workbook, showSheet, 'Ordre Spectacle');
  
  // Télécharger
  const filename = `equipes_BSF_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Export rapide pour le dashboard (vue globale)
export const exportAllData = (
  volunteerShifts: any[],
  volunteerSignups: any[],
  volunteers: any[],
  performanceTeams: any[]
) => {
  const workbook = XLSX.utils.book_new();
  
  // Vue globale pour Hernan
  const globalSummary = [
    ['📊 RAPPORT COMPLET - BOSTON SALSA FESTIVAL 2025'],
    ['Généré le:', new Date().toLocaleDateString('fr-FR')],
    [''],
    ['═══════════════════════════════════════════'],
    ['🤝 BÉNÉVOLAT - RÉSUMÉ EXÉCUTIF'],
    ['═══════════════════════════════════════════'],
    ['Total créneaux bénévoles:', volunteerShifts.length],
    ['Total bénévoles inscrits:', volunteers.length],
    ['Créneaux critiques (< 50%):', volunteerShifts.filter(s => (s.current_volunteers / s.max_volunteers) < 0.5 && s.status === 'live').length],
    ['Créneaux complets:', volunteerShifts.filter(s => s.status === 'full').length],
    [''],
    ['🎭 ÉQUIPES PERFORMANCE - RÉSUMÉ EXÉCUTIF'],
    ['═══════════════════════════════════════════'],
    ['Total équipes soumises:', performanceTeams.length],
    ['Équipes approuvées:', performanceTeams.filter(t => t.status === 'approved').length],
    ['En attente d\'action:', performanceTeams.filter(t => t.status === 'submitted').length],
    ['Brouillons:', performanceTeams.filter(t => t.status === 'draft').length],
    [''],
    ['🚨 ACTIONS URGENTES REQUISES'],
    ['═══════════════════════════════════════════']
  ];
  
  // Ajouter les actions urgentes
  const criticalShifts = volunteerShifts.filter(s => 
    (s.current_volunteers / s.max_volunteers) < 0.5 && s.status === 'live'
  );
  const pendingTeams = performanceTeams.filter(t => t.status === 'submitted');
  
  if (criticalShifts.length > 0) {
    globalSummary.push(['• Créneaux bénévoles urgents à remplir:', criticalShifts.length]);
    criticalShifts.slice(0, 5).forEach(shift => {
      globalSummary.push(['  -', `${shift.title} (${shift.current_volunteers}/${shift.max_volunteers})`]);
    });
  }
  
  if (pendingTeams.length > 0) {
    globalSummary.push(['• Équipes en attente d\'approbation:', pendingTeams.length]);
    pendingTeams.slice(0, 5).forEach(team => {
      globalSummary.push(['  -', `${team.team_name} (${team.director_name})`]);
    });
  }
  
  globalSummary.push(['']);
  globalSummary.push(['📈 INDICATEURS CLÉS']);
  globalSummary.push(['═══════════════════════════════════════════']);
  globalSummary.push(['Taux de remplissage bénévoles:', `${Math.round((volunteerSignups.filter(s => s.status !== 'cancelled').length / volunteerShifts.reduce((sum, s) => sum + s.max_volunteers, 0)) * 100)}%`]);
  globalSummary.push(['Taux d\'approbation équipes:', `${Math.round((performanceTeams.filter(t => t.status === 'approved').length / performanceTeams.length) * 100)}%`]);
  
  const globalSheet = XLSX.utils.aoa_to_sheet(globalSummary);
  XLSX.utils.book_append_sheet(workbook, globalSheet, 'Vue Globale');
  
  const filename = `rapport_complet_BSF_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};