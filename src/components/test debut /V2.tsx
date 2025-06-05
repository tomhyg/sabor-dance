import React, { useState, useEffect } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, X, CheckCircle, Eye, EyeOff, Star, MessageSquare, Copy, Bell, Play, Instagram, ExternalLink, Heart, UserCheck, ArrowRight } from 'lucide-react';
// import NotificationSystem from './NotificationSystem'; // Temporairement désactivé

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
}

interface Artist {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  profile_image: string;
  instagram?: string;
  website?: string;
  sample_videos: SampleVideo[];
  rating: number;
  total_reviews: number;
  location: string;
  available_for_booking: boolean;
  price_range?: string;
}

interface SampleVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  dance_style: string;
  duration: string;
}

interface Review {
  id: string;
  artist_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  event_name: string;
  date: string;
  verified: boolean;
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

const languages = {
  fr: {
    // Navigation
    login: 'Connexion',
    volunteers: 'Bénévoles',
    teams: 'Équipes',
    events: 'Événements',
    profiles: 'Profils',
    artists: 'Artistes',
    
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
    
    // Teams
    performanceTeams: 'Équipes de Performance',
    createTeam: 'Créer une équipe',
    scoreTeam: 'Noter l\'équipe',
    draft: 'Brouillon',
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
    verified: 'Vérifié'
  },
  en: {
    // Navigation
    login: 'Login',
    volunteers: 'Volunteers',
    teams: 'Teams',
    events: 'Events',
    profiles: 'Profiles',
    artists: 'Artists',
    
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
    
    // Teams
    performanceTeams: 'Performance Teams',
    createTeam: 'Create team',
    scoreTeam: 'Score team',
    draft: 'Draft',
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
    verified: 'Verified'
  },
  es: {
    // Navigation
    login: 'Iniciar sesión',
    volunteers: 'Voluntarios',
    teams: 'Equipos',
    events: 'Eventos',
    profiles: 'Perfiles',
    artists: 'Artistas',
    
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
    
    // Teams
    performanceTeams: 'Equipos de Performance',
    createTeam: 'Crear equipo',
    scoreTeam: 'Puntuar equipo',
    draft: 'Borrador',
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
    verified: 'Verificado'
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
      name: 'Festival de Danse Latine 2025',
      start_date: '2025-06-20',
      end_date: '2025-06-22',
      location: 'Convention Center',
      required_volunteer_hours: 8,
      status: 'live',
      team_submission_deadline: '2025-06-15'
    }
  ]);

  // Données artistes de démo
  const [artists, setArtists] = useState<Artist[]>([
    {
      id: '1',
      user_id: 'artist1',
      stage_name: 'Diana Jiménez',
      bio: 'Experienced Cuban salsa instructor with a passion for sharing the joy of Latin dance. Specialized in Cuban Casino and Rueda de Casino with over 10 years of international teaching experience.',
      specialties: ['Cuban Salsa', 'Rueda de Casino', 'Son Cubano'],
      experience_years: 12,
      profile_image: '/api/placeholder/300/300',
      instagram: '@dianajeminez_salsa',
      website: 'www.cubanpassion.com',
      sample_videos: [
        {
          id: 'v1',
          title: 'Cuban Salsa Basics',
          url: 'https://youtube.com/watch?v=example1',
          thumbnail: '/api/placeholder/200/120',
          dance_style: 'Cuban Salsa',
          duration: '3:45'
        },
        {
          id: 'v2',
          title: 'Rueda de Casino Advanced',
          url: 'https://youtube.com/watch?v=example2',
          thumbnail: '/api/placeholder/200/120',
          dance_style: 'Rueda de Casino',
          duration: '5:12'
        }
      ],
      rating: 4.8,
      total_reviews: 127,
      location: 'Paris, France',
      available_for_booking: true,
      price_range: '€80-150/hour'
    },
    {
      id: '2',
      user_id: 'artist2',
      stage_name: 'Carlos Mendoza',
      bio: 'International bachata champion and instructor. Known for his smooth style and technical precision in modern bachata and sensual bachata.',
      specialties: ['Modern Bachata', 'Sensual Bachata', 'Dominican Bachata'],
      experience_years: 8,
      profile_image: '/api/placeholder/300/300',
      instagram: '@carlosbachata',
      sample_videos: [
        {
          id: 'v3',
          title: 'Bachata Sensual Flow',
          url: 'https://youtube.com/watch?v=example3',
          thumbnail: '/api/placeholder/200/120',
          dance_style: 'Sensual Bachata',
          duration: '4:20'
        }
      ],
      rating: 4.9,
      total_reviews: 89,
      location: 'Barcelona, Spain',
      available_for_booking: true,
      price_range: '€100-200/hour'
    }
  ]);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      artist_id: '1',
      reviewer_name: 'Marie Dubois',
      rating: 5,
      comment: 'Diana is an amazing instructor! Her technique is flawless and she explains everything so clearly. I learned more in one weekend than in months of regular classes.',
      event_name: 'Paris Salsa Congress 2024',
      date: '2024-05-15',
      verified: true
    },
    {
      id: '2',
      artist_id: '1',
      reviewer_name: 'Jean-Luc Martinez',
      rating: 5,
      comment: 'Incredible energy and passion. Diana makes Cuban salsa accessible to everyone while maintaining authenticity.',
      event_name: 'Lyon Bachata Festival',
      date: '2024-03-22',
      verified: true
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
    }
  ]);

  const [volunteerSignups, setVolunteerSignups] = useState<VolunteerSignup[]>([]);

  const [performanceTeams, setPerformanceTeams] = useState<PerformanceTeam[]>([
    {
      id: '1',
      team_name: 'Salsa Passion',
      director_name: 'María González',
      director_email: 'maria@salsapassion.com',
      studio_name: 'Dance Studio Paris',
      city: 'Paris',
      country: 'France',
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
        role: authMode === 'register' ? role : 'organizer'
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

  // Page d'accueil - Style DORA
  const HomePage = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
      <div className="min-h-screen bg-black overflow-hidden">
        {/* Hero Section with DORA-style gradients */}
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-pink-800"></div>
            <div 
              className="absolute w-96 h-96 bg-gradient-to-r from-pink-500/30 to-violet-500/30 rounded-full blur-3xl animate-pulse"
              style={{
                left: mousePosition.x * 0.01 + 'px',
                top: mousePosition.y * 0.01 + 'px',
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-white/20 rounded-full animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-8 animate-fade-in">
                <Star className="w-4 h-4" />
                Révolutionnez vos congrès de danse
                <Star className="w-4 h-4" />
              </div>
            </div>

            {/* Main Title - DORA Style */}
            <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-violet-200 mb-8 leading-none tracking-tighter animate-slide-up">
              Sabor
            </h1>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-purple-400 mb-12 leading-none tracking-tighter animate-slide-up delay-200">
              Dance
            </h2>

            {/* Subtitle with animation */}
            <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-medium max-w-4xl mx-auto leading-relaxed mb-16 animate-fade-in delay-400">
              La plateforme qui digitalise l'expérience des congrès de danse latine
              <br />
              <span className="text-pink-300">Salsa • Bachata • Kizomba • Zouk</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in delay-600">
              <button 
                onClick={() => setShowAuth(true)}
                className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xl font-bold rounded-2xl hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.startFree}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group flex items-center gap-3 px-8 py-6 text-white/90 text-xl font-semibold hover:text-white transition-all duration-300">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                Voir la démo
              </button>
            </div>
          </div>
        </div>

        {/* Features Section with DORA-style cards */}
        <div className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-6">
                Fonctionnalités
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Des outils puissants pour organiser des événements inoubliables
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Volunteer Management Card */}
              <div 
                onClick={() => setCurrentView('volunteers')}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-600/20 group-hover:from-green-300/30 group-hover:to-teal-500/30 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 group-hover:text-green-100 transition-colors">
                    {t.volunteerManagement}
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-8">
                    {t.volunteerDesc}
                  </p>
                  
                  <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                    <span className="font-semibold">{t.discover}</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 bg-emerald-300/20 rounded-full blur-lg group-hover:scale-150 transition-all duration-700"></div>
              </div>

              {/* Performance Teams Card */}
              <div 
                onClick={() => setCurrentView('teams')}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 group-hover:from-purple-300/30 group-hover:to-indigo-500/30 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 group-hover:text-purple-100 transition-colors">
                    {t.teamPerformance}
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-8">
                    {t.teamDesc}
                  </p>
                  
                  <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                    <span className="font-semibold">{t.discover}</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-lg group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-violet-300/20 rounded-full blur-xl group-hover:scale-125 transition-all duration-700"></div>
              </div>

              {/* Profiles Card */}
              <div 
                onClick={() => setCurrentView('profiles')}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-600 to-red-700 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-600/20 group-hover:from-orange-300/30 group-hover:to-red-500/30 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 group-hover:text-orange-100 transition-colors">
                    {t.profiles}
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-8">
                    Découvrez les profils des artistes et instructeurs de danse latine
                  </p>
                  
                  <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                    <span className="font-semibold">{t.discover}</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="absolute top-8 right-8 w-14 h-14 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="absolute bottom-6 left-6 w-18 h-18 bg-pink-300/20 rounded-full blur-lg group-hover:scale-110 transition-all duration-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="relative py-32 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-violet-200 mb-8 leading-tight">
                {t.readyTitle}
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                {t.readyDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={() => setShowAuth(true)}
                  className="group px-12 py-6 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xl font-bold rounded-2xl hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    {t.startFree}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button className="px-8 py-6 border-2 border-white/20 text-white text-xl font-semibold rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                  Demander une démo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Animations */}
        <style jsx>{`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          .animate-slide-up {
            animation: slide-up 1s ease-out forwards;
          }
          
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-400 {
            animation-delay: 0.4s;
          }
          
          .delay-600 {
            animation-delay: 0.6s;
          }
        `}</style>
      </div>
    );
  };

  // Module Gestion Bénévoles - Style DORA
  const VolunteersPage = () => {
    const [showCreateShift, setShowCreateShift] = useState(false);
    const [showDuplicateEvent, setShowDuplicateEvent] = useState(false);
    const [userVolunteerHours, setUserVolunteerHours] = useState(0);
    const requiredHours = 8;
    const [newShift, setNewShift] = useState({
      title: '',
      description: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      max_volunteers: 1,
      role_type: '',
      check_in_required: true
    });

    const handleCreateShift = () => {
      const shift: VolunteerShift = {
        id: Date.now().toString(),
        ...newShift,
        current_volunteers: 0,
        status: 'draft'
      };
      setVolunteerShifts([...volunteerShifts, shift]);
      setShowCreateShift(false);
      setNewShift({
        title: '',
        description: '',
        shift_date: '',
        start_time: '',
        end_time: '',
        max_volunteers: 1,
        role_type: '',
        check_in_required: true
      });
    };

    const signUpForShift = (shiftId: string) => {
      const shift = volunteerShifts.find(s => s.id === shiftId);
      if (shift && shift.current_volunteers < shift.max_volunteers) {
        const signup: VolunteerSignup = {
          id: Date.now().toString(),
          shift_id: shiftId,
          volunteer_id: currentUser?.id || '1',
          status: 'signed_up',
          signed_up_at: new Date().toISOString(),
          reminder_sent: false
        };
        
        setVolunteerSignups([...volunteerSignups, signup]);
        
        const shiftDuration = calculateShiftDuration(shift.start_time, shift.end_time);
        setUserVolunteerHours(prev => prev + shiftDuration);
        
        setVolunteerShifts(shifts =>
          shifts.map(s =>
            s.id === shiftId 
              ? { 
                  ...s, 
                  current_volunteers: s.current_volunteers + 1,
                  status: s.current_volunteers + 1 >= s.max_volunteers ? 'full' : s.status
                }
              : s
          )
        );
      }
    };

    const calculateShiftDuration = (startTime: string, endTime: string) => {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    };

    const changeShiftStatus = (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === shiftId ? { ...shift, status: newStatus } : shift
        )
      );
    };

    const duplicateFromEvent = (eventId: string) => {
      const sourceEvent = events.find(e => e.id === eventId);
      if (sourceEvent) {
        const newEvent: Event = {
          ...sourceEvent,
          id: Date.now().toString(),
          name: `${sourceEvent.name} (Copie)`,
          created_from_template: eventId,
          status: 'draft'
        };
        setEvents([...events, newEvent]);
        setShowDuplicateEvent(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
        {/* Hero Header */}
        <div className="relative py-20 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-bounce"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                  Gestion des Bénévoles
                </h1>
                <p className="text-xl text-green-100 max-w-2xl">
                  Organisez et gérez vos équipes bénévoles avec simplicité et efficacité
                </p>
              </div>
              
              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowDuplicateEvent(true)}
                    className="group bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                  >
                    <Copy size={18} />
                    {t.duplicateEvent}
                  </button>
                  <button
                    onClick={() => setShowCreateShift(true)}
                    className="group bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold hover:from-lime-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                  >
                    <Plus size={20} />
                    {t.createSlot}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Progression des heures bénévoles */}
          {currentUser?.role === 'volunteer' && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-green-400" />
                Mon Progression Bénévolat
              </h2>
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-300 text-lg">Heures complétées</span>
                <span className="font-bold text-2xl text-white">{userVolunteerHours}h / {requiredHours}h</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-lime-500 to-green-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min((userVolunteerHours / requiredHours) * 100, 100)}%` }}
                ></div>
              </div>
              {userVolunteerHours >= requiredHours && (
                <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl">
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle size={24} />
                    <span className="font-bold text-lg">Félicitations ! Vos heures bénévoles sont complétées !</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste des créneaux */}
          <div className="grid gap-6">
            {volunteerShifts.map(shift => (
              <div key={shift.id} className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">{shift.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        shift.status === 'draft' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                        shift.status === 'live' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        shift.status === 'full' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {shift.status.toUpperCase()}
                      </span>
                      {shift.check_in_required && (
                        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Check-in requis
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{shift.description}</p>
                    
                    <div className="flex flex-wrap gap-6 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-green-400" />
                        <span className="font-medium">{new Date(shift.shift_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={20} className="text-green-400" />
                        <span className="font-medium">{shift.start_time} - {shift.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={20} className="text-green-400" />
                        <span className="font-medium">{shift.current_volunteers}/{shift.max_volunteers} bénévoles</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-8 flex flex-col gap-3">
                    {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => changeShiftStatus(shift.id, shift.status === 'draft' ? 'live' : 'draft')}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                            shift.status === 'draft' 
                              ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25' 
                              : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-gray-500/25'
                          }`}
                        >
                          {shift.status === 'draft' ? 'Publier' : 'Brouillon'}
                        </button>
                      </div>
                    )}
                    
                    {shift.status === 'full' ? (
                      <div className="bg-gray-600/30 text-gray-400 px-6 py-3 rounded-xl font-bold text-center border border-gray-500/30">
                        {t.full}
                      </div>
                    ) : shift.status === 'live' ? (
                      <button
                        onClick={() => signUpForShift(shift.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                      >
                        {t.signUp}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-300">{t.progress}</span>
                    <span className="text-sm text-gray-400">
                      {Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-lime-500 to-green-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${(shift.current_volunteers / shift.max_volunteers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de création de créneau */}
          {showCreateShift && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Créer un créneau</h2>
                  <button onClick={() => setShowCreateShift(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Titre</label>
                    <input
                      type="text"
                      value={newShift.title}
                      onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Ex: Accueil et enregistrement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newShift.description}
                      onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 transition-all duration-200"
                      placeholder="Décrivez les tâches du bénévole..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={newShift.shift_date}
                        onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Nb bénévoles</label>
                      <input
                        type="number"
                        min="1"
                        value={newShift.max_volunteers}
                        onChange={(e) => setNewShift({...newShift, max_volunteers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Heure début</label>
                      <input
                        type="time"
                        value={newShift.start_time}
                        onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Heure fin</label>
                      <input
                        type="time"
                        value={newShift.end_time}
                        onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newShift.check_in_required}
                      onChange={(e) => setNewShift({...newShift, check_in_required: e.target.checked})}
                      className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <label className="text-gray-300 font-medium">Check-in requis le jour J</label>
                  </div>

                  <button
                    onClick={handleCreateShift}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    Créer le créneau
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de duplication d'événement */}
          {showDuplicateEvent && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Dupliquer un événement</h2>
                  <button onClick={() => setShowDuplicateEvent(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300">Sélectionnez un événement à dupliquer :</p>
                  {events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => duplicateFromEvent(event.id)}
                      className="w-full p-4 text-left bg-gray-700/30 border border-gray-600/30 rounded-xl hover:bg-gray-600/30 hover:border-green-500/30 transition-all duration-300 text-white"
                    >
                      <div className="font-semibold">{event.name}</div>
                      <div className="text-sm text-gray-400">{event.location} • {event.start_date}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Module Équipes de Performance - Style DORA
  const TeamsPage = () => {
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<PerformanceTeam | null>(null);
    const [newTeam, setNewTeam] = useState({
      team_name: '',
      director_name: '',
      director_email: '',
      studio_name: '',
      city: '',
      country: '',
      song_title: '',
      performance_video_url: '',
      group_size: 4,
      dance_styles: [] as string[],
      backup_team: false
    });

    const [scoring, setScoring] = useState({
      group_size_score: 5,
      wow_factor_score: 5,
      technical_score: 5,
      style_variety_bonus: 0
    });

    const handleCreateTeam = () => {
      const team: PerformanceTeam = {
        id: Date.now().toString(),
        ...newTeam,
        status: 'draft',
        can_edit_until: '2025-06-15'
      };
      setPerformanceTeams([...performanceTeams, team]);
      setShowCreateTeam(false);
      setNewTeam({
        team_name: '',
        director_name: '',
        director_email: '',
        studio_name: '',
        city: '',
        country: '',
        song_title: '',
        performance_video_url: '',
        group_size: 4,
        dance_styles: [],
        backup_team: false
      });
    };

    const handleScoreTeam = () => {
      if (selectedTeam) {
        const totalScore = scoring.group_size_score + scoring.wow_factor_score + scoring.technical_score + scoring.style_variety_bonus;
        
        setPerformanceTeams(teams =>
          teams.map(team =>
            team.id === selectedTeam.id 
              ? { 
                  ...team, 
                  scoring: { ...scoring, total_score: totalScore },
                  status: 'approved'
                }
              : team
          )
        );
        
        setShowScoreModal(false);
        setSelectedTeam(null);
      }
    };

    const changeTeamStatus = (teamId: string, newStatus: 'draft' | 'submitted' | 'approved' | 'rejected') => {
      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === teamId ? { ...team, status: newStatus } : team
        )
      );
    };

    const addOrganizerNote = (teamId: string, note: string) => {
      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === teamId ? { ...team, organizer_notes: note } : team
        )
      );
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        case 'submitted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'draft': return t.draft;
        case 'submitted': return t.submitted;
        case 'approved': return t.approved;
        case 'rejected': return t.rejected;
        default: return status;
      }
    };

    // Trier les équipes par ordre de passage puis par score
    const sortedTeams = [...performanceTeams].sort((a, b) => {
      if (a.performance_order && b.performance_order) {
        return a.performance_order - b.performance_order;
      }
      if (a.scoring?.total_score && b.scoring?.total_score) {
        return b.scoring.total_score - a.scoring.total_score;
      }
      return 0;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* Hero Header */}
        <div className="relative py-20 bg-gradient-to-r from-purple-600 via-violet-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                  {t.performanceTeams}
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl">
                  Gérez les soumissions, répétitions techniques et spectacles avec facilité
                </p>
              </div>
              
              {(currentUser?.role === 'team_director' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="group bg-gradient-to-r from-pink-500 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <Plus size={20} />
                  {t.createTeam}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Liste des équipes */}
          <div className="grid gap-6">
            {sortedTeams.map(team => (
              <div key={team.id} className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">{team.team_name}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(team.status)}`}>
                        {getStatusText(team.status)}
                      </span>
                      {team.backup_team && (
                        <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          Équipe de backup
                        </span>
                      )}
                      {team.performance_order && (
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          #{team.performance_order}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 text-gray-300 mb-6">
                      <div className="space-y-2">
                        <p><span className="text-purple-400 font-semibold">{t.director}:</span> {team.director_name}</p>
                        <p><span className="text-purple-400 font-semibold">Email:</span> {team.director_email}</p>
                        <p><span className="text-purple-400 font-semibold">{t.studio}:</span> {team.studio_name}</p>
                        <p><span className="text-purple-400 font-semibold">{t.groupSize}:</span> {team.group_size} personnes</p>
                      </div>
                      <div className="space-y-2">
                        <p><span className="text-purple-400 font-semibold">{t.city}:</span> {team.city}</p>
                        <p><span className="text-purple-400 font-semibold">{t.country}:</span> {team.country}</p>
                        <p><span className="text-purple-400 font-semibold">{t.danceStyles}:</span> {team.dance_styles.join(', ')}</p>
                        {team.song_title && <p><span className="text-purple-400 font-semibold">{t.song}:</span> {team.song_title}</p>}
                      </div>
                    </div>

                    {team.scoring && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 mb-4">
                        <h4 className="font-bold text-purple-300 mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Évaluation Tech Rehearsal
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                          <div className="space-y-1">
                            <p>Taille groupe: <span className="text-purple-300 font-bold">{team.scoring.group_size_score}/10</span></p>
                            <p>Wow factor: <span className="text-purple-300 font-bold">{team.scoring.wow_factor_score}/10</span></p>
                          </div>
                          <div className="space-y-1">
                            <p>Technique: <span className="text-purple-300 font-bold">{team.scoring.technical_score}/10</span></p>
                            <p><span className="text-white font-bold">Score total: {team.scoring.total_score}/30</span></p>
                          </div>
                        </div>
                      </div>
                    )}

                    {team.organizer_notes && (
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-l-4 border-blue-400 p-4 rounded-r-xl mb-4">
                        <p className="text-sm text-gray-300"><span className="text-blue-300 font-semibold">Notes organisateur:</span> {team.organizer_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-8 space-y-3">
                    {team.performance_video_url && (
                      <a
                        href={team.performance_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 text-center transform hover:scale-105"
                      >
                        <Play className="w-4 h-4 inline mr-2" />
                        {t.watchVideo}
                      </a>
                    )}
                    
                    {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                      <div className="flex flex-col gap-2">
                        {team.status === 'submitted' && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedTeam(team);
                                setShowScoreModal(true);
                              }}
                              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                            >
                              <Star size={16} className="inline mr-1" />
                              {t.scoreTeam}
                            </button>
                            <button 
                              onClick={() => changeTeamStatus(team.id, 'approved')}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                            >
                              <CheckCircle size={16} className="inline mr-1" />
                              {t.approve}
                            </button>
                            <button 
                              onClick={() => changeTeamStatus(team.id, 'rejected')}
                              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                            >
                              <X size={16} className="inline mr-1" />
                              {t.reject}
                            </button>
                          </>
                        )}
                        
                        {team.status === 'approved' && !team.organizer_notes && (
                          <button 
                            onClick={() => {
                              const note = prompt('Ajouter une note pour cette équipe:');
                              if (note) addOrganizerNote(team.id, note);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                          >
                            <MessageSquare size={16} className="inline mr-1" />
                            Ajouter note
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de notation d'équipe */}
          {showScoreModal && selectedTeam && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-400" />
                    Noter l'équipe {selectedTeam.team_name}
                  </h2>
                  <button onClick={() => setShowScoreModal(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-bold text-gray-300 mb-4">
                      Taille du groupe (plus grand = mieux) - <span className="text-purple-400">{scoring.group_size_score}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.group_size_score}
                      onChange={(e) => setScoring({...scoring, group_size_score: parseInt(e.target.value)})}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-300 mb-4">
                      Wow Factor (impact scénique) - <span className="text-purple-400">{scoring.wow_factor_score}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.wow_factor_score}
                      onChange={(e) => setScoring({...scoring, wow_factor_score: parseInt(e.target.value)})}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-300 mb-4">
                      Technique - <span className="text-purple-400">{scoring.technical_score}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.technical_score}
                      onChange={(e) => setScoring({...scoring, technical_score: parseInt(e.target.value)})}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-300 mb-4">
                      Bonus variété de style - <span className="text-purple-400">{scoring.style_variety_bonus}/5</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={scoring.style_variety_bonus}
                      onChange={(e) => setScoring({...scoring, style_variety_bonus: parseInt(e.target.value)})}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 p-6 rounded-2xl">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-black text-white mb-2">Score Total</p>
                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                          {scoring.group_size_score + scoring.wow_factor_score + scoring.technical_score + scoring.style_variety_bonus}/35
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleScoreTeam}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    Enregistrer la notation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de création d'équipe */}
          {showCreateTeam && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Music className="w-8 h-8 text-purple-400" />
                    Créer une équipe
                  </h2>
                  <button onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Nom de l'équipe</label>
                      <input
                        type="text"
                        value={newTeam.team_name}
                        onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: Salsa Passion"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Nom du directeur</label>
                      <input
                        type="text"
                        value={newTeam.director_name}
                        onChange={(e) => setNewTeam({...newTeam, director_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: María González"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email du directeur</label>
                    <input
                      type="email"
                      value={newTeam.director_email}
                      onChange={(e) => setNewTeam({...newTeam, director_email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="maria@salsapassion.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Studio de danse</label>
                      <input
                        type="text"
                        value={newTeam.studio_name}
                        onChange={(e) => setNewTeam({...newTeam, studio_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: Dance Studio Paris"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Taille du groupe</label>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={newTeam.group_size}
                        onChange={(e) => setNewTeam({...newTeam, group_size: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Ville</label>
                      <input
                        type="text"
                        value={newTeam.city}
                        onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: Paris"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Pays</label>
                      <input
                        type="text"
                        value={newTeam.country}
                        onChange={(e) => setNewTeam({...newTeam, country: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: France"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Titre de la chanson</label>
                      <input
                        type="text"
                        value={newTeam.song_title}
                        onChange={(e) => setNewTeam({...newTeam, song_title: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Ex: La Vida Es Un Carnaval"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Styles de danse</label>
                      <select
                        multiple
                        value={newTeam.dance_styles}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNewTeam({...newTeam, dance_styles: values});
                        }}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value="Salsa">Salsa</option>
                        <option value="Bachata">Bachata</option>
                        <option value="Kizomba">Kizomba</option>
                        <option value="Zouk">Zouk</option>
                        <option value="Merengue">Merengue</option>
                        <option value="Fusion">Fusion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Lien vidéo de performance (YouTube/Vimeo)</label>
                    <input
                      type="url"
                      value={newTeam.performance_video_url}
                      onChange={(e) => setNewTeam({...newTeam, performance_video_url: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newTeam.backup_team}
                      onChange={(e) => setNewTeam({...newTeam, backup_team: e.target.checked})}
                      className="w-5 h-5 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label className="text-gray-300 font-medium">Équipe de backup (remplaçant si annulation)</label>
                  </div>

                  <button
                    onClick={handleCreateTeam}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    Créer l'équipe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom CSS for sliders */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
          }
          
          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
          }
        `}</style>
      </div>
    );
  };

  // Page Profils Artistes - Style DORA
  const ProfilesPage = () => {
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newReview, setNewReview] = useState({
      rating: 5,
      comment: '',
      reviewer_name: currentUser?.full_name || ''
    });

    const handleSubmitReview = () => {
      if (selectedArtist && currentUser) {
        const review: Review = {
          id: Date.now().toString(),
          artist_id: selectedArtist.id,
          reviewer_name: newReview.reviewer_name,
          rating: newReview.rating,
          comment: newReview.comment,
          event_name: events[0]?.name || 'Current Event',
          date: new Date().toISOString().split('T')[0],
          verified: true
        };
        
        setReviews([...reviews, review]);
        
        // Update artist rating
        const artistReviews = [...reviews.filter(r => r.artist_id === selectedArtist.id), review];
        const avgRating = artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length;
        
        setArtists(prev => prev.map(artist => 
          artist.id === selectedArtist.id 
            ? { ...artist, rating: avgRating, total_reviews: artistReviews.length }
            : artist
        ));
        
        setShowReviewModal(false);
        setNewReview({ rating: 5, comment: '', reviewer_name: currentUser.full_name });
      }
    };

    const getArtistReviews = (artistId: string) => 
      reviews.filter(review => review.artist_id === artistId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-orange-900">
        {/* Hero Header */}
        <div className="relative py-20 bg-gradient-to-r from-orange-600 via-pink-600 to-red-700 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-bounce"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {t.profiles}
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Découvrez les profils des artistes et instructeurs de danse latine
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Vue grille des artistes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {artists.map(artist => (
              <div key={artist.id} className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold">{artist.rating.toFixed(1)}</span>
                  </div>
                  {artist.available_for_booking && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      {t.availableBooking}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{artist.stage_name}</h3>
                    {artist.instagram && (
                      <Instagram className="w-5 h-5 text-pink-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 h-12 overflow-hidden">{artist.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.specialties.slice(0, 2).map(specialty => (
                      <span key={specialty} className="px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-xs font-medium">
                        {specialty}
                      </span>
                    ))}
                    {artist.specialties.length > 2 && (
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs">
                        +{artist.specialties.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{artist.experience_years} {t.yearsExp}</span>
                    <span>{artist.total_reviews} {t.reviews}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedArtist(artist)}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                  >
                    {t.viewProfile}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Profil Artiste Simple */}
          {selectedArtist && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedArtist.stage_name}</h2>
                    <button
                      onClick={() => setSelectedArtist(null)}
                      className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-6">
                      <User className="w-16 h-16 text-white" />
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-white">{selectedArtist.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({selectedArtist.total_reviews} avis)</span>
                      </div>
                      <p className="text-gray-300 mb-4">{selectedArtist.location}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Bio</h3>
                      <p className="text-gray-300">{selectedArtist.bio}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{t.specialties}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedArtist.specialties.map(specialty => (
                          <span key={specialty} className="px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-sm font-medium">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{t.experience}</h3>
                      <p className="text-gray-300">{selectedArtist.experience_years} {t.yearsExp}</p>
                    </div>

                    <button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                      {t.contactArtist}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            
            {/* Système de notifications - Temporairement désactivé */}
            {/* {currentUser && (
              <NotificationSystem 
                userRole={currentUser.role} 
                eventId="1" 
              />
            )} */}
            
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
      return <HomePage />;
    }

    switch (currentView) {
      case 'volunteers':
        return <VolunteersPage />;
      case 'teams':
        return <TeamsPage />;
      case 'profiles':
        return <ProfilesPage />;
      default:
        return <HomePage />;
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