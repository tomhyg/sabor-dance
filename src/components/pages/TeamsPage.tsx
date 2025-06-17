import React, { useState, useEffect } from 'react';
import { Music, Plus, X, Play, Star, CheckCircle, Users, Target, BarChart3, Download, AlertTriangle, Edit, Send, Instagram, Globe, ExternalLink, ChevronDown, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import { exportPerformanceTeams, quickExport } from '../../utils/exportUtils';
import { teamService } from '../../services/teamService';
import { PerformanceTeam } from '../../types/PerformanceTeam';
import { useTranslation } from '../../locales/translations'; // ✅ Import du système de traduction

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

interface TeamsPageProps {
  t: any;
  currentUser: any;
  language: 'fr' | 'en' | 'es'; // ✅ Ajout de la prop language
  performanceTeams: PerformanceTeam[];
  setPerformanceTeams: React.Dispatch<React.SetStateAction<PerformanceTeam[]>>;
}

const TeamsPage: React.FC<TeamsPageProps> = ({
  t,
  currentUser,
  language = 'en', // ✅ Valeur par défaut
  performanceTeams,
  setPerformanceTeams
}) => {
  // ✅ Hook de traduction avec la langue passée en prop
  const { translate } = useTranslation(language);
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<PerformanceTeam | null>(null);
  const [showEditTeam, setShowEditTeam] = useState<PerformanceTeam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState<string | null>(null);
  
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    director_name: '',
    director_email: '',
    director_phone: '',
    studio_name: '',
    city: '',
    state: '',
    country: '',
    song_title: '',
    song_artist: '',
    group_size: 4,
    dance_styles: [] as string[],
    performance_level: null as 'beginner' | 'intermediate' | 'advanced' | 'pro' | null | undefined,
    performance_video_url: '',
    music_file: null as File | null,
    instagram: '',
    website_url: ''
  });

  const [editTeamData, setEditTeamData] = useState({
    team_name: '',
    director_name: '',
    director_email: '',
    director_phone: '',
    studio_name: '',
    city: '',
    state: '',
    country: '',
    song_title: '',
    song_artist: '',
    group_size: 4,
    dance_styles: [] as string[],
    performance_level: null as 'beginner' | 'intermediate' | 'advanced' | 'pro' | null | undefined,
    performance_video_url: '',
    instagram: '',
    website_url: ''
  });

  // Charger les équipes au montage du composant
  useEffect(() => {
    loadTeams();
  }, []);

  // 🆕 CHARGEMENT DES ÉQUIPES DEPUIS SUPABASE
  const loadTeams = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement équipes Supabase...');
      
      const { data, error } = await teamService.getTeams('a9d1c983-1456-4007-9aec-b297dd095ff7');
      
      if (error) {
        console.error('❌ Erreur chargement équipes:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipes chargées:', data?.length);
      
      // Convertir les données Supabase vers le format local
      const localTeams: PerformanceTeam[] = (data || []).map(team => ({
        id: team.id,
        event_id: team.event_id,
        team_name: team.team_name,
        director_name: team.director_name,
        director_email: team.director_email,
        director_phone: team.director_phone,
        studio_name: team.studio_name,
        city: team.city,
        state: team.state,
        country: team.country,
        status: team.status,
        performance_video_url: team.performance_video_url,
        music_file_url: team.music_file_url,
        song_title: team.song_title,
        song_artist: team.song_artist,
        group_size: team.group_size,
        dance_styles: team.dance_styles || [],
        performance_level: team.performance_level,
        performance_order: team.performance_order,
        scoring: team.scoring,
        organizer_notes: team.organizer_notes,
        rejection_reason: team.rejection_reason,
        can_edit_until: team.can_edit_until,
        backup_team: team.backup_team,
        instagram: team.instagram,
        website_url: team.website_url,
        created_by: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        submitted_at: team.submitted_at,
        approved_at: team.approved_at,
        rejected_at: team.rejected_at
      }));

      setPerformanceTeams(localTeams);

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTeams = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    quickExport('teams', {
      teams: performanceTeams,
      eventName: 'Boston Salsa Festival 2025'
    }, format);
  };

  // 🆕 CRÉATION AVEC SUPABASE
  const handleCreateTeam = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      console.log('🚀 Création équipe avec Supabase:', newTeam);

      // Préparer les données pour Supabase
      const teamData = {
        event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        team_name: newTeam.team_name,
        director_name: newTeam.director_name,
        director_email: newTeam.director_email,
        director_phone: newTeam.director_phone || null,
        studio_name: newTeam.studio_name || null,
        city: newTeam.city,
        state: newTeam.state || null,
        country: newTeam.country,
        song_title: newTeam.song_title || null,
        song_artist: newTeam.song_artist || null,
        group_size: newTeam.group_size,
        dance_styles: newTeam.dance_styles,
        performance_level: newTeam.performance_level,
        performance_video_url: newTeam.performance_video_url || null,
        instagram: newTeam.instagram || null,
        website_url: newTeam.website_url || null,
        status: 'draft',
        backup_team: false,
        performance_duration: 5,
        can_edit_until: '2025-06-15T23:59:59Z',
        created_by: currentUser?.id || null
      };

      const { data, error } = await teamService.createTeam(teamData);

      if (error) {
        console.error('❌ Erreur création équipe:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipe créée avec succès:', data);

      // Convertir vers le format local et ajouter à la liste
      const localTeam: PerformanceTeam = {
        id: data.id,
        event_id: data.event_id,
        team_name: data.team_name,
        director_name: data.director_name,
        director_email: data.director_email,
        director_phone: data.director_phone,
        studio_name: data.studio_name,
        city: data.city,
        state: data.state,
        country: data.country,
        status: data.status,
        performance_video_url: data.performance_video_url,
        music_file_url: data.music_file_url,
        song_title: data.song_title,
        song_artist: data.song_artist,
        group_size: data.group_size,
        dance_styles: data.dance_styles || [],
        performance_level: data.performance_level,
        performance_order: data.performance_order,
        backup_team: data.backup_team,
        instagram: data.instagram,
        website_url: data.website_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        scoring: null,
        organizer_notes: null,
        rejection_reason: null,
        can_edit_until: data.can_edit_until,
        submitted_at: null,
        approved_at: null,
        rejected_at: null
      };

      setPerformanceTeams(prev => [localTeam, ...prev]);

      // Upload du fichier musical si présent
      if (newTeam.music_file && data.id) {
        await handleMusicUpload(data.id, newTeam.music_file);
      }

      // Fermer le modal et reset
      setShowCreateTeam(false);
      resetNewTeam();
      alert(translate('teamCreated'));

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 🆕 UPLOAD FICHIER MUSICAL
  const handleMusicUpload = async (teamId: string, file: File) => {
    try {
      setUploadingMusic(teamId);
      console.log('🎵 Upload fichier musical:', file.name);

      const { data, error } = await teamService.uploadMusicFile(teamId, file, currentUser);

      if (error) {
        console.error('❌ Erreur upload musical:', error);
        alert(`${translate('fileUploadError')}: ${getErrorMessage(error)}`);
        return;
      }

      console.log('✅ Fichier musical uploadé:', data);

      // Mettre à jour l'équipe dans la liste locale
      setPerformanceTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                music_file_url: data?.url || null, 
                song_title: data?.team?.song_title || null 
              }
            : team
        )
      );

      if (data?.warning) {
        alert(`⚠️ ${data.warning}`);
      } else {
        alert(translate('fileUploadSuccess'));
      }

    } catch (error) {
      console.error('❌ Erreur catch upload:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    } finally {
      setUploadingMusic(null);
    }
  };

  // 🆕 SOUMISSION ÉQUIPE AVEC SUPABASE
  const handleSubmitTeam = async (teamId: string) => {
    try {
      console.log('📤 Soumission équipe:', teamId);
      
      const { data, error } = await teamService.updateStatus(teamId, 'submitted');
      
      if (error) {
        console.error('❌ Erreur soumission:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipe soumise:', data);

      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === teamId 
            ? { ...team, status: 'submitted', submitted_at: new Date().toISOString() }
            : team
        )
      );

      alert(translate('teamSubmitted'));

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    }
  };

  // 🆕 ÉDITION AVEC SUPABASE
  const handleEditTeam = (team: PerformanceTeam) => {
    setEditTeamData({
      team_name: team.team_name,
      director_name: team.director_name,
      director_email: team.director_email,
      director_phone: team.director_phone || '',
      studio_name: team.studio_name || '',
      city: team.city,
      state: team.state || '',
      country: team.country,
      song_title: team.song_title || '',
      song_artist: team.song_artist || '',
      group_size: team.group_size,
      dance_styles: [...(team.dance_styles || [])],
      performance_level: team.performance_level,
      performance_video_url: team.performance_video_url || '',
      instagram: team.instagram || '',
      website_url: team.website_url || ''
    });
    setShowEditTeam(team);
  };

  const saveEditTeam = async () => {
    if (!showEditTeam || isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('🔄 Sauvegarde équipe:', showEditTeam.id, editTeamData);

      const { data, error } = await teamService.updateTeam(showEditTeam.id, editTeamData);

      if (error) {
        console.error('❌ Erreur mise à jour:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipe mise à jour:', data);

      const updatedTeam = { ...showEditTeam, ...editTeamData, updated_at: new Date().toISOString() };
      
      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === showEditTeam.id ? updatedTeam : team
        )
      );

      setShowEditTeam(null);
      alert(translate('teamUpdated'));

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const canEditTeam = (team: PerformanceTeam) => {
    return (
      (currentUser?.role === 'organizer' || currentUser?.role === 'admin') ||
      (currentUser?.role === 'team_director' && team.created_by === currentUser?.id && team.status !== 'approved')
    );
  };

  // 🆕 APPROBATION AVEC SUPABASE
  const handleApprove = async (teamId: string) => {
    try {
      console.log('✅ Approbation équipe:', teamId);
      
      const { data, error } = await teamService.updateStatus(teamId, 'approved');
      
      if (error) {
        console.error('❌ Erreur approbation:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipe approuvée:', data);

      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === teamId 
            ? { ...team, status: 'approved', approved_at: new Date().toISOString() }
            : team
        )
      );

      alert(translate('teamApproved'));

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    }
  };

  // 🆕 REFUS AVEC SUPABASE
  const handleReject = async (teamId: string) => {
    const reason = prompt(translate('rejectionReason') + ' (optionnel):');
    
    try {
      console.log('❌ Refus équipe:', teamId);
      
      const { data, error } = await teamService.updateStatus(teamId, 'rejected', reason || undefined);
      
      if (error) {
        console.error('❌ Erreur refus:', error);
        alert(`${translate('error')}: ${error.message}`);
        return;
      }

      console.log('✅ Équipe refusée:', data);

      setPerformanceTeams(teams =>
        teams.map(team =>
          team.id === teamId 
            ? { 
                ...team, 
                status: 'rejected', 
                rejected_at: new Date().toISOString(),
                rejection_reason: reason || null
              }
            : team
        )
      );

      alert(translate('teamRejected'));

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('error')}: ${getErrorMessage(error)}`);
    }
  };

  const resetNewTeam = () => {
    setNewTeam({
      team_name: '',
      director_name: '',
      director_email: '',
      director_phone: '',
      studio_name: '',
      city: '',
      state: '',
      country: '',
      song_title: '',
      song_artist: '',
      group_size: 4,
      dance_styles: [],
      performance_level: null,
      performance_video_url: '',
      music_file: null,
      instagram: '',
      website_url: ''
    });
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

  const addEditDanceStyle = (style: string) => {
    if (style && !editTeamData.dance_styles.includes(style)) {
      setEditTeamData({
        ...editTeamData,
        dance_styles: [...editTeamData.dance_styles, style]
      });
    }
  };

  const removeEditDanceStyle = (style: string) => {
    setEditTeamData({
      ...editTeamData,
      dance_styles: editTeamData.dance_styles.filter(s => s !== style)
    });
  };

  // ✅ Fonction pour traduire les styles de danse
  const translateDanceStyle = (style: string) => {
    const styleMap: Record<string, string> = {
      'Salsa': translate('salsa'),
      'Bachata': translate('bachata'),
      'Kizomba': translate('zouk'), // ou créer kizomba
      'Zouk': translate('zouk'),
      'Mambo': translate('mambo'),
      'Cha-cha': translate('chacha'),
      'Merengue': translate('merengue'),
      'Rumba': translate('rumba'),
      'Samba': translate('samba')
    };
    return styleMap[style] || style;
  };

  // ✅ Fonction pour traduire les niveaux
  const translateLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      'beginner': translate('beginner'),
      'intermediate': translate('intermediate'),
      'advanced': translate('advanced'),
      'professional': translate('professional'),
      'pro': translate('professional')
    };
    return levelMap[level] || level;
  };

  // ✅ Fonction pour traduire les statuts
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': translate('draft'),
      'submitted': translate('submitted'),
      'approved': translate('approved'),
      'rejected': translate('rejected')
    };
    return statusMap[status] || status;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-purple-100">{translate('loadingData')}</p>
        </div>
      </div>
    );
  }

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
                {translate('performanceTeams')}
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl">
                {translate('teamDesc')}
              </p>
            </div>
            
            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin' || currentUser?.role === 'team_director') && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowCreateTeam(true)}
                  disabled={isCreating}
                  className="group bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  {isCreating ? translate('creating') + '...' : translate('createTeam')}
                </button>
                {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportTeams('xlsx')}
                      className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileSpreadsheet size={16} />
                      XLSX
                    </button>
                    <button
                      onClick={() => handleExportTeams('csv')}
                      className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileText size={16} />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExportTeams('pdf')}
                      className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileText size={16} />
                      PDF
                    </button>
                  </div>
                )}
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
            <p className="text-gray-300 font-medium">{translate('total')} {translate('teams')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div className="text-3xl font-black text-green-400">{performanceTeams.filter(t => t.status === 'approved').length}</div>
            </div>
            <p className="text-gray-300 font-medium">{translate('approved')}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8 text-yellow-400" />
              <div className="text-3xl font-black text-yellow-400">{performanceTeams.filter(t => t.status === 'submitted').length}</div>
            </div>
            <p className="text-gray-300 font-medium">{translate('pending')}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 backdrop-blur-md border border-gray-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-8 h-8 text-gray-400" />
              <div className="text-3xl font-black text-gray-400">{performanceTeams.filter(t => t.status === 'draft').length}</div>
            </div>
            <p className="text-gray-300 font-medium">{translate('draft')}</p>
          </div>
        </div>

        {/* Liste des équipes */}
        <div className="grid gap-6">
          {performanceTeams
            .sort((a, b) => {
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
                      {team.status === 'submitted' && '🚨 '}
                      {translateStatus(team.status)}
                      {team.status === 'submitted' && ` - ${translate('actionRequired')}`}
                    </span>
                    {team.status === 'submitted' && (
                      <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                        {translate('urgent')}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300 mb-4">
                    <div>
                      <span className="text-purple-400 font-semibold">{translate('directorName')}:</span>
                      <p className="font-medium">{team.director_name}</p>
                      <p className="text-sm text-gray-400">{team.director_email}</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{translate('studioName')}:</span>
                      <p className="font-medium">{team.studio_name || translate('none')}</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{translate('location')}:</span>
                      <p className="font-medium">
                        {team.city}
                        {team.state && `, ${team.state}`}
                        {team.country && `, ${team.country}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">{translate('groupSize')}:</span>
                      <p className="font-medium">{team.group_size} {translate('members')}</p>
                    </div>
                  </div>

                  {/* Réseaux sociaux */}
                  {(team.instagram || team.website_url) && (
                    <div className="flex items-center gap-4 mb-4">
                      {team.instagram && (
                        <a 
                          href={`https://instagram.com/${team.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 px-3 py-2 rounded-lg hover:bg-pink-500/30 transition-colors"
                        >
                          <Instagram size={16} />
                          {team.instagram}
                        </a>
                      )}
                      {team.website_url && (
                        <a 
                          href={team.website_url.startsWith('http') ? team.website_url : `https://${team.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Globe size={16} />
                          {translate('website')}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {team.dance_styles?.map(style => (
                      <span key={style} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 font-medium">
                        {translateDanceStyle(style)}
                      </span>
                    ))}
                    {team.performance_level && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30 font-medium flex items-center gap-1">
                        ⭐ {translateLevel(team.performance_level)}
                      </span>
                    )}
                  </div>

                  {team.performance_video_url && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-purple-400 font-semibold">{translate('performanceVideo')}:</span>
                      <a 
                        href={team.performance_video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                      >
                        <Play size={16} />
                        {translate('watchVideo')}
                      </a>
                    </div>
                  )}

                  <div className="text-gray-300 mb-4">
                    <span className="text-purple-400 font-semibold">{translate('musicFile')}:</span>
                    <span className="ml-2">
                      {team.song_title ? (
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">✅ {team.song_title}</span>
                          {uploadingMusic === team.id && (
                            <span className="text-yellow-400 animate-pulse">📤 {translate('uploadingMusic')}...</span>
                          )}
                          {team.music_file_url && (currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                            <a 
                              href={team.music_file_url}
                              download
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                            >
                              <Download size={12} />
                              {translate('download')}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-400">❌ {translate('notProvided')}</span>
                      )}
                    </span>
                  </div>

                  {team.organizer_notes && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-purple-400 font-semibold">{translate('organizerNotes')}:</span>
                      <p className="mt-1 text-sm bg-gray-700/30 p-3 rounded-lg">{team.organizer_notes}</p>
                    </div>
                  )}

                  {team.rejection_reason && (
                    <div className="text-gray-300 mb-4">
                      <span className="text-red-400 font-semibold">{translate('rejectionReason')}:</span>
                      <p className="mt-1 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-300">{team.rejection_reason}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-8 flex flex-col gap-3">
                  {/* Boutons pour Team Directors */}
                  {currentUser?.role === 'team_director' && team.created_by === currentUser?.id && (
                    <div className="flex flex-col gap-2">
                      {team.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitTeam(team.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg flex items-center gap-2"
                        >
                          <Send size={16} />
                          {translate('submitTeam')}
                        </button>
                      )}
                      {canEditTeam(team) && (
                        <button
                          onClick={() => handleEditTeam(team)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                        >
                          <Edit size={16} />
                          {translate('edit')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Boutons pour Organisateurs */}
                  {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                    <div className="flex flex-col gap-2">
                      {team.status === 'submitted' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(team.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            {translate('approveTeam')}
                          </button>
                          <button
                            onClick={() => handleReject(team.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                          >
                            <X size={16} />
                            {translate('rejectTeam')}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                      >
                        <Edit size={16} />
                        {translate('edit')}
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                  >
                    <Play size={16} />
                    {translate('details')}
                  </button>
                </div>
              </div>

              {/* Progress bar pour équipes approuvées */}
              {team.status === 'approved' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 font-semibold">✅ {translate('approved')}</span>
                    {team.performance_order && (
                      <span className="text-green-300 font-bold">{translate('performanceOrder')}: #{team.performance_order}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{translate('readyForShow')}</p>
                </div>
              )}

              {team.scoring && (
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                    <Star size={16} />
                    {translate('scoring')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">{translate('groupSize')}:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.group_size_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Wow Factor:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.wow_factor_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{translate('technical')}:</span>
                      <span className="text-white font-bold ml-2">{team.scoring.technical_score}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{translate('total')}:</span>
                      <span className="text-purple-300 font-bold ml-2">{team.scoring.total_score}/30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucune équipe */}
        {performanceTeams.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{translate('noTeams')}</h3>
            <p className="text-gray-500">{translate('teamsWillAppear')}</p>
            <button
              onClick={loadTeams}
              className="mt-4 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              {translate('refresh')}
            </button>
          </div>
        )}

        {/* Modal de création d'équipe */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">{translate('createTeam')}</h2>
                <button 
                  onClick={() => setShowCreateTeam(false)} 
                  disabled={isCreating}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('teamName')} *</label>
                    <input
                      type="text"
                      value={newTeam.team_name}
                      onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Ex: Boston Salsa Collective"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('directorName')} *</label>
                    <input
                      type="text"
                      value={newTeam.director_name}
                      onChange={(e) => setNewTeam({...newTeam, director_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder={translate('directorName')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('directorEmail')} *</label>
                    <input
                      type="email"
                      value={newTeam.director_email}
                      onChange={(e) => setNewTeam({...newTeam, director_email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('phone')}</label>
                    <input
                      type="tel"
                      value={newTeam.director_phone}
                      onChange={(e) => setNewTeam({...newTeam, director_phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('studioName')}</label>
                    <input
                      type="text"
                      value={newTeam.studio_name}
                      onChange={(e) => setNewTeam({...newTeam, studio_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder={translate('studioName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('groupSize')} *</label>
                    <input
                      type="number"
                      min="2"
                      value={newTeam.group_size}
                      onChange={(e) => setNewTeam({...newTeam, group_size: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('city')} *</label>
                    <input
                      type="text"
                      value={newTeam.city}
                      onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Boston"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('state')}</label>
                    <input
                      type="text"
                      value={newTeam.state}
                      onChange={(e) => setNewTeam({...newTeam, state: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Massachusetts"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('country')} *</label>
                    <input
                      type="text"
                      value={newTeam.country}
                      onChange={(e) => setNewTeam({...newTeam, country: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="USA"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">📸 {translate('instagram')}</label>
                    <input
                      type="text"
                      value={newTeam.instagram}
                      onChange={(e) => setNewTeam({...newTeam, instagram: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="@votre_equipe ou votre_equipe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">🌐 {translate('website')}</label>
                    <input
                      type="url"
                      value={newTeam.website_url}
                      onChange={(e) => setNewTeam({...newTeam, website_url: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="https://votre-site.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('songTitle')}</label>
                    <input
                      type="text"
                      value={newTeam.song_title}
                      onChange={(e) => setNewTeam({...newTeam, song_title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder={translate('songTitle')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('songArtist')}</label>
                    <input
                      type="text"
                      value={newTeam.song_artist}
                      onChange={(e) => setNewTeam({...newTeam, song_artist: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder={translate('songArtist')}
                    />
                  </div>
                </div>

                {/* Upload MP3 */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    🎵 {translate('musicFile')} (MP3)
                  </label>
                  <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewTeam({...newTeam, music_file: file});
                        console.log('🎵 Fichier sélectionné:', file?.name);
                      }}
                      className="hidden"
                      id="music-upload"
                    />
                    <label htmlFor="music-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          newTeam.music_file 
                            ? 'bg-green-500/20' 
                            : 'bg-purple-500/20'
                        }`}>
                          <Music className={`w-8 h-8 ${
                            newTeam.music_file 
                              ? 'text-green-400' 
                              : 'text-purple-400'
                          }`} />
                        </div>
                        {newTeam.music_file ? (
                          <div>
                            <p className="text-green-400 font-semibold">✅ {newTeam.music_file.name}</p>
                            <p className="text-green-300 text-sm">{translate('fileReadyToUpload')}</p>
                            <p className="text-gray-400 text-xs mt-1">{translate('clickToChange')}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-purple-300 font-semibold">{translate('clickToSelect')}</p>
                            <p className="text-gray-400 text-sm">MP3, WAV, M4A {translate('accepted')}</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {newTeam.music_file && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs">
                      <p className="text-green-300">
                        <strong>{translate('fileDetected')}:</strong> {newTeam.music_file.name} 
                        ({(newTeam.music_file.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Lien vidéo */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    🎬 {translate('performanceVideo')}
                  </label>
                  <input
                    type="url"
                    value={newTeam.performance_video_url}
                    onChange={(e) => setNewTeam({...newTeam, performance_video_url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="https://youtube.com/watch?v=... ou Google Drive, Vimeo..."
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    💡 {translate('acceptedLinks')}: YouTube, Vimeo, Google Drive, Dropbox, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{translate('danceStyles')}</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newTeam.dance_styles.map(style => (
                      <span key={style} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 flex items-center gap-2">
                        {translateDanceStyle(style)}
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
                        {translateDanceStyle(style)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Niveau de performance */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    ⭐ {translate('performanceLevel')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['beginner', 'intermediate', 'advanced', 'pro'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setNewTeam({...newTeam, performance_level: newTeam.performance_level === level ? null : level})}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          newTeam.performance_level === level
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30'
                        }`}
                      >
                        {translateLevel(level)}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 {translate('selectLevelThatFits')}
                  </p>
                </div>

                <button
                  onClick={handleCreateTeam}
                  disabled={isCreating || !newTeam.team_name || !newTeam.director_name || !newTeam.director_email || !newTeam.city || !newTeam.country}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {translate('creating')}...
                    </div>
                  ) : (
                    translate('createTeam')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition d'équipe */}
        {showEditTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">{translate('editTeam')}</h2>
                <button 
                  onClick={() => setShowEditTeam(null)} 
                  disabled={isUpdating}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('teamName')} *</label>
                    <input
                      type="text"
                      value={editTeamData.team_name}
                      onChange={(e) => setEditTeamData({...editTeamData, team_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('directorName')} *</label>
                    <input
                      type="text"
                      value={editTeamData.director_name}
                      onChange={(e) => setEditTeamData({...editTeamData, director_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('directorEmail')} *</label>
                    <input
                      type="email"
                      value={editTeamData.director_email}
                      onChange={(e) => setEditTeamData({...editTeamData, director_email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('phone')}</label>
                    <input
                      type="tel"
                      value={editTeamData.director_phone}
                      onChange={(e) => setEditTeamData({...editTeamData, director_phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('city')} *</label>
                    <input
                      type="text"
                      value={editTeamData.city}
                      onChange={(e) => setEditTeamData({...editTeamData, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('state')}</label>
                    <input
                      type="text"
                      value={editTeamData.state}
                      onChange={(e) => setEditTeamData({...editTeamData, state: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{translate('country')} *</label>
                    <input
                      type="text"
                      value={editTeamData.country}
                      onChange={(e) => setEditTeamData({...editTeamData, country: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">📸 {translate('instagram')}</label>
                    <input
                      type="text"
                      value={editTeamData.instagram}
                      onChange={(e) => setEditTeamData({...editTeamData, instagram: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="@votre_equipe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">🌐 {translate('website')}</label>
                    <input
                      type="url"
                      value={editTeamData.website_url}
                      onChange={(e) => setEditTeamData({...editTeamData, website_url: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://votre-site.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{translate('danceStyles')}</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editTeamData.dance_styles.map(style => (
                      <span key={style} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 flex items-center gap-2">
                        {translateDanceStyle(style)}
                        <button
                          onClick={() => removeEditDanceStyle(style)}
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
                        onClick={() => addEditDanceStyle(style)}
                        disabled={editTeamData.dance_styles.includes(style)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          editTeamData.dance_styles.includes(style) 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                        }`}
                      >
                        {translateDanceStyle(style)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Niveau de performance en édition */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    ⭐ {translate('performanceLevel')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['beginner', 'intermediate', 'advanced', 'pro'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setEditTeamData({...editTeamData, performance_level: editTeamData.performance_level === level ? null : level})}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          editTeamData.performance_level === level
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30'
                        }`}
                      >
                        {translateLevel(level)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowEditTeam(null)}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {translate('cancel')}
                  </button>
                  <button
                    onClick={saveEditTeam}
                    disabled={isUpdating || !editTeamData.team_name || !editTeamData.director_name || !editTeamData.director_email}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {translate('saving')}...
                      </div>
                    ) : (
                      translate('saveChanges')
                    )}
                  </button>
                </div>
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
                
                {/* Contenu des détails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">{translate('generalInfo')}</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><strong>{translate('directorName')}:</strong> {selectedTeam.director_name}</p>
                        <p><strong>{translate('email')}:</strong> {selectedTeam.director_email}</p>
                        {selectedTeam.director_phone && <p><strong>{translate('phone')}:</strong> {selectedTeam.director_phone}</p>}
                        {selectedTeam.studio_name && <p><strong>{translate('studioName')}:</strong> {selectedTeam.studio_name}</p>}
                        <p><strong>{translate('location')}:</strong> 
                          {selectedTeam.city}
                          {selectedTeam.state && `, ${selectedTeam.state}`}
                          {selectedTeam.country && `, ${selectedTeam.country}`}
                        </p>
                        <p><strong>{translate('groupSize')}:</strong> {selectedTeam.group_size} {translate('members')}</p>
                      </div>
                    </div>

                    {/* Réseaux sociaux */}
                    {(selectedTeam.instagram || selectedTeam.website_url) && (
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">{translate('socialMedia')}</h4>
                        <div className="space-y-2">
                          {selectedTeam.instagram && (
                            <div className="flex items-center gap-2">
                              <Instagram size={16} className="text-pink-400" />
                              <a 
                                href={`https://instagram.com/${selectedTeam.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-400 hover:text-pink-300 underline"
                              >
                                {selectedTeam.instagram}
                              </a>
                              <ExternalLink size={14} className="text-gray-400" />
                            </div>
                          )}
                          {selectedTeam.website_url && (
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-blue-400" />
                              <a 
                                href={selectedTeam.website_url.startsWith('http') ? selectedTeam.website_url : `https://${selectedTeam.website_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                {translate('website')}
                              </a>
                              <ExternalLink size={14} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">{translate('performance')}</h4>
                        <div className="space-y-2 text-gray-300">
                          {selectedTeam.song_title && <p><strong>{translate('songTitle')}:</strong> {selectedTeam.song_title}</p>}
                          {selectedTeam.song_artist && <p><strong>{translate('songArtist')}:</strong> {selectedTeam.song_artist}</p>}
                          <div>
                            <strong>{translate('danceStyles')}:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedTeam.dance_styles?.map(style => (
                                <span key={style} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                                  {translateDanceStyle(style)}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {selectedTeam.performance_level && (
                            <div>
                              <strong>{translate('performanceLevel')}:</strong>
                              <span className="ml-2 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-sm font-medium">
                                ⭐ {translateLevel(selectedTeam.performance_level)}
                              </span>
                            </div>
                          )}
                          
                          {/* Vidéo de performance */}
                          {selectedTeam.performance_video_url && (
                            <div>
                              <strong>{translate('performanceVideo')}:</strong>
                              <div className="mt-2">
                                <a 
                                  href={selectedTeam.performance_video_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                                >
                                  <Play size={16} />
                                  {translate('watchVideo')}
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {/* Fichier musical */}
                          <div>
                            <strong>{translate('musicFile')}:</strong>
                            <div className="mt-2 space-y-2">
                              {selectedTeam.song_title ? (
                                <div>
                                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg mb-2">
                                    <Music size={16} />
                                    <span>✅ {selectedTeam.song_title}</span>
                                  </div>
                                  
                                  {/* Contrôles pour organisateurs */}
                                  {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && selectedTeam.music_file_url && (
                                    <div className="flex gap-2">
                                      <a
                                        href={selectedTeam.music_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                                      >
                                        <Play size={16} />
                                        {translate('listen')}
                                      </a>
                                      <a
                                        href={selectedTeam.music_file_url}
                                        download={`${selectedTeam.team_name}_${selectedTeam.song_title}.mp3`}
                                        className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                                      >
                                        <Download size={16} />
                                        {translate('download')}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg">
                                  <AlertTriangle size={16} />
                                  <span>❌ {translate('musicFileMissing')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">{translate('status')}</h4>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        selectedTeam.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                        selectedTeam.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-300' :
                        selectedTeam.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {translateStatus(selectedTeam.status)}
                      </span>
                    </div>
                    
                    {selectedTeam.scoring && (
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">{translate('scoring')}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{translate('groupSize')}:</span>
                            <span className="font-bold">{selectedTeam.scoring.group_size_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wow Factor:</span>
                            <span className="font-bold">{selectedTeam.scoring.wow_factor_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{translate('technical')}:</span>
                            <span className="font-bold">{selectedTeam.scoring.technical_score}/10</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-600 pt-2">
                            <span className="font-bold">{translate('total')}:</span>
                            <span className="font-bold text-purple-300">{selectedTeam.scoring.total_score}/30</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTeam.performance_order && (
                      <div>
                        <h4 className="text-purple-400 font-semibold mb-2">{translate('performanceOrder')}</h4>
                        <div className="text-2xl font-bold text-green-400">#{selectedTeam.performance_order}</div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">{translate('history')}</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        {selectedTeam.created_at && <p><strong>{translate('created')}:</strong> {new Date(selectedTeam.created_at).toLocaleString()}</p>}
                        {selectedTeam.submitted_at && <p><strong>{translate('submitted')}:</strong> {new Date(selectedTeam.submitted_at).toLocaleString()}</p>}
                        {selectedTeam.approved_at && <p><strong>{translate('approved')}:</strong> {new Date(selectedTeam.approved_at).toLocaleString()}</p>}
                        {selectedTeam.rejected_at && <p><strong>{translate('rejected')}:</strong> {new Date(selectedTeam.rejected_at).toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedTeam.organizer_notes && (
                  <div className="mb-8">
                    <h4 className="text-purple-400 font-semibold mb-2">{translate('organizerNotes')}</h4>
                    <p className="text-gray-300 bg-gray-700/30 p-4 rounded-xl">{selectedTeam.organizer_notes}</p>
                  </div>
                )}

                {selectedTeam.rejection_reason && (
                  <div className="mb-8">
                    <h4 className="text-red-400 font-semibold mb-2">{translate('rejectionReason')}</h4>
                    <p className="text-red-300 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{selectedTeam.rejection_reason}</p>
                  </div>
                )}

                {/* Actions pour organisateurs */}
                {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && selectedTeam.status === 'submitted' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedTeam.id);
                        setSelectedTeam({...selectedTeam, status: 'approved', approved_at: new Date().toISOString()});
                      }}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      {translate('approveTeam')}
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTeam.id);
                        setSelectedTeam(null);
                      }}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      {translate('rejectTeam')}
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