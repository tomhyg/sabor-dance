import React, { useState } from 'react';
import { Calendar, Users, Music, Settings, MapPin, Clock, Star, TrendingUp, AlertTriangle, CheckCircle, Edit, Save, X, Plus, BarChart3, UserCheck, Play, Download, QrCode, Bell } from 'lucide-react';

// Import des nouveaux composants (optionnels - tu peux les ajouter progressivement)
// import BSFNavigation from '../components/BSFNavigation';
// import BSFSettings from '../components/BSFSettings';
// import { quickExport } from '../utils/exportUtils';

interface BSFPageProps {
  t: any;
  currentUser: any;
  setCurrentView: (view: string) => void;
  volunteerShifts: any[];
  performanceTeams: any[];
  volunteerSignups: any[];
}

interface EventSettings {
  id?: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  venue_address: string;
  required_volunteer_hours: number;
  team_submission_deadline: string;
  description: string;
  capacity: number;
  ticket_price: number;
  contact_email: string;
  website: string;
  instagram: string;
  // Champs étendus pour compatibilité avec BSFSettings
  team_submission_limit?: number;
  registration_deadline?: string;
  website_url?: string;
  instagram_handle?: string;
  status?: 'draft' | 'live' | 'completed' | 'cancelled';
  notifications_enabled?: boolean;
  allow_team_video_preview?: boolean;
  team_performance_duration?: number;
  scoring_enabled?: boolean;
}

