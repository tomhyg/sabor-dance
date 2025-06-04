import React, { useState, useEffect } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, MapPin, CheckCircle, X, Edit, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'volunteer' | 'team_director';
}

interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  required_volunteer_hours: number;
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
}

interface PerformanceTeam {
  id: string;
  team_name: string;
  director_name: string;
  director_email: string;
  studio_name: string;
  city: string;
  country: string;
  status: 'draft' | 'submitted' | 'approved';
  performance_video_url?: string;
  song_title?: string;
}

// Animations variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleHover = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const floatingCard = {
  hover: { 
    y: -8, 
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: { duration: 0.3 }
  }
};
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
    email: 'Email',
    password: 'Mot de passe',
    connect: 'Se connecter',
    signup: 'S\'inscrire',
    noAccount: 'Pas de compte ? S\'inscrire',
    hasAccount: 'Déjà un compte ? Se connecter',
    
    // Volunteers
    volunteerManagementTitle: 'Gestion des Bénévoles',
    createSlot: 'Créer un créneau',
    signUp: 'S\'inscrire',
    full: 'Complet',
    progress: 'Progression',
    
    // Teams
    performanceTeams: 'Équipes de Performance',
    createTeam: 'Créer une équipe',
    draft: 'Brouillon',
    submitted: 'Soumise',
    approved: 'Approuvée',
    director: 'Directeur',
    studio: 'Studio',
    city: 'Ville',
    country: 'Pays',
    song: 'Chanson',
    watchVideo: 'Voir vidéo',
    approve: 'Approuver'
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
    email: 'Email',
    password: 'Password',
    connect: 'Log in',
    signup: 'Sign up',
    noAccount: 'No account? Sign up',
    hasAccount: 'Already have an account? Log in',
    
    // Volunteers
    volunteerManagementTitle: 'Volunteer Management',
    createSlot: 'Create slot',
    signUp: 'Sign up',
    full: 'Full',
    progress: 'Progress',
    
    // Teams
    performanceTeams: 'Performance Teams',
    createTeam: 'Create team',
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    director: 'Director',
    studio: 'Studio',
    city: 'City',
    country: 'Country',
    song: 'Song',
    watchVideo: 'Watch video',
    approve: 'Approve'
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
    email: 'Email',
    password: 'Contraseña',
    connect: 'Iniciar sesión',
    signup: 'Registrarse',
    noAccount: '¿No tienes cuenta? Regístrate',
    hasAccount: '¿Ya tienes cuenta? Inicia sesión',
    
    // Volunteers
    volunteerManagementTitle: 'Gestión de Voluntarios',
    createSlot: 'Crear turno',
    signUp: 'Registrarse',
    full: 'Completo',
    progress: 'Progreso',
    
    // Teams
    performanceTeams: 'Equipos de Performance',
    createTeam: 'Crear equipo',
    draft: 'Borrador',
    submitted: 'Enviado',
    approved: 'Aprobado',
    director: 'Director',
    studio: 'Estudio',
    city: 'Ciudad',
    country: 'País',
    song: 'Canción',
    watchVideo: 'Ver video',
    approve: 'Aprobar'
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
  const [events] = useState<Event[]>([
    {
      id: '1',
      name: 'Festival de Danse Latine 2025',
      start_date: '2025-06-20',
      end_date: '2025-06-22',
      location: 'Convention Center',
      required_volunteer_hours: 8
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
      role_type: 'registration_desk'
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
      role_type: 'tech_support'
    }
  ]);

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
      song_title: 'La Vida Es Un Carnaval'
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
    const [role, setRole] = useState<'volunteer' | 'organizer' | 'team_director'>('volunteer');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = () => {
      // Simulation de l'authentification
      const user: User = {
        id: '1',
        email,
        full_name: authMode === 'register' ? fullName : 'Utilisateur Test',
        role: authMode === 'register' ? role : 'volunteer'
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
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="volunteer">{t.volunteer}</option>
                    <option value="team_director">{t.teamDirector}</option>
                    <option value="organizer">{t.organizer}</option>
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
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 overflow-hidden">
        <div className="container mx-auto px-4 py-24 relative">
          {/* Floating elements background */}
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-12 h-12 bg-lime-400/20 rounded-full"
            animate={{ 
              y: [0, 15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          <motion.div 
            className="text-center text-white mb-16"
            variants={fadeInUp}
          >
            <motion.h1 
              className="text-7xl font-black mb-6 tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {t.title}
            </motion.h1>
            <motion.p 
              className="text-2xl font-medium opacity-90 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Volunteers Card */}
            <motion.div 
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-400 to-green-500 p-8 cursor-pointer"
              variants={fadeInUp}
              whileHover="hover"
              whileTap="tap"
              {...floatingCard}
              {...scaleHover}
            >
              <div className="relative z-10">
                <motion.div 
                  className="bg-white/20 rounded-2xl p-4 w-fit mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.volunteerManagement}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  {t.volunteerDesc}
                </p>
                <motion.button
                  onClick={() => setCurrentView('volunteers')}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.discover}
                </motion.button>
              </div>
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Teams Card */}
            <motion.div 
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-8 cursor-pointer"
              variants={fadeInUp}
              whileHover="hover"
              whileTap="tap"
              {...floatingCard}
              {...scaleHover}
            >
              <div className="relative z-10">
                <motion.div 
                  className="bg-white/20 rounded-2xl p-4 w-fit mb-6"
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <Music className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.teamPerformance}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  {t.teamDesc}
                </p>
                <motion.button
                  onClick={() => setCurrentView('teams')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.discover}
                </motion.button>
              </div>
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>

            {/* Events Card */}
            <motion.div 
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 p-8"
              variants={fadeInUp}
              whileHover="hover"
              {...floatingCard}
            >
              <div className="relative z-10">
                <motion.div 
                  className="bg-white/20 rounded-2xl p-4 w-fit mb-6"
                  animate={{ 
                    rotateY: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.eventsTitle}</h3>
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  {t.eventsDesc}
                </p>
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl opacity-60 cursor-not-allowed">
                  {t.soon}
                </button>
              </div>
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
                animate={{ 
                  rotate: [0, -360],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <motion.div 
        className="py-16 bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {t.readyTitle}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {t.readyDesc}
          </motion.p>
          <motion.button
            onClick={() => setShowAuth(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {t.startFree}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Module Gestion Bénévoles
  const VolunteersPage = () => {
    const [showCreateShift, setShowCreateShift] = useState(false);
    const [newShift, setNewShift] = useState({
      title: '',
      description: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      max_volunteers: 1,
      role_type: ''
    });

    const handleCreateShift = () => {
      const shift: VolunteerShift = {
        id: Date.now().toString(),
        ...newShift,
        current_volunteers: 0
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
        role_type: ''
      });
    };

    const signUpForShift = (shiftId: string) => {
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === shiftId && shift.current_volunteers < shift.max_volunteers
            ? { ...shift, current_volunteers: shift.current_volunteers + 1 }
            : shift
        )
      );
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Bénévoles</h1>
            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setShowCreateShift(true)}
                className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-lime-600 hover:to-green-600 transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Créer un créneau
              </button>
            )}
          </div>

          <div className="grid gap-6">
            {volunteerShifts.map(shift => (
              <div key={shift.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{shift.title}</h3>
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
                  
                  <div className="ml-6">
                    {shift.current_volunteers >= shift.max_volunteers ? (
                      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium">
                        Complet
                      </div>
                    ) : (
                      <button
                        onClick={() => signUpForShift(shift.id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                      >
                        S'inscrire
                      </button>
                    )}
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
        </div>
      </div>
    );
  };

  // Module Équipes de Performance
  const TeamsPage = () => {
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [newTeam, setNewTeam] = useState({
      team_name: '',
      director_name: '',
      director_email: '',
      studio_name: '',
      city: '',
      country: '',
      song_title: '',
      performance_video_url: ''
    });

    const handleCreateTeam = () => {
      const team: PerformanceTeam = {
        id: Date.now().toString(),
        ...newTeam,
        status: 'draft'
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
        performance_video_url: ''
      });
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-800';
        case 'submitted': return 'bg-blue-100 text-blue-800';
        case 'approved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'draft': return 'Brouillon';
        case 'submitted': return 'Soumise';
        case 'approved': return 'Approuvée';
        default: return status;
      }
    };

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
            {performanceTeams.map(team => (
              <div key={team.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{team.team_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                        {getStatusText(team.status)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Directeur:</strong> {team.director_name}</p>
                        <p><strong>Email:</strong> {team.director_email}</p>
                        <p><strong>Studio:</strong> {team.studio_name}</p>
                      </div>
                      <div>
                        <p><strong>Ville:</strong> {team.city}</p>
                        <p><strong>Pays:</strong> {team.country}</p>
                        {team.song_title && <p><strong>Chanson:</strong> {team.song_title}</p>}
                      </div>
                    </div>
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
                    {currentUser?.role === 'organizer' && team.status === 'submitted' && (
                      <button className="block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors w-full">
                        Approuver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de création d'équipe */}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        value={newTeam.city}
                        onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        type="text"
                        value={newTeam.country}
                        onChange={(e) => setNewTeam({...newTeam, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la chanson</label>
                      <input
                        type="text"
                        value={newTeam.song_title}
                        onChange={(e) => setNewTeam({...newTeam, song_title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
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

                  <button
                    onClick={handleCreateTeam}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Créer l'équipe
                  </button>
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

  // Rendu principal avec AnimatePresence
  const renderCurrentView = () => {
    if (!currentUser && currentView !== 'home') {
      return <HomePage />;
    }

    return (
      <AnimatePresence mode="wait">
        {currentView === 'volunteers' && (
          <motion.div
            key="volunteers"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <VolunteersPage />
          </motion.div>
        )}
        {currentView === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <TeamsPage />
          </motion.div>
        )}
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {renderCurrentView()}
      <AnimatePresence>
        {showAuth && <AuthModal />}
      </AnimatePresence>
    </div>
  );
};

export default SaborDanceApp;