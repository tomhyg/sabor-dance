import NotificationSystem from './NotificationSystem';
import React, { useState } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, X, CheckCircle, Eye, EyeOff, Star, MessageSquare, Copy, Bell } from 'lucide-react';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'assistant' | 'volunteer' | 'team_director';
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
    organizerNotes: 'Notes organisateur'
  },
  en: {
    // Navigation
    login: 'Login',
    volunteers: 'Volunteers',
    teams: 'Teams',
    events: 'Events',
    
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
    organizerNotes: 'Organizer notes'
  },
  es: {
    // Navigation
    login: 'Iniciar sesión',
    volunteers: 'Voluntarios',
    teams: 'Equipos',
    events: 'Eventos',
    
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
    organizerNotes: 'Notas del organizador'
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
    const [role, setRole] = useState<'volunteer' | 'organizer' | 'team_director' | 'assistant'>('volunteer');
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
                    onChange={(e) => setRole(e.target.value as 'volunteer' | 'organizer' | 'team_director' | 'assistant')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="volunteer">{t.volunteer}</option>
                    <option value="team_director">{t.teamDirector}</option>
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

  // Page d'accueil
  const HomePage = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 overflow-hidden">
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center text-white mb-16">
            <h1 className="text-7xl font-black mb-6 tracking-tight">
              {t.title}
            </h1>
            <p className="text-2xl font-medium opacity-90 max-w-3xl mx-auto leading-relaxed">
              La plateforme qui digitalise l&apos;expérience des congrès de danse latine
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Volunteers Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-400 to-green-500 p-8 cursor-pointer">
              <div className="relative z-10">
                <div className="bg-white/20 rounded-2xl p-4 w-fit mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.volunteerManagement}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  Organisez facilement vos créneaux bénévoles et permettez aux volontaires de s&apos;inscrire
                </p>
                <button
                  onClick={() => setCurrentView('volunteers')}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.discover}
                </button>
              </div>
            </div>

            {/* Teams Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-8 cursor-pointer">
              <div className="relative z-10">
                <div className="bg-white/20 rounded-2xl p-4 w-fit mb-6">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.teamPerformance}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  Gérez les soumissions d&apos;équipes, répétitions techniques et spectacles
                </p>
                <button
                  onClick={() => setCurrentView('teams')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.discover}
                </button>
              </div>
            </div>

            {/* Events Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 p-8">
              <div className="relative z-10">
                <div className="bg-white/20 rounded-2xl p-4 w-fit mb-6">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.eventsTitle}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  {t.eventsDesc}
                </p>
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl opacity-60 cursor-not-allowed">
                  {t.soon}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t.readyTitle}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.readyDesc}
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t.startFree}
          </button>
        </div>
      </div>
    </div>
  );

  // Module Gestion Bénévoles amélioré
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
      // Logique de duplication d'événement
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Bénévoles</h1>
            <div className="flex gap-2">
              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                <>
                  <button
                    onClick={() => setShowDuplicateEvent(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Copy size={18} />
                    {t.duplicateEvent}
                  </button>
                  <button
                    onClick={() => setShowCreateShift(true)}
                    className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-lime-600 hover:to-green-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    {t.createSlot}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progression des heures bénévoles */}
          {currentUser?.role === 'volunteer' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Mon Progression Bénévolat</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Heures complétées</span>
                <span className="font-bold text-lg">{userVolunteerHours}h / {requiredHours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-lime-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((userVolunteerHours / requiredHours) * 100, 100)}%` }}
                ></div>
              </div>
              {userVolunteerHours >= requiredHours && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Félicitations ! Vos heures bénévoles sont complétées !</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-6">
            {volunteerShifts.map(shift => (
              <div key={shift.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{shift.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        shift.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        shift.status === 'live' ? 'bg-green-100 text-green-800' :
                        shift.status === 'full' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shift.status.toUpperCase()}
                      </span>
                      {shift.check_in_required && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Check-in requis
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{shift.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(shift.shift_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {shift.start_time} - {shift.end_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {shift.current_volunteers}/{shift.max_volunteers} bénévoles
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-2">
                    {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => changeShiftStatus(shift.id, shift.status === 'draft' ? 'live' : 'draft')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            shift.status === 'draft' 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-500 text-white hover:bg-gray-600'
                          }`}
                        >
                          {shift.status === 'draft' ? 'Publier' : 'Brouillon'}
                        </button>
                      </div>
                    )}
                    
                    {shift.status === 'full' ? (
                      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium text-center">
                        {t.full}
                      </div>
                    ) : shift.status === 'live' ? (
                      <button
                        onClick={() => signUpForShift(shift.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                      >
                        {t.signUp}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <span className="text-sm text-gray-500">
                      {Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-lime-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(shift.current_volunteers / shift.max_volunteers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de création de créneau */}
          {showCreateShift && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Créer un créneau</h2>
                  <button onClick={() => setShowCreateShift(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      type="text"
                      value={newShift.title}
                      onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newShift.description}
                      onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={newShift.shift_date}
                        onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nb bénévoles</label>
                      <input
                        type="number"
                        min="1"
                        value={newShift.max_volunteers}
                        onChange={(e) => setNewShift({...newShift, max_volunteers: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                      <input
                        type="time"
                        value={newShift.start_time}
                        onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                      <input
                        type="time"
                        value={newShift.end_time}
                        onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newShift.check_in_required}
                      onChange={(e) => setNewShift({...newShift, check_in_required: e.target.checked})}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Check-in requis le jour J</label>
                  </div>

                  <button
                    onClick={handleCreateShift}
                    className="w-full bg-gradient-to-r from-lime-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-lime-600 hover:to-green-600 transition-all duration-200"
                  >
                    Créer le créneau
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de duplication d'événement */}
          {showDuplicateEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Dupliquer un événement</h2>
                  <button onClick={() => setShowDuplicateEvent(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">Sélectionnez un événement à dupliquer :</p>
                  {events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => duplicateFromEvent(event.id)}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-semibold">{event.name}</div>
                      <div className="text-sm text-gray-500">{event.location} • {event.start_date}</div>
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

  // Module Équipes de Performance amélioré
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
        case 'draft': return 'bg-gray-100 text-gray-800';
        case 'submitted': return 'bg-blue-100 text-blue-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'draft': return 'Brouillon';
        case 'submitted': return 'Soumise';
        case 'approved': return 'Approuvée';
        case 'rejected': return 'Refusée';
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Équipes de Performance</h1>
            {(currentUser?.role === 'team_director' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Créer une équipe
              </button>
            )}
          </div>

          <div className="grid gap-6">
            {sortedTeams.map(team => (
              <div key={team.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{team.team_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                        {getStatusText(team.status)}
                      </span>
                      {team.backup_team && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Équipe de backup
                        </span>
                      )}
                      {team.performance_order && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          #{team.performance_order}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p><strong>Directeur:</strong> {team.director_name}</p>
                        <p><strong>Email:</strong> {team.director_email}</p>
                        <p><strong>Studio:</strong> {team.studio_name}</p>
                        <p><strong>Taille groupe:</strong> {team.group_size} personnes</p>
                      </div>
                      <div>
                        <p><strong>Ville:</strong> {team.city}</p>
                        <p><strong>Pays:</strong> {team.country}</p>
                        <p><strong>Styles:</strong> {team.dance_styles.join(', ')}</p>
                        {team.song_title && <p><strong>Chanson:</strong> {team.song_title}</p>}
                      </div>
                    </div>

                    {team.scoring && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold mb-2">Évaluation Tech Rehearsal</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>Taille groupe: {team.scoring.group_size_score}/10</p>
                            <p>Wow factor: {team.scoring.wow_factor_score}/10</p>
                          </div>
                          <div>
                            <p>Technique: {team.scoring.technical_score}/10</p>
                            <p><strong>Score total: {team.scoring.total_score}/30</strong></p>
                          </div>
                        </div>
                      </div>
                    )}

                    {team.organizer_notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                        <p className="text-sm"><strong>Notes organisateur:</strong> {team.organizer_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    {team.performance_video_url && (
                      <a
                        href={team.performance_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors text-center"
                      >
                        Voir vidéo
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
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                            >
                              <Star size={16} className="inline mr-1" />
                              Noter équipe
                            </button>
                            <button 
                              onClick={() => changeTeamStatus(team.id, 'approved')}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                              Approuver
                            </button>
                            <button 
                              onClick={() => changeTeamStatus(team.id, 'rejected')}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        
                        {team.status === 'approved' && !team.organizer_notes && (
                          <button 
                            onClick={() => {
                              const note = prompt('Ajouter une note pour cette équipe:');
                              if (note) addOrganizerNote(team.id, note);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Noter l&apos;équipe {selectedTeam.team_name}</h2>
                  <button onClick={() => setShowScoreModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille du groupe (plus grand = mieux) - {scoring.group_size_score}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.group_size_score}
                      onChange={(e) => setScoring({...scoring, group_size_score: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wow Factor (impact scénique) - {scoring.wow_factor_score}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.wow_factor_score}
                      onChange={(e) => setScoring({...scoring, wow_factor_score: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technique - {scoring.technical_score}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scoring.technical_score}
                      onChange={(e) => setScoring({...scoring, technical_score: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus variété de style - {scoring.style_variety_bonus}/5
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={scoring.style_variety_bonus}
                      onChange={(e) => setScoring({...scoring, style_variety_bonus: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-bold">
                      Score total: {scoring.group_size_score + scoring.wow_factor_score + scoring.technical_score + scoring.style_variety_bonus}/35
                    </p>
                  </div>

                  <button
                    onClick={handleScoreTeam}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Enregistrer la notation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de création d'équipe amélioré */}
          {showCreateTeam && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Créer une équipe</h2>
                  <button onClick={() => setShowCreateTeam(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;équipe</label>
                      <input
                        type="text"
                        value={newTeam.team_name}
                        onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du directeur</label>
                      <input
                        type="text"
                        value={newTeam.director_name}
                        onChange={(e) => setNewTeam({...newTeam, director_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email du directeur</label>
                    <input
                      type="email"
                      value={newTeam.director_email}
                      onChange={(e) => setNewTeam({...newTeam, director_email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Studio de danse</label>
                      <input
                        type="text"
                        value={newTeam.studio_name}
                        onChange={(e) => setNewTeam({...newTeam, studio_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taille du groupe</label>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={newTeam.group_size}
                        onChange={(e) => setNewTeam({...newTeam, group_size: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        value={newTeam.city}
                        onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        type="text"
                        value={newTeam.country}
                        onChange={(e) => setNewTeam({...newTeam, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la chanson</label>
                      <input
                        type="text"
                        value={newTeam.song_title}
                        onChange={(e) => setNewTeam({...newTeam, song_title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Styles de danse</label>
                      <select
                        multiple
                        value={newTeam.dance_styles}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNewTeam({...newTeam, dance_styles: values});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien vidéo de performance (YouTube/Vimeo)</label>
                    <input
                      type="url"
                      value={newTeam.performance_video_url}
                      onChange={(e) => setNewTeam({...newTeam, performance_video_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newTeam.backup_team}
                      onChange={(e) => setNewTeam({...newTeam, backup_team: e.target.checked})}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Équipe de backup (remplaçant si annulation)</label>
                  </div>

                  <button
                    onClick={handleCreateTeam}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Créer l&apos;équipe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            
            {/* NOUVEAU : Système de notifications */}
            {currentUser && (
              <NotificationSystem 
                userRole={currentUser.role} 
                eventId="1" 
              />
            )}
            
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