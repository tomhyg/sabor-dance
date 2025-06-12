import React, { useState } from 'react';
import { Music, Plus, X, Play, Star, CheckCircle, Users, Target, BarChart3, Download } from 'lucide-react';
import { exportTeamsToExcel } from '../../utils/exportUtils';

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

interface TeamsPageProps {
  t: any;
  currentUser: any;
  performanceTeams: PerformanceTeam[];
  setPerformanceTeams: React.Dispatch<React.SetStateAction<PerformanceTeam[]>>;
}

const TeamsPage: React.FC<TeamsPageProps> = ({
  t,
  currentUser,
  performanceTeams,
  setPerformanceTeams
}) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<PerformanceTeam | null>(null);
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    director_name: '',
    director_email: '',
    studio_name: '',
    city: '',
    country: '',
    song_title: '',
    group_size: 4,
    dance_styles: [] as string[]
  });

  // Handler pour export Excel
  const handleExportTeams = () => {
    try {
      exportTeamsToExcel(performanceTeams);
      console.log('Export équipes généré avec succès');
    } catch (error) {
      console.error('Erreur export équipes:', error);
    }
  };

  const handleCreateTeam = () => {
    const team: PerformanceTeam = {
      id: Date.now().toString(),
      ...newTeam,
      status: 'draft',
      can_edit_until: '2025-06-15',
      backup_team: false
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
      group_size: 4,
      dance_styles: []
    });
  };

  const handleApprove = (teamId: string) => {
    setPerformanceTeams(teams =>
      teams.map(team =>
        team.id === teamId ? { ...team, status: 'approved' as const } : team
      )
    );
  };

  const handleReject = (teamId: string) => {
    setPerformanceTeams(teams =>
      teams.map(team =>
        team.id === teamId ? { ...team, status: 'rejected' as const } : team
      )
    );
  };

  const addDanceStyle = (style: string) => {
    if (style && !newTeam.dance_styles.includes(style)) {
      setNewTeam({
        ...newTeam,
        dance_styles: [...newTeam.dance_styles, style]
      });
    }
  };

  const removeDanceStyle = (style: string) => {
    setNewTeam({
      ...newTeam,
      dance_styles: newTeam.dance_styles.filter(s => s !== style)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Hero Header */}
      <div className="relative py-20 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {t.performanceTeams || 'Équipes de Performance'}
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl">
                Gérez les équipes de performance pour votre congrès de danse
              </p>
            </div>
            
            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="group bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <Plus size={20} />
                  {t.createTeam || 'Créer une équipe'}
                </button>
                <button
                  onClick={handleExportTeams}
                  className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div className="text-3xl font-black text-blue-400">{performanceTeams.length}</div>
            </div>
            <p className="text-gray-300 font-medium">Total équipes</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div className="text-3xl font-black text-green-400">{performanceTeams.filter(t => t.status === 'approved').length}</div>
            </div>
            <p className="text-gray-300 font-medium">Approuvées</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8 text-yellow-400" />
              <div className="text-3xl font-black text-yellow-400">{performanceTeams.filter(t => t.status === 'submitted').length}</div>
            </div>
            <p className="text-gray-300 font-medium">En attente</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 backdrop-blur-md border border-gray-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-8 h-8 text-gray-400" />
              <div className="text-3xl font-black text-gray-400">{performanceTeams.filter(t => t.status === 'draft').length}</div>
            </div>
            <p className="text-gray-300 font-medium">Brouillons</p>
          </div>
        </div>

        {/* Liste des équipes */}
        <div className="grid gap-6">
          {performanceTeams
            .sort((a, b) => {
              // Équipes en attente en priorité
              if (a.status === 'submitted' && b.status !== 'submitted') return -1;
              if (b.status === 'submitted' && a.status !== 'submitted') return 1;
              return 0;
            })
            .map(team => (
            <div key={team.id} className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">{team.team_name}</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      team.status === 'draft' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                      team.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      team.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {team.status === 'draft' ? (t.draft || 'Brouillon') :
                       team.status === 'submitted' ? (t.submitted || '🚨 SOUMISE - ACTION REQUISE') :
                       team.status === 'approved' ? (t.approved || 'Approuvée') :
                       (t.rejected || 'Refusée')}
                    </span>
                    {team.status === 'submitted' && (
                      <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300 mb-4">
                    <div>
                      <span className="text-purple-400 font-semibold">{t.director || 'Directeur'}:</span>
                      <p className="font-medium">{team.director_name}</p>
                      <p className="text-sm text-gray-400">{team.director_email}</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{t.studio || 'Studio'}:</span>
                      <p className="font-medium">{team.studio_name}</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{t.city || 'Ville'}:</span>
                      <p className="font-medium">{team.city}, {team.country}</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{t.groupSize || 'Taille'}:</span>
                      <p className="font-medium">{team.group_size} {t.members || 'membres'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {team.dance_styles.map(style => (
                      <span key={style} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 font-medium">
                        {style}
                      </span>
                    ))}
                  </div>

                  {team.song_title && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-purple-400 font-semibold">{t.song || 'Chanson'}:</span> 
                      <span className="font-medium ml-2">{team.song_title}</span>
                    </div>
                  )}

                  {team.performance_video_url && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-purple-400 font-semibold">Vidéo:</span>
                      <button className="ml-2 text-blue-400 hover:text-blue-300 underline">
                        Voir la vidéo
                      </button>
                    </div>
                  )}

                  {team.organizer_notes && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-purple-400 font-semibold">{t.organizerNotes || 'Notes'}:</span>
                      <p className="mt-1 text-sm bg-gray-700/30 p-3 rounded-lg">{team.organizer_notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-8 flex flex-col gap-3">
                  {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && team.status === 'submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(team.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        {t.approve || 'Approuver'}
                      </button>
                      <button
                        onClick={() => handleReject(team.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                      >
                        <X size={16} />
                        {t.reject || 'Refuser'}
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                  >
                    <Play size={16} />
                    {t.viewProfile || 'Voir détails'}
                  </button>
                </div>
              </div>

              {/* Progress bar pour équipes approuvées */}
              {team.status === 'approved' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 font-semibold">✅ Équipe approuvée</span>
                    {team.performance_order && (
                      <span className="text-green-300 font-bold">Ordre: #{team.performance_order}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">Prête pour le spectacle</p>
                </div>
              )}

              {team.scoring && (
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                    <Star size={16} />
                    Notation
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Taille:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.group_size_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Wow Factor:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.wow_factor_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Technique:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.technical_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <span className="text-purple-300 font-bold ml-2">{team.scoring.total_score}/30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucune équipe */}
        {performanceTeams.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune équipe pour le moment</h3>
            <p className="text-gray-500">Les équipes apparaîtront ici une fois soumises</p>
          </div>
        )}

        {/* Modal de création d'équipe */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">{t.createTeam || 'Créer une équipe'}</h2>
                <button onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.teamName || 'Nom de l\'équipe'}</label>
                    <input
                      type="text"
                      value={newTeam.team_name}
                      onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Ex: Boston Salsa Collective"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.director || 'Directeur'}</label>
                    <input
                      type="text"
                      value={newTeam.director_name}
                      onChange={(e) => setNewTeam({...newTeam, director_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Nom du directeur"
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
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.studio || 'Studio'}</label>
                    <input
                      type="text"
                      value={newTeam.studio_name}
                      onChange={(e) => setNewTeam({...newTeam, studio_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Nom du studio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.groupSize || 'Taille du groupe'}</label>
                    <input
                      type="number"
                      min="2"
                      value={newTeam.group_size}
                      onChange={(e) => setNewTeam({...newTeam, group_size: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.city || 'Ville'}</label>
                    <input
                      type="text"
                      value={newTeam.city}
                      onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Boston"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.country || 'Pays'}</label>
                    <input
                      type="text"
                      value={newTeam.country}
                      onChange={(e) => setNewTeam({...newTeam, country: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="USA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.song || 'Chanson'}</label>
                  <input
                    type="text"
                    value={newTeam.song_title}
                    onChange={(e) => setNewTeam({...newTeam, song_title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Titre de la chanson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.danceStyles || 'Styles de danse'}</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newTeam.dance_styles.map(style => (
                      <span key={style} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 flex items-center gap-2">
                        {style}
                        <button
                          onClick={() => removeDanceStyle(style)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['Salsa', 'Bachata', 'Kizomba', 'Zouk', 'Mambo', 'Cha-cha'].map(style => (
                      <button
                        key={style}
                        onClick={() => addDanceStyle(style)}
                        disabled={newTeam.dance_styles.includes(style)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          newTeam.dance_styles.includes(style) 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateTeam}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  {t.createTeam || 'Créer l\'équipe'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détails d'équipe */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">{selectedTeam.team_name}</h2>
                  <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Informations générales</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><strong>Directeur:</strong> {selectedTeam.director_name}</p>
                        <p><strong>Email:</strong> {selectedTeam.director_email}</p>
                        <p><strong>Studio:</strong> {selectedTeam.studio_name}</p>
                        <p><strong>Localisation:</strong> {selectedTeam.city}, {selectedTeam.country}</p>
                        <p><strong>Taille:</strong> {selectedTeam.group_size} membres</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Performance</h4>
                      <div className="space-y-2 text-gray-300">
                        {selectedTeam.song_title && <p><strong>Chanson:</strong> {selectedTeam.song_title}</p>}
                        <div>
                          <strong>Styles:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedTeam.dance_styles.map(style => (
                              <span key={style} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                        {selectedTeam.performance_video_url && (
                          <p><strong>Vidéo:</strong> <a href={selectedTeam.performance_video_url} className="text-blue-400 hover:text-blue-300">Voir la vidéo</a></p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Statut</h4>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        selectedTeam.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                        selectedTeam.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-300' :
                        selectedTeam.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {selectedTeam.status === 'draft' ? 'Brouillon' :
                         selectedTeam.status === 'submitted' ? 'Soumise' :
                         selectedTeam.status === 'approved' ? 'Approuvée' :
                         'Refusée'}
                      </span>
                    </div>
                    
                    {selectedTeam.scoring && (
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">Notation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Taille du groupe:</span>
                            <span className="font-bold">{selectedTeam.scoring.group_size_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wow Factor:</span>
                            <span className="font-bold">{selectedTeam.scoring.wow_factor_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Technique:</span>
                            <span className="font-bold">{selectedTeam.scoring.technical_score}/10</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-600 pt-2">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold text-purple-300">{selectedTeam.scoring.total_score}/30</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTeam.performance_order && (
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">Ordre de passage</h4>
                        <div className="text-2xl font-bold text-green-400">#{selectedTeam.performance_order}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedTeam.organizer_notes && (
                  <div className="mb-8">
                    <h4 className="text-purple-400 font-semibold mb-2">Notes de l'organisateur</h4>
                    <p className="text-gray-300 bg-gray-700/30 p-4 rounded-xl">{selectedTeam.organizer_notes}</p>
                  </div>
                )}

                {/* Actions pour organisateurs */}
                {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && selectedTeam.status === 'submitted' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedTeam.id);
                        setSelectedTeam({...selectedTeam, status: 'approved'});
                      }}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Approuver cette équipe
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTeam.id);
                        setSelectedTeam({...selectedTeam, status: 'rejected'});
                      }}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Refuser cette équipe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;