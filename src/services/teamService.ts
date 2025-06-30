// src/services/teamService.ts - VERSION FINALE COMPLÈTE AVEC PERFORMERS
import { supabase } from '../lib/supabase';
import { PerformanceTeam, TechRehearsalRating } from '../types/PerformanceTeam';

const getErrorMessage = (error: unknown): string => {
  console.log('🔍 Type d\'erreur:', typeof error, error);
  
  if (error && typeof error === 'object') {
    // Erreur Supabase
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Erreur PostgreSQL
    if ('details' in error && typeof error.details === 'string') {
      return error.details;
    }
    
    // Erreur avec code
    if ('code' in error && 'hint' in error) {
      return `Code: ${error.code} - ${error.hint || 'Erreur base de données'}`;
    }
    
    // Tenter de sérialiser l'objet
    try {
      return JSON.stringify(error);
    } catch {
      return 'Erreur inconnue lors de la sérialisation';
    }
  }
  
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 🎯 Interface pour les performers
export interface Performer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  position_in_team?: number;
  is_team_director?: boolean;
}

// 🎯 Interface pour l'équipe avec performers
export interface TeamWithPerformers extends PerformanceTeam {
  performers?: Performer[];
}

// Fonction pour nettoyer et valider les données avant insertion
const validateAndCleanTeamData = (teamData: any) => {
  console.log('🧹 Données reçues:', teamData);
  
  // ✅ FILTRER LES OBJETS FILE ET PERFORMERS qui ne doivent pas aller en base
  const { music_file, team_photo, performers, ...dataWithoutFiles } = teamData;
  
  console.log('👥 Performers exclus de l\'insertion principale:', performers);
  
  // ✅ Mapper 'professional' vers 'pro' pour la base
  let performance_level = dataWithoutFiles.performance_level;
  if (performance_level === 'professional') {
    performance_level = 'pro';
  }
  
  // ✅ Assurer que country a une valeur par défaut
  const country = dataWithoutFiles.country && dataWithoutFiles.country.trim() 
    ? dataWithoutFiles.country.trim() 
    : 'USA'; // Valeur par défaut
  
  // ✅ Nettoyer toutes les chaînes
  const cleanedData = {
    ...dataWithoutFiles,
    team_name: dataWithoutFiles.team_name?.trim() || '',
    director_name: dataWithoutFiles.director_name?.trim() || '',
    director_email: dataWithoutFiles.director_email?.toLowerCase().trim() || '',
    director_phone: dataWithoutFiles.director_phone?.trim() || null,
    studio_name: dataWithoutFiles.studio_name?.trim() || null,
    city: dataWithoutFiles.city?.trim() || '',
    state: dataWithoutFiles.state?.trim() || null,
    country: country,
    performance_level: performance_level,
    performance_video_url: dataWithoutFiles.performance_video_url?.trim() || null,
    instagram: dataWithoutFiles.instagram?.trim() || null,
    website_url: dataWithoutFiles.website_url?.trim() || null,
    dance_styles: Array.isArray(dataWithoutFiles.dance_styles) ? dataWithoutFiles.dance_styles : [],
    group_size: typeof dataWithoutFiles.group_size === 'number' ? dataWithoutFiles.group_size : 4
  };
  
  console.log('🧹 Données nettoyées (sans fichiers ni performers):', cleanedData);
  return cleanedData;
};

