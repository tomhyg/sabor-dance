// SaborDanceApp.tsx - Version mise à jour avec système de traduction complet
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Music, LogIn, LogOut, User, Plus, Clock, X, CheckCircle, Eye, EyeOff, Star, MessageSquare, Copy, Bell, Play, Instagram, ExternalLink, Heart, UserCheck, ArrowRight, BarChart3 } from 'lucide-react';

// Import du nouveau système de traduction
import { useTranslation, LANGUAGE_LABELS, type Language, DEFAULT_LANGUAGE } from '../locales';

// Import des services Supabase
import { useAuth } from '../hooks/useAuth';
import { volunteerService } from '../services/volunteerService';

// Import des composants pages
import HomePage from '../components/pages/HomePage';
import VolunteersPage from '../components/pages/VolunteersPage';
import Dashboard from '../components/pages/Dashboard';
import TeamsPage from '../components/pages/TeamsPage';
import ProfilesPage from '../components/pages/ProfilesPage';

// Types unifiés - utilise les types locaux existants pour éviter les conflits
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

// Fonction utilitaire pour convertir les données Supabase vers le format local
const convertSupabaseShiftToLocal = (supabaseShift: any): VolunteerShift => ({
  id: supabaseShift.id,
  title: supabaseShift.title,
  description: supabaseShift.description || '', // Gérer les undefined
  shift_date: supabaseShift.shift_date,
  start_time: supabaseShift.start_time,
  end_time: supabaseShift.end_time,
  max_volunteers: supabaseShift.max_volunteers,
  current_volunteers: supabaseShift.current_volunteers || 0,
  role_type: supabaseShift.role_type,
  status: supabaseShift.status,
  check_in_required: supabaseShift.check_in_required || false
});

const convertSupabaseUserToLocal = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  full_name: supabaseUser.full_name,
  role: supabaseUser.role,
  profile_image: supabaseUser.profile_image,
  bio: supabaseUser.bio,
  instagram: supabaseUser.instagram,
  specialties: supabaseUser.specialties,
  experience_years: supabaseUser.experience_years,
  location: supabaseUser.location,
  phone: supabaseUser.phone,
  qr_code: supabaseUser.qr_code
});

