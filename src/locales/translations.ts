// src/locales/translations.ts - Système de traduction complet
export type Language = 'fr' | 'en' | 'es';

export const translations = {
  fr: {
    // ================================
    // NAVIGATION & GÉNÉRAL
    // ================================
    login: 'Connexion',
    logout: 'Déconnexion',
    volunteers: 'Bénévoles',
    teams: 'Équipes',
    events: 'Événements',
    profiles: 'Profils',
    artists: 'Artistes',
    dashboard: 'Dashboard',
    home: 'Accueil',
    settings: 'Paramètres',
    help: 'Aide',
    about: 'À propos',
    contact: 'Contact',
    
    // Actions communes
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    loading: 'Chargement...',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    export: 'Exporter',
    import: 'Importer',
    refresh: 'Actualiser',
    close: 'Fermer',
    open: 'Ouvrir',
    view: 'Voir',
    details: 'Détails',
    more: 'Plus',
    less: 'Moins',
    all: 'Tous',
    none: 'Aucun',
    yes: 'Oui',
    no: 'Non',
    ok: 'OK',
    confirm: 'Confirmer',

    // ================================
    // HOMEPAGE
    // ================================
    title: 'Sabor Dance',
    subtitle: 'La plateforme qui digitalise l\'expérience des congrès de danse latine',
    volunteerManagement: 'Gestion Bénévoles',
    volunteerDesc: 'Organisez facilement vos créneaux bénévoles et permettez aux volontaires de s\'inscrire',
    teamPerformance: 'Équipes Performance',
    teamDesc: 'Gérez les soumissions d\'équipes, répétitions techniques et spectacles',
    eventsTitle: 'Événements',
    eventsDesc: 'Centralisez la gestion de vos congrès de danse latine',
    discover: 'Découvrir →',
    soon: 'Bientôt →',
    readyTitle: 'Prêt à digitaliser votre congrès ?',
    readyDesc: 'Rejoignez les organisateurs qui font confiance à Sabor Dance pour simplifier leurs événements',
    startFree: 'Commencer gratuitement',

    // ================================
    // AUTHENTIFICATION
    // ================================
    connection: 'Connexion',
    register: 'Inscription',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signOut: 'Se déconnecter',
    fullName: 'Nom complet',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    phone: 'Téléphone',
    role: 'Rôle',
    
    // Rôles
    volunteer: '🙋‍♀️ Bénévole',
    teamDirector: '💃 Directeur d\'équipe',
    organizer: '🎯 Organisateur',
    assistant: '👥 Assistant',
    admin: '⚡ Admin',
    artist: '🎨 Artiste/Instructeur',
    attendee: '🎫 Participant',

    // Messages auth
    noAccount: 'Pas de compte ? S\'inscrire',
    hasAccount: 'Déjà un compte ? Se connecter',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    checkEmail: 'Vérifiez votre email',
    loginSuccess: 'Connexion réussie !',
    logoutSuccess: 'Déconnexion réussie !',
    signupSuccess: 'Inscription réussie !',
    loginError: 'Erreur de connexion',
    signupError: 'Erreur d\'inscription',
    invalidCredentials: 'Identifiants invalides',
    emailRequired: 'Email requis',
    passwordRequired: 'Mot de passe requis',
    passwordTooShort: 'Mot de passe trop court',
    emailInvalid: 'Email invalide',

    // ================================
    // DASHBOARD
    // ================================
    dashboardTitle: 'Tableau de bord',
    welcomeBack: 'Bon retour',
    overview: 'Vue d\'ensemble',
    statistics: 'Statistiques',
    recentActivity: 'Activité récente',
    quickActions: 'Actions rapides',
    criticalShifts: 'Créneaux critiques',
    volunteersRegistered: 'Bénévoles inscrits',
    completedShifts: 'Créneaux terminés',
    approvedTeams: 'Équipes approuvées',
    shiftProgress: 'Progression créneaux',
    teamStatus: 'Statut équipes',
    urgentAlerts: 'Alertes urgentes',
    today: 'Aujourd\'hui',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    thisYear: 'Cette année',
    total: 'Total',
    pending: 'En attente',
    inProgress: 'En cours',

    // ================================
    // BÉNÉVOLES (VOLUNTEERS)
    // ================================
    volunteerManagementTitle: 'Gestion des Bénévoles',
    volunteerDashboard: 'Tableau de bord bénévole',
    myShifts: 'Mes créneaux',
    myProgress: 'Ma progression',
    availableShifts: 'Créneaux disponibles',
    upcomingShifts: 'Créneaux à venir',
    pastShifts: 'Créneaux passés',
    nextShift: 'Prochain créneau',
    
    // Créneaux
    createSlot: 'Créer un créneau',
    createShift: 'Créer un créneau',
    editShift: 'Modifier le créneau',
    deleteShift: 'Supprimer le créneau',
    duplicateShift: 'Dupliquer le créneau',
    shiftTitle: 'Titre du créneau',
    shiftDescription: 'Description',
    shiftDate: 'Date',
    shiftTime: 'Horaire',
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    duration: 'Durée',
    maxVolunteers: 'Nombre maximum de bénévoles',
    currentVolunteers: 'Bénévoles inscrits',
    spotsLeft: 'Places restantes',
    roleType: 'Type de rôle',
    requirements: 'Exigences',
    notes: 'Notes',
    
    // Statuts créneaux
    draft: 'Brouillon',
    published: 'Publié',
    live: 'Actif',
    full: 'Complet',
    cancelled: 'Annulé',
    completed: 'Terminé',
    
    // Actions bénévoles
    signUpForShift: 'S\'inscrire',
    signedUp: 'Inscrit',
    checkIn: 'Pointer',
    checkedIn: 'Présent',
    checkOut: 'Pointer sortie',
    noShow: 'Absent',
    waitlist: 'Liste d\'attente',
    
    // Progression
    hoursCompleted: 'Heures effectuées',
    hoursRequired: 'Heures requises',
    hoursRemaining: 'Heures restantes',
    progressPercentage: 'Pourcentage de progression',
    goalReached: 'Objectif atteint !',
    congratulations: 'Félicitations !',
    volunteerQuotaComplete: 'Vous avez terminé vos heures bénévoles !',
    
    // Types de rôles
    registrationDesk: 'Accueil',
    techSupport: 'Support technique',
    security: 'Sécurité',
    artistPickup: 'Transport artistes',
    setup: 'Installation',
    cleanup: 'Nettoyage',
    photography: 'Photographie',
    socialMedia: 'Réseaux sociaux',
    translation: 'Traduction',
    hostess: 'Hôtesse',
    
    // Messages bénévoles
    shiftSignupSuccess: 'Inscription réussie au créneau !',
    shiftSignupError: 'Erreur lors de l\'inscription',
    shiftFull: 'Ce créneau est complet',
    shiftCancelled: 'Ce créneau a été annulé',
    checkInSuccess: 'Pointage réussi !',
    checkInError: 'Erreur lors du pointage',
    alreadySignedUp: 'Vous êtes déjà inscrit à ce créneau',
    cantSignupPastShift: 'Impossible de s\'inscrire à un créneau passé',
    
    // Export bénévoles
    exportVolunteers: 'Exporter les bénévoles',
    exportShifts: 'Exporter les créneaux',
    exportSignups: 'Exporter les inscriptions',

    // ================================
    // ÉQUIPES (TEAMS)
    // ================================
    performanceTeams: 'Équipes de Performance',
    teamManagement: 'Gestion des équipes',
    createTeam: 'Créer une équipe',
    editTeam: 'Modifier l\'équipe',
    deleteTeam: 'Supprimer l\'équipe',
    duplicateTeam: 'Dupliquer l\'équipe',
    
    // Informations équipe
    teamName: 'Nom de l\'équipe',
    directorName: 'Nom du directeur',
    directorEmail: 'Email du directeur',
    directorPhone: 'Téléphone du directeur',
    studioName: 'Nom du studio',
    city: 'Ville',
    state: 'État/Province',
    country: 'Pays',
    groupSize: 'Taille du groupe',
    members: 'membres',
    
    // Performance
    performanceVideo: 'Vidéo de performance',
    performanceVideoUrl: 'Lien vidéo de performance',
    musicFile: 'Fichier musical',
    songTitle: 'Titre de la chanson',
    songArtist: 'Artiste',
    danceStyles: 'Styles de danse',
    danceStyle: 'Style de danse',
    performanceLevel: 'Niveau de performance',
    performanceOrder: 'Ordre de passage',
    performanceDuration: 'Durée de performance',
    
    // Styles de danse
    salsa: 'Salsa',
    bachata: 'Bachata',
    merengue: 'Merengue',
    zouk: 'Zouk',
    reggaeton: 'Reggaeton',
    cumbia: 'Cumbia',
    mambo: 'Mambo',
    chacha: 'Cha-cha',
    rumba: 'Rumba',
    samba: 'Samba',
    
    // Niveaux
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    professional: 'Professionnel',
    
    // Statuts équipe
    submitted: 'Soumise',
    approved: 'Approuvée',
    rejected: 'Refusée',
    underReview: 'En cours d\'examen',
    
    // Actions équipe
    submitTeam: 'Soumettre l\'équipe',
    approveTeam: 'Approuver l\'équipe',
    rejectTeam: 'Refuser l\'équipe',
    scoreTeam: 'Noter l\'équipe',
    watchVideo: 'Voir la vidéo',
    downloadMusic: 'Télécharger la musique',
    
    // Informations additionnelles
    instagram: 'Instagram',
    website: 'Site web',
    websiteUrl: 'URL du site web',
    backupTeam: 'Équipe de remplacement',
    organizerNotes: 'Notes de l\'organisateur',
    teamNotes: 'Notes de l\'équipe',
    rejectionReason: 'Raison du refus',
    
    // Upload
    uploadVideo: 'Uploader une vidéo',
    uploadMusic: 'Uploader de la musique',
    uploadFile: 'Uploader un fichier',
    fileUploadSuccess: 'Fichier uploadé avec succès !',
    fileUploadError: 'Erreur lors de l\'upload',
    fileTooBig: 'Fichier trop volumineux',
    fileFormatNotSupported: 'Format de fichier non supporté',
    dragAndDrop: 'Glissez-déposez ou cliquez pour sélectionner',
    
    // Messages équipes
    teamCreated: 'Équipe créée avec succès !',
    teamUpdated: 'Équipe mise à jour avec succès !',
    teamDeleted: 'Équipe supprimée avec succès !',
    teamSubmitted: 'Équipe soumise avec succès !',
    teamApproved: 'Équipe approuvée avec succès !',
    teamRejected: 'Équipe refusée',
    teamError: 'Erreur lors de l\'opération sur l\'équipe',
    
    // Export équipes
    exportTeams: 'Exporter les équipes',

    // ================================
    // ÉVÉNEMENTS (EVENTS)
    // ================================
    eventsManagement: 'Gestion des événements',
    createEvent: 'Créer un événement',
    editEvent: 'Modifier l\'événement',
    deleteEvent: 'Supprimer l\'événement',
    duplicateEvent: 'Dupliquer l\'événement',
    
    // Informations événement
    eventName: 'Nom de l\'événement',
    eventDescription: 'Description de l\'événement',
    eventLocation: 'Lieu de l\'événement',
    eventAddress: 'Adresse',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    capacity: 'Capacité',
    registrationDeadline: 'Date limite d\'inscription',
    teamSubmissionDeadline: 'Date limite de soumission des équipes',
    
    // Statuts événement
    upcoming: 'À venir',
    ongoing: 'En cours',
    finished: 'Terminé',
    
    // ================================
    // PROFILS (PROFILES)
    // ================================
    profile: 'Profil',
    myProfile: 'Mon profil',
    editProfile: 'Modifier le profil',
    profilePicture: 'Photo de profil',
    bio: 'Biographie',
    location: 'Localisation',
    experience: 'Expérience',
    yearsExperience: 'Années d\'expérience',
    specialties: 'Spécialités',
    availability: 'Disponibilité',
    emergencyContact: 'Contact d\'urgence',
    
    // Messages profil
    profileUpdated: 'Profil mis à jour avec succès !',
    profileError: 'Erreur lors de la mise à jour du profil',

    // ================================
    // ARTISTES (ARTISTS)
    // ================================
    artistsManagement: 'Gestion des artistes',
    artistProfile: 'Profil artiste',
    artistBio: 'Biographie de l\'artiste',
    artistSpecialties: 'Spécialités',
    artistExperience: 'Expérience',
    yearsExp: 'années d\'expérience',
    availableBooking: 'Disponible pour réservation',
    contactArtist: 'Contacter l\'artiste',
    watchSample: 'Voir un échantillon',
    verified: 'Vérifié',
    basedIn: 'Basé à',
    teaches: 'Enseigne',
    priceRange: 'Gamme de prix',
    readMore: 'Lire plus',
    readLess: 'Lire moins',

    // ================================
    // EXPORTS & RAPPORTS
    // ================================
    exportData: 'Exporter les données',
    exportFormat: 'Format d\'export',
    generateReport: 'Générer un rapport',
    downloadReport: 'Télécharger le rapport',
    csvFormat: 'Format CSV',
    excelFormat: 'Format Excel',
    pdfFormat: 'Format PDF',
    
    // En-têtes exports
    id: 'ID',
    name: 'Nom',
    columnTitle: 'Titre',
    description: 'Description',
    date: 'Date',
    time: 'Heure',
    status: 'Statut',
    type: 'Type',
    count: 'Nombre',
    percentage: 'Pourcentage',
    
    // Rapports spécifiques
    volunteerReport: 'Rapport bénévoles',
    teamReport: 'Rapport équipes',
    eventReport: 'Rapport événement',
    attendanceReport: 'Rapport de présence',
    progressReport: 'Rapport de progression',

    // ================================
    // NOTIFICATIONS & MESSAGES
    // ================================
    notifications: 'Notifications',
    messages: 'Messages',
    alerts: 'Alertes',
    reminders: 'Rappels',
    
    // Types de notifications
    info: 'Information',
    success: 'Succès',
    warning: 'Avertissement',
    error: 'Erreur',
    
    // Messages système
    operationSuccess: 'Opération réussie !',
    operationError: 'Erreur lors de l\'opération',
    savingData: 'Sauvegarde en cours...',
    loadingData: 'Chargement des données...',
    noData: 'Aucune donnée disponible',
    noResults: 'Aucun résultat trouvé',
    connectionError: 'Erreur de connexion',
    serverError: 'Erreur serveur',
    unauthorized: 'Non autorisé',
    forbidden: 'Accès interdit',
    notFound: 'Non trouvé',
    
    // Confirmations
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ?',
    confirmAction: 'Êtes-vous sûr de vouloir continuer ?',
    actionCannotBeUndone: 'Cette action ne peut pas être annulée',
    
    // ================================
    // INTERFACE UTILISATEUR
    // ================================
    gridView: 'Vue grille',
    listView: 'Vue liste',
    calendarView: 'Vue calendrier',
    tableView: 'Vue tableau',
    cardView: 'Vue cartes',
    
    // Navigation
    firstPage: 'Première page',
    lastPage: 'Dernière page',
    nextPage: 'Page suivante',
    previousPage: 'Page précédente',
    pageOf: 'Page {current} sur {total}',
    
    // Recherche et filtres
    searchPlaceholder: 'Rechercher...',
    filterBy: 'Filtrer par',
    sortBy: 'Trier par',
    clearFilters: 'Effacer les filtres',
    noFiltersApplied: 'Aucun filtre appliqué',
    
    // Dates et temps
    selectDate: 'Sélectionner une date',
    selectTime: 'Sélectionner une heure',
    timezone: 'Fuseau horaire',
    
    // ================================
    // DIVERS
    // ================================
    language: 'Langue',
    theme: 'Thème',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    
    // Footer
    copyright: 'Tous droits réservés',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    
    // Temps
    minute: 'minute',
    minutes: 'minutes',
    hour: 'heure',
    hours: 'heures',
    day: 'jour',
    days: 'jours',
    week: 'semaine',
    weeks: 'semaines',
    month: 'mois',
    months: 'mois',
    year: 'année',
    years: 'années',
    
    // Tailles
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    extraLarge: 'Très grand',
    
    // Directions
    up: 'Haut',
    down: 'Bas',
    left: 'Gauche',
    right: 'Droite',
    
    // QR Code
    qrCode: 'Code QR',
    scanQRCode: 'Scanner le code QR',
    generateQRCode: 'Générer un code QR',
    qrCodeScanned: 'Code QR scanné avec succès !',
    invalidQRCode: 'Code QR invalide',
    
    // Emails
    sendEmail: 'Envoyer un email',
    emailSent: 'Email envoyé avec succès !',
    emailError: 'Erreur lors de l\'envoi de l\'email',
    emailSubject: 'Sujet de l\'email',
    emailBody: 'Corps de l\'email',
    
    // Urgence
    urgent: 'Urgent',
    critical: 'Critique',
    highPriority: 'Priorité haute',
    mediumPriority: 'Priorité moyenne',
    lowPriority: 'Priorité basse',

    // ================================
    // ✅ NOUVELLES TRADUCTIONS CALENDAR
    // ================================
    calendar: {
      // En-têtes et navigation
      volunteerSchedule: 'Planning Bénévoles',
      today: 'Aujourd\'hui',
      previousWeek: 'Semaine précédente',
      nextWeek: 'Semaine suivante',
      
      // Jours de la semaine (format court)
      days: {
        mon: 'Lun',
        tue: 'Mar', 
        wed: 'Mer',
        thu: 'Jeu',
        fri: 'Ven',
        sat: 'Sam',
        sun: 'Dim'
      },
      
      // Légende des statuts
      legend: {
        title: 'Légende',
        empty: 'Vide',
        partiallyFilled: 'Partiellement rempli',
        full: 'Complet',
        draft: 'Brouillon',
        myShifts: 'Mes créneaux',
        cancelled: 'Annulé'
      },
      
      // Statuts des créneaux
      shiftStatus: {
        draft: 'BROUILLON',
        live: 'PUBLIÉ', 
        full: 'COMPLET',
        cancelled: 'ANNULÉ'
      },
      
      // Messages d'erreur - drag & drop
      errors: {
        cannotMoveToPast: 'Impossible de déplacer un créneau vers une date passée',
        cannotMoveToCurrentPastHour: 'Impossible de déplacer un créneau vers une heure passée',
        cannotCreateInPast: 'Impossible de créer un créneau dans le passé',
        cannotCreateAtPastHour: 'Impossible de créer un créneau à une heure passée',
        moveError: 'Erreur lors du déplacement',
        createError: 'Erreur lors de la création',
        updateError: 'Erreur lors de la mise à jour',
        statusChangeError: 'Erreur lors du changement de statut'
      },
      
      // Messages de succès
      success: {
        shiftMoved: 'Shift déplacé avec succès',
        shiftCreated: 'Créneau créé avec succès !',
        shiftUpdated: 'Modifications sauvegardées !',
        statusChanged: 'Statut changé avec succès'
      },
      
      // États de chargement
      loading: {
        moving: 'Déplacement...',
        creating: 'Création...',
        updating: 'Sauvegarde...',
        changingStatus: 'Changement...'
      }
    },
    
    // ================================
    // MODALS
    // ================================
    modals: {
      // Modal création rapide
      quickCreate: {
        title: 'Nouveau Créneau',
        titleField: 'Titre',
        titlePlaceholder: 'Créneau {hour}h',
        volunteers: 'Bénévoles',
        duration: 'Durée (h)',
        durationOptions: {
          oneHour: '1h',
          twoHours: '2h', 
          threeHours: '3h',
          fourHours: '4h'
        },
        info: {
          date: 'Date',
          schedule: 'Horaire'
        },
        buttons: {
          cancel: 'Annuler',
          create: 'Créer'
        }
      },
      
      // Modal détails créneau
      shiftDetails: {
        title: 'Détails du créneau',
        fields: {
          date: 'Date',
          schedule: 'Horaire', 
          volunteers: 'Bénévoles',
          status: 'Statut'
        },
        buttons: {
          signUp: 'S\'inscrire',
          unsubscribe: 'Se désinscrire', 
          publish: 'Publier',
          draft: 'Brouillon',
          edit: 'Modifier',
          close: 'Fermer'
        },
        messages: {
          shiftFull: 'Créneau complet'
        }
      },
      
      // Modal édition créneau
      editShift: {
        title: 'Modifier le Créneau',
        fields: {
          title: 'Titre',
          description: 'Description',
          date: 'Date',
          maxVolunteers: 'Max bénévoles', 
          startTime: 'Heure début',
          endTime: 'Heure fin',
          roleType: 'Type de rôle',
          roleTypePlaceholder: 'Ex: accueil, technique, sécurité...',
          checkInRequired: 'Check-in requis'
        },
        buttons: {
          cancel: 'Annuler',
          saveChanges: 'Sauvegarder'
        }
      }
    },
    
    // ================================
    // SHIFTS
    // ================================
    shifts: {
      // Labels génériques
      hour: 'Heure',
      volunteers: 'Bénévoles',
      duration: 'Durée',
      
      // Actions
      actions: {
        create: 'Créer un créneau',
        edit: 'Modifier',
        delete: 'Supprimer',
        publish: 'Publier',
        unpublish: 'Dépublier',
        signUp: 'S\'inscrire',
        unsubscribe: 'Se désinscrire'
      }
    },

    // ================================
    // ✅ NOUVELLES TRADUCTIONS GRIDVIEW
    // ================================
    gridViewDetails: {
      // En-têtes principaux
      title: 'Vue Grille - Planning Bénévoles',
      subtitle: 'Vision d\'ensemble type spreadsheet',
      
      // Navigation
      previousWeek: 'Semaine précédente',
      nextWeek: 'Semaine suivante',
      
      // Filtres et actions
      filters: {
        allRoles: 'Tous les rôles',
        registrationDesk: 'Accueil',
        techSupport: 'Technique',
        security: 'Sécurité',
        artistPickup: 'Transport',
        cleanup: 'Nettoyage',
        photography: 'Photographie',
        setup: 'Installation'
      },
      
      actions: {
        exportGrid: 'Export Grille',
        editShift: 'Modifier le créneau',
        signUp: 'S\'inscrire'
      },
      
      // Colonnes de la grille
      columns: {
        shifts: 'Créneaux',
        timeSlots: 'Créneaux horaires'
      },
      
      // Statuts et légende
      legend: {
        title: 'Légende',
        empty: 'Vide (0-30%)',
        partial: 'Partiel (31-80%)',
        full: 'Complet (81-100%)',
        draft: 'Brouillon'
      },
      
      // Indicateurs visuels
      indicators: {
        empty: '🔴',
        partial: '🟡',
        full: '🟢',
        userSignedUp: '✓ Inscrit',
        draft: '(Brouillon)'
      },
      
      // Statistiques
      stats: {
        emptyShifts: 'Créneaux vides',
        partialShifts: 'Partiels',
        fullShifts: 'Complets',
        totalShifts: 'Total créneaux'
      },
      
      // Messages d'état
      messages: {
        noShifts: 'Aucun créneau cette semaine',
        noShiftsDescription: 'Les créneaux apparaîtront ici une fois créés'
      },
      
      // Instructions d'utilisation
      instructions: {
        title: '💡 Mode d\'emploi :',
        organizer: [
          'Cliquez sur une case pour modifier le créneau',
          'Les cases rouges 🔴 nécessitent une attention urgente',
          'Utilisez les filtres pour voir un type de rôle spécifique'
        ],
        volunteer: [
          'Cliquez sur une case verte/jaune pour vous inscrire',
          'Vos inscriptions sont marquées d\'un contour bleu',
          'Les cases rouges 🔴 ont besoin de bénévoles !'
        ]
      }
    }
  },

  en: {
    // ================================
    // NAVIGATION & GENERAL
    // ================================
    login: 'Login',
    logout: 'Logout',
    volunteers: 'Volunteers',
    teams: 'Teams',
    events: 'Events',
    profiles: 'Profiles',
    artists: 'Artists',
    dashboard: 'Dashboard',
    home: 'Home',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    contact: 'Contact',

    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    view: 'View',
    details: 'Details',
    more: 'More',
    less: 'Less',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirm',
    
    // ================================
    // HOMEPAGE
    // ================================
    title: 'Sabor Dance',
    subtitle: 'The platform that digitalizes the Latin dance congress experience',
    volunteerManagement: 'Volunteer Management',
    volunteerDesc: 'Easily organize your volunteer shifts and allow volunteers to sign up',
    teamPerformance: 'Performance Teams',
    teamDesc: 'Manage team submissions, tech rehearsals and performances',
    eventsTitle: 'Events',
    eventsDesc: 'Centralize the management of your Latin dance congresses',
    discover: 'Discover →',
    soon: 'Coming Soon →',
    readyTitle: 'Ready to digitalize your congress?',
    readyDesc: 'Join organizers who trust Sabor Dance to simplify their events',
    startFree: 'Start for free',

    // ================================
    // AUTHENTICATION
    // ================================
    connection: 'Connection',
    register: 'Register',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    fullName: 'Full Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone',
    role: 'Role',
    
    // Roles
    volunteer: '🙋‍♀️ Volunteer',
    teamDirector: '💃 Team Director',
    organizer: '🎯 Organizer',
    assistant: '👥 Assistant',
    admin: '⚡ Admin',
    artist: '🎨 Artist/Instructor',
    attendee: '🎫 Attendee',

    // Auth messages
    noAccount: 'No account? Sign up',
    hasAccount: 'Already have an account? Sign in',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    checkEmail: 'Check your email',
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful!',
    signupSuccess: 'Registration successful!',
    loginError: 'Login error',
    signupError: 'Registration error',
    invalidCredentials: 'Invalid credentials',
    emailRequired: 'Email required',
    passwordRequired: 'Password required',
    passwordTooShort: 'Password too short',
    emailInvalid: 'Invalid email',

    // ================================
    // DASHBOARD
    // ================================
    dashboardTitle: 'Dashboard',
    welcomeBack: 'Welcome back',
    overview: 'Overview',
    statistics: 'Statistics',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    criticalShifts: 'Critical Shifts',
    volunteersRegistered: 'Volunteers Registered',
    completedShifts: 'Completed Shifts',
    approvedTeams: 'Approved Teams',
    shiftProgress: 'Shift Progress',
    teamStatus: 'Team Status',
    urgentAlerts: 'Urgent Alerts',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    total: 'Total',
    pending: 'Pending',
    completed: 'Completed',
    inProgress: 'In Progress',

    // ================================
    // VOLUNTEERS
    // ================================
    volunteerManagementTitle: 'Volunteer Management',
    volunteerDashboard: 'Volunteer Dashboard',
    myShifts: 'My Shifts',
    myProgress: 'My Progress',
    availableShifts: 'Available Shifts',
    upcomingShifts: 'Upcoming Shifts',
    pastShifts: 'Past Shifts',
    nextShift: 'Next Shift',
    
    // Shifts
    createSlot: 'Create Shift',
    createShift: 'Create Shift',
    editShift: 'Edit Shift',
    deleteShift: 'Delete Shift',
    duplicateShift: 'Duplicate Shift',
    shiftTitle: 'Shift Title',
    shiftDescription: 'Description',
    shiftDate: 'Date',
    shiftTime: 'Time',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration',
    maxVolunteers: 'Maximum Volunteers',
    currentVolunteers: 'Current Volunteers',
    spotsLeft: 'Spots Left',
    roleType: 'Role Type',
    requirements: 'Requirements',
    notes: 'Notes',
    
    // Shift statuses
    draft: 'Draft',
    published: 'Published',
    live: 'Live',
    full: 'Full',
    cancelled: 'Cancelled',
    
    // Volunteer actions
    signUpForShift: 'Sign Up',
    signedUp: 'Signed Up',
    checkIn: 'Check In',
    checkedIn: 'Checked In',
    checkOut: 'Check Out',
    noShow: 'No Show',
    waitlist: 'Waitlist',
    
    // Progress
    hoursCompleted: 'Hours Completed',
    hoursRequired: 'Hours Required',
    hoursRemaining: 'Hours Remaining',
    progressPercentage: 'Progress Percentage',
    goalReached: 'Goal Reached!',
    congratulations: 'Congratulations!',
    volunteerQuotaComplete: 'You have completed your volunteer hours!',
    
    // Role types
    registrationDesk: 'Registration Desk',
    techSupport: 'Tech Support',
    security: 'Security',
    artistPickup: 'Artist Pickup',
    setup: 'Setup',
    cleanup: 'Cleanup',
    photography: 'Photography',
    socialMedia: 'Social Media',
    translation: 'Translation',
    hostess: 'Hostess',
    
    // Volunteer messages
    shiftSignupSuccess: 'Successfully signed up for shift!',
    shiftSignupError: 'Error signing up for shift',
    shiftFull: 'This shift is full',
    shiftCancelled: 'This shift has been cancelled',
    checkInSuccess: 'Successfully checked in!',
    checkInError: 'Error checking in',
    alreadySignedUp: 'You are already signed up for this shift',
    cantSignupPastShift: 'Cannot sign up for past shift',
    
    // Export volunteers
    exportVolunteers: 'Export Volunteers',
    exportShifts: 'Export Shifts',
    exportSignups: 'Export Signups',

    // ================================
    // TEAMS
    // ================================
    performanceTeams: 'Performance Teams',
    teamManagement: 'Team Management',
    createTeam: 'Create Team',
    editTeam: 'Edit Team',
    deleteTeam: 'Delete Team',
    duplicateTeam: 'Duplicate Team',
    
    // Team information
    teamName: 'Team Name',
    directorName: 'Director Name',
    directorEmail: 'Director Email',
    directorPhone: 'Director Phone',
    studioName: 'Studio Name',
    city: 'City',
    state: 'State',
    country: 'Country',
    groupSize: 'Group Size',
    members: 'members',
    
    // Performance
    performanceVideo: 'Performance Video',
    performanceVideoUrl: 'Performance Video URL',
    musicFile: 'Music File',
    songTitle: 'Song Title',
    songArtist: 'Artist',
    danceStyles: 'Dance Styles',
    danceStyle: 'Dance Style',
    performanceLevel: 'Performance Level',
    performanceOrder: 'Performance Order',
    performanceDuration: 'Performance Duration',
    
    // Dance styles
    salsa: 'Salsa',
    bachata: 'Bachata',
    merengue: 'Merengue',
    zouk: 'Zouk',
    reggaeton: 'Reggaeton',
    cumbia: 'Cumbia',
    mambo: 'Mambo',
    chacha: 'Cha-cha',
    rumba: 'Rumba',
    samba: 'Samba',
    
    // Levels
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    professional: 'Professional',
    
    // Team statuses
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    underReview: 'Under Review',
    
    // Team actions
    submitTeam: 'Submit Team',
    approveTeam: 'Approve Team',
    rejectTeam: 'Reject Team',
    scoreTeam: 'Score Team',
    watchVideo: 'Watch Video',
    downloadMusic: 'Download Music',
    
    // Additional information
    instagram: 'Instagram',
    website: 'Website',
    websiteUrl: 'Website URL',
    backupTeam: 'Backup Team',
    organizerNotes: 'Organizer Notes',
    teamNotes: 'Team Notes',
    rejectionReason: 'Rejection Reason',
    
    // Upload
    uploadVideo: 'Upload Video',
    uploadMusic: 'Upload Music',
    uploadFile: 'Upload File',
    fileUploadSuccess: 'File uploaded successfully!',
    fileUploadError: 'File upload error',
    fileTooBig: 'File too large',
    fileFormatNotSupported: 'File format not supported',
    dragAndDrop: 'Drag and drop or click to select',
    
    // Team messages
    teamCreated: 'Team created successfully!',
    teamUpdated: 'Team updated successfully!',
    teamDeleted: 'Team deleted successfully!',
    teamSubmitted: 'Team submitted successfully!',
    teamApproved: 'Team approved successfully!',
    teamRejected: 'Team rejected',
    teamError: 'Error with team operation',
    
    // Export teams
    exportTeams: 'Export Teams',

    // ================================
    // EVENTS
    // ================================
    eventsManagement: 'Events Management',
    createEvent: 'Create Event',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    duplicateEvent: 'Duplicate Event',
    
    // Event information
    eventName: 'Event Name',
    eventDescription: 'Event Description',
    eventLocation: 'Event Location',
    eventAddress: 'Address',
    startDate: 'Start Date',
    endDate: 'End Date',
    capacity: 'Capacity',
    registrationDeadline: 'Registration Deadline',
    teamSubmissionDeadline: 'Team Submission Deadline',
    
    // Event statuses
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    finished: 'Finished',
    
    // ================================
    // PROFILES
    // ================================
    profile: 'Profile',
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    profilePicture: 'Profile Picture',
    bio: 'Biography',
    location: 'Location',
    experience: 'Experience',
    yearsExperience: 'Years of Experience',
    specialties: 'Specialties',
    availability: 'Availability',
    emergencyContact: 'Emergency Contact',
    
    // Profile messages
    profileUpdated: 'Profile updated successfully!',
    profileError: 'Error updating profile',

    // ================================
    // ARTISTS
    // ================================
    artistsManagement: 'Artists Management',
    artistProfile: 'Artist Profile',
    artistBio: 'Artist Biography',
    artistSpecialties: 'Specialties',
    artistExperience: 'Experience',
    yearsExp: 'years of experience',
    availableBooking: 'Available for booking',
    contactArtist: 'Contact artist',
    watchSample: 'Watch sample',
    verified: 'Verified',
    basedIn: 'Based in',
    teaches: 'Teaches',
    priceRange: 'Price range',
    readMore: 'Read more',
    readLess: 'Read less',

    // ================================
    // EXPORTS & REPORTS
    // ================================
    exportData: 'Export Data',
    exportFormat: 'Export Format',
    generateReport: 'Generate Report',
    downloadReport: 'Download Report',
    csvFormat: 'CSV Format',
    excelFormat: 'Excel Format',
    pdfFormat: 'PDF Format',
    
    // Export headers
    id: 'ID',
    name: 'Name',
    columnTitle: 'Title',
    description: 'Description',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    type: 'Type',
    count: 'Count',
    percentage: 'Percentage',
    
    // Specific reports
    volunteerReport: 'Volunteer Report',
    teamReport: 'Team Report',
    eventReport: 'Event Report',
    attendanceReport: 'Attendance Report',
    progressReport: 'Progress Report',

    // ================================
    // NOTIFICATIONS & MESSAGES
    // ================================
    notifications: 'Notifications',
    messages: 'Messages',
    alerts: 'Alerts',
    reminders: 'Reminders',
    
    // Notification types
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    
    // System messages
    operationSuccess: 'Operation successful!',
    operationError: 'Operation error',
    savingData: 'Saving data...',
    loadingData: 'Loading data...',
    noData: 'No data available',
    noResults: 'No results found',
    connectionError: 'Connection error',
    serverError: 'Server error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    
    // Confirmations
    confirmDelete: 'Are you sure you want to delete?',
    confirmAction: 'Are you sure you want to continue?',
    actionCannotBeUndone: 'This action cannot be undone',
    
    // ================================
    // USER INTERFACE
    // ================================
    gridView: 'Grid View',
    listView: 'List View',
    calendarView: 'Calendar View',
    tableView: 'Table View',
    cardView: 'Card View',
    
    // Navigation
    firstPage: 'First Page',
    lastPage: 'Last Page',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    pageOf: 'Page {current} of {total}',
    
    // Search and filters
    searchPlaceholder: 'Search...',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    clearFilters: 'Clear filters',
    noFiltersApplied: 'No filters applied',
    
    // Dates and time
    selectDate: 'Select date',
    selectTime: 'Select time',
    timezone: 'Timezone',
    
    // ================================
    // MISCELLANEOUS
    // ================================
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Footer
    copyright: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // Time
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    week: 'week',
    weeks: 'weeks',
    month: 'month',
    months: 'months',
    year: 'year',
    years: 'years',
    
    // Sizes
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra Large',
    
    // Directions
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    
    // QR Code
    qrCode: 'QR Code',
    scanQRCode: 'Scan QR Code',
    generateQRCode: 'Generate QR Code',
    qrCodeScanned: 'QR Code scanned successfully!',
    invalidQRCode: 'Invalid QR Code',
    
    // Emails
    sendEmail: 'Send Email',
    emailSent: 'Email sent successfully!',
    emailError: 'Email sending error',
    emailSubject: 'Email Subject',
    emailBody: 'Email Body',
    
    // Urgency
    urgent: 'Urgent',
    critical: 'Critical',
    highPriority: 'High Priority',
    mediumPriority: 'Medium Priority',
    lowPriority: 'Low Priority',

    // ================================
    // ✅ NOUVELLES TRADUCTIONS CALENDAR
    // ================================
    calendar: {
      // Headers and navigation
      volunteerSchedule: 'Volunteer Schedule',
      today: 'Today',
      previousWeek: 'Previous Week',
      nextWeek: 'Next Week',
      
      // Days of week (short format)
      days: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed', 
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun'
      },
      
      // Status legend
      legend: {
        title: 'Legend',
        empty: 'Empty',
        partiallyFilled: 'Partially filled',
        full: 'Full',
        draft: 'Draft',
        myShifts: 'My shifts',
        cancelled: 'Cancelled'
      },
      
      // Shift statuses
      shiftStatus: {
        draft: 'DRAFT',
        live: 'LIVE',
        full: 'FULL', 
        cancelled: 'CANCELLED'
      },
      
      // Error messages - drag & drop
      errors: {
        cannotMoveToPast: 'Cannot move shift to past date',
        cannotMoveToCurrentPastHour: 'Cannot move shift to past hour',
        cannotCreateInPast: 'Cannot create shift in the past',
        cannotCreateAtPastHour: 'Cannot create shift at past hour',
        moveError: 'Error moving shift',
        createError: 'Error creating shift',
        updateError: 'Error updating shift',
        statusChangeError: 'Error changing status'
      },
      
      // Success messages
      success: {
        shiftMoved: 'Shift moved successfully',
        shiftCreated: 'Shift created successfully!',
        shiftUpdated: 'Changes saved!',
        statusChanged: 'Status changed successfully'
      },
      
      // Loading states
      loading: {
        moving: 'Moving...',
        creating: 'Creating...',
        updating: 'Updating...',
        changingStatus: 'Changing...'
      }
    },
    
    // ================================
    // MODALS - ENGLISH
    // ================================
    modals: {
      // Quick create modal
      quickCreate: {
        title: 'New Shift',
        titleField: 'Title',
        titlePlaceholder: 'Shift {hour}h',
        volunteers: 'Volunteers',
        duration: 'Duration (h)',
        durationOptions: {
          oneHour: '1h',
          twoHours: '2h',
          threeHours: '3h', 
          fourHours: '4h'
        },
        info: {
          date: 'Date',
          schedule: 'Schedule'
        },
        buttons: {
          cancel: 'Cancel',
          create: 'Create'
        }
      },
      
      // Shift details modal
      shiftDetails: {
        title: 'Shift Details',
        fields: {
          date: 'Date',
          schedule: 'Schedule',
          volunteers: 'Volunteers', 
          status: 'Status'
        },
        buttons: {
          signUp: 'Sign Up',
          unsubscribe: 'Unsubscribe',
          publish: 'Publish',
          draft: 'Draft',
          edit: 'Edit',
          close: 'Close'
        },
        messages: {
          shiftFull: 'Shift is full'
        }
      },
      
      // Edit shift modal
      editShift: {
        title: 'Edit Shift',
        fields: {
          title: 'Title',
          description: 'Description',
          date: 'Date',
          maxVolunteers: 'Max volunteers',
          startTime: 'Start time',
          endTime: 'End time', 
          roleType: 'Role type',
          roleTypePlaceholder: 'E.g.: reception, tech, security...',
          checkInRequired: 'Check-in required'
        },
        buttons: {
          cancel: 'Cancel',
          saveChanges: 'Save Changes'
        }
      }
    },
    
    // ================================
    // SHIFTS - ENGLISH
    // ================================
    shifts: {
      // Generic labels
      hour: 'Hour',
      volunteers: 'Volunteers',
      duration: 'Duration',
      
      // Actions
      actions: {
        create: 'Create shift',
        edit: 'Edit',
        delete: 'Delete',
        publish: 'Publish',
        unpublish: 'Unpublish',
        signUp: 'Sign Up',
        unsubscribe: 'Unsubscribe'
      }
    },

    // ================================
    // ✅ NOUVELLES TRADUCTIONS GRIDVIEW
    // ================================
    gridViewDetails: {
      // Main headers
      title: 'Grid View - Volunteer Schedule',
      subtitle: 'Spreadsheet-style overview',
      
      // Navigation
      previousWeek: 'Previous Week',
      nextWeek: 'Next Week',
      
      // Filters and actions
      filters: {
        allRoles: 'All roles',
        registrationDesk: 'Registration',
        techSupport: 'Tech Support',
        security: 'Security',
        artistPickup: 'Artist Pickup',
        cleanup: 'Cleanup',
        photography: 'Photography',
        setup: 'Setup'
      },
      
      actions: {
        exportGrid: 'Export Grid',
        editShift: 'Edit Shift',
        signUp: 'Sign Up'
      },
      
      // Grid columns
      columns: {
        shifts: 'Shifts',
        timeSlots: 'Time Slots'
      },
      
      // Status and legend
      legend: {
        title: 'Legend',
        empty: 'Empty (0-30%)',
        partial: 'Partial (31-80%)',
        full: 'Full (81-100%)',
        draft: 'Draft'
      },
      
      // Visual indicators
      indicators: {
        empty: '🔴',
        partial: '🟡',
        full: '🟢',
        userSignedUp: '✓ Signed Up',
        draft: '(Draft)'
      },
      
      // Statistics
      stats: {
        emptyShifts: 'Empty Shifts',
        partialShifts: 'Partial',
        fullShifts: 'Full',
        totalShifts: 'Total Shifts'
      },
      
      // Status messages
      messages: {
        noShifts: 'No shifts this week',
        noShiftsDescription: 'Shifts will appear here once created'
      },
      
      // Usage instructions
      instructions: {
        title: '💡 How to use:',
        organizer: [
          'Click on a cell to edit the shift',
          'Red cells 🔴 need urgent attention',
          'Use filters to view specific role types'
        ],
        volunteer: [
          'Click on a green/yellow cell to sign up',
          'Your signups are marked with a blue outline',
          'Red cells 🔴 need volunteers!'
        ]
      }
    }
  },

  es: {
    // ================================
    // NAVEGACIÓN Y GENERAL
    // ================================
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    volunteers: 'Voluntarios',
    teams: 'Equipos',
    events: 'Eventos',
    profiles: 'Perfiles',
    artists: 'Artistas',
    dashboard: 'Panel de control',
    home: 'Inicio',
    settings: 'Configuración',
    help: 'Ayuda',
    about: 'Acerca de',
    contact: 'Contacto',

    // Acciones comunes
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    loading: 'Cargando...',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    export: 'Exportar',
    import: 'Importar',
    refresh: 'Actualizar',
    close: 'Cerrar',
    open: 'Abrir',
    view: 'Ver',
    details: 'Detalles',
    more: 'Más',
    less: 'Menos',
    all: 'Todos',
    none: 'Ninguno',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirmar',

    // ================================
    // PÁGINA PRINCIPAL
    // ================================
    title: 'Sabor Dance',
    subtitle: 'La plataforma que digitaliza la experiencia de los congresos de baile latino',
    volunteerManagement: 'Gestión de Voluntarios',
    volunteerDesc: 'Organiza fácilmente tus turnos de voluntarios y permite que se inscriban',
    teamPerformance: 'Equipos de Performance',
    teamDesc: 'Gestiona las presentaciones de equipos, ensayos técnicos y espectáculos',
    eventsTitle: 'Eventos',
    eventsDesc: 'Centraliza la gestión de tus congresos de baile latino',
    discover: 'Descubrir →',
    soon: 'Próximamente →',
    readyTitle: '¿Listo para digitalizar tu congreso?',
    readyDesc: 'Únete a los organizadores que confían en Sabor Dance para simplificar sus eventos',
    startFree: 'Comenzar gratis',

    // ================================
    // AUTENTICACIÓN
    // ================================
    connection: 'Conexión',
    register: 'Registrarse',
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar sesión',
    fullName: 'Nombre completo',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    phone: 'Teléfono',
    role: 'Rol',
    
    // Roles
    volunteer: '🙋‍♀️ Voluntario',
    teamDirector: '💃 Director de equipo',
    organizer: '🎯 Organizador',
    assistant: '👥 Asistente',
    admin: '⚡ Admin',
    artist: '🎨 Artista/Instructor',
    attendee: '🎫 Participante',

    // Mensajes de auth
    noAccount: '¿No tienes cuenta? Regístrate',
    hasAccount: '¿Ya tienes cuenta? Inicia sesión',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer contraseña',
    checkEmail: 'Revisa tu email',
    loginSuccess: '¡Inicio de sesión exitoso!',
    logoutSuccess: '¡Cierre de sesión exitoso!',
    signupSuccess: '¡Registro exitoso!',
    loginError: 'Error de inicio de sesión',
    signupError: 'Error de registro',
    invalidCredentials: 'Credenciales inválidas',
    emailRequired: 'Email requerido',
    passwordRequired: 'Contraseña requerida',
    passwordTooShort: 'Contraseña muy corta',
    emailInvalid: 'Email inválido',

    // ================================
    // PANEL DE CONTROL
    // ================================
    dashboardTitle: 'Panel de control',
    welcomeBack: 'Bienvenido de nuevo',
    overview: 'Resumen',
    statistics: 'Estadísticas',
    recentActivity: 'Actividad reciente',
    quickActions: 'Acciones rápidas',
    criticalShifts: 'Turnos críticos',
    volunteersRegistered: 'Voluntarios registrados',
    completedShifts: 'Turnos completados',
    approvedTeams: 'Equipos aprobados',
    shiftProgress: 'Progreso de turnos',
    teamStatus: 'Estado de equipos',
    urgentAlerts: 'Alertas urgentes',
    today: 'Hoy',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    thisYear: 'Este año',
    total: 'Total',
    pending: 'Pendiente',
    completed: 'Completado',
    inProgress: 'En progreso',

    // ================================
    // VOLUNTARIOS
    // ================================
    volunteerManagementTitle: 'Gestión de Voluntarios',
    volunteerDashboard: 'Panel de voluntario',
    myShifts: 'Mis turnos',
    myProgress: 'Mi progreso',
    availableShifts: 'Turnos disponibles',
    upcomingShifts: 'Próximos turnos',
    pastShifts: 'Turnos pasados',
    nextShift: 'Próximo turno',
    
    // Turnos
    createSlot: 'Crear turno',
    createShift: 'Crear turno',
    editShift: 'Editar turno',
    deleteShift: 'Eliminar turno',
    duplicateShift: 'Duplicar turno',
    shiftTitle: 'Título del turno',
    shiftDescription: 'Descripción',
    shiftDate: 'Fecha',
    shiftTime: 'Horario',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    duration: 'Duración',
    maxVolunteers: 'Máximo de voluntarios',
    currentVolunteers: 'Voluntarios actuales',
    spotsLeft: 'Lugares restantes',
    roleType: 'Tipo de rol',
    requirements: 'Requisitos',
    notes: 'Notas',
    
    // Estados de turnos
    draft: 'Borrador',
    published: 'Publicado',
    live: 'Activo',
    full: 'Completo',
    cancelled: 'Cancelado',
    
    // Acciones de voluntarios
    signUpForShift: 'Inscribirse',
    signedUp: 'Inscrito',
    checkIn: 'Registrar entrada',
    checkedIn: 'Presente',
    checkOut: 'Registrar salida',
    noShow: 'No se presentó',
    waitlist: 'Lista de espera',
    
    // Progreso
    hoursCompleted: 'Horas completadas',
    hoursRequired: 'Horas requeridas',
    hoursRemaining: 'Horas restantes',
    progressPercentage: 'Porcentaje de progreso',
    goalReached: '¡Meta alcanzada!',
    congratulations: '¡Felicitaciones!',
    volunteerQuotaComplete: '¡Has completado tus horas de voluntariado!',
    
    // Tipos de roles
    registrationDesk: 'Mesa de registro',
    techSupport: 'Soporte técnico',
    security: 'Seguridad',
    artistPickup: 'Transporte de artistas',
    setup: 'Montaje',
    cleanup: 'Limpieza',
    photography: 'Fotografía',
    socialMedia: 'Redes sociales',
    translation: 'Traducción',
    hostess: 'Azafata',
    
    // Mensajes de voluntarios
    shiftSignupSuccess: '¡Inscripción al turno exitosa!',
    shiftSignupError: 'Error al inscribirse al turno',
    shiftFull: 'Este turno está completo',
    shiftCancelled: 'Este turno ha sido cancelado',
    checkInSuccess: '¡Registro de entrada exitoso!',
    checkInError: 'Error al registrar entrada',
    alreadySignedUp: 'Ya estás inscrito a este turno',
    cantSignupPastShift: 'No puedes inscribirte a un turno pasado',
    
    // Exportar voluntarios
    exportVolunteers: 'Exportar voluntarios',
    exportShifts: 'Exportar turnos',
    exportSignups: 'Exportar inscripciones',

    // ================================
    // EQUIPOS
    // ================================
    performanceTeams: 'Equipos de Performance',
    teamManagement: 'Gestión de equipos',
    createTeam: 'Crear equipo',
    editTeam: 'Editar equipo',
    deleteTeam: 'Eliminar equipo',
    duplicateTeam: 'Duplicar equipo',
    
    // Información del equipo
    teamName: 'Nombre del equipo',
    directorName: 'Nombre del director',
    directorEmail: 'Email del director',
    directorPhone: 'Teléfono del director',
    studioName: 'Nombre del estudio',
    city: 'Ciudad',
    state: 'Estado',
    country: 'País',
    groupSize: 'Tamaño del grupo',
    members: 'miembros',
    
    // Performance
    performanceVideo: 'Video de performance',
    performanceVideoUrl: 'URL del video de performance',
    musicFile: 'Archivo musical',
    songTitle: 'Título de la canción',
    songArtist: 'Artista',
    danceStyles: 'Estilos de baile',
    danceStyle: 'Estilo de baile',
    performanceLevel: 'Nivel de performance',
    performanceOrder: 'Orden de presentación',
    performanceDuration: 'Duración de performance',
    
    // Estilos de baile
    salsa: 'Salsa',
    bachata: 'Bachata',
    merengue: 'Merengue',
    zouk: 'Zouk',
    reggaeton: 'Reggaeton',
    cumbia: 'Cumbia',
    mambo: 'Mambo',
    chacha: 'Cha-cha',
    rumba: 'Rumba',
    samba: 'Samba',
    
    // Niveles
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    professional: 'Profesional',
    
    // Estados del equipo
    submitted: 'Presentado',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    underReview: 'En revisión',
    
    // Acciones del equipo
    submitTeam: 'Presentar equipo',
    approveTeam: 'Aprobar equipo',
    rejectTeam: 'Rechazar equipo',
    scoreTeam: 'Calificar equipo',
    watchVideo: 'Ver video',
    downloadMusic: 'Descargar música',
    
    // Información adicional
    instagram: 'Instagram',
    website: 'Sitio web',
    websiteUrl: 'URL del sitio web',
    backupTeam: 'Equipo de respaldo',
    organizerNotes: 'Notas del organizador',
    teamNotes: 'Notas del equipo',
    rejectionReason: 'Razón del rechazo',
    
    // Subida de archivos
    uploadVideo: 'Subir video',
    uploadMusic: 'Subir música',
    uploadFile: 'Subir archivo',
    fileUploadSuccess: '¡Archivo subido exitosamente!',
    fileUploadError: 'Error al subir archivo',
    fileTooBig: 'Archivo muy grande',
    fileFormatNotSupported: 'Formato de archivo no soportado',
    dragAndDrop: 'Arrastra y suelta o haz clic para seleccionar',
    
    // Mensajes de equipos
    teamCreated: '¡Equipo creado exitosamente!',
    teamUpdated: '¡Equipo actualizado exitosamente!',
    teamDeleted: '¡Equipo eliminado exitosamente!',
    teamSubmitted: '¡Equipo presentado exitosamente!',
    teamApproved: '¡Equipo aprobado exitosamente!',
    teamRejected: 'Equipo rechazado',
    teamError: 'Error en la operación del equipo',
    
    // Exportar equipos
    exportTeams: 'Exportar equipos',

    // ================================
    // EVENTOS
    // ================================
    eventsManagement: 'Gestión de eventos',
    createEvent: 'Crear evento',
    editEvent: 'Editar evento',
    deleteEvent: 'Eliminar evento',
    duplicateEvent: 'Duplicar evento',
    
    // Información del evento
    eventName: 'Nombre del evento',
    eventDescription: 'Descripción del evento',
    eventLocation: 'Ubicación del evento',
    eventAddress: 'Dirección',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    capacity: 'Capacidad',
    registrationDeadline: 'Fecha límite de registro',
    teamSubmissionDeadline: 'Fecha límite de presentación de equipos',
    
    // Estados del evento
    upcoming: 'Próximo',
    ongoing: 'En curso',
    finished: 'Terminado',
    
    // ================================
    // PERFILES
    // ================================
    profile: 'Perfil',
    myProfile: 'Mi perfil',
    editProfile: 'Editar perfil',
    profilePicture: 'Foto de perfil',
    bio: 'Biografía',
    location: 'Ubicación',
    experience: 'Experiencia',
    yearsExperience: 'Años de experiencia',
    specialties: 'Especialidades',
    availability: 'Disponibilidad',
    emergencyContact: 'Contacto de emergencia',
    
    // Mensajes de perfil
    profileUpdated: '¡Perfil actualizado exitosamente!',
    profileError: 'Error al actualizar perfil',

    // ================================
    // ARTISTAS
    // ================================
    artistsManagement: 'Gestión de artistas',
    artistProfile: 'Perfil de artista',
    artistBio: 'Biografía del artista',
    artistSpecialties: 'Especialidades',
    artistExperience: 'Experiencia',
    yearsExp: 'años de experiencia',
    availableBooking: 'Disponible para contratación',
    contactArtist: 'Contactar artista',
    watchSample: 'Ver muestra',
    verified: 'Verificado',
    basedIn: 'Ubicado en',
    teaches: 'Enseña',
    priceRange: 'Rango de precios',
    readMore: 'Leer más',
    readLess: 'Leer menos',

    // ================================
    // EXPORTACIONES Y REPORTES
    // ================================
    exportData: 'Exportar datos',
    exportFormat: 'Formato de exportación',
    generateReport: 'Generar reporte',
    downloadReport: 'Descargar reporte',
    csvFormat: 'Formato CSV',
    excelFormat: 'Formato Excel',
    pdfFormat: 'Formato PDF',
    
    // Encabezados de exportación
    id: 'ID',
    name: 'Nombre',
    columnTitle: 'Título',
    description: 'Descripción',
    date: 'Fecha',
    time: 'Hora',
    status: 'Estado',
    type: 'Tipo',
    count: 'Cantidad',
    percentage: 'Porcentaje',
    
    // Reportes específicos
    volunteerReport: 'Reporte de voluntarios',
    teamReport: 'Reporte de equipos',
    eventReport: 'Reporte de evento',
    attendanceReport: 'Reporte de asistencia',
    progressReport: 'Reporte de progreso',

    // ================================
    // NOTIFICACIONES Y MENSAJES
    // ================================
    notifications: 'Notificaciones',
    messages: 'Mensajes',
    alerts: 'Alertas',
    reminders: 'Recordatorios',
    
    // Tipos de notificaciones
    info: 'Información',
    success: 'Éxito',
    warning: 'Advertencia',
    error: 'Error',
    
    // Mensajes del sistema
    operationSuccess: '¡Operación exitosa!',
    operationError: 'Error en la operación',
    savingData: 'Guardando datos...',
    loadingData: 'Cargando datos...',
    noData: 'No hay datos disponibles',
    noResults: 'No se encontraron resultados',
    connectionError: 'Error de conexión',
    serverError: 'Error del servidor',
    unauthorized: 'No autorizado',
    forbidden: 'Prohibido',
    notFound: 'No encontrado',
    
    // Confirmaciones
    confirmDelete: '¿Estás seguro de que quieres eliminar?',
    confirmAction: '¿Estás seguro de que quieres continuar?',
    actionCannotBeUndone: 'Esta acción no se puede deshacer',
    
    // ================================
    // INTERFAZ DE USUARIO
    // ================================
    gridView: 'Vista de cuadrícula',
    listView: 'Vista de lista',
    calendarView: 'Vista de calendario',
    tableView: 'Vista de tabla',
    cardView: 'Vista de tarjetas',
    
    // Navegación
    firstPage: 'Primera página',
    lastPage: 'Última página',
    nextPage: 'Página siguiente',
    previousPage: 'Página anterior',
    pageOf: 'Página {current} de {total}',
    
    // Búsqueda y filtros
    searchPlaceholder: 'Buscar...',
    filterBy: 'Filtrar por',
    sortBy: 'Ordenar por',
    clearFilters: 'Limpiar filtros',
    noFiltersApplied: 'No hay filtros aplicados',
    
    // Fechas y tiempo
    selectDate: 'Seleccionar fecha',
    selectTime: 'Seleccionar hora',
    timezone: 'Zona horaria',
    
    // ================================
    // MISCELÁNEO
    // ================================
    language: 'Idioma',
    theme: 'Tema',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    
    // Pie de página
    copyright: 'Todos los derechos reservados',
    privacyPolicy: 'Política de privacidad',
    termsOfService: 'Términos de servicio',
    
    // Tiempo
    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    day: 'día',
    days: 'días',
    week: 'semana',
    weeks: 'semanas',
    month: 'mes',
    months: 'meses',
    year: 'año',
    years: 'años',
    
    // Tamaños
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    extraLarge: 'Extra grande',
    
    // Direcciones
    up: 'Arriba',
    down: 'Abajo',
    left: 'Izquierda',
    right: 'Derecha',
    
    // Código QR
    qrCode: 'Código QR',
    scanQRCode: 'Escanear código QR',
    generateQRCode: 'Generar código QR',
    qrCodeScanned: '¡Código QR escaneado exitosamente!',
    invalidQRCode: 'Código QR inválido',
    
    // Emails
    sendEmail: 'Enviar email',
    emailSent: '¡Email enviado exitosamente!',
    emailError: 'Error al enviar email',
    emailSubject: 'Asunto del email',
    emailBody: 'Cuerpo del email',
    
    // Urgencia
    urgent: 'Urgente',
    critical: 'Crítico',
    highPriority: 'Alta prioridad',
    mediumPriority: 'Prioridad media',
    lowPriority: 'Baja prioridad',

    // ================================
    // ✅ NOUVELLES TRADUCTIONS CALENDAR
    // ================================ 
    calendar: {
      // Encabezados y navegación
      volunteerSchedule: 'Horario de Voluntarios',
      today: 'Hoy',
      previousWeek: 'Semana Anterior',
      nextWeek: 'Próxima Semana',
      
      // Días de la semana (formato corto)
      days: {
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mié',
        thu: 'Jue', 
        fri: 'Vie',
        sat: 'Sáb',
        sun: 'Dom'
      },
      
      // Leyenda de estados
      legend: {
        title: 'Leyenda',
        empty: 'Vacío',
        partiallyFilled: 'Parcialmente lleno',
        full: 'Completo',
        draft: 'Borrador',
        myShifts: 'Mis turnos',
        cancelled: 'Cancelado'
      },
      
      // Estados de turnos
      shiftStatus: {
        draft: 'BORRADOR',
        live: 'ACTIVO',
        full: 'COMPLETO',
        cancelled: 'CANCELADO'
      },
      
      // Mensajes de error - arrastrar y soltar
      errors: {
        cannotMoveToPast: 'No se puede mover turno a fecha pasada',
        cannotMoveToCurrentPastHour: 'No se puede mover turno a hora pasada',
        cannotCreateInPast: 'No se puede crear turno en el pasado',
        cannotCreateAtPastHour: 'No se puede crear turno en hora pasada',
        moveError: 'Error al mover turno',
        createError: 'Error al crear turno',
        updateError: 'Error al actualizar turno',
        statusChangeError: 'Error al cambiar estado'
      },
      
      // Mensajes de éxito
      success: {
        shiftMoved: 'Turno movido exitosamente',
        shiftCreated: '¡Turno creado exitosamente!',
        shiftUpdated: '¡Cambios guardados!',
        statusChanged: 'Estado cambiado exitosamente'
      },
      
      // Estados de carga
      loading: {
        moving: 'Moviendo...',
        creating: 'Creando...',
        updating: 'Actualizando...',
        changingStatus: 'Cambiando...'
      }
    },
    
    // ================================
    // MODALS - ESPAÑOL
    // ================================
    modals: {
      // Modal creación rápida
      quickCreate: {
        title: 'Nuevo Turno',
        titleField: 'Título',
        titlePlaceholder: 'Turno {hour}h',
        volunteers: 'Voluntarios',
        duration: 'Duración (h)',
        durationOptions: {
          oneHour: '1h',
          twoHours: '2h',
          threeHours: '3h',
          fourHours: '4h'
        },
        info: {
          date: 'Fecha',
          schedule: 'Horario'
        },
        buttons: {
          cancel: 'Cancelar',
          create: 'Crear'
        }
      },
      
      // Modal detalles del turno
      shiftDetails: {
        title: 'Detalles del Turno',
        fields: {
          date: 'Fecha',
          schedule: 'Horario',
          volunteers: 'Voluntarios',
          status: 'Estado'
        },
        buttons: {
          signUp: 'Inscribirse',
          unsubscribe: 'Desuscribirse',
          publish: 'Publicar', 
          draft: 'Borrador',
          edit: 'Editar',
          close: 'Cerrar'
        },
        messages: {
          shiftFull: 'Turno completo'
        }
      },
      
      // Modal edición de turno
      editShift: {
        title: 'Editar Turno',
        fields: {
          title: 'Título',
          description: 'Descripción',
          date: 'Fecha',
          maxVolunteers: 'Máx. voluntarios',
          startTime: 'Hora inicio',
          endTime: 'Hora fin',
          roleType: 'Tipo de rol',
          roleTypePlaceholder: 'Ej: recepción, técnico, seguridad...',
          checkInRequired: 'Check-in requerido'
        },
        buttons: {
          cancel: 'Cancelar',
          saveChanges: 'Guardar Cambios'
        }
      }
    },
    
    // ================================
    // SHIFTS - ESPAÑOL  
    // ================================
    shifts: {
      // Etiquetas genéricas
      hour: 'Hora',
      volunteers: 'Voluntarios',
      duration: 'Duración',
      
      // Acciones
      actions: {
        create: 'Crear turno',
        edit: 'Editar',
        delete: 'Eliminar',
        publish: 'Publicar',
        unpublish: 'Despublicar',
        signUp: 'Inscribirse',
        unsubscribe: 'Desuscribirse'
      }
    },

    // ================================
    // ✅ NOUVELLES TRADUCTIONS GRIDVIEW
    // ================================
    gridViewDetails: {
      // Encabezados principales
      title: 'Vista Cuadrícula - Horario Voluntarios',
      subtitle: 'Vista general tipo hoja de cálculo',
      
      // Navegación
      previousWeek: 'Semana Anterior',
      nextWeek: 'Próxima Semana',
      
      // Filtros y acciones
      filters: {
        allRoles: 'Todos los roles',
        registrationDesk: 'Registro',
        techSupport: 'Soporte Técnico',
        security: 'Seguridad',
        artistPickup: 'Transporte Artistas',
        cleanup: 'Limpieza',
        photography: 'Fotografía',
        setup: 'Montaje'
      },
      
      actions: {
        exportGrid: 'Exportar Cuadrícula',
        editShift: 'Editar Turno',
        signUp: 'Inscribirse'
      },
      
      // Columnas de la cuadrícula
      columns: {
        shifts: 'Turnos',
        timeSlots: 'Horarios'
      },
      
      // Estados y leyenda
      legend: {
        title: 'Leyenda',
        empty: 'Vacío (0-30%)',
        partial: 'Parcial (31-80%)',
        full: 'Completo (81-100%)',
        draft: 'Borrador'
      },
      
      // Indicadores visuales
      indicators: {
        empty: '🔴',
        partial: '🟡',
        full: '🟢',
        userSignedUp: '✓ Inscrito',
        draft: '(Borrador)'
      },
      
      // Estadísticas
      stats: {
        emptyShifts: 'Turnos Vacíos',
        partialShifts: 'Parciales',
        fullShifts: 'Completos',
        totalShifts: 'Total Turnos'
      },
      
      // Mensajes de estado
      messages: {
        noShifts: 'No hay turnos esta semana',
        noShiftsDescription: 'Los turnos aparecerán aquí una vez creados'
      },
      
      // Instrucciones de uso
      instructions: {
        title: '💡 Cómo usar:',
        organizer: [
          'Haz clic en una celda para editar el turno',
          'Las celdas rojas 🔴 necesitan atención urgente',
          'Usa los filtros para ver tipos específicos de roles'
        ],
        volunteer: [
          'Haz clic en una celda verde/amarilla para inscribirte',
          'Tus inscripciones están marcadas con un borde azul',
          '¡Las celdas rojas 🔴 necesitan voluntarios!'
        ]
      }
    }
  }
};

// Helper function pour obtenir les traductions avec fallback
export const getTranslation = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  // Fallback vers l'anglais si la traduction n'existe pas
  if (!value && lang !== 'en') {
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }
  
  // Fallback vers la clé si aucune traduction n'est trouvée
  return value || key;
};

// Hook personnalisé pour les traductions
export const useTranslation = (language: Language) => {
  const t = translations[language];
  
  return {
    t,
    // Fonction pour récupérer une traduction avec des paramètres
    translate: (key: string, params?: Record<string, string | number>) => {
      let translation = getTranslation(language, key);
      
      // Remplacer les paramètres {param} dans la traduction
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }
      
      return translation;
    }
  };
};

// Export des types pour TypeScript
export type TranslationKey = keyof typeof translations.fr;
export type TranslationParams = Record<string, string | number>;

// Constantes pour les langues supportées
export const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'es'];
export const DEFAULT_LANGUAGE: Language = 'en'; // Par défaut anglais pour BSF

// Fonction utilitaire pour détecter la langue du navigateur
export const detectBrowserLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('es')) return 'es';
    return 'en'; // Par défaut
  }
  
  return DEFAULT_LANGUAGE;
};

// Labels de langue pour l'interface
export const LANGUAGE_LABELS = {
  fr: '🇫🇷 Français',
  en: '🇺🇸 English', 
  es: '🇪🇸 Español'
} as const;