export const teamService = {
  // ✅ FONCTION CREATETEAM AVEC PERFORMERS ET FICHIERS
  async createTeam(teamData: any): Promise<ServiceResponse<TeamWithPerformers>> {
    try {
      console.log('🎯 Début createTeam avec données:', teamData);
      
      // ✅ Extraire les données
      const musicFile = teamData.music_file;
      const teamPhoto = teamData.team_photo;
      const performers = teamData.performers as Performer[];
      
      console.log('👥 Performers reçus:', performers);
      
      // ✅ Nettoyer et valider les données (SANS les fichiers ET performers)
      const cleanedData = validateAndCleanTeamData(teamData);
      
      // ✅ Vérifications préalables
      if (!cleanedData.team_name) {
        return { success: false, message: 'Le nom de l\'équipe est requis' };
      }
      
      if (!cleanedData.director_name) {
        return { success: false, message: 'Le nom du directeur est requis' };
      }
      
      if (!cleanedData.director_email) {
        return { success: false, message: 'L\'email du directeur est requis' };
      }
      
      if (!cleanedData.city) {
        return { success: false, message: 'La ville est requise' };
      }
      
      // ✅ Préparer les données pour l'insertion (SANS les fichiers ET performers)
      const insertData = {
        ...cleanedData,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 Données équipe à insérer:', insertData);
      
      // 1️⃣ CRÉER L'ÉQUIPE
      const { data: teamCreated, error: teamError } = await supabase
        .from('performance_teams')
        .insert([insertData])
        .select()
        .single();

      if (teamError) {
        console.error('❌ Erreur Supabase createTeam:', teamError);
        console.error('❌ Code erreur:', teamError.code);
        console.error('❌ Message erreur:', teamError.message);
        console.error('❌ Détails erreur:', teamError.details);
        console.error('❌ Hint erreur:', teamError.hint);
        
        // Messages d'erreur spécifiques
        if (teamError.code === '23505') {
          return { success: false, message: 'Une équipe avec ce nom existe déjà' };
        }
        
        if (teamError.code === '23502') {
          return { success: false, message: 'Champ obligatoire manquant: ' + (teamError.details || 'non spécifié') };
        }
        
        if (teamError.code === '23514') {
          return { success: false, message: 'Valeur invalide: ' + (teamError.details || 'vérifiez les données') };
        }
        
        throw teamError;
      }

      console.log('✅ Équipe créée:', teamCreated);

      // 2️⃣ SAUVEGARDER LES PERFORMERS
      let savedPerformers: Performer[] = [];
      if (performers && performers.length > 0 && teamCreated?.id) {
        try {
          console.log('👥 Sauvegarde des performers...');
          const performerResult = await this.savePerformers(teamCreated.id, performers);
          
          if (performerResult.success && performerResult.data) {
            savedPerformers = performerResult.data;
            console.log('✅ Performers sauvegardés:', savedPerformers);
          } else {
            console.warn('⚠️ Erreur sauvegarde performers:', performerResult.message);
          }
        } catch (performerError) {
          console.warn('⚠️ Exception sauvegarde performers:', performerError);
          // Ne pas échouer la création pour les performers
        }
      }

      // 3️⃣ UPLOAD DES FICHIERS
      let finalTeamData = teamCreated;
      if ((musicFile || teamPhoto) && teamCreated?.id) {
        console.log('📁 Upload des fichiers pour l\'équipe:', teamCreated.id);
        
        try {
          const uploadResult = await this.uploadTeamFiles(teamCreated.id, {
            music_file: musicFile,
            team_photo: teamPhoto
          });
          
          if (uploadResult.success && uploadResult.data) {
            console.log('✅ Fichiers uploadés avec succès');
            finalTeamData = uploadResult.data;
          } else {
            console.log('⚠️ Équipe créée mais erreur upload fichiers:', uploadResult.message);
          }
        } catch (uploadError) {
          console.error('❌ Erreur upload fichiers:', uploadError);
        }
      }
      
      // 4️⃣ RETOURNER L'ÉQUIPE AVEC LES PERFORMERS
      const teamWithPerformers: TeamWithPerformers = {
        ...finalTeamData,
        performers: savedPerformers
      };
      
      return { success: true, data: teamWithPerformers };
      
    } catch (error) {
      console.error('❌ Exception createTeam:', error);
      const errorMessage = getErrorMessage(error);
      console.error('❌ Message d\'erreur final:', errorMessage);
      
      return { 
        success: false, 
        message: errorMessage || 'Erreur lors de la création de l\'équipe'
      };
    }
  },

  // 🎯 NOUVELLE FONCTION: Sauvegarder les performers
  async savePerformers(teamId: string, performers: Performer[]): Promise<ServiceResponse<Performer[]>> {
    try {
      console.log('👥 Sauvegarde performers pour équipe:', teamId);
      console.log('👥 Performers à sauvegarder:', performers);
      
      // Préparer les données performers
      const performersData = performers.map((performer, index) => ({
        team_id: teamId,
        name: performer.name,
        email: performer.email,
        phone: performer.phone || null,
        role: performer.role || (index === 0 ? 'director' : 'performer'),
        position_in_team: performer.position_in_team || (index + 1),
        is_team_director: performer.is_team_director || (index === 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('📤 Données performers à insérer:', performersData);
      
      // Insérer les performers
      const { data, error } = await supabase
        .from('team_performers')
        .insert(performersData)
        .select();
      
      if (error) {
        console.error('❌ Erreur insertion performers:', error);
        throw error;
      }
      
      console.log('✅ Performers insérés:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Erreur savePerformers:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // 🎯 NOUVELLE FONCTION: Récupérer une équipe avec ses performers
  async getTeamWithPerformers(teamId: string): Promise<ServiceResponse<TeamWithPerformers>> {
    try {
      console.log('🔍 Récupération équipe avec performers:', teamId);
      
      // Récupérer l'équipe
      const { data: teamData, error: teamError } = await supabase
        .from('performance_teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (teamError) throw teamError;
      
      // Récupérer les performers
      const { data: performersData, error: performersError } = await supabase
        .from('team_performers')
        .select('*')
        .eq('team_id', teamId)
        .order('position_in_team', { ascending: true });
      
      if (performersError) {
        console.warn('⚠️ Erreur récupération performers:', performersError);
      }
      
      const teamWithPerformers: TeamWithPerformers = {
        ...teamData,
        performers: performersData || []
      };
      
      return { success: true, data: teamWithPerformers };
      
    } catch (error) {
      console.error('❌ Erreur getTeamWithPerformers:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // 🎯 NOUVELLE FONCTION: Mettre à jour les performers
  async updatePerformers(teamId: string, performers: Performer[]): Promise<ServiceResponse<Performer[]>> {
    try {
      console.log('🔄 Mise à jour performers pour équipe:', teamId);
      
      // Supprimer les anciens performers
      const { error: deleteError } = await supabase
        .from('team_performers')
        .delete()
        .eq('team_id', teamId);
      
      if (deleteError) {
        console.error('❌ Erreur suppression anciens performers:', deleteError);
        throw deleteError;
      }
      
      // Sauvegarder les nouveaux performers
      if (performers && performers.length > 0) {
        return await this.savePerformers(teamId, performers);
      }
      
      return { success: true, data: [] };
      
    } catch (error) {
      console.error('❌ Erreur updatePerformers:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  async updateTeam(teamId: string, updateData: any): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      const cleanedData = validateAndCleanTeamData(updateData);
      
      const { data, error } = await supabase
        .from('performance_teams')
        .update({
          ...cleanedData,
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
      // Les performers seront supprimés automatiquement par CASCADE
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

  // ✅ FONCTION markAsCompleted AJOUTÉE
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

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur markAsCompleted:', error);
      return { 
        success: false, 
        message: getErrorMessage(error)
      };
    }
  },

  // ✅ FONCTION uploadTeamFiles AVEC LES BONS NOMS DE BUCKETS
  async uploadTeamFiles(teamId: string, files: { music_file?: File; team_photo?: File }): Promise<ServiceResponse<PerformanceTeam>> {
    try {
      let updateData: any = {};

      // ✅ Upload musique dans le bucket 'team-files'
      if (files.music_file) {
        console.log('🎵 Upload fichier musique:', files.music_file.name);
        console.log('🎯 Utilisation du bucket: team-files');
        
        // ✅ RÉCUPÉRER LES INFOS DE L'ÉQUIPE POUR LE RENOMMAGE
        const { data: teamInfo, error: teamError } = await supabase
          .from('performance_teams')
          .select('team_name, studio_name')
          .eq('id', teamId)
          .single();

        if (teamError) {
          console.warn('⚠️ Impossible de récupérer les infos équipe pour renommage:', teamError);
        }

        // ✅ GÉNÉRER UN NOM DE FICHIER INTELLIGENT : NomStudio-NomEquipe
        const cleanString = (str: string) => 
          str.replace(/[^a-zA-Z0-9\s]/g, '') // Supprimer caractères spéciaux
             .replace(/\s+/g, '') // Supprimer espaces
             .substring(0, 20); // Limiter longueur

        const studioName = teamInfo?.studio_name ? cleanString(teamInfo.studio_name) : 'Studio';
        const teamName = teamInfo?.team_name ? cleanString(teamInfo.team_name) : 'Team';
        const extension = files.music_file.name.split('.').pop()?.toLowerCase() || 'mp3';
        
        // Nom de fichier final : Studio-Team.extension
        const intelligentFileName = `${studioName}-${teamName}.${extension}`;
        const storageFileName = `${teamId}-music-${Date.now()}.${extension}`; // Nom unique pour le storage
        
        console.log('🎯 Nom de fichier intelligent généré:', intelligentFileName);
        
        const { data: musicData, error: musicError } = await supabase.storage
          .from('team-files')
          .upload(storageFileName, files.music_file, {
            cacheControl: '3600',
            upsert: true
          });

        if (musicError) {
          console.error('❌ Erreur upload musique:', musicError);
          console.error('❌ Bucket testé: team-files');
          throw musicError;
        }

        const { data: musicUrl } = supabase.storage
          .from('team-files')
          .getPublicUrl(storageFileName);

        // ✅ SAUVEGARDER LE NOM INTELLIGENT ET LE TITRE GÉNÉRÉ
        updateData.music_file_url = musicUrl.publicUrl;
        updateData.music_file_name = intelligentFileName; // ✅ NomStudio-NomEquipe.mp3
        updateData.song_title = intelligentFileName.replace(/\.[^/.]+$/, ''); // ✅ Nom sans extension pour song_title
        
        console.log('✅ Musique uploadée:', musicUrl.publicUrl);
        console.log('✅ Nom de fichier sauvé:', intelligentFileName);
      }

      // ✅ Upload photo dans le bucket 'team-files'
      if (files.team_photo) {
        console.log('📸 Upload photo équipe:', files.team_photo.name);
        console.log('🎯 Utilisation du bucket: team-files');
        
        const photoFileName = `${teamId}-photo-${Date.now()}.${files.team_photo.name.split('.').pop()}`;
        
        const { data: photoData, error: photoError } = await supabase.storage
          .from('team-files')
          .upload(photoFileName, files.team_photo, {
            cacheControl: '3600',
            upsert: true
          });

        if (photoError) {
          console.error('❌ Erreur upload photo:', photoError);
          console.error('❌ Bucket testé: team-files');
          throw photoError;
        }

        const { data: photoUrl } = supabase.storage
          .from('team-files')
          .getPublicUrl(photoFileName);

        updateData.team_photo_url = photoUrl.publicUrl;
        
        console.log('✅ Photo uploadée:', photoUrl.publicUrl);
      }

      // Mettre à jour l'équipe avec les URLs des fichiers
      if (Object.keys(updateData).length > 0) {
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
      }

      // Si aucun fichier à uploader, retourner l'équipe existante
      const { data, error } = await supabase
        .from('performance_teams')
        .select()
        .eq('id', teamId)
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

  // ⭐ FONCTION getTeams (utilisée par useTeams)
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