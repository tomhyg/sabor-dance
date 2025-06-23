// src/hooks/useTeams.ts - AVEC FILTRAGE PAR RÔLE UTILISATEUR - CORRIGÉ
import { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { PerformanceTeam } from '../types/PerformanceTeam';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

interface UseTeamsReturn {
  // État
  performanceTeams: PerformanceTeam[];
  setPerformanceTeams: React.Dispatch<React.SetStateAction<PerformanceTeam[]>>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTeams: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  
  // Statistiques
  stats: {
    total: number;
    approved: number;
    submitted: number;
    draft: number;
    rejected: number;
    completed: number;
  };
  
  // Filtres et tri
  getFilteredTeams: (filters?: TeamFilters) => PerformanceTeam[];
  getSortedTeams: (sortBy?: TeamSortBy) => PerformanceTeam[];
}

export interface TeamFilters {
  status?: PerformanceTeam['status'];
  hasMusic?: boolean;
  hasVideo?: boolean;
  hasRating?: boolean;
  searchTerm?: string;
}

export type TeamSortBy = 'name' | 'status' | 'created' | 'submitted' | 'city' | 'group_size' | 'performance_order' | 'rating_average';

interface UseTeamsProps {
  eventId?: string;
  currentUser?: any;
}

export const useTeams = ({ 
  eventId = 'a9d1c983-1456-4007-9aec-b297dd095ff7', 
  currentUser 
}: UseTeamsProps = {}): UseTeamsReturn => {
  const [performanceTeams, setPerformanceTeams] = useState<PerformanceTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CHARGEMENT DES ÉQUIPES AVEC FILTRAGE PAR RÔLE - CORRIGÉ
  const loadTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Chargement équipes Supabase...');
      
      // ⭐ CORRECTION: Utiliser la nouvelle structure de retour du service
      const result = await teamService.getTeams(eventId);
      
      if (!result.success) {
        console.error('❌ Erreur chargement équipes:', result.message);
        setError(result.message || 'Erreur de chargement');
        return;
      }

      console.log('✅ Équipes chargées:', result.data?.length);
      
      // Convertir les données Supabase vers le format local
      let localTeams: PerformanceTeam[] = (result.data || []).map((team: any) => ({
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
        music_file_name: team.music_file_name,
        song_title: team.song_title,
        song_artist: team.song_artist,
        group_size: team.group_size,
        dance_styles: team.dance_styles || [],
        performance_level: team.performance_level,
        performance_order: team.performance_order,
        performance_duration: team.performance_duration,
        team_photo_url: team.team_photo_url,
        backup_team: team.backup_team,
        instagram: team.instagram,
        website_url: team.website_url,
        created_by: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        submitted_at: team.submitted_at,
        approved_at: team.approved_at,
        rejected_at: team.rejected_at,
        completed_at: team.completed_at,
        scoring: team.scoring,
        organizer_notes: team.organizer_notes,
        rejection_reason: team.rejection_reason,
        can_edit_until: team.can_edit_until,
        // ⭐ NOUVEAU: Tech rehearsal rating
        tech_rehearsal_rating: team.tech_rehearsal_rating
      }));

      // 🔐 FILTRAGE PAR RÔLE UTILISATEUR
      if (currentUser) {
        const isOrganizer = currentUser.role === 'organizer' || currentUser.role === 'admin' || currentUser.role === 'assistant';
        const isTeamDirector = currentUser.role === 'team_director';

        if (isTeamDirector && !isOrganizer) {
          // Les team directors ne voient que leurs propres équipes
          localTeams = localTeams.filter((team: PerformanceTeam) => team.created_by === currentUser.id);
          console.log(`🔒 Filtrage team director: ${localTeams.length} équipes visibles pour ${currentUser.email}`);
        } else if (isOrganizer) {
          // Les organisateurs voient toutes les équipes
          console.log(`👑 Organisateur: ${localTeams.length} équipes visibles pour ${currentUser.email}`);
        } else {
          // Autres rôles : pas d'équipes visibles par défaut
          localTeams = [];
          console.log(`❌ Aucune équipe visible pour le rôle: ${currentUser.role}`);
        }
      }

      setPerformanceTeams(localTeams);

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 ACTUALISATION
  const refreshTeams = async () => {
    await loadTeams();
  };

  // 📊 STATISTIQUES CALCULÉES (basées sur les équipes visibles)
  const stats = {
    total: performanceTeams.length,
    approved: performanceTeams.filter((t: PerformanceTeam) => t.status === 'approved').length,
    submitted: performanceTeams.filter((t: PerformanceTeam) => t.status === 'submitted').length,
    draft: performanceTeams.filter((t: PerformanceTeam) => t.status === 'draft').length,
    rejected: performanceTeams.filter((t: PerformanceTeam) => t.status === 'rejected').length,
    completed: performanceTeams.filter((t: PerformanceTeam) => t.status === 'completed').length,
  };

  // 🔍 FILTRAGE
  const getFilteredTeams = (filters: TeamFilters = {}) => {
    let filtered = [...performanceTeams];

    if (filters.status) {
      filtered = filtered.filter((team: PerformanceTeam) => team.status === filters.status);
    }

    if (filters.hasMusic !== undefined) {
      filtered = filtered.filter((team: PerformanceTeam) => 
        filters.hasMusic ? !!team.music_file_url : !team.music_file_url
      );
    }

    if (filters.hasVideo !== undefined) {
      filtered = filtered.filter((team: PerformanceTeam) => 
        filters.hasVideo ? !!team.performance_video_url : !team.performance_video_url
      );
    }

    // ⭐ NOUVEAU: Filtre par notation
    if (filters.hasRating !== undefined) {
      filtered = filtered.filter((team: PerformanceTeam) => 
        filters.hasRating ? !!team.tech_rehearsal_rating : !team.tech_rehearsal_rating
      );
    }

    // Filtre de recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((team: PerformanceTeam) =>
        team.team_name?.toLowerCase().includes(term) ||
        team.director_name?.toLowerCase().includes(term) ||
        team.city?.toLowerCase().includes(term) ||
        team.studio_name?.toLowerCase().includes(term) ||
        team.dance_styles?.some((style: string) => style.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // 📋 TRI
  const getSortedTeams = (sortBy: TeamSortBy = 'name') => {
    const teams = [...performanceTeams];

    switch (sortBy) {
      case 'name':
        return teams.sort((a, b) => a.team_name.localeCompare(b.team_name));
      
      case 'status':
        // Ordre de priorité: submitted > draft > approved > rejected > completed
        const statusOrder: Record<PerformanceTeam['status'], number> = { 
          submitted: 1, 
          draft: 2, 
          approved: 3, 
          rejected: 4,
          completed: 5 
        };
        return teams.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      
      case 'created':
        return teams.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      
      case 'submitted':
        return teams.sort((a, b) => {
          const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
          const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
          return bTime - aTime;
        });
      
      case 'city':
        return teams.sort((a, b) => a.city?.localeCompare(b.city || '') || 0);

      case 'group_size':
        return teams.sort((a, b) => b.group_size - a.group_size);

      case 'performance_order':
        return teams.sort((a, b) => {
          const aOrder = a.performance_order || 999;
          const bOrder = b.performance_order || 999;
          return aOrder - bOrder;
        });

      // ⭐ NOUVEAU: Tri par note moyenne
      case 'rating_average':
        return teams.sort((a, b) => {
          const avgA = a.tech_rehearsal_rating ? 
            ((a.tech_rehearsal_rating.rating_1 + a.tech_rehearsal_rating.rating_2 + a.tech_rehearsal_rating.rating_3) / 3) : 0;
          const avgB = b.tech_rehearsal_rating ? 
            ((b.tech_rehearsal_rating.rating_1 + b.tech_rehearsal_rating.rating_2 + b.tech_rehearsal_rating.rating_3) / 3) : 0;
          return avgB - avgA; // Ordre décroissant
        });
      
      default:
        return teams;
    }
  };

  // 🚀 CHARGEMENT INITIAL (rechargement quand currentUser change)
  useEffect(() => {
    loadTeams();
  }, [eventId, currentUser?.id, currentUser?.role]);

  return {
    // État
    performanceTeams,
    setPerformanceTeams,
    isLoading,
    error,
    
    // Actions
    loadTeams,
    refreshTeams,
    
    // Statistiques
    stats,
    
    // Filtres et tri
    getFilteredTeams,
    getSortedTeams,
  };
};