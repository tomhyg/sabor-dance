// src/hooks/useTeams.ts - Hook principal pour la gestion des équipes
import { useState, useEffect, useCallback } from 'react';
import { PerformanceTeam } from '../types/PerformanceTeam';
import { teamService } from '../services/teamService';

interface UseTeamsOptions {
  eventId?: string;
  currentUser?: any;  // ✅ Ajout du currentUser
  autoLoad?: boolean;
  filters?: {
    status?: PerformanceTeam['status'][];
    search?: string;
    danceStyles?: string[];
    performanceLevel?: string[];
  };
}

interface UseTeamsReturn {
  // États (avec alias pour compatibilité)
  teams: PerformanceTeam[];
  performanceTeams: PerformanceTeam[];  // ✅ Alias pour TeamsPage
  setPerformanceTeams: React.Dispatch<React.SetStateAction<PerformanceTeam[]>>;  // ✅ Alias
  loading: boolean;
  isLoading: boolean;  // ✅ Alias pour TeamsPage
  error: string | null;
  
  // Statistiques (avec objet stats pour TeamsPage)
  totalTeams: number;
  draftTeams: number;
  submittedTeams: number;
  approvedTeams: number;
  rejectedTeams: number;
  completedTeams: number;
  stats: {  // ✅ Objet stats attendu par TeamsPage
    total: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  
  // Actions
  loadTeams: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  addTeam: (team: PerformanceTeam) => void;
  updateTeam: (teamId: string, updates: Partial<PerformanceTeam>) => void;
  removeTeam: (teamId: string) => void;
  
  // Filtres et recherche
  filteredTeams: PerformanceTeam[];
  applyFilters: (filters: UseTeamsOptions['filters']) => void;
  clearFilters: () => void;
  searchTeams: (query: string) => PerformanceTeam[];
  
  // Fonctions attendues par TeamsPage
  getFilteredTeams: (options: { searchTerm?: string }) => PerformanceTeam[];
  getSortedTeams: (sortBy: 'name' | 'status' | 'created' | 'submitted' | 'city') => PerformanceTeam[];
  
  // Utilitaires
  getTeamById: (id: string) => PerformanceTeam | undefined;
  getTeamsByStatus: (status: PerformanceTeam['status']) => PerformanceTeam[];
  getTeamsByDirector: (directorId: string) => PerformanceTeam[];
  getCurrentUserTeams: () => PerformanceTeam[];  // ✅ Nouvelle fonction
}

export const useTeams = (options: UseTeamsOptions = {}): UseTeamsReturn => {
  const {
    eventId = 'a9d1c983-1456-4007-9aec-b297dd095ff7',
    currentUser,  // ✅ Extraction du currentUser
    autoLoad = true,
    filters: initialFilters
  } = options;

  // États principaux
  const [teams, setTeams] = useState<PerformanceTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  // Charger les équipes
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si pas de service réel, utiliser des données de test
      if (typeof teamService?.getTeams !== 'function') {
        // Données de test
        const testTeams: PerformanceTeam[] = [
          {
            id: 'team-1',
            event_id: eventId,
            team_name: 'Sabor Latino',
            director_name: 'Maria Rodriguez',
            director_email: 'maria@example.com',
            director_phone: '+1-555-0123',
            city: 'Montreal',
            state: 'Quebec',
            country: 'Canada',
            studio_name: 'Studio Salsa Montreal',
            group_size: 8,
            dance_styles: ['Salsa', 'Bachata'],
            performance_level: 'intermediate',
            performance_video_url: 'https://youtube.com/watch?v=example1',
            song_title: 'La Vida Es Un Carnaval',
            song_artist: 'Celia Cruz',
            music_file_url: 'https://example.com/music1.mp3',
            team_photo_url: 'https://example.com/team1.jpg',
            instagram: '@saborlatino',
            website_url: 'https://saborlatino.com',
            status: 'submitted',
            created_by: 'user-1',
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date('2024-01-20').toISOString(),
          },
          {
            id: 'team-2',
            event_id: eventId,
            team_name: 'Pasión Caribeña',
            director_name: 'Carlos Mendez',
            director_email: 'carlos@example.com',
            director_phone: '+1-555-0456',
            city: 'Toronto',
            state: 'Ontario',
            country: 'Canada',
            studio_name: 'Caribbean Dance Studio',
            group_size: 12,
            dance_styles: ['Bachata', 'Merengue', 'Salsa'],
            performance_level: 'advanced',
            performance_video_url: 'https://youtube.com/watch?v=example2',
            song_title: 'Obsesión',
            song_artist: 'Aventura',
            music_file_url: 'https://example.com/music2.mp3',
            team_photo_url: 'https://example.com/team2.jpg',
            instagram: '@pasioncaribena',
            status: 'approved',
            created_by: 'user-2',
            created_at: new Date('2024-01-10').toISOString(),
            updated_at: new Date('2024-01-25').toISOString(),
          },
          {
            id: 'team-3',
            event_id: eventId,
            team_name: 'Fuego Dance Crew',
            director_name: 'Ana Silva',
            director_email: 'ana@example.com',
            director_phone: '+1-555-0789',
            city: 'Vancouver',
            state: 'British Columbia',
            country: 'Canada',
            studio_name: 'Fuego Dance Academy',
            group_size: 6,
            dance_styles: ['Salsa', 'Kizomba'],
            performance_level: 'pro',
            performance_video_url: 'https://youtube.com/watch?v=example3',
            song_title: 'Quimbara',
            song_artist: 'Celia Cruz & Johnny Pacheco',
            music_file_url: 'https://example.com/music3.mp3',
            team_photo_url: 'https://example.com/team3.jpg',
            instagram: '@fuegodance',
            website_url: 'https://fuegodance.ca',
            status: 'draft',
            created_by: 'user-3',
            created_at: new Date('2024-01-25').toISOString(),
            updated_at: new Date('2024-01-25').toISOString(),
          }
        ];
        
        setTeams(testTeams);
      } else {
        // Utiliser le service réel
        const result = await teamService.getTeams(eventId);
        if (result.success && result.data) {
          setTeams(result.data);
        } else {
          setError(result.message || 'Erreur lors du chargement des équipes');
        }
      }
    } catch (err) {
      console.error('Erreur useTeams:', err);
      setError('Erreur lors du chargement des équipes');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Refresh (alias pour loadTeams)
  const refreshTeams = useCallback(async () => {
    await loadTeams();
  }, [loadTeams]);

  // Ajouter une équipe
  const addTeam = useCallback((team: PerformanceTeam) => {
    setTeams(prev => [...prev, team]);
  }, []);

  // Mettre à jour une équipe
  const updateTeam = useCallback((teamId: string, updates: Partial<PerformanceTeam>) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? { ...team, ...updates, updated_at: new Date().toISOString() }
          : team
      )
    );
  }, []);

  // Supprimer une équipe
  const removeTeam = useCallback((teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
  }, []);

  // Filtrer les équipes
  const filteredTeams = teams.filter(team => {
    // Filtre par statut
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(team.status)) {
        return false;
      }
    }

    // Filtre par recherche
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        team.team_name.toLowerCase().includes(searchLower) ||
        team.director_name.toLowerCase().includes(searchLower) ||
        team.studio_name?.toLowerCase().includes(searchLower) ||
        team.city.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Filtre par styles de danse
    if (filters.danceStyles && filters.danceStyles.length > 0) {
      const hasMatchingStyle = filters.danceStyles.some(style =>
        team.dance_styles?.includes(style)  // ✅ Vérification de nullité
      );
      if (!hasMatchingStyle) {
        return false;
      }
    }

    // Filtre par niveau de performance
    if (filters.performanceLevel && filters.performanceLevel.length > 0) {
      if (!filters.performanceLevel.includes(team.performance_level || '')) {
        return false;
      }
    }

    return true;
  });

  // Appliquer des filtres
  const applyFilters = useCallback((newFilters: UseTeamsOptions['filters']) => {
    setFilters(newFilters || {});
  }, []);

  // Effacer les filtres
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Rechercher des équipes
  const searchTeams = useCallback((query: string): PerformanceTeam[] => {
    if (!query.trim()) return teams;
    
    const searchLower = query.toLowerCase();
    return teams.filter(team =>
      team.team_name.toLowerCase().includes(searchLower) ||
      team.director_name.toLowerCase().includes(searchLower) ||
      team.studio_name?.toLowerCase().includes(searchLower) ||
      team.city.toLowerCase().includes(searchLower) ||
      team.dance_styles?.some(style => style.toLowerCase().includes(searchLower))  // ✅ Vérification de nullité
    );
  }, [teams]);

  // Utilitaires avec currentUser
  const getTeamById = useCallback((id: string): PerformanceTeam | undefined => {
    return teams.find(team => team.id === id);
  }, [teams]);

  const getTeamsByStatus = useCallback((status: PerformanceTeam['status']): PerformanceTeam[] => {
    return teams.filter(team => team.status === status);
  }, [teams]);

  const getTeamsByDirector = useCallback((directorId: string): PerformanceTeam[] => {
    return teams.filter(team => team.created_by === directorId);
  }, [teams]);

  // ✅ Nouvelle fonction pour les équipes de l'utilisateur actuel
  const getCurrentUserTeams = useCallback((): PerformanceTeam[] => {
    if (!currentUser?.id) return [];
    return teams.filter(team => team.created_by === currentUser.id);
  }, [teams, currentUser?.id]);

  // Statistiques
  const totalTeams = teams.length;
  const draftTeams = teams.filter(t => t.status === 'draft').length;
  const submittedTeams = teams.filter(t => t.status === 'submitted').length;
  const approvedTeams = teams.filter(t => t.status === 'approved').length;
  const rejectedTeams = teams.filter(t => t.status === 'rejected').length;
  const completedTeams = teams.filter(t => t.status === 'completed').length;

  // Charger automatiquement au montage
  useEffect(() => {
    if (autoLoad) {
      loadTeams();
    }
  }, [autoLoad, loadTeams]);

  return {
    // États (compatibilité avec TeamsPage)
    teams,
    performanceTeams: teams,  // ✅ Alias pour compatibilité
    setPerformanceTeams: setTeams,  // ✅ Alias pour compatibilité
    loading,
    isLoading: loading,      // ✅ Alias pour compatibilité
    error,
    
    // Statistiques (compatibilité avec TeamsPage)
    totalTeams,
    draftTeams,
    submittedTeams,
    approvedTeams,
    rejectedTeams,
    completedTeams,
    stats: {  // ✅ Objet stats attendu par TeamsPage
      total: totalTeams,
      draft: draftTeams,
      submitted: submittedTeams,
      approved: approvedTeams,
      rejected: rejectedTeams,
      completed: completedTeams
    },
    
    // Actions
    loadTeams,
    refreshTeams,
    addTeam,
    updateTeam,
    removeTeam,
    
    // Filtres et recherche (compatibilité avec TeamsPage)
    filteredTeams,
    applyFilters,
    clearFilters,
    searchTeams,
    
    // Fonctions attendues par TeamsPage
    getFilteredTeams: (options: { searchTerm?: string }) => {
      return searchTeams(options.searchTerm || '');
    },
    getSortedTeams: (sortBy: 'name' | 'status' | 'created' | 'submitted' | 'city') => {
      return [...teams].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.team_name.localeCompare(b.team_name);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'created':
            const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;  // ✅ Vérification de nullité
            const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;  // ✅ Vérification de nullité
            return bCreated - aCreated;
          case 'submitted':
            return (b.submitted_at || '').localeCompare(a.submitted_at || '');
          case 'city':
            return a.city.localeCompare(b.city);
          default:
            return 0;
        }
      });
    },
    
    // Utilitaires
    getTeamById,
    getTeamsByStatus,
    getTeamsByDirector,
    getCurrentUserTeams  // ✅ Nouvelle fonction
  };
};