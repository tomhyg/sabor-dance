import React, { useState, useEffect } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, X, CheckCircle, Eye, EyeOff, Star, MessageSquare, Copy, Bell, Play, Instagram, ExternalLink, Heart, UserCheck, ArrowRight, BarChart3 } from 'lucide-react';

// Import des composants pages
import HomePage from './pages/HomePage';
import VolunteersPage from './pages/VolunteersPage';
import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/TeamsPage';
import ProfilesPage from './pages/ProfilesPage';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'assistant' | 'volunteer' | 'team_director' | 'artist' | 'attendee';
  profile_image?: string;
  bio?: string;
  instagram?: string;
  specialties?: string[];
  experience_years?: number;
  location?: string;
  phone?: string;
  qr_code?: string;
}

interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  required_volunteer_hours: number;
  status: 'draft' | 'live' | 'completed' | 'cancelled';
  team_submission_deadline: string;
  created_from_template?: string;
}

interface VolunteerShift {
  id: string;
  title: string;
  description: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  current_volunteers: number;
  role_type: string;
  status: 'draft' | 'live' | 'full' | 'cancelled';
  check_in_required: boolean;
}

interface VolunteerSignup {
  id: string;
  shift_id: string;
  volunteer_id: string;
  status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';
  signed_up_at: string;
  reminder_sent: boolean;
  checked_in_at?: string;
  qr_code?: string;
}

interface PerformanceTeam {
  id: string;
  team_name: string;
  director_name: string;
  director_email: string;
  studio_name: string;
  city: string;
  country: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  performance_video_url?: string;
  song_title?: string;
  group_size: number;
  dance_styles: string[];
  performance_order?: number;
  scoring?: {
    group_size_score: number;
    wow_factor_score: number;
    technical_score: number;
    style_variety_bonus: number;
    total_score: number;
  };
  organizer_notes?: string;
  can_edit_until: string;
  backup_team?: boolean;
}

