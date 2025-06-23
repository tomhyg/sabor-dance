// src/services/teamService.ts - VERSION COMPLÈTE AVEC markAsCompleted AJOUTÉ
import { supabase } from '../lib/supabase';
import { PerformanceTeam, TechRehearsalRating } from '../types/PerformanceTeam';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const teamService = {
  // =====================
  // FONCTIONS EXISTANTES
  // =====================

  async createTeam(teamData: any): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .insert([{
          ...teamData,
          status: 'draft',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur createTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async updateTeam(teamId: string, updateData: any): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur updateTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async deleteTeam(teamId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('performance_teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur deleteTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async submitTeam(teamId: string): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur submitTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async approveTeam(teamId: string): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur approveTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async rejectTeam(teamId: string, reason?: string): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur rejectTeam:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // ✅ NOUVELLE FONCTION: markAsCompleted avec sauvegarde backend
  async markAsCompleted(teamId: string): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) {
        console.error('Erreur marking team as completed:', error);
        return { success: false, message: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur marking team as completed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async uploadTeamFiles(teamId: string, files: { music_file?: File; team_photo?: File }): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      let updateData: any = {};

      // Upload musique
      if (files.music_file) {
        const musicFileName = `${teamId}-music-${Date.now()}.${files.music_file.name.split('.').pop()}`;
        
        const { data: musicData, error: musicError } = await supabase.storage
          .from('team-music')
          .upload(musicFileName, files.music_file);

        if (musicError) throw musicError;

        const { data: musicUrl } = supabase.storage
          .from('team-music')
          .getPublicUrl(musicFileName);

        updateData.music_file_url = musicUrl.publicUrl;
        updateData.music_file_name = files.music_file.name;
        
        // Générer song_title depuis le nom de fichier
        const baseName = files.music_file.name.replace(/\.[^/.]+$/, '');
        updateData.song_title = baseName;
      }

      // Upload photo
      if (files.team_photo) {
        const photoFileName = `${teamId}-photo-${Date.now()}.${files.team_photo.name.split('.').pop()}`;
        
        const { data: photoData, error: photoError } = await supabase.storage
          .from('team-photos')
          .upload(photoFileName, files.team_photo);

        if (photoError) throw photoError;

        const { data: photoUrl } = supabase.storage
          .from('team-photos')
          .getPublicUrl(photoFileName);

        updateData.team_photo_url = photoUrl.publicUrl;
      }

      // Mettre à jour l'équipe
      const { data, error } = await supabase
        .from('performance_teams')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur uploadTeamFiles:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // ⭐ FONCTION CORRIGÉE: getTeams (utilisée par useTeams)
  async getTeams(eventId: string): Promise<ServiceResponse<PerformanceTeam[]>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .select('*')
        .eq('event_id', eventId)
        .order('performance_order', { ascending: true, nullsFirst: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur getTeams:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async getTeamsByEvent(eventId: string): Promise<ServiceResponse<PerformanceTeam[]>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .select('*')
        .eq('event_id', eventId)
        .order('performance_order', { ascending: true, nullsFirst: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur getTeamsByEvent:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // ⭐ NOUVELLES FONCTIONS POUR NOTATION TECH REHEARSAL

  async updateTechRehearsalRating(teamId: string, rating: TechRehearsalRating): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          tech_rehearsal_rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur updateTechRehearsalRating:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // Export avec ratings inclus
  async exportTeamsWithRatings(eventId: string): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .select(`
          *,
          tech_rehearsal_rating
        `)
        .eq('event_id', eventId)
        .order('performance_order', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Formatter pour export CSV/Excel avec types corrects
      const exportData = data.map((team: any) => ({
        ...team,
        // Aplatir les ratings pour l'export
        rating_1_label: team.tech_rehearsal_rating?.rating_1_label || '',
        rating_1_score: team.tech_rehearsal_rating?.rating_1 || '',
        rating_2_label: team.tech_rehearsal_rating?.rating_2_label || '',
        rating_2_score: team.tech_rehearsal_rating?.rating_2 || '',
        rating_3_label: team.tech_rehearsal_rating?.rating_3_label || '',
        rating_3_score: team.tech_rehearsal_rating?.rating_3 || '',
        rating_comments: team.tech_rehearsal_rating?.comments || '',
        rating_average: team.tech_rehearsal_rating ? 
          ([team.tech_rehearsal_rating.rating_1, team.tech_rehearsal_rating.rating_2, team.tech_rehearsal_rating.rating_3]
            .filter((r: number) => r > 0)
            .reduce((sum: number, r: number) => sum + r, 0) / 
           [team.tech_rehearsal_rating.rating_1, team.tech_rehearsal_rating.rating_2, team.tech_rehearsal_rating.rating_3]
            .filter((r: number) => r > 0).length) || 0 : 0,
        rated_by: team.tech_rehearsal_rating?.rated_by || '',
        rated_at: team.tech_rehearsal_rating?.rated_at || ''
      }));

      return { success: true, data: exportData };
    } catch (error) {
      console.error('❌ Erreur exportTeamsWithRatings:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // Obtenir les équipes avec ratings pour dashboard
  async getTeamsWithRatings(eventId: string): Promise<ServiceResponse<{ data: PerformanceTeam[]; stats: any }>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .select(`
          *,
          tech_rehearsal_rating
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculer statistiques des ratings avec types corrects
      const ratedTeams = data.filter((team: any) => team.tech_rehearsal_rating);
      const averageRatings = ratedTeams.map((team: any) => {
        const rating = team.tech_rehearsal_rating;
        const scores = [rating.rating_1, rating.rating_2, rating.rating_3].filter((r: number) => r > 0);
        return scores.length > 0 ? scores.reduce((sum: number, r: number) => sum + r, 0) / scores.length : 0;
      });

      const stats = {
        totalTeams: data.length,
        ratedTeams: ratedTeams.length,
        unratedTeams: data.length - ratedTeams.length,
        averageOverallRating: averageRatings.length > 0 
          ? averageRatings.reduce((sum: number, avg: number) => sum + avg, 0) / averageRatings.length 
          : 0
      };

      return { success: true, data: { data, stats } };
    } catch (error) {
      console.error('❌ Erreur getTeamsWithRatings:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // Supprimer une notation
  async deleteTechRehearsalRating(teamId: string): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const { data, error } = await supabase
        .from('performance_teams')
        .update({ 
          tech_rehearsal_rating: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur deleteTechRehearsalRating:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // Générer ordre de performance basé sur les ratings (future feature)
  async generatePerformanceOrder(eventId: string, algorithm: 'rating' | 'style' | 'mixed' = 'mixed'): Promise<ServiceResponse<PerformanceTeam[]>> {
    try {
      // Récupérer toutes les équipes approuvées avec ratings
      const { data: teams, error } = await supabase
        .from('performance_teams')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Algorithme de tri avec types corrects
      let sortedTeams: any[];
      
      switch (algorithm) {
        case 'rating':
          // Trier par note moyenne (meilleures en dernier pour finir en beauté)
          sortedTeams = teams.sort((a: any, b: any) => {
            const avgA = this.calculateAverageRating(a.tech_rehearsal_rating);
            const avgB = this.calculateAverageRating(b.tech_rehearsal_rating);
            return avgA - avgB;
          });
          break;
          
        case 'style':
          // Mélanger les styles pour variété
          sortedTeams = this.mixByStyles(teams);
          break;
          
        case 'mixed':
        default:
          // Combinaison: style + rating + taille groupe
          sortedTeams = this.advancedMixAlgorithm(teams);
          break;
      }

      // Assigner l'ordre de performance avec types corrects
      const updates = sortedTeams.map((team: any, index: number) => ({
        id: team.id,
        performance_order: index + 1
      }));

      // Mettre à jour en batch
      const { error: updateError } = await supabase
        .from('performance_teams')
        .upsert(updates.map((update: any) => ({
          id: update.id,
          performance_order: update.performance_order,
          updated_at: new Date().toISOString()
        })));

      if (updateError) throw updateError;

      return { success: true, data: sortedTeams };
    } catch (error) {
      console.error('❌ Erreur generatePerformanceOrder:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // Fonctions utilitaires pour l'algorithme d'ordre avec types corrects
  calculateAverageRating(rating: any): number {
    if (!rating) return 0;
    const scores = [rating.rating_1, rating.rating_2, rating.rating_3].filter((r: number) => r > 0);
    return scores.length > 0 ? scores.reduce((sum: number, r: number) => sum + r, 0) / scores.length : 0;
  },

  mixByStyles(teams: any[]): any[] {
    // Grouper par style principal
    const styleGroups: { [key: string]: any[] } = {};
    teams.forEach((team: any) => {
      const mainStyle = team.dance_styles?.[0] || 'other';
      if (!styleGroups[mainStyle]) styleGroups[mainStyle] = [];
      styleGroups[mainStyle].push(team);
    });

    // Mélanger en alternant les styles
    const result: any[] = [];
    const styleKeys = Object.keys(styleGroups);
    let maxLength = Math.max(...Object.values(styleGroups).map((arr: any[]) => arr.length));

    for (let i = 0; i < maxLength; i++) {
      styleKeys.forEach((style: string) => {
        if (styleGroups[style][i]) {
          result.push(styleGroups[style][i]);
        }
      });
    }

    return result;
  },

  advancedMixAlgorithm(teams: any[]): any[] {
    // Algorithme sophistiqué combinant plusieurs facteurs
    return teams.sort((a: any, b: any) => {
      // Facteur 1: Note moyenne (poids 40%)
      const ratingA = this.calculateAverageRating(a.tech_rehearsal_rating);
      const ratingB = this.calculateAverageRating(b.tech_rehearsal_rating);
      const ratingScore = (ratingA - ratingB) * 0.4;

      // Facteur 2: Taille du groupe (poids 30%) - plus grands vers la fin
      const sizeScore = (a.group_size - b.group_size) * 0.3;

      // Facteur 3: Variété de style (poids 30%) - éviter trop de même style consécutifs
      const styleScore = this.calculateStyleVarietyScore(a, b, teams) * 0.3;

      return ratingScore + sizeScore + styleScore;
    });
  },

  calculateStyleVarietyScore(teamA: any, teamB: any, allTeams: any[]): number {
    // Logique simplifiée pour la variété des styles
    // Dans une vraie implémentation, on analyserait la position dans la séquence
    const styleA = teamA.dance_styles?.[0] || '';
    const styleB = teamB.dance_styles?.[0] || '';
    
    // Favoriser l'alternance des styles
    return styleA === styleB ? -1 : 1;
  }
};