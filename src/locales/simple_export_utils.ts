// translations-export-patch.ts - Patch pour ajouter les traductions d'export
// À fusionner avec votre fichier translations.ts existant

// Ajout des traductions pour les exports
export const exportTranslations = {
  fr: {
    // Ajout des traductions communes manquantes
    common: {
      yes: 'Oui',
      no: 'Non'
    },

    // Traductions spécifiques aux exports
    export: {
      // Statuts traduits
      status: {
        unpublished: 'Non publié',
        live: 'Actif',
        full: 'Complet',
        cancelled: 'Annulé',
        signedUp: 'Inscrit',
        confirmed: 'Confirmé',
        checkedIn: 'Présent',
        noShow: 'Absent',
        draft: 'Brouillon',
        submitted: 'Soumis',
        approved: 'Approuvé',
        rejected: 'Rejeté'
      },

      // En-têtes des colonnes
      headers: {
        id: 'ID',
        title: 'Titre',
        description: 'Description',
        date: 'Date',
        startTime: 'Heure début',
        endTime: 'Heure fin',
        duration: 'Durée',
        roleType: 'Type de rôle',
        maxVolunteers: 'Max. bénévoles',
        currentVolunteers: 'Bénévoles actuels',
        status: 'Statut',
        checkInRequired: 'Check-in requis',
        organizerInCharge: 'Organisateur responsable',
        fillRate: 'Taux remplissage (%)',
        urgent: 'Urgent',
        signupId: 'ID Inscription',
        shiftId: 'ID Créneau',
        volunteerName: 'Nom bénévole',
        volunteerEmail: 'Email bénévole',
        phone: 'Téléphone',
        shiftTitle: 'Titre créneau',
        shiftDate: 'Date créneau',
        time: 'Heure',
        signupDate: 'Date inscription',
        reminderSent: 'Rappel envoyé',
        checkIn: 'Check-in',
        qrCode: 'Code QR',
        teamName: 'Nom équipe',
        director: 'Directeur',
        directorEmail: 'Email directeur',
        studio: 'Studio',
        city: 'Ville',
        state: 'État/Province',
        country: 'Pays',
        songTitle: 'Titre chanson',
        hasVideo: 'A une vidéo',
        videoUrl: 'URL vidéo',
        groupSize: 'Taille groupe',
        danceStyles: 'Styles de danse',
        level: 'Niveau',
        performanceOrder: 'Ordre passage',
        totalScore: 'Score total',
        technicalScore: 'Score technique',
        wowScore: 'Facteur wow',
        sizeScore: 'Score taille',
        varietyBonus: 'Bonus variété',
        organizerNotes: 'Notes organisateur',
        backupTeam: 'Équipe de secours',
        canEditUntil: 'Peut modifier jusqu\'au',
        createdBy: 'Créé par',
        category: 'Catégorie',
        metric: 'Métrique',
        value: 'Valeur',
        details: 'Détails'
      },

      // Noms des feuilles Excel
      sheetNames: {
        volunteerShifts: 'Créneaux Bénévoles',
        volunteerSignups: 'Inscriptions Bénévoles',
        performanceTeams: 'Équipes Performance',
        dashboardReport: 'Rapport Dashboard'
      },

      // Titres des exports
      titles: {
        volunteerShifts: 'Créneaux Bénévoles - BSF 2025',
        volunteerSignups: 'Inscriptions Bénévoles - BSF 2025',
        performanceTeams: 'Équipes de Performance - BSF 2025',
        dashboardReport: 'Rapport du Dashboard'
      },

      // Noms des fichiers
      filenames: {
        volunteerShifts: 'creneaux_benevoles',
        volunteerSignups: 'inscriptions_benevoles',
        performanceTeams: 'equipes_performance',
        dashboardReport: 'rapport_dashboard'
      },

      // Catégories du rapport
      categories: {
        event: 'ÉVÉNEMENT',
        volunteers: 'BÉNÉVOLES',
        teams: 'ÉQUIPES'
      },

      // Métriques du rapport
      metrics: {
        name: 'Nom',
        totalShifts: 'Total créneaux',
        criticalShifts: 'Créneaux critiques',
        totalSignups: 'Total inscriptions',
        totalTeams: 'Total équipes',
        participants: 'Participants'
      },

      // Textes divers
      volunteer: 'Bénévole',
      notAvailable: 'Non disponible',
      unknownShift: 'Créneau inconnu',
      notAssigned: 'Non assigné',
      notSpecified: 'Non spécifié',
      notDefined: 'Non défini',
      notRated: 'Non noté',
      none: 'Aucun',
      reportGenerated: 'Rapport généré le',
      active: 'actifs',
      lessThan50Filled: 'Moins de 50% remplis',
      checkedIn: 'pointés',
      approved: 'approuvées',
      pending: 'en attente',
      totalDancers: 'Total danseurs',

      // Messages PDF
      pdf: {
        generatedOn: 'Généré le',
        totalRecords: 'Total enregistrements',
        footer: 'Rapport généré par Sabor Dance'
      },

      // Erreurs
      errors: {
        noData: 'Aucune donnée à exporter'
      }
    }
  },

  en: {
    // Ajout des traductions communes manquantes
    common: {
      yes: 'Yes',
      no: 'No'
    },

    // Traductions spécifiques aux exports
    export: {
      // Statuts traduits
      status: {
        unpublished: 'Unpublished',
        live: 'Live',
        full: 'Full',
        cancelled: 'Cancelled',
        signedUp: 'Signed Up',
        confirmed: 'Confirmed',
        checkedIn: 'Checked In',
        noShow: 'No Show',
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved',
        rejected: 'Rejected'
      },

      // En-têtes des colonnes
      headers: {
        id: 'ID',
        title: 'Title',
        description: 'Description',
        date: 'Date',
        startTime: 'Start Time',
        endTime: 'End Time',
        duration: 'Duration',
        roleType: 'Role Type',
        maxVolunteers: 'Max Volunteers',
        currentVolunteers: 'Current Volunteers',
        status: 'Status',
        checkInRequired: 'Check-in Required',
        organizerInCharge: 'Organizer in Charge',
        fillRate: 'Fill Rate (%)',
        urgent: 'Urgent',
        signupId: 'Signup ID',
        shiftId: 'Shift ID',
        volunteerName: 'Volunteer Name',
        volunteerEmail: 'Volunteer Email',
        phone: 'Phone',
        shiftTitle: 'Shift Title',
        shiftDate: 'Shift Date',
        time: 'Time',
        signupDate: 'Signup Date',
        reminderSent: 'Reminder Sent',
        checkIn: 'Check-in',
        qrCode: 'QR Code',
        teamName: 'Team Name',
        director: 'Director',
        directorEmail: 'Director Email',
        studio: 'Studio',
        city: 'City',
        state: 'State/Province',
        country: 'Country',
        songTitle: 'Song Title',
        hasVideo: 'Has Video',
        videoUrl: 'Video URL',
        groupSize: 'Group Size',
        danceStyles: 'Dance Styles',
        level: 'Level',
        performanceOrder: 'Performance Order',
        totalScore: 'Total Score',
        technicalScore: 'Technical Score',
        wowScore: 'Wow Factor',
        sizeScore: 'Size Score',
        varietyBonus: 'Variety Bonus',
        organizerNotes: 'Organizer Notes',
        backupTeam: 'Backup Team',
        canEditUntil: 'Can Edit Until',
        createdBy: 'Created By',
        category: 'Category',
        metric: 'Metric',
        value: 'Value',
        details: 'Details'
      },

      // Noms des feuilles Excel
      sheetNames: {
        volunteerShifts: 'Volunteer Shifts',
        volunteerSignups: 'Volunteer Signups',
        performanceTeams: 'Performance Teams',
        dashboardReport: 'Dashboard Report'
      },

      // Titres des exports
      titles: {
        volunteerShifts: 'Volunteer Shifts - BSF 2025',
        volunteerSignups: 'Volunteer Signups - BSF 2025',
        performanceTeams: 'Performance Teams - BSF 2025',
        dashboardReport: 'Dashboard Report'
      },

      // Noms des fichiers
      filenames: {
        volunteerShifts: 'volunteer_shifts',
        volunteerSignups: 'volunteer_signups',
        performanceTeams: 'performance_teams',
        dashboardReport: 'dashboard_report'
      },

      // Catégories du rapport
      categories: {
        event: 'EVENT',
        volunteers: 'VOLUNTEERS',
        teams: 'TEAMS'
      },

      // Métriques du rapport
      metrics: {
        name: 'Name',
        totalShifts: 'Total Shifts',
        criticalShifts: 'Critical Shifts',
        totalSignups: 'Total Signups',
        totalTeams: 'Total Teams',
        participants: 'Participants'
      },

      // Textes divers
      volunteer: 'Volunteer',
      notAvailable: 'Not Available',
      unknownShift: 'Unknown Shift',
      notAssigned: 'Not Assigned',
      notSpecified: 'Not Specified',
      notDefined: 'Not Defined',
      notRated: 'Not Rated',
      none: 'None',
      reportGenerated: 'Report generated on',
      active: 'active',
      lessThan50Filled: 'Less than 50% filled',
      checkedIn: 'checked in',
      approved: 'approved',
      pending: 'pending',
      totalDancers: 'Total dancers',

      // Messages PDF
      pdf: {
        generatedOn: 'Generated on',
        totalRecords: 'Total records',
        footer: 'Report generated by Sabor Dance'
      },

      // Erreurs
      errors: {
        noData: 'No data to export'
      }
    }
  },

  es: {
    // Ajout des traductions communes manquantes
    common: {
      yes: 'Sí',
      no: 'No'
    },

    // Traductions spécifiques aux exports
    export: {
      // Statuts traduits
      status: {
        unpublished: 'Sin publicar',
        live: 'Activo',
        full: 'Completo',
        cancelled: 'Cancelado',
        signedUp: 'Inscrito',
        confirmed: 'Confirmado',
        checkedIn: 'Presente',
        noShow: 'Ausente',
        draft: 'Borrador',
        submitted: 'Enviado',
        approved: 'Aprobado',
        rejected: 'Rechazado'
      },

      // En-têtes des colonnes
      headers: {
        id: 'ID',
        title: 'Título',
        description: 'Descripción',
        date: 'Fecha',
        startTime: 'Hora inicio',
        endTime: 'Hora fin',
        duration: 'Duración',
        roleType: 'Tipo de rol',
        maxVolunteers: 'Máx. voluntarios',
        currentVolunteers: 'Voluntarios actuales',
        status: 'Estado',
        checkInRequired: 'Check-in requerido',
        organizerInCharge: 'Organizador a cargo',
        fillRate: 'Tasa ocupación (%)',
        urgent: 'Urgente',
        signupId: 'ID Inscripción',
        shiftId: 'ID Turno',
        volunteerName: 'Nombre voluntario',
        volunteerEmail: 'Email voluntario',
        phone: 'Teléfono',
        shiftTitle: 'Título turno',
        shiftDate: 'Fecha turno',
        time: 'Hora',
        signupDate: 'Fecha inscripción',
        reminderSent: 'Recordatorio enviado',
        checkIn: 'Check-in',
        qrCode: 'Código QR',
        teamName: 'Nombre equipo',
        director: 'Director',
        directorEmail: 'Email director',
        studio: 'Estudio',
        city: 'Ciudad',
        state: 'Estado/Provincia',
        country: 'País',
        songTitle: 'Título canción',
        hasVideo: 'Tiene video',
        videoUrl: 'URL video',
        groupSize: 'Tamaño grupo',
        danceStyles: 'Estilos de baile',
        level: 'Nivel',
        performanceOrder: 'Orden actuación',
        totalScore: 'Puntuación total',
        technicalScore: 'Puntuación técnica',
        wowScore: 'Factor wow',
        sizeScore: 'Puntuación tamaño',
        varietyBonus: 'Bonus variedad',
        organizerNotes: 'Notas organizador',
        backupTeam: 'Equipo suplente',
        canEditUntil: 'Puede editar hasta',
        createdBy: 'Creado por',
        category: 'Categoría',
        metric: 'Métrica',
        value: 'Valor',
        details: 'Detalles'
      },

      // Noms des feuilles Excel
      sheetNames: {
        volunteerShifts: 'Turnos Voluntarios',
        volunteerSignups: 'Inscripciones Voluntarios',
        performanceTeams: 'Equipos Actuación',
        dashboardReport: 'Reporte Dashboard'
      },

      // Titres des exports
      titles: {
        volunteerShifts: 'Turnos de Voluntarios - BSF 2025',
        volunteerSignups: 'Inscripciones de Voluntarios - BSF 2025',
        performanceTeams: 'Equipos de Actuación - BSF 2025',
        dashboardReport: 'Reporte del Dashboard'
      },

      // Noms des fichiers
      filenames: {
        volunteerShifts: 'turnos_voluntarios',
        volunteerSignups: 'inscripciones_voluntarios',
        performanceTeams: 'equipos_actuacion',
        dashboardReport: 'reporte_dashboard'
      },

      // Catégories du rapport
      categories: {
        event: 'EVENTO',
        volunteers: 'VOLUNTARIOS',
        teams: 'EQUIPOS'
      },

      // Métriques du rapport
      metrics: {
        name: 'Nombre',
        totalShifts: 'Total turnos',
        criticalShifts: 'Turnos críticos',
        totalSignups: 'Total inscripciones',
        totalTeams: 'Total equipos',
        participants: 'Participantes'
      },

      // Textes divers
      volunteer: 'Voluntario',
      notAvailable: 'No disponible',
      unknownShift: 'Turno desconocido',
      notAssigned: 'No asignado',
      notSpecified: 'No especificado',
      notDefined: 'No definido',
      notRated: 'Sin calificar',
      none: 'Ninguno',
      reportGenerated: 'Reporte generado el',
      active: 'activos',
      lessThan50Filled: 'Menos del 50% ocupados',
      checkedIn: 'presentes',
      approved: 'aprobados',
      pending: 'pendientes',
      totalDancers: 'Total bailarines',

      // Messages PDF
      pdf: {
        generatedOn: 'Generado el',
        totalRecords: 'Total registros',
        footer: 'Reporte generado por Sabor Dance'
      },

      // Erreurs
      errors: {
        noData: 'No hay datos para exportar'
      }
    }
  }
};

// Instructions pour l'intégration :
// 1. Copiez les propriétés 'common' et 'export' de chaque langue
// 2. Fusionnez-les avec votre fichier translations.ts existant
// 3. Exemple d'intégration :

/*
// Dans votre fichier translations.ts existant, ajoutez :

export const translations = {
  fr: {
    // ... vos traductions existantes ...
    
    // Ajoutez ces nouvelles traductions :
    common: {
      yes: 'Oui',
      no: 'Non'
    },
    
    export: {
      // ... copiez toute la section export.fr d'au-dessus
    }
  },
  
  en: {
    // ... vos traductions existantes ...
    
    // Ajoutez ces nouvelles traductions :
    common: {
      yes: 'Yes',
      no: 'No'
    },
    
    export: {
      // ... copiez toute la section export.en d'au-dessus
    }
  },
  
  es: {
    // ... vos traductions existantes ...
    
    // Ajoutez ces nouvelles traductions :
    common: {
      yes: 'Sí',
      no: 'No'
    },
    
    export: {
      // ... copiez toute la section export.es d'au-dessus
    }
  }
};
*/
