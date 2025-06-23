// src/components/pages/TeamsPage.tsx - VERSION SÉCURISÉE AVEC FALLBACKS
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Download, RefreshCw, Users, CheckCircle, Target, BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';
import { useTeamActions, CreateTeamData } from '../../hooks/useTeamActions';
import { PerformanceTeam, TechRehearsalRating } from '../../types/PerformanceTeam';
import { TeamCard } from '../teams/TeamCard';
import { TeamCardHorizontal } from '../teams/TeamCardHorizontal';
import { TeamCreateModal } from '../teams/TeamCreateModal';
import { TeamEditModal } from '../teams/TeamEditModal';
import { TeamDetailsModal } from '../teams/TeamDetailsModal';

// Import du système de traduction
import { useTranslation, type Language, DEFAULT_LANGUAGE } from '../../locales';

interface TeamsPageProps {
  currentUser: any;
  translate: (key: string) => string;
  currentLanguage?: Language;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({ 
  currentUser, 
  translate, 
  currentLanguage = DEFAULT_LANGUAGE
}) => {
  // 🌐 SYSTÈME DE TRADUCTION LOCAL
  const { t } = useTranslation(currentLanguage);

  // Fonction helper pour les traductions sécurisées
  const safeTranslate = (key: string, fallback: string = key): string => {
    try {
      // Essayer d'abord avec le système de traduction principal
      const translation = (t as any)[key];
      if (translation && typeof translation === 'string') {
        return translation;
      }
      
      // Fallback vers la fonction translate personnalisée
      try {
        const customTranslation = translate(key);
        if (customTranslation && customTranslation !== key) {
          return customTranslation;
        }
      } catch (e) {
        // Ignore les erreurs de la fonction translate personnalisée
      }
      
      // Dernier fallback
      return fallback;
    } catch (e) {
      return fallback;
    }
  };

  // 🎯 HOOKS PRINCIPAUX
  const { 
    performanceTeams, 
    setPerformanceTeams, 
    isLoading, 
    error, 
    stats, 
    refreshTeams,
    getFilteredTeams,
    getSortedTeams 
  } = useTeams({ currentUser });

  const {
    createTeam,
    updateTeam,
    submitTeam,
    approveTeam,
    rejectTeam,
    markAsCompleted,
    uploadMusicFile,
    uploadTeamPhoto,
    updateTechRehearsalRating,
    isCreating,
    isUpdating,
    uploadingMusic,
    uploadingPhoto
  } = useTeamActions({
    currentUser,
    performanceTeams,
    setPerformanceTeams,
    onSuccess: (message) => console.log('✅', message),
    onError: (message) => console.error('❌', message)
  });

  // 🎛️ ÉTATS LOCAUX
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState<PerformanceTeam | null>(null);
  const [showTeamDetails, setShowTeamDetails] = useState<PerformanceTeam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'created' | 'submitted' | 'city'>('name');

  // 📋 ÉQUIPES FILTRÉES ET TRIÉES
  const filteredAndSortedTeams = getSortedTeams(sortBy).filter(team => {
    const filtered = getFilteredTeams({
      searchTerm
    });
    return filtered.includes(team);
  });

  // 🎬 HANDLERS
  const handleCreateTeam = async (formData: CreateTeamData) => {
    const newTeam = await createTeam(formData);
    return !!newTeam;
  };

  const handleEditTeam = (team: PerformanceTeam) => {
    setShowEditTeam(team);
  };

  const handleSubmitTeam = async (teamId: string) => {
    await submitTeam(teamId);
  };

  const handleApprove = async (teamId: string) => {
    await approveTeam(teamId);
  };

  const handleReject = async (teamId: string) => {
    const reason = prompt(safeTranslate('rejectionReason', 'Rejection reason') + ' (optionnel):');
    await rejectTeam(teamId, reason || undefined);
  };

  const handleMarkCompleted = async (teamId: string) => {
    await markAsCompleted(teamId);
  };

  // ⭐ NOUVEAU HANDLER POUR NOTATION
  const handleRatingUpdate = async (teamId: string, rating: TechRehearsalRating) => {
    const success = await updateTechRehearsalRating(teamId, rating);
    if (success) {
      // Mettre à jour l'équipe dans les détails si c'est celle affichée
      if (showTeamDetails && showTeamDetails.id === teamId) {
        setShowTeamDetails(prev => prev ? {
          ...prev,
          tech_rehearsal_rating: rating
        } : null);
      }
    }
    return success;
  };

  // 🔄 ACTUALISATION
  const handleRefresh = async () => {
    await refreshTeams();
  };

  // 📊 EXPORT DES ÉQUIPES
  const handleExportTeams = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      const { quickExport } = require('../../utils/exportUtils');
      
      quickExport('teams', {
        teams: performanceTeams,
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      
      console.log(`✅ Export teams ${format.toUpperCase()} generated successfully`);
    } catch (error) {
      console.error('❌ Error exporting teams:', error);
      alert(`Erreur lors de l'export: ${error}`);
    }
  };

  // 🎯 VÉRIFICATION DES PERMISSIONS
  const canCreateTeam = currentUser?.role === 'organizer' || 
                       currentUser?.role === 'admin' || 
                       currentUser?.role === 'team_director';

  const isOrganizer = currentUser?.role === 'organizer' || 
                     currentUser?.role === 'admin' || 
                     currentUser?.role === 'assistant';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-purple-100">{safeTranslate('loadingData', 'Loading data...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md">
            <h2 className="text-xl font-bold text-red-300 mb-4">{safeTranslate('error', 'Error')}</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {safeTranslate('retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
      
      {/* Hero Header avec Statistiques et Filtres intégrés */}
      <div className="relative py-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          {/* En-tête avec titre et boutons */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {safeTranslate('performanceTeams', 'Performance Teams')}
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl">
                {safeTranslate('teamDesc', 'Manage your performance teams')}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Bouton Créer une équipe */}
              {canCreateTeam && (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  disabled={isCreating}
                  className="group bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  {isCreating ? safeTranslate('creating', 'Creating...') : safeTranslate('createTeam', 'Create Team')}
                </button>
              )}
              
              {/* Boutons d'export pour les organisateurs */}
              {isOrganizer && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportTeams('xlsx')}
                    className="bg-green-600/30 hover:bg-green-600/50 border-2 border-green-400/60 text-green-100 px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-lg shadow-green-500/20"
                    title="Export Excel"
                  >
                    <FileSpreadsheet size={16} />
                    XLSX
                  </button>
                  <button
                    onClick={() => handleExportTeams('csv')}
                    className="bg-blue-600/30 hover:bg-blue-600/50 border-2 border-blue-400/60 text-blue-100 px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20"
                    title="Export CSV"
                  >
                    <FileText size={16} />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportTeams('pdf')}
                    className="bg-red-600/30 hover:bg-red-600/50 border-2 border-red-400/60 text-red-100 px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 font-semibold shadow-lg shadow-red-500/20"
                    title="Export PDF"
                  >
                    <FileText size={16} />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques améliorées */}
          {isOrganizer && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-md border-2 border-blue-400/40 rounded-3xl p-6 shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-blue-300" />
                  <div className="text-3xl font-black text-blue-200">{stats.total}</div>
                </div>
                <p className="text-blue-100 font-medium">{safeTranslate('totalTeams', 'Total Teams')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-2 border-green-400/40 rounded-3xl p-6 shadow-lg shadow-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8 text-green-300" />
                  <div className="text-3xl font-black text-green-200">{stats.approved}</div>
                </div>
                <p className="text-green-100 font-medium">{safeTranslate('approved', 'Approved')}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-2 border-yellow-400/40 rounded-3xl p-6 shadow-lg shadow-yellow-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-8 h-8 text-yellow-300" />
                  <div className="text-3xl font-black text-yellow-200">{stats.submitted}</div>
                </div>
                <p className="text-yellow-100 font-medium">{safeTranslate('submitted', 'Submitted')}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-md border-2 border-gray-400/40 rounded-3xl p-6 shadow-lg shadow-gray-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-gray-300" />
                  <div className="text-3xl font-black text-gray-200">{stats.draft}</div>
                </div>
                <p className="text-gray-100 font-medium">{safeTranslate('draft', 'Draft')}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">

        {/* Barre de recherche */}
        {isOrganizer && (
          <div className="mb-8">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
              <input
                type="text"
                placeholder={safeTranslate('searchTeams', 'Search teams...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-600/60 border-2 border-gray-500/50 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Grille des équipes */}
        {filteredAndSortedTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {performanceTeams.length === 0 ? 
                safeTranslate('noTeamsYet', 'No teams yet') : 
                safeTranslate('noTeamsFound', 'No teams found')
              }
            </h3>
            <p className="text-purple-200 mb-8">
              {performanceTeams.length === 0 ? 
                safeTranslate('createFirstTeam', 'Create your first team') : 
                safeTranslate('tryDifferentSearch', 'Try a different search')
              }
            </p>
            {canCreateTeam && performanceTeams.length === 0 && (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {safeTranslate('createFirstTeam', 'Create your first team')}
              </button>
            )}
          </div>
        ) : (
          <div className={`${isOrganizer ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'} pb-12`}>
            {filteredAndSortedTeams.map((team) => (
              isOrganizer ? (
                <TeamCard
                  key={team.id}
                  team={team}
                  currentUser={currentUser}
                  translate={translate}
                  currentLanguage={currentLanguage}
                  onEdit={() => handleEditTeam(team)}
                  onView={() => setShowTeamDetails(team)}
                  onSubmit={() => handleSubmitTeam(team.id)}
                  onApprove={() => handleApprove(team.id)}
                  onReject={() => handleReject(team.id)}
                  onMarkCompleted={() => handleMarkCompleted(team.id)}
                  uploadingMusic={uploadingMusic === team.id ? uploadingMusic : null}
                  uploadingPhoto={uploadingPhoto === team.id ? uploadingPhoto : null}
                />
              ) : (
                <TeamCardHorizontal
                  key={team.id}
                  team={team}
                  currentUser={currentUser}
                  translate={translate}
                  onEdit={() => handleEditTeam(team)}
                  onView={() => setShowTeamDetails(team)}
                  onSubmit={() => handleSubmitTeam(team.id)}
                  currentLanguage={currentLanguage}
                  uploadingMusic={uploadingMusic === team.id}
                  uploadingPhoto={uploadingPhoto === team.id}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Modals avec support des langues */}
      {showCreateTeam && (
        <TeamCreateModal
          currentUser={currentUser}
          translate={translate}
          currentLanguage={currentLanguage}
          isCreating={isCreating}
          onClose={() => setShowCreateTeam(false)}
          onSubmit={handleCreateTeam}
        />
      )}

      {showEditTeam && (
        <TeamEditModal
          team={showEditTeam}
          currentUser={currentUser}
          translate={translate}
          currentLanguage={currentLanguage}
          // Pas de currentLanguage car TeamEditModal ne le supporte pas encore
          isUpdating={isUpdating}
          onClose={() => setShowEditTeam(null)}
          onSubmit={updateTeam}
        />
      )}

      {showTeamDetails && (
        <TeamDetailsModal
          team={showTeamDetails}
          currentUser={currentUser}
          translate={translate}
          onClose={() => setShowTeamDetails(null)}
          currentLanguage={currentLanguage}
          onApprove={() => {
            handleApprove(showTeamDetails.id);
            setShowTeamDetails(null);
          }}
          onReject={() => {
            handleReject(showTeamDetails.id);
            setShowTeamDetails(null);
          }}
          onRatingUpdate={handleRatingUpdate}
        />
      )}
    </div>
  );
};