const BSFPage: React.FC<BSFPageProps> = ({
  t,
  currentUser,
  setCurrentView,
  volunteerShifts,
  performanceTeams,
  volunteerSignups
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentBSFView, setCurrentBSFView] = useState<'overview' | 'volunteers' | 'teams' | 'dashboard' | 'settings'>('overview');
  
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    id: 'bsf-2025',
    name: 'Boston Salsa Festival 2025',
    start_date: '2025-06-20',
    end_date: '2025-06-22',
    location: 'Boston Convention Center',
    venue_address: '415 Summer St, Boston, MA 02210',
    required_volunteer_hours: 8,
    team_submission_deadline: '2025-06-15',
    description: 'Le plus grand festival de danse latine de la côte Est ! 3 jours de workshops, spectacles et soirées avec les meilleurs artistes internationaux.',
    capacity: 700,
    ticket_price: 150,
    contact_email: 'info@bostonsalsafestival.com',
    website: 'www.bostonsalsafestival.com',
    instagram: '@bostonsalsafestival',
    // Champs étendus avec valeurs par défaut
    team_submission_limit: 30,
    registration_deadline: '2025-06-10',
    website_url: 'https://www.bostonsalsafestival.com',
    instagram_handle: 'bostonsalsafestival',
    status: 'live',
    notifications_enabled: true,
    allow_team_video_preview: true,
    team_performance_duration: 4,
    scoring_enabled: true
  });

  // Calculer les statistiques (tes calculs existants)
  const totalVolunteers = volunteerSignups.filter(s => s.status !== 'cancelled').length;
  const criticalShifts = volunteerShifts.filter(s => 
    s.status === 'live' && (s.current_volunteers / s.max_volunteers) < 0.5
  ).length;
  const approvedTeams = performanceTeams.filter(t => t.status === 'approved').length;
  const pendingTeams = performanceTeams.filter(t => t.status === 'submitted').length;

  // Fonctions d'export améliorées
  const handleQuickExport = (type: 'volunteers' | 'teams' | 'dashboard') => {
    // Fonction d'export simple (tu peux remplacer par quickExport des utils plus tard)
    const exportData = {
      volunteers: volunteerShifts,
      teams: performanceTeams,
      dashboard: { totalVolunteers, criticalShifts, approvedTeams, pendingTeams }
    };
    
    const dataStr = JSON.stringify(exportData[type], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bsf_${type}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveSettings = () => {
    // Ici on sauvegarderait les paramètres
    console.log('Paramètres sauvegardés:', eventSettings);
    setShowSettings(false);
  };

  // Navigation BSF intégrée (optionnelle)
  const BSFQuickNav = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold">Navigation Rapide</h3>
          <div className="flex gap-2">
            {criticalShifts > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                {criticalShifts} urgents
              </span>
            )}
            {pendingTeams > 0 && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Clock size={12} />
                {pendingTeams} en attente
              </span>
            )}
          </div>
        </div>
        
        {/* Actions rapides pour organisateurs */}
        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickExport('volunteers')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
              title="Exporter bénévoles"
            >
              <Download size={14} />
              CSV Bénévoles
            </button>
            <button
              onClick={() => handleQuickExport('teams')}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
              title="Exporter équipes"
            >
              <Download size={14} />
              CSV Équipes
            </button>
            <button
              onClick={() => console.log('QR Scanner ouvert')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
              title="Scanner QR"
            >
              <QrCode size={14} />
              QR
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900">
      {/* Hero Header BSF (ton design existant) */}
      <div className="relative py-20 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-bounce"></div>
          {/* Motifs danse */}
          <div className="absolute top-20 left-20 text-white/10 text-8xl">💃</div>
          <div className="absolute bottom-20 right-20 text-white/10 text-8xl">🕺</div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
                    {eventSettings.name}
                  </h1>
                  <div className="flex items-center gap-6 text-orange-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">
                        {new Date(eventSettings.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - 
                        {new Date(eventSettings.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">{eventSettings.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xl text-orange-100 max-w-3xl leading-relaxed">
                {eventSettings.description}
              </p>
            </div>
            
            {/* Bouton paramètres pour organisateurs */}
            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <Settings size={20} />
                Paramètres Événement
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation rapide améliorée */}
        <BSFQuickNav />

        {/* Navigation rapide (tes cartes existantes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="group bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black text-blue-400">{totalVolunteers}</div>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Analytics Dashboard</h3>
            <p className="text-gray-300 text-sm">Vue d'ensemble complète de l'événement</p>
          </button>

          <button
            onClick={() => setCurrentView('volunteers')}
            className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-8 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
              {criticalShifts > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {criticalShifts} urgents
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Gestion Bénévoles</h3>
            <p className="text-gray-300 text-sm">Créneaux, planning et check-in</p>
          </button>

          <button
            onClick={() => setCurrentView('teams')}
            className="group bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 hover:from-purple-500/20 hover:to-violet-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
              {pendingTeams > 0 && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  {pendingTeams} en attente
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Équipes Performance</h3>
            <p className="text-gray-300 text-sm">Soumissions et ordre de passage</p>
          </button>

          <button
            onClick={() => setCurrentView('profiles')}
            className="group bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-md border border-pink-500/20 rounded-3xl p-8 hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black text-pink-400">{approvedTeams}</div>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Artistes & Profils</h3>
            <p className="text-gray-300 text-sm">Instructeurs et performers</p>
          </button>
        </div>

        {/* Informations spécifiques par rôle (ton contenu existant) */}
        {currentUser?.role === 'volunteer' && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-400" />
                  Bienvenue, Bénévole !
                </h2>
                <p className="text-green-100 text-lg mb-4">
                  Merci de contribuer au succès du BSF ! Vous devez compléter <strong>{eventSettings.required_volunteer_hours}h de bénévolat</strong> pour obtenir votre pass gratuit.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView('volunteers')}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                  >
                    Voir mes créneaux
                  </button>
                  <button className="bg-green-500/20 text-green-300 px-6 py-3 rounded-xl font-bold hover:bg-green-500/30 transition-colors">
                    Programme complet
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-green-400 mb-2">8h</div>
                <p className="text-green-300 font-semibold">requis</p>
              </div>
            </div>
          </div>
        )}

        {currentUser?.role === 'team_director' && (
          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Play className="w-8 h-8 text-purple-400" />
                  Espace Directeur d'Équipe
                </h2>
                <p className="text-purple-100 text-lg mb-4">
                  Soumettez vos équipes avant le <strong>{new Date(eventSettings.team_submission_deadline).toLocaleDateString('fr-FR')}</strong>. 
                  Tous les détails, vidéos et musiques sont requis.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView('teams')}
                    className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors"
                  >
                    Mes équipes
                  </button>
                  <button className="bg-purple-500/20 text-purple-300 px-6 py-3 rounded-xl font-bold hover:bg-purple-500/30 transition-colors">
                    Règlement spectacle
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-purple-400 mb-2">{performanceTeams.filter(t => t.created_by === currentUser?.id).length}</div>
                <p className="text-purple-300 font-semibold">mes équipes</p>
              </div>
            </div>
          </div>
        )}

        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-red-400" />
                  Tableau de Bord Organisateur
                </h2>
                <p className="text-red-100 text-lg mb-4">
                  Vue d'ensemble complète du BSF. Surveillez les alertes critiques et les actions requises.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                  >
                    Dashboard complet
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-red-500/20 text-red-300 px-6 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
                  >
                    Paramètres BSF
                  </button>
                  <button
                    onClick={() => handleQuickExport('dashboard')}
                    className="bg-red-500/20 text-red-300 px-6 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Rapport
                  </button>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-red-400">{criticalShifts}</div>
                  <p className="text-red-300 text-sm font-semibold">Créneaux critiques</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-400">{pendingTeams}</div>
                  <p className="text-orange-300 text-sm font-semibold">Équipes en attente</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infos générales événement (ton contenu existant) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations pratiques */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-400" />
              Informations Pratiques
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">📍 Lieu</h4>
                <p className="text-gray-300">{eventSettings.location}</p>
                <p className="text-gray-400 text-sm">{eventSettings.venue_address}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">📅 Dates</h4>
                <p className="text-gray-300">
                  Du {new Date(eventSettings.start_date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })} au {new Date(eventSettings.end_date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">🎫 Tarifs</h4>
                <p className="text-gray-300">{eventSettings.ticket_price}$ - Pass 3 jours</p>
                <p className="text-gray-400 text-sm">Gratuit pour les bénévoles ({eventSettings.required_volunteer_hours}h requises)</p>
              </div>
            </div>
          </div>

          {/* Statistiques live */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              Statistiques Live
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">{totalVolunteers}</div>
                <p className="text-gray-300 font-semibold">Bénévoles</p>
                <p className="text-gray-500 text-sm">inscrits</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-purple-400 mb-2">{performanceTeams.length}</div>
                <p className="text-gray-300 font-semibold">Équipes</p>
                <p className="text-gray-500 text-sm">soumises</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-green-400 mb-2">{approvedTeams}</div>
                <p className="text-gray-300 font-semibold">Approuvées</p>
                <p className="text-gray-500 text-sm">pour le show</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-orange-400 mb-2">{eventSettings.capacity}</div>
                <p className="text-gray-300 font-semibold">Participants</p>
                <p className="text-gray-500 text-sm">max attendus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Paramètres Événement (ton modal existant) */}
      {showSettings && (currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Settings className="w-8 h-8 text-red-400" />
                  Paramètres Événement BSF
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations générales */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-gray-600/30 pb-3">Informations Générales</h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Nom de l'événement</label>
                    <input
                      type="text"
                      value={eventSettings.name}
                      onChange={(e) => setEventSettings({...eventSettings, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Date début</label>
                      <input
                        type="date"
                        value={eventSettings.start_date}
                        onChange={(e) => setEventSettings({...eventSettings, start_date: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Date fin</label>
                      <input
                        type="date"
                        value={eventSettings.end_date}
                        onChange={(e) => setEventSettings({...eventSettings, end_date: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Lieu</label>
                    <input
                      type="text"
                      value={eventSettings.location}
                      onChange={(e) => setEventSettings({...eventSettings, location: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Adresse complète</label>
                    <input
                      type="text"
                      value={eventSettings.venue_address}
                      onChange={(e) => setEventSettings({...eventSettings, venue_address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                    <textarea
                      value={eventSettings.description}
                      onChange={(e) => setEventSettings({...eventSettings, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 h-24"
                    />
                  </div>
                </div>

                {/* Paramètres techniques */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-gray-600/30 pb-3">Paramètres Techniques</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Heures bénévoles requises</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={eventSettings.required_volunteer_hours}
                        onChange={(e) => setEventSettings({...eventSettings, required_volunteer_hours: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Capacité max</label>
                      <input
                        type="number"
                        value={eventSettings.capacity}
                        onChange={(e) => setEventSettings({...eventSettings, capacity: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Prix ticket ($)</label>
                      <input
                        type="number"
                        value={eventSettings.ticket_price}
                        onChange={(e) => setEventSettings({...eventSettings, ticket_price: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Deadline équipes</label>
                      <input
                        type="date"
                        value={eventSettings.team_submission_deadline}
                        onChange={(e) => setEventSettings({...eventSettings, team_submission_deadline: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email contact</label>
                    <input
                      type="email"
                      value={eventSettings.contact_email}
                      onChange={(e) => setEventSettings({...eventSettings, contact_email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Site web</label>
                      <input
                        type="text"
                        value={eventSettings.website}
                        onChange={(e) => setEventSettings({...eventSettings, website: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Instagram</label>
                      <input
                        type="text"
                        value={eventSettings.instagram}
                        onChange={(e) => setEventSettings({...eventSettings, instagram: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-600/30">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Sauvegarder les Paramètres
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSFPage;