// src/hooks/useTeamActions.ts - VERSION COMPLÈTE AVEC markAsCompleted CORRIGÉ
import { useState } from 'react';
import { teamService } from '../services/teamService';
import { PerformanceTeam, TechRehearsalRating } from '../types/PerformanceTeam';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

export interface CreateTeamData {
  team_name: string;
  director_name: string;
  director_email: string;
  director_phone?: string;
  studio_name?: string;
  city: string;
  state?: string;
  country?: string;
  group_size: number;
  dance_styles: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null;
  performance_video_url?: string;
  instagram?: string;
  website_url?: string;
  music_file?: File | null;
  team_photo?: File | null;
}

export interface UpdateTeamData {
  team_name: string;
  director_name: string;
  director_email: string;
  director_phone?: string;
  studio_name?: string;
  city: string;
  state?: string;
  country?: string;
  group_size: number;
  dance_styles: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null;
  performance_video_url?: string;
  instagram?: string;
  website_url?: string;
}

interface UseTeamActionsProps {
  currentUser: any;
  performanceTeams: PerformanceTeam[];
  setPerformanceTeams: React.Dispatch<React.SetStateAction<PerformanceTeam[]>>;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useTeamActions = ({
  currentUser,
  performanceTeams,
  setPerformanceTeams,
  onSuccess,
  onError
}: UseTeamActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  // =====================
  // FONCTIONS EXISTANTES
  // =====================

  const createTeam = async (teamData: CreateTeamData): Promise<boolean> => {
    try {
      setIsCreating(true);
      
      // Si pas de service réel, simuler la création
      if (typeof teamService?.createTeam !== 'function') {
        const newTeam: PerformanceTeam = {
          id: `team_${Date.now()}`,
          event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
          ...teamData,
          status: 'draft',
          created_by: currentUser?.id,
          created_at: new Date().toISOString()
        };
        
        setPerformanceTeams(prev => [...prev, newTeam]);
        onSuccess?.('Équipe créée avec succès !');
        return true;
      }
      
      const result = await teamService.createTeam({
        ...teamData,
        event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        created_by: currentUser?.id
      });
      
      if (result.success && result.data) {
        setPerformanceTeams(prev => [...prev, result.data!]);
        onSuccess?.('Équipe créée avec succès !');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de la création de l\'équipe');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updateTeam = async (teamId: string, updateData: UpdateTeamData): Promise<boolean> => {
    try {
      setIsUpdating(true);
      
      if (typeof teamService?.updateTeam !== 'function') {
        setPerformanceTeams(prev => 
          prev.map(team => 
            team.id === teamId 
              ? { ...team, ...updateData, updated_at: new Date().toISOString() }
              : team
          )
        );
        onSuccess?.('Équipe mise à jour avec succès !');
        return true;
      }
      
      const result = await teamService.updateTeam(teamId, updateData);
      
      if (result.success && result.data) {
        setPerformanceTeams(prev => 
          prev.map(team => team.id === teamId ? result.data! : team)
        );
        onSuccess?.('Équipe mise à jour avec succès !');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de la mise à jour');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (typeof teamService?.deleteTeam !== 'function') {
        setPerformanceTeams(prev => prev.filter(team => team.id !== teamId));
        onSuccess?.('Équipe supprimée avec succès !');
        return true;
      }
      
      const result = await teamService.deleteTeam(teamId);
      
      if (result.success) {
        setPerformanceTeams(prev => prev.filter(team => team.id !== teamId));
        onSuccess?.('Équipe supprimée avec succès !');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de la suppression');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitTeam = async (teamId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (typeof teamService?.submitTeam !== 'function') {
        setPerformanceTeams(prev => 
          prev.map(team => 
            team.id === teamId 
              ? { 
                  ...team, 
                  status: 'submitted' as const,
                  submitted_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              : team
          )
        );
        onSuccess?.('Équipe soumise avec succès !');
        return true;
      }
      
      const result = await teamService.submitTeam(teamId);
      
      if (result.success && result.data) {
        setPerformanceTeams(prev => 
          prev.map(team => team.id === teamId ? result.data! : team)
        );
        onSuccess?.('Équipe soumise avec succès !');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de la soumission');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveTeam = async (teamId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (typeof teamService?.approveTeam !== 'function') {
        setPerformanceTeams(prev => 
          prev.map(team => 
            team.id === teamId 
              ? { 
                  ...team, 
                  status: 'approved' as const,
                  approved_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              : team
          )
        );
        onSuccess?.('Équipe approuvée avec succès !');
        return true;
      }
      
      const result = await teamService.approveTeam(teamId);
      
      if (result.success && result.data) {
        setPerformanceTeams(prev => 
          prev.map(team => team.id === teamId ? result.data! : team)
        );
        onSuccess?.('Équipe approuvée avec succès !');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de l\'approbation');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTeam = async (teamId: string, reason?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (typeof teamService?.rejectTeam !== 'function') {
        setPerformanceTeams(prev => 
          prev.map(team => 
            team.id === teamId 
              ? { 
                  ...team, 
                  status: 'rejected' as const,
                  rejection_reason: reason,
                  rejected_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              : team
          )
        );
        onSuccess?.('Équipe rejetée');
        return true;
      }
      
      const result = await teamService.rejectTeam(teamId, reason);
      
      if (result.success && result.data) {
        setPerformanceTeams(prev => 
          prev.map(team => team.id === teamId ? result.data! : team)
        );
        onSuccess?.('Équipe rejetée');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors du rejet');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FONCTION CORRIGÉE: markAsCompleted avec sauvegarde backend
  const markAsCompleted = async (teamId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // ✅ VÉRIFIER SI LE SERVICE BACKEND EXISTE (comme les autres fonctions)
      if (typeof teamService?.markAsCompleted !== 'function') {
        // Mode développement/test - mise à jour locale seulement
        setPerformanceTeams(prev => 
          prev.map(team => 
            team.id === teamId 
              ? { 
                  ...team, 
                  status: 'completed' as const,
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              : team
          )
        );
        onSuccess?.('Équipe marquée comme terminée');
        return true;
      }
      
      // ✅ APPEL AU BACKEND SI DISPONIBLE
      const result = await teamService.markAsCompleted(teamId);
      
      if (result.success && result.data) {
        // ✅ CORRECTION: Mettre à jour l'état local avec les données du backend
        setPerformanceTeams(prev => 
          prev.map(team => team.id === teamId ? result.data! : team)
        );
        onSuccess?.('Équipe marquée comme terminée');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors du marquage comme terminé');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMusicFile = async (teamId: string, file: File): Promise<boolean> => {
    try {
      setUploadingMusic(teamId);
      
      // Simulation upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fakeUrl = `https://example.com/music/${file.name}`;
      
      setPerformanceTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                music_file_url: fakeUrl,
                music_file_name: file.name,
                song_title: file.name.replace(/\.[^/.]+$/, ''),
                updated_at: new Date().toISOString()
              }
            : team
        )
      );
      
      onSuccess?.('Fichier musical uploadé avec succès !');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur upload musique: ${errorMessage}`);
      return false;
    } finally {
      setUploadingMusic(null);
    }
  };

  const uploadTeamPhoto = async (teamId: string, file: File): Promise<boolean> => {
    try {
      setUploadingPhoto(teamId);
      
      // Simulation upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fakeUrl = `https://example.com/photos/${file.name}`;
      
      setPerformanceTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                team_photo_url: fakeUrl,
                updated_at: new Date().toISOString()
              }
            : team
        )
      );
      
      onSuccess?.('Photo d\'équipe uploadée avec succès !');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur upload photo: ${errorMessage}`);
      return false;
    } finally {
      setUploadingPhoto(null);
    }
  };

  const uploadTeamFiles = async (
    teamId: string, 
    files: { music_file?: File; team_photo?: File }
  ): Promise<boolean> => {
    try {
      let success = true;
      
      if (files.music_file) {
        success = success && await uploadMusicFile(teamId, files.music_file);
      }
      
      if (files.team_photo) {
        success = success && await uploadTeamPhoto(teamId, files.team_photo);
      }
      
      return success;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    }
  };

  // ⭐ NOUVELLES FONCTIONS POUR NOTATION TECH REHEARSAL

  const updateTechRehearsalRating = async (teamId: string, rating: TechRehearsalRating): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Si pas de service réel, simuler la mise à jour
      if (typeof teamService?.updateTechRehearsalRating !== 'function') {
        setPerformanceTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId 
              ? { ...team, tech_rehearsal_rating: rating }
              : team
          )
        );
        
        onSuccess?.('Notation enregistrée avec succès');
        return true;
      }
      
      const result = await teamService.updateTechRehearsalRating(teamId, rating);
      
      if (result.success) {
        setPerformanceTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId 
              ? { ...team, tech_rehearsal_rating: rating }
              : team
          )
        );
        
        onSuccess?.('Notation enregistrée avec succès');
        return true;
      } else {
        onError?.(result.message || 'Erreur lors de la sauvegarde de la notation');
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAverageRating = (team: PerformanceTeam): number => {
    if (!team.tech_rehearsal_rating) return 0;
    
    const { rating_1, rating_2, rating_3 } = team.tech_rehearsal_rating;
    const totalRatings = [rating_1, rating_2, rating_3].filter(r => r > 0);
    
    if (totalRatings.length === 0) return 0;
    return totalRatings.reduce((sum, rating) => sum + rating, 0) / totalRatings.length;
  };

  const exportTeamsWithRatings = async (eventId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Générer CSV avec ratings
      const teamsWithRatings = performanceTeams.map(team => ({
        'Nom Équipe': team.team_name,
        'Directeur': team.director_name,
        'Email': team.director_email,
        'Ville': team.city,
        'Studio': team.studio_name || '',
        'Statut': team.status,
        'Taille Groupe': team.group_size,
        'Styles': (team.dance_styles || []).join('; '),
        'Niveau': team.performance_level || '',
        // Ratings
        'Critère 1': team.tech_rehearsal_rating?.rating_1_label || '',
        'Note 1': team.tech_rehearsal_rating?.rating_1 || '',
        'Critère 2': team.tech_rehearsal_rating?.rating_2_label || '',
        'Note 2': team.tech_rehearsal_rating?.rating_2 || '',
        'Critère 3': team.tech_rehearsal_rating?.rating_3_label || '',
        'Note 3': team.tech_rehearsal_rating?.rating_3 || '',
        'Note Moyenne': getAverageRating(team).toFixed(2),
        'Commentaires': team.tech_rehearsal_rating?.comments || '',
        'Noté Par': team.tech_rehearsal_rating?.rated_by || '',
        'Noté Le': team.tech_rehearsal_rating?.rated_at ? 
          new Date(team.tech_rehearsal_rating.rated_at).toLocaleDateString('fr-FR') : ''
      }));

      // Créer et télécharger CSV
      const headers = Object.keys(teamsWithRatings[0] || {});
      const csvContent = [
        headers.join(','),
        ...teamsWithRatings.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `teams-ratings-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onSuccess?.('Export généré avec succès !');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError?.(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // États
    isLoading,
    isCreating,
    isUpdating,
    uploadingMusic,
    uploadingPhoto,
    
    // Actions existantes
    createTeam,
    updateTeam,
    deleteTeam,
    submitTeam,
    approveTeam,
    rejectTeam,
    markAsCompleted, // ✅ FONCTION CORRIGÉE
    uploadMusicFile,
    uploadTeamPhoto,
    uploadTeamFiles,
    
    // ⭐ NOUVELLES ACTIONS RATING
    updateTechRehearsalRating,
    getAverageRating,
    exportTeamsWithRatings
  };
};