// Langues complètes
const languages = {
  fr: {
    // Navigation
    login: 'Connexion',
    volunteers: 'Bénévoles',
    teams: 'Équipes',
    events: 'Événements',
    profiles: 'Profils',
    artists: 'Artistes',
    dashboard: 'Dashboard',
    
    // Homepage
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
    
    // Auth
    connection: 'Connexion',
    register: 'Inscription',
    fullName: 'Nom complet',
    role: 'Rôle',
    volunteer: '🙋‍♀️ Bénévole',
    teamDirector: '💃 Directeur d\'équipe',
    organizer: '🎯 Organisateur',
    assistant: '👥 Assistant',
    admin: '⚡ Admin',
    artist: '🎨 Artiste/Instructeur',
    attendee: '🎫 Participant',
    email: 'Email',
    password: 'Mot de passe',
    connect: 'Se connecter',
    signup: 'S\'inscrire',
    noAccount: 'Pas de compte ? S\'inscrire',
    hasAccount: 'Déjà un compte ? Se connecter',
    
    // Volunteers
    volunteerManagementTitle: 'Gestion des Bénévoles',
    createSlot: 'Créer un créneau',
    duplicateEvent: 'Dupliquer événement',
    signUp: 'S\'inscrire',
    checkIn: 'Pointer',
    confirmed: 'Confirmé',
    checkedIn: 'Présent',
    full: 'Complet',
    progress: 'Progression',
    publish: 'Publier',
    draft: 'Brouillon',
    
    // Teams
    performanceTeams: 'Équipes de Performance',
    createTeam: 'Créer une équipe',
    scoreTeam: 'Noter l\'équipe',
    submitted: 'Soumise',
    approved: 'Approuvée',
    rejected: 'Refusée',
    director: 'Directeur',
    studio: 'Studio',
    city: 'Ville',
    country: 'Pays',
    song: 'Chanson',
    watchVideo: 'Voir vidéo',
    approve: 'Approuver',
    reject: 'Refuser',
    groupSize: 'Taille du groupe',
    danceStyles: 'Styles de danse',
    performanceOrder: 'Ordre de passage',
    organizerNotes: 'Notes organisateur',
    teamName: 'Nom de l\'équipe',
    danceStyle: 'Style de danse',
    members: 'membres',
    
    // Profiles
    viewProfile: 'Voir profil',
    artistProfile: 'Profil Artiste',
    sampleVideos: 'Vidéos exemples',
    specialties: 'Spécialités',
    experience: 'Expérience',
    reviews: 'Avis',
    rating: 'Note',
    yearsExp: 'ans d\'expérience',
    availableBooking: 'Disponible pour booking',
    contactArtist: 'Contacter l\'artiste',
    watchSample: 'Voir échantillon',
    verified: 'Vérifié',
    basedIn: 'Basé à',
    teaches: 'Enseigne',
    priceRange: 'Tarifs',
    readMore: 'Lire plus',
    readLess: 'Lire moins',
    instagram: 'Instagram',
    website: 'Site web',
    
    // Dashboard
    criticalShifts: 'Créneaux Critiques',
    volunteersRegistered: 'Bénévoles Inscrits',
    completedShifts: 'Créneaux Complets',
    approvedTeams: 'Équipes Approuvées',
    refresh: 'Actualiser',
    shiftProgress: 'Progression Créneaux',
    teamStatus: 'Statut Équipes',
    urgentAlerts: 'Alertes Urgentes',
    quickActions: 'Actions Rapides',
    today: 'Aujourd\'hui',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    loading: 'Chargement...',
    search: 'Rechercher'
  },
  en: {
    // Navigation
    login: 'Login',
    volunteers: 'Volunteers',
    teams: 'Teams',
    events: 'Events',
    profiles: 'Profiles',
    artists: 'Artists',
    dashboard: 'Dashboard',
    
    // Homepage
    title: 'Sabor Dance',
    subtitle: 'The platform that digitalizes the Latin dance congress experience',
    volunteerManagement: 'Volunteer Management',
    volunteerDesc: 'Easily organize your volunteer slots and allow volunteers to sign up',
    teamPerformance: 'Performance Teams',
    teamDesc: 'Manage team submissions, technical rehearsals and shows',
    eventsTitle: 'Events',
    eventsDesc: 'Centralize the management of your Latin dance congresses',
    discover: 'Discover →',
    soon: 'Soon →',
    readyTitle: 'Ready to digitize your congress?',
    readyDesc: 'Join organizers who trust Sabor Dance to simplify their events',
    startFree: 'Start for free',
    
    // Auth
    connection: 'Login',
    register: 'Sign Up',
    fullName: 'Full Name',
    role: 'Role',
    volunteer: '🙋‍♀️ Volunteer',
    teamDirector: '💃 Team Director',
    organizer: '🎯 Organizer',
    assistant: '👥 Assistant',
    admin: '⚡ Admin',
    artist: '🎨 Artist/Instructor',
    attendee: '🎫 Attendee',
    email: 'Email',
    password: 'Password',
    connect: 'Log in',
    signup: 'Sign up',
    noAccount: 'No account? Sign up',
    hasAccount: 'Already have an account? Log in',
    
    // Volunteers
    volunteerManagementTitle: 'Volunteer Management',
    createSlot: 'Create slot',
    duplicateEvent: 'Duplicate event',
    signUp: 'Sign up',
    checkIn: 'Check in',
    confirmed: 'Confirmed',
    checkedIn: 'Checked in',
    full: 'Full',
    progress: 'Progress',
    publish: 'Publish',
    draft: 'Draft',
    
    // Teams
    performanceTeams: 'Performance Teams',
    createTeam: 'Create team',
    scoreTeam: 'Score team',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    director: 'Director',
    studio: 'Studio',
    city: 'City',
    country: 'Country',
    song: 'Song',
    watchVideo: 'Watch video',
    approve: 'Approve',
    reject: 'Reject',
    groupSize: 'Group size',
    danceStyles: 'Dance styles',
    performanceOrder: 'Performance order',
    organizerNotes: 'Organizer notes',
    teamName: 'Team name',
    danceStyle: 'Dance style',
    members: 'members',
    
    // Profiles
    viewProfile: 'View profile',
    artistProfile: 'Artist Profile',
    sampleVideos: 'Sample videos',
    specialties: 'Specialties',
    experience: 'Experience',
    reviews: 'Reviews',
    rating: 'Rating',
    yearsExp: 'years experience',
    availableBooking: 'Available for booking',
    contactArtist: 'Contact artist',
    watchSample: 'Watch sample',
    verified: 'Verified',
    basedIn: 'Based in',
    teaches: 'Teaches',
    priceRange: 'Price range',
    readMore: 'Read more',
    readLess: 'Read less',
    instagram: 'Instagram',
    website: 'Website',
    
    // Dashboard
    criticalShifts: 'Critical Shifts',
    volunteersRegistered: 'Volunteers Registered',
    completedShifts: 'Completed Shifts',
    approvedTeams: 'Approved Teams',
    refresh: 'Refresh',
    shiftProgress: 'Shift Progress',
    teamStatus: 'Team Status',
    urgentAlerts: 'Urgent Alerts',
    quickActions: 'Quick Actions',
    today: 'Today',
    thisWeek: 'This week',
    thisMonth: 'This month',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    search: 'Search'
  },
  es: {
    // Navigation
    login: 'Iniciar sesión',
    volunteers: 'Voluntarios',
    teams: 'Equipos',
    events: 'Eventos',
    profiles: 'Perfiles',
    artists: 'Artistas',
    dashboard: 'Panel de Control',
    
    // Homepage
    title: 'Sabor Dance',
    subtitle: 'La plataforma que digitaliza la experiencia de los congresos de danza latina',
    volunteerManagement: 'Gestión de Voluntarios',
    volunteerDesc: 'Organiza fácilmente tus turnos de voluntarios y permite que se registren',
    teamPerformance: 'Equipos de Performance',
    teamDesc: 'Gestiona las presentaciones de equipos, ensayos técnicos y espectáculos',
    eventsTitle: 'Eventos',
    eventsDesc: 'Centraliza la gestión de tus congresos de danza latina',
    discover: 'Descubrir →',
    soon: 'Pronto →',
    readyTitle: '¿Listo para digitalizar tu congreso?',
    readyDesc: 'Únete a los organizadores que confían en Sabor Dance para simplificar sus eventos',
    startFree: 'Comenzar gratis',
    
    // Auth
    connection: 'Iniciar sesión',
    register: 'Registrarse',
    fullName: 'Nombre completo',
    role: 'Rol',
    volunteer: '🙋‍♀️ Voluntario',
    teamDirector: '💃 Director de equipo',
    organizer: '🎯 Organizador',
    assistant: '👥 Asistente',
    admin: '⚡ Admin',
    artist: '🎨 Artista/Instructor',
    attendee: '🎫 Participante',
    email: 'Email',
    password: 'Contraseña',
    connect: 'Iniciar sesión',
    signup: 'Registrarse',
    noAccount: '¿No tienes cuenta? Regístrate',
    hasAccount: '¿Ya tienes cuenta? Inicia sesión',
    
    // Volunteers
    volunteerManagementTitle: 'Gestión de Voluntarios',
    createSlot: 'Crear turno',
    duplicateEvent: 'Duplicar evento',
    signUp: 'Registrarse',
    checkIn: 'Registrar',
    confirmed: 'Confirmado',
    checkedIn: 'Presente',
    full: 'Completo',
    progress: 'Progreso',
    publish: 'Publicar',
    draft: 'Borrador',
    
    // Teams
    performanceTeams: 'Equipos de Performance',
    createTeam: 'Crear equipo',
    scoreTeam: 'Puntuar equipo',
    submitted: 'Enviado',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    director: 'Director',
    studio: 'Estudio',
    city: 'Ciudad',
    country: 'País',
    song: 'Canción',
    watchVideo: 'Ver video',
    approve: 'Aprobar',
    reject: 'Rechazar',
    groupSize: 'Tamaño del grupo',
    danceStyles: 'Estilos de danza',
    performanceOrder: 'Orden de actuación',
    organizerNotes: 'Notas del organizador',
    teamName: 'Nombre del equipo',
    danceStyle: 'Estilo de danza',
    members: 'miembros',
    
    // Profiles
    viewProfile: 'Ver perfil',
    artistProfile: 'Perfil Artista',
    sampleVideos: 'Videos muestra',
    specialties: 'Especialidades',
    experience: 'Experiencia',
    reviews: 'Reseñas',
    rating: 'Calificación',
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
    instagram: 'Instagram',
    website: 'Sitio web',
    
    // Dashboard
    criticalShifts: 'Turnos Críticos',
    volunteersRegistered: 'Voluntarios Registrados',
    completedShifts: 'Turnos Completados',
    approvedTeams: 'Equipos Aprobados',
    refresh: 'Actualizar',
    shiftProgress: 'Progreso Turnos',
    teamStatus: 'Estado Equipos',
    urgentAlerts: 'Alertas Urgentes',
    quickActions: 'Acciones Rápidas',
    today: 'Hoy',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    loading: 'Cargando...',
    search: 'Buscar'
  }
};

type Language = 'fr' | 'en' | 'es';

// Composant principal
const SaborDanceApp = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  
  const t = languages[currentLanguage];

  // Données de démo
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Boston Salsa Festival 2025',
      start_date: '2025-06-20',
      end_date: '2025-06-22',
      location: 'Boston Convention Center',
      required_volunteer_hours: 8,
      status: 'live',
      team_submission_deadline: '2025-06-15'
    }
  ]);

  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([
    {
      id: '1',
      title: 'Accueil et enregistrement',
      description: 'Accueillir les participants et gérer les inscriptions',
      shift_date: '2025-06-20',
      start_time: '09:00',
      end_time: '12:00',
      max_volunteers: 3,
      current_volunteers: 1,
      role_type: 'registration_desk',
      status: 'live',
      check_in_required: true
    },
    {
      id: '2',
      title: 'Assistance technique',
      description: 'Support technique pour les ateliers',
      shift_date: '2025-06-20',
      start_time: '14:00',
      end_time: '18:00',
      max_volunteers: 2,
      current_volunteers: 0,
      role_type: 'tech_support',
      status: 'live',
      check_in_required: true
    },
    {
      id: '3',
      title: 'Transport artistes',
      description: 'Récupérer les artistes à l\'aéroport',
      shift_date: '2025-06-19',
      start_time: '16:00',
      end_time: '20:00',
      max_volunteers: 4,
      current_volunteers: 4,
      role_type: 'artist_pickup',
      status: 'full',
      check_in_required: true
    },
    {
      id: '4',
      title: 'Setup technique matinée',
      description: 'Installation équipement son et éclairage',
      shift_date: '2025-06-20',
      start_time: '07:00',
      end_time: '09:00',
      max_volunteers: 5,
      current_volunteers: 2,
      role_type: 'tech_setup',
      status: 'live',
      check_in_required: true
    },
    {
      id: '5',
      title: 'Vente merchandising',
      description: 'Gestion stand de vente t-shirts et accessoires',
      shift_date: '2025-06-21',
      start_time: '10:00',
      end_time: '18:00',
      max_volunteers: 2,
      current_volunteers: 1,
      role_type: 'merchandise',
      status: 'live',
      check_in_required: true
    },
    {
      id: '6',
      title: 'Sécurité backstage',
      description: 'Contrôle d\'accès zone artistes',
      shift_date: '2025-06-21',
      start_time: '19:00',
      end_time: '02:00',
      max_volunteers: 3,
      current_volunteers: 0,
      role_type: 'security',
      status: 'live',
      check_in_required: true
    }
  ]);

  const [volunteerSignups, setVolunteerSignups] = useState<VolunteerSignup[]>([
    {
      id: '1',
      shift_id: '1',
      volunteer_id: 'vol1',
      status: 'signed_up',
      signed_up_at: '2025-06-01T10:00:00Z',
      reminder_sent: false,
      qr_code: 'SABOR_VOL_vol1_1735804800000'
    },
    {
      id: '2',
      shift_id: '3',
      volunteer_id: 'vol2',
      status: 'confirmed',
      signed_up_at: '2025-06-02T14:30:00Z',
      reminder_sent: true,
      qr_code: 'SABOR_VOL_vol2_1735804900000'
    },
    {
      id: '3',
      shift_id: '3',
      volunteer_id: 'vol3',
      status: 'confirmed',
      signed_up_at: '2025-06-02T15:15:00Z',
      reminder_sent: true,
      qr_code: 'SABOR_VOL_vol3_1735805000000'
    },
    {
      id: '4',
      shift_id: '4',
      volunteer_id: 'vol4',
      status: 'signed_up',
      signed_up_at: '2025-06-03T09:00:00Z',
      reminder_sent: false,
      qr_code: 'SABOR_VOL_vol4_1735805100000'
    },
    {
      id: '5',
      shift_id: '4',
      volunteer_id: 'vol5',
      status: 'signed_up',
      signed_up_at: '2025-06-03T11:20:00Z',
      reminder_sent: false,
      qr_code: 'SABOR_VOL_vol5_1735805200000'
    }
  ]);

  const [performanceTeams, setPerformanceTeams] = useState<PerformanceTeam[]>([
    {
      id: '1',
      team_name: 'Boston Salsa Collective',
      director_name: 'María González',
      director_email: 'maria@bostonsalsa.com',
      studio_name: 'Boston Latin Dance Academy',
      city: 'Boston',
      country: 'USA',
      status: 'submitted',
      song_title: 'La Vida Es Un Carnaval',
      group_size: 8,
      dance_styles: ['Salsa'],
      can_edit_until: '2025-06-15',
      backup_team: false
    },
    {
      id: '2',
      team_name: 'Bachata Elegance',
      director_name: 'Carlos Rodriguez',
      director_email: 'carlos@bachataelegance.com',
      studio_name: 'Elegance Dance Studio',
      city: 'Madrid',
      country: 'Spain',
      status: 'approved',
      song_title: 'Obsesión',
      group_size: 6,
      dance_styles: ['Bachata'],
      performance_order: 1,
      scoring: {
        group_size_score: 7,
        wow_factor_score: 9,
        technical_score: 8,
        style_variety_bonus: 0,
        total_score: 24
      },
      organizer_notes: 'Excellent technique, great stage presence',
      can_edit_until: '2025-06-15',
      backup_team: false
    },
    {
      id: '3',
      team_name: 'Kizomba Fusion NYC',
      director_name: 'Aminata Diallo',
      director_email: 'aminata@kizombafusion.nyc',
      studio_name: 'African Rhythms Studio',
      city: 'New York',
      country: 'USA',
      status: 'approved',
      song_title: 'Meu Amor',
      group_size: 4,
      dance_styles: ['Kizomba', 'Urban Kiz'],
      performance_order: 2,
      scoring: {
        group_size_score: 5,
        wow_factor_score: 10,
        technical_score: 9,
        style_variety_bonus: 2,
        total_score: 26
      },
      organizer_notes: 'Innovative choreography, perfect execution',
      can_edit_until: '2025-06-15',
      backup_team: false
    },
    {
      id: '4',
      team_name: 'Les Danseurs de Paris',
      director_name: 'Jean-Baptiste Moreau',
      director_email: 'jb@danseursparis.fr',
      studio_name: 'Studio Danse Latine Paris',
      city: 'Paris',
      country: 'France',
      status: 'submitted',
      song_title: 'Quimbara',
      group_size: 12,
      dance_styles: ['Salsa', 'Mambo'],
      can_edit_until: '2025-06-15',
      backup_team: false
    }
  ]);

  // Composant sélecteur de langue
  const LanguageSelector = () => (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value as Language)}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 cursor-pointer"
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇺🇸 English</option>
        <option value="es">🇪🇸 Español</option>
      </select>
    </div>
  );

  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'volunteer' | 'organizer' | 'team_director' | 'assistant' | 'artist' | 'attendee'>('attendee');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = () => {
      // Simulation de l'authentification
      const user: User = {
        id: '1',
        email,
        full_name: authMode === 'register' ? fullName : 'Utilisateur Test',
        role: authMode === 'register' ? role : 'organizer',
        qr_code: `SABOR_VOL_1_${Date.now()}`
      };
      setCurrentUser(user);
      setShowAuth(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {authMode === 'login' ? t.connection : t.register}
            </h2>
            <button 
              onClick={() => setShowAuth(false)} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.fullName}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder={t.fullName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.role}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'volunteer' | 'organizer' | 'team_director' | 'assistant' | 'artist' | 'attendee')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="volunteer">{t.volunteer}</option>
                    <option value="attendee">{t.attendee}</option>
                    <option value="team_director">{t.teamDirector}</option>
                    <option value="artist">{t.artist}</option>
                    <option value="organizer">{t.organizer}</option>
                    <option value="assistant">{t.assistant}</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {authMode === 'login' ? t.connect : t.signup}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
            >
              {authMode === 'login' ? t.noAccount : t.hasAccount}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-200"
            >
              {t.title}
            </button>
            
            {currentUser && (
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentView === 'dashboard' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600'
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>{t.dashboard}</span>
                </button>
                <button
                  onClick={() => setCurrentView('volunteers')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentView === 'volunteers' 
                      ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-lime-500 hover:to-green-500'
                  }`}
                >
                  <Users size={20} />
                  <span>{t.volunteers}</span>
                </button>
                <button
                  onClick={() => setCurrentView('teams')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentView === 'teams' 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600'
                  }`}
                >
                  <Music size={20} />
                  <span>{t.teams}</span>
                </button>
                <button
                  onClick={() => setCurrentView('profiles')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentView === 'profiles' 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600'
                  }`}
                >
                  <User size={20} />
                  <span>{t.profiles}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-800">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogIn size={20} />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  // Rendu principal
  const renderCurrentView = () => {
    if (!currentUser && currentView !== 'home') {
      return <HomePage t={t} setCurrentView={setCurrentView} setShowAuth={setShowAuth} />;
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            t={t}
            volunteerShifts={volunteerShifts}
            performanceTeams={performanceTeams}
            volunteerSignups={volunteerSignups}
            currentUser={currentUser}
          />
        );
      case 'volunteers':
        return (
          <VolunteersPage 
            t={t}
            currentUser={currentUser}
            volunteerShifts={volunteerShifts}
            setVolunteerShifts={setVolunteerShifts}
            volunteerSignups={volunteerSignups}
            setVolunteerSignups={setVolunteerSignups}
            events={events}
            setEvents={setEvents}
          />
        );
      case 'teams':
        return (
          <TeamsPage 
            t={t}
            currentUser={currentUser}
            performanceTeams={performanceTeams}
            setPerformanceTeams={setPerformanceTeams}
          />
        );
      case 'profiles':
        return (
          <ProfilesPage 
            t={t}
            currentUser={currentUser}
          />
        );
      default:
        return <HomePage t={t} setCurrentView={setCurrentView} setShowAuth={setShowAuth} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {renderCurrentView()}
      {showAuth && <AuthModal />}
    </div>
  );
};

export default SaborDanceApp;