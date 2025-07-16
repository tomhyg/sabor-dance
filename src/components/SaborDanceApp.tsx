// src/components/SaborDanceApp.tsx - Version corrigée avec notifications réelles
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, X, CheckCircle, Eye, EyeOff, Star, MessageSquare, Copy, Bell, Play, Instagram, ExternalLink, Heart, UserCheck, ArrowRight, BarChart3 } from 'lucide-react';

// Import du nouveau système de traduction
import { useTranslation, LANGUAGE_LABELS, type Language, DEFAULT_LANGUAGE } from '../locales';

// Import des hooks et services mis à jour
import { useAuth } from '../hooks/useAuth';
import { volunteerService } from '../services/volunteerService';
import { teamService } from '../services/teamService';

// Import des composants pages
import HomePage from './pages/HomePage';
import VolunteersPage from './pages/VolunteersPage';
import Dashboard from './pages/Dashboard';
import { TeamsPage } from './pages/TeamsPage';
import ProfilesPage from './pages/ProfilesPage';
import AuthModal from './AuthModal';
import { AuthRouter } from './AuthRouter';

// Import des types
import { PerformanceTeam } from '../types/PerformanceTeam';

// ===== IMPORT DU NOUVEAU SYSTÈME DE NOTIFICATIONS =====
import { autoInitNotifications } from '../services/initNotifications';
import { UrgentTasksBadge } from './notifications/UrgentTasksBadge';
import { UrgentTasksModal } from './notifications/UrgentTasksModal';
import { useNotifications } from '../hooks/useNotifications';
import { UserRole, UrgentTask } from '../services/notifications/notificationService';

// 🎯 CORRECTION: Types unifiés avec statuts compatibles
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
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
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

// 🎯 CORRECTION: VolunteerShift avec statuts compatibles incluant 'unpublished'
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
  status: 'draft' | 'live' | 'full' | 'cancelled' | 'unpublished'; // 🎯 AJOUT: 'unpublished'
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

// 🎯 CORRECTION: Fonction utilitaire pour convertir les données Supabase vers le format local
const convertSupabaseShiftToLocal = (supabaseShift: any): VolunteerShift => ({
  id: supabaseShift.id,
  title: supabaseShift.title,
  description: supabaseShift.description || '',
  shift_date: supabaseShift.shift_date,
  start_time: supabaseShift.start_time,
  end_time: supabaseShift.end_time,
  max_volunteers: supabaseShift.max_volunteers,
  current_volunteers: supabaseShift.current_volunteers || 0,
  role_type: supabaseShift.role_type,
  status: supabaseShift.status,
  check_in_required: supabaseShift.check_in_required || false
});

const convertSupabaseUserToLocal = (supabaseUser: any): User => {
  if (!supabaseUser || typeof supabaseUser !== 'object') {
    throw new Error('Invalid user data');
  }

  return {
    id: supabaseUser.id || '',
    email: supabaseUser.email || '',
    full_name: supabaseUser.full_name || '',
    role: supabaseUser.role || 'attendee',
    profile_image: supabaseUser.profile_image || undefined,
    bio: supabaseUser.bio || undefined,
    instagram: supabaseUser.instagram || undefined,
    specialties: supabaseUser.specialties || undefined,
    experience_years: supabaseUser.experience_years || undefined,
    location: supabaseUser.location || undefined,
    phone: supabaseUser.phone || undefined,
    qr_code: supabaseUser.qr_code || undefined,
    verified: supabaseUser.verified || false,
    created_at: supabaseUser.created_at || undefined,
    updated_at: supabaseUser.updated_at || undefined
  };
};

// Composant pour l'affichage du statut utilisateur
const UserStatusDisplay = ({ user, isTestUser }: { user: User, isTestUser: boolean }) => (
  <div className="container mx-auto px-4 py-4">
    <div className="bg-green-500/20 p-4 rounded-xl mb-4 max-w-4xl mx-auto border border-green-200">
      <div className="flex items-center gap-3">
        {user.profile_image && (
          <img 
            src={user.profile_image} 
            alt={user.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-green-800 text-lg font-semibold">
            ✅ Connecté : <strong>{user.full_name}</strong>
          </p>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span>Rôle: {user.role}</span>
            <span>•</span>
            <span>Type: {isTestUser ? 'Test' : 'Supabase'}</span>
            {user.verified && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  Vérifié
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// =============================================
// COMPOSANT PRINCIPAL
// =============================================

const SaborDanceApp = () => {
  // ===== HOOKS D'AUTHENTIFICATION =====
  const { 
    user: supabaseUser, 
    loading: authLoading, 
    error: authError,
    isTestUser,
    authType,
    signIn,
    signUp,
    signInAsTestUser,
    signOut,
    uploadProfileImage,
    updateProfile,
    resetPassword
  } = useAuth();

  // Conversion utilisateur
  const currentUser: User | null = supabaseUser ? convertSupabaseUserToLocal(supabaseUser as any) : null;

  // ===== NOUVEAU SYSTÈME DE NOTIFICATIONS =====
  const { 
    urgentTasks, 
    taskCount, 
    urgentCount, 
    criticalCount, 
    loading: notificationsLoading, 
    refresh: refreshNotifications,
    dismissTask,
    sendTestEmail 
  } = useNotifications(currentUser?.role as UserRole, currentUser?.id);

  // États de l'application
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [language, setLanguage] = useState<'fr' | 'en' | 'es'>('en');

  // États pour les données
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  const [volunteerSignups, setVolunteerSignups] = useState<VolunteerSignup[]>([]);
  const [performanceTeams, setPerformanceTeams] = useState<PerformanceTeam[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Système de traduction
  const { t } = useTranslation(currentLanguage);

  // ===== INITIALISATION DU SYSTÈME DE NOTIFICATIONS =====
  useEffect(() => {
    console.log('🚀 Initialisation du système de notifications...');
    
    // Initialiser le système de notifications
    const notificationSystem = autoInitNotifications();
    
    return () => {
      console.log('🧹 Nettoyage du système de notifications');
      notificationSystem.cleanup();
    };
  }, []);

  // Charger les données initiales
  useEffect(() => {
    if (currentUser && !dataLoading) {
      loadInitialData();
    }
  }, [currentUser?.id]);

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      // Récupérer les shifts de l'événement BSF
      const { data: shiftsData, error: shiftsError } = await volunteerService.getShifts('a9d1c983-1456-4007-9aec-b297dd095ff7');

      if (!shiftsError && shiftsData) {
        const convertedShifts = shiftsData.map(shift => convertSupabaseShiftToLocal(shift));
        setVolunteerShifts(convertedShifts);
        console.log('Shifts chargés:', convertedShifts);
      }

      // Récupérer les inscriptions pour les bénévoles
      if (currentUser?.role === 'volunteer' && currentUser.id) {
        const { data: signupsData, error: signupsError } = await volunteerService.getVolunteerSignups(
          currentUser.id,
          'a9d1c983-1456-4007-9aec-b297dd095ff7'
        );

        if (!signupsError && signupsData) {
          const convertedSignups = signupsData.map(signup => ({
            id: signup.id,
            shift_id: signup.shift_id,
            volunteer_id: signup.volunteer_id,
            status: signup.status,
            signed_up_at: signup.signed_up_at,
            reminder_sent: signup.reminder_sent,
            checked_in_at: signup.checked_in_at,
            qr_code: signup.qr_code
          }));
          setVolunteerSignups(convertedSignups);
        }
      }

      // 🎯 CORRECTION: Charger les vraies équipes depuis Supabase
      try {
        const teamsResult = await teamService.getTeams('a9d1c983-1456-4007-9aec-b297dd095ff7');
        
        if (teamsResult.success && teamsResult.data) {
          setPerformanceTeams(teamsResult.data);
          console.log('✅ Équipes chargées depuis Supabase:', teamsResult.data);
        } else {
          console.warn('⚠️ Erreur chargement équipes:', teamsResult.message);
          setPerformanceTeams([]); // 🎯 SUPPRESSION: Plus de données de démo
        }
      } catch (error) {
        console.error('❌ Erreur chargement équipes:', error);
        setPerformanceTeams([]);
      }

      // Ajouter l'événement BSF
      setEvents([{
        id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        name: 'Boston Salsa Festival 2025',
        start_date: '2025-07-15',
        end_date: '2025-07-20',
        location: 'Boston, MA, USA',
        required_volunteer_hours: 9, // 🎯 CORRECTION: 9h selon feedback
        status: 'live',
        team_submission_deadline: '2025-06-01T23:59:59Z'
      }]);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // ===== GESTIONNAIRES D'AUTHENTIFICATION =====
  
  const handleTestLogin = async (email: string) => {
    try {
      const result = await signInAsTestUser(email);
      if (result.user) {
        console.log('✅ Connexion test réussie:', result.user);
      } else {
        console.error('❌ Erreur connexion test:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion test:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return { error: result.error };
  };

  const handleSignUp = async (email: string, password: string, userData: any) => {
    const result = await signUp(email, password, userData);
    return { 
      error: result.error, 
      message: result.message || null 
    };
  };

  const handleResetPassword = async (email: string) => {
    const result = await resetPassword(email);
    return { 
      error: result.error, 
      message: result.message || null 
    };
  };

  // ===== GESTIONNAIRE D'ACTIONS NOTIFICATIONS =====
  const handleNotificationAction = (task: UrgentTask) => {
    console.log(`🎯 Action notification: ${task.title}`);
    
    // Redirection intelligente selon le type de tâche
    if (task.category === 'volunteer' && task.relatedData?.shiftIds) {
      setCurrentView('volunteers');
    } else if (task.category === 'team' && task.relatedData?.teamIds) {
      setCurrentView('teams');
    } else if (task.category === 'approval') {
      setCurrentView('teams');
    } else if (task.category === 'shift') {
      setCurrentView('volunteers');
    }
    
    // Fermer la modal
    setShowNotifications(false);
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (userRole: string | undefined, page: string): boolean => {
    if (!userRole) return false;

    const permissions: Record<string, string[]> = {
      'dashboard': ['organizer', 'admin', 'assistant'],
      'volunteers': ['volunteer', 'organizer', 'admin', 'assistant'],
      'teams': ['team_director', 'organizer', 'admin', 'assistant'],
      'profiles': ['volunteer', 'team_director', 'organizer', 'admin', 'assistant', 'artist', 'attendee']
    };

    return permissions[page]?.includes(userRole) || false;
  };

  // Fonction translate pour compatibilité
  const translate = (key: string) => {
    const keyMap: Record<string, string> = {
      'performanceTeams': t.teams || 'Équipes',
      'teamDesc': t.teamDesc || 'Gérez les équipes de performance',
      'teamDirectorView': 'Vue Directeur d\'Équipe',
      'searchTeams': 'Rechercher des équipes...',
      'allStatus': 'Tous les statuts',
      'sortByName': 'Trier par nom',
      'sortByStatus': 'Trier par statut',
      'sortByCreated': 'Trier par création',
      'sortBySubmitted': 'Trier par soumission',
      'sortByCity': 'Trier par ville',
      'noTeamsYet': 'Aucune équipe pour le moment',
      'noTeamsFound': 'Aucune équipe trouvée',
      'createFirstTeam': 'Créer votre première équipe',
      'tryDifferentSearch': 'Essayez une recherche différente',
      'totalTeams': 'Total',
      'loadingData': t.loadingData || 'Chargement des données...',
      'retry': 'Réessayer',
      'refresh': 'Actualiser',
      'creating': 'Création...',
      'createTeam': 'Créer une équipe',
      'draft': 'Brouillon',
      'submitted': 'Soumis',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'completed': 'Terminé',
      'error': t.error || 'Erreur'
    };

    return keyMap[key] || key;
  };

  // ===== COMPOSANTS UI =====

  // Sélecteur de langue
  const LanguageSelector = () => (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value as Language)}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 cursor-pointer"
      >
        {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );

  // Navigation avec badge notifications
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-200"
            >
              Sabor Dance
            </button>

            {currentUser && (
              <div className="hidden md:flex space-x-2">
                {hasPermission(currentUser.role, 'dashboard') && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentView === 'dashboard'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600'
                      }`}
                  >
                    <BarChart3 size={20} />
                    <span>{t.dashboard}</span>
                  </button>
                )}

                {hasPermission(currentUser.role, 'volunteers') && (
                  <button
                    onClick={() => setCurrentView('volunteers')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentView === 'volunteers'
                        ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-lime-500 hover:to-green-500'
                      }`}
                  >
                    <Users size={20} />
                    <span>{t.volunteers}</span>
                  </button>
                )}

                {hasPermission(currentUser.role, 'teams') && (
                  <button
                    onClick={() => setCurrentView('teams')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentView === 'teams'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600'
                      }`}
                  >
                    <Music size={20} />
                    <span>{t.teams}</span>
                  </button>
                )}

                <button
                  onClick={() => setCurrentView('profiles')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentView === 'profiles'
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

            {/* NOUVEAU BADGE NOTIFICATIONS */}
            {currentUser && (
              <UrgentTasksBadge 
                taskCount={taskCount}
                urgentCount={urgentCount}
                criticalCount={criticalCount}
                loading={notificationsLoading}
                onClick={() => setShowNotifications(true)}
              />
            )}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    {currentUser.profile_image ? (
                      <img 
                        src={currentUser.profile_image} 
                        alt={currentUser.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-800">{currentUser.full_name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                      {isTestUser && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          Test
                        </span>
                      )}
                      {currentUser.verified && (
                        <CheckCircle size={12} className="text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut()}
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

  // ===== RENDU DES VUES =====
  const renderCurrentView = () => {
    if (authLoading || dataLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              {authLoading ? t.loading : t.loadingData}
            </p>
          </div>
        </div>
      );
    }

    if (!currentUser && currentView !== 'home') {
      return <HomePage t={t} setCurrentView={setCurrentView} setShowAuth={setShowAuth} />;
    }

    // Redirection automatique si pas de permissions
    if (currentUser && !hasPermission(currentUser.role, currentView)) {
      const defaultPages: Record<string, string> = {
        'volunteer': 'volunteers',
        'team_director': 'teams',
        'organizer': 'dashboard',
        'admin': 'dashboard',
        'assistant': 'dashboard',
        'artist': 'profiles',
        'attendee': 'profiles'
      };

      const defaultPage = defaultPages[currentUser.role] || 'profiles';
      setCurrentView(defaultPage);
      return null;
    }

    switch (currentView) {
      case 'dashboard':
        if (!hasPermission(currentUser?.role, 'dashboard')) {
          return <div className="p-8 text-center text-red-500">❌ Accès non autorisé</div>;
        }
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
        if (!hasPermission(currentUser?.role, 'volunteers')) {
          return <div className="p-8 text-center text-red-500">❌ Accès non autorisé</div>;
        }
        return (
          <VolunteersPage
            t={t}
            currentUser={currentUser}
            language={language}
            volunteerShifts={volunteerShifts}
            setVolunteerShifts={setVolunteerShifts}
            volunteerSignups={volunteerSignups}
            setVolunteerSignups={setVolunteerSignups}
            events={events}
            setEvents={setEvents}
          />
        );

      case 'teams':
        if (!hasPermission(currentUser?.role, 'teams')) {
          return <div className="p-8 text-center text-red-500">❌ Accès non autorisé</div>;
        }
        return (
          <TeamsPage
            currentUser={currentUser}
            translate={translate}
            currentLanguage={currentLanguage}
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
        if (currentUser) {
          const defaultPages: Record<string, string> = {
            'volunteer': 'volunteers',
            'team_director': 'teams',
            'organizer': 'dashboard',
            'admin': 'dashboard',
            'assistant': 'dashboard',
            'artist': 'profiles',
            'attendee': 'profiles'
          };

          const defaultPage = defaultPages[currentUser.role] || 'profiles';
          setCurrentView(defaultPage);
          return null;
        }

        return (
          <>
            <HomePage t={t} setCurrentView={setCurrentView} setShowAuth={setShowAuth} />

            {/* Section de test */}
            {!currentUser && (
              <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-xl mb-8 max-w-4xl mx-auto border border-orange-200">
                  <h3 className="text-orange-800 font-bold mb-4 text-xl flex items-center gap-2">
                    🧪 Connexions test rapides
                    <span className="text-sm font-normal text-orange-600">
                      ({authType === 'test' ? 'Mode test actif' : 'Mode Supabase'})
                    </span>
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleTestLogin('hernan@bostonsalsafest.com')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Hernan (Admin)
                    </button>
                    <button
                      onClick={() => handleTestLogin('kelly@bostonsalsafest.com')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Kelly (Organizer)
                    </button>
                    <button
                      onClick={() => handleTestLogin('volunteer1@test.com')}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                    >
                      Volunteer 1
                    </button>
                    <button
                      onClick={() => handleTestLogin('teamdir1@test.com')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Team Director 1
                    </button>
                  </div>
                  {authError && (
                    <p className="text-red-600 mt-3 bg-red-50 p-2 rounded">
                      ❌ {authError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentUser && <UserStatusDisplay user={currentUser} isTestUser={isTestUser} />}
          </>
        );
    }
  };

  // ===== RENDU PRINCIPAL =====
  return (
    <AuthRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        {renderCurrentView()}
        
        {/* Modal d'authentification */}
        <AuthModal
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          authMode={authMode}
          setAuthMode={setAuthMode}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onResetPassword={handleResetPassword}
          t={t}
        />

        {/* NOUVELLE MODAL NOTIFICATIONS */}
        {showNotifications && currentUser && (
          <UrgentTasksModal
            userRole={currentUser.role as UserRole}
            urgentTasks={urgentTasks}
            loading={notificationsLoading}
            onClose={() => setShowNotifications(false)}
            onTaskAction={handleNotificationAction}
            onDismissTask={dismissTask}
            onRefresh={refreshNotifications}
            onTestEmail={sendTestEmail}
          />
        )}
      </div>
    </AuthRouter>
  );
};

export default SaborDanceApp;