// Composant principal
const SaborDanceApp = () => {
  // Utilisation du hook useAuth
  const { user: supabaseUser, loading: authLoading, signInAsTestUser, signOut, error: authError } = useAuth();
  
  // Conversion de l'utilisateur Supabase vers le format local
  const currentUser: User | null = supabaseUser ? convertSupabaseUserToLocal(supabaseUser) : null;
  
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [testAuthLoading, setTestAuthLoading] = useState(false);
  
  // États pour les données avec types locaux
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  const [volunteerSignups, setVolunteerSignups] = useState<VolunteerSignup[]>([]);
  const [performanceTeams, setPerformanceTeams] = useState<PerformanceTeam[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Utilisation du nouveau système de traduction
  const { t } = useTranslation(currentLanguage);

  // Charger les données depuis Supabase quand l'utilisateur est connecté
  useEffect(() => {
    if (currentUser && !dataLoading) {
      loadInitialData();
    }
  }, [currentUser?.id]); // Only when user ID changes

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      // Récupérer les shifts de l'événement BSF
      const { data: shiftsData, error: shiftsError } = await volunteerService.getShifts('a9d1c983-1456-4007-9aec-b297dd095ff7');
      
      if (!shiftsError && shiftsData) {
        // Convertir les données Supabase vers le format local
        const convertedShifts = shiftsData.map(shift => convertSupabaseShiftToLocal(shift));
        setVolunteerShifts(convertedShifts);
        console.log('Shifts chargés:', convertedShifts);
      } else {
        console.error('Erreur chargement shifts:', shiftsError);
      }

      // Récupérer les inscriptions si c'est un bénévole
      if (currentUser?.role === 'volunteer') {
        // ✅ BON EVENT ID (le même que pour les shifts)
        const { data: signupsData, error: signupsError } = await volunteerService.getVolunteerSignups(
          currentUser!.id, // Utilisation de l'assertion non-null car on a vérifié au-dessus
          'a9d1c983-1456-4007-9aec-b297dd095ff7'
        );
        
        if (!signupsError && signupsData) {
          // Convertir les signups au format local
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

      // Ajouter l'événement BSF
      setEvents([{
        id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        name: 'Boston Salsa Festival 2025',
        start_date: '2025-07-15',
        end_date: '2025-07-20',
        location: 'Boston, MA, USA',
        required_volunteer_hours: 8,
        status: 'live',
        team_submission_deadline: '2025-06-01T23:59:59Z'
      }]);

      // Données de démo pour les équipes
      setPerformanceTeams([
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
          can_edit_until: '2025-06-15T23:59:59Z',
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
          can_edit_until: '2025-06-15T23:59:59Z',
          backup_team: false
        }
      ]);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Fonction de test pour se connecter rapidement
  const handleTestLogin = async (email: string) => {
    setTestAuthLoading(true);
    try {
      const result = await signInAsTestUser(email);
      if (result.user) {
        console.log('Connexion réussie:', result.user);
      } else {
        console.error('Erreur connexion:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion test:', error);
    } finally {
      setTestAuthLoading(false);
    }
  };

  // Composant sélecteur de langue
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

  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'volunteer' | 'organizer' | 'team_director' | 'assistant' | 'artist' | 'attendee'>('attendee');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async () => {
      // TODO: Implémenter la vraie authentification Supabase
      // Pour l'instant, garde le comportement existant
      setShowAuth(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {authMode === 'login' ? t.login : t.register}
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
              {authMode === 'login' ? t.signIn : t.signUp}
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
              Sabor Dance
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

  // Rendu principal
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
        return (
          <>
            <HomePage t={t} setCurrentView={setCurrentView} setShowAuth={setShowAuth} />
            
            {/* Boutons de test Supabase - Affichés seulement sur la page d'accueil */}
            {!currentUser && (
              <div className="container mx-auto px-4 py-8">
                <div className="bg-red-500/20 p-6 rounded-xl mb-8 max-w-4xl mx-auto">
                  <h3 className="text-white font-bold mb-4 text-xl">🧪 {t.loading}</h3>
                  <div className="flex gap-3 flex-wrap">
                    <button 
                      onClick={() => handleTestLogin('hernan@bostonsalsafest.com')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      disabled={testAuthLoading}
                    >
                      Hernan ({t.admin})
                    </button>
                    <button 
                      onClick={() => handleTestLogin('kelly@bostonsalsafest.com')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      disabled={testAuthLoading}
                    >
                      Kelly ({t.organizer})
                    </button>
                    <button 
                      onClick={() => handleTestLogin('volunteer1@test.com')}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                      disabled={testAuthLoading}
                    >
                      {t.volunteer} 1
                    </button>
                    <button 
                      onClick={() => handleTestLogin('teamdir1@test.com')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      disabled={testAuthLoading}
                    >
                      {t.teamDirector} 1
                    </button>
                  </div>
                  {testAuthLoading && (
                    <p className="text-white mt-3 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t.loading}
                    </p>
                  )}
                  {authError && (
                    <p className="text-red-200 mt-3">❌ {t.error}: {authError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Affichage utilisateur connecté */}
            {currentUser && (
              <div className="container mx-auto px-4 py-4">
                <div className="bg-green-500/20 p-4 rounded-xl mb-4 max-w-4xl mx-auto">
                  <p className="text-white text-lg">
                    ✅ {t.loginSuccess}: <strong>{currentUser.full_name}</strong> ({currentUser.role})
                  </p>
                  <p className="text-green-200 text-sm mt-1">
                    {t.email}: {currentUser.email} | ID: {currentUser.id}
                  </p>
                </div>
              </div>
            )}
          </>
        );
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