// src/services/teamService.ts - Version complète avec upload fonctionnel
import { supabase } from '../lib/supabase'
import { PerformanceTeam } from '../types/PerformanceTeam'
import type { User } from '../lib/supabase'

export const teamService = {
  // Récupérer toutes les équipes d'un événement
  async getTeams(eventId: string) {
    const { data, error } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Récupérer une équipe spécifique
  async getTeam(teamId: string) {
    const { data, error } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('id', teamId)
      .single()

    return { data, error }
  },

  // Créer une nouvelle équipe
  async createTeam(teamData: any) {
    console.log('🚀 Création équipe Supabase:', teamData);
    
    const { data, error } = await supabase
      .from('performance_teams')
      .insert(teamData)
      .select()
      .single()

    return { data, error }
  },

  // Mettre à jour une équipe
  async updateTeam(teamId: string, updates: any) {
    console.log('🔄 Mise à jour équipe:', teamId, updates);
    
    const { data, error } = await supabase
      .from('performance_teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single()

    return { data, error }
  },

  // Changer le statut d'une équipe
  async updateStatus(teamId: string, status: 'draft' | 'submitted' | 'approved' | 'rejected', notes?: string) {
    const updates: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    // Ajouter des timestamps selon le statut
    if (status === 'submitted') {
      updates.submitted_at = new Date().toISOString();
    } else if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString();
      if (notes) updates.rejection_reason = notes;
    }

    const { data, error } = await supabase
      .from('performance_teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single()

    return { data, error }
  },

  // Upload d'un fichier musical - VERSION AVEC UTILISATEUR EN PARAMÈTRE
  async uploadMusicFile(teamId: string, file: File, currentUser?: User) {
    try {
      console.log('🎵 Upload fichier musical:', file.name, 'pour équipe', teamId);
      
      // Vérifier l'authentification avec l'utilisateur passé en paramètre
      if (currentUser) {
        console.log('👤 Utilisateur depuis paramètre:', currentUser.id, currentUser.email);
      } else {
        // Fallback : essayer de récupérer depuis Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        console.log('👤 Utilisateur depuis session:', user?.id, user?.email);

        if (!user) {
          console.error('❌ Aucun utilisateur connecté !');
          return { data: null, error: { message: 'Utilisateur non authentifié' } };
        }
      }
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}_${Date.now()}.${fileExt}`;
      const filePath = fileName; // Chemin simple sans dossier

      console.log('📁 Chemin upload:', filePath);

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true  // Permettre l'écrasement
        });

      if (uploadError) {
        console.error('❌ Erreur upload:', uploadError);
        
        // Essayer avec un nom encore plus simple
        const simplePath = `${teamId}_music.${fileExt}`;
        console.log('🔄 Tentative avec chemin simple:', simplePath);
        
        const { data: simpleUpload, error: simpleError } = await supabase.storage
          .from('team-files')
          .upload(simplePath, file, {
            upsert: true
          });
          
        if (simpleError) {
          console.error('❌ Erreur upload simple:', simpleError);
          
          // Fallback: sauvegarder juste le titre sans upload
          const { data: teamData, error: updateError } = await supabase
            .from('performance_teams')
            .update({
              song_title: file.name.replace(/\.[^/.]+$/, ""),
              updated_at: new Date().toISOString()
            })
            .eq('id', teamId)
            .select()
            .single();
            
          return { 
            data: { 
              url: null, 
              team: teamData, 
              warning: 'Upload échoué - titre sauvegardé' 
            }, 
            error: simpleError 
          };
        }
        
        // Upload simple réussi
        const { data: { publicUrl } } = supabase.storage
          .from('team-files')
          .getPublicUrl(simplePath);
          
        console.log('✅ Fichier uploadé (chemin simple):', publicUrl);

        const { data: teamData, error: updateError } = await supabase
          .from('performance_teams')
          .update({
            music_file_url: publicUrl,
            song_title: file.name.replace(/\.[^/.]+$/, ""),
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId)
          .select()
          .single();

        return { data: { url: publicUrl, team: teamData }, error: updateError };
      }

      // Upload original réussi
      const { data: { publicUrl } } = supabase.storage
        .from('team-files')
        .getPublicUrl(filePath);

      console.log('✅ Fichier uploadé:', publicUrl);

      // Mettre à jour l'équipe avec l'URL du fichier
      const { data: teamData, error: updateError } = await supabase
        .from('performance_teams')
        .update({
          music_file_url: publicUrl,
          song_title: file.name.replace(/\.[^/.]+$/, ""),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      return { data: { url: publicUrl, team: teamData }, error: updateError };

    } catch (error) {
      console.error('❌ Erreur catch upload:', error);
      
      // En cas d'erreur totale, sauvegarder au moins le titre
      try {
        const { data: teamData, error: updateError } = await supabase
          .from('performance_teams')
          .update({
            song_title: file.name.replace(/\.[^/.]+$/, ""),
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId)
          .select()
          .single();
          
        return { 
          data: { 
            url: null, 
            team: teamData, 
            warning: 'Erreur upload - titre sauvegardé' 
          }, 
          error 
        };
      } catch {
        return { data: null, error };
      }
    }
  },

  // Supprimer une équipe (soft delete)
  async deleteTeam(teamId: string) {
    const { data, error } = await supabase
      .from('performance_teams')
      .update({ 
        status: 'rejected',
        deleted_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    return { data, error }
  },

  // Récupérer les statistiques des équipes
  async getTeamStats(eventId: string) {
    const { data, error } = await supabase
      .from('performance_teams')
      .select('status, group_size')
      .eq('event_id', eventId);

    if (error) return { data: null, error };

    const stats = {
      total: data.length,
      draft: data.filter(t => t.status === 'draft').length,
      submitted: data.filter(t => t.status === 'submitted').length,
      approved: data.filter(t => t.status === 'approved').length,
      rejected: data.filter(t => t.status === 'rejected').length,
      totalParticipants: data.reduce((sum, team) => sum + (team.group_size || 0), 0)
    };

    return { data: stats, error: null };
  },

  // Supprimer un fichier musical
  async deleteMusicFile(teamId: string, fileUrl: string) {
    try {
      // Extraire le nom du fichier depuis l'URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      console.log('🗑️ Suppression fichier:', fileName);

      // Supprimer du storage
      const { error: deleteError } = await supabase.storage
        .from('team-files')
        .remove([fileName]);

      if (deleteError) {
        console.error('❌ Erreur suppression storage:', deleteError);
      }

      // Mettre à jour l'équipe pour supprimer l'URL
      const { data: teamData, error: updateError } = await supabase
        .from('performance_teams')
        .update({
          music_file_url: null,
          song_title: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      return { data: teamData, error: updateError };

    } catch (error) {
      console.error('❌ Erreur catch suppression:', error);
      return { data: null, error };
    }
  },

  // Obtenir l'URL publique d'un fichier
  getPublicUrl(fileName: string) {
    const { data: { publicUrl } } = supabase.storage
      .from('team-files')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Vérifier si une équipe peut encore être modifiée
  canEditTeam(team: PerformanceTeam): boolean {
    if (team.status === 'approved' || team.status === 'rejected') {
      return false;
    }

    if (team.can_edit_until) {
      const editDeadline = new Date(team.can_edit_until);
      const now = new Date();
      return now < editDeadline;
    }

    return true;
  },

  // Dupliquer une équipe (pour créer une nouvelle équipe basée sur une existante)
  async duplicateTeam(originalTeamId: string, newTeamName: string) {
    try {
      // Récupérer l'équipe originale
      const { data: originalTeam, error: fetchError } = await this.getTeam(originalTeamId);
      
      if (fetchError || !originalTeam) {
        return { data: null, error: fetchError || { message: 'Équipe non trouvée' } };
      }

      // Créer les données pour la nouvelle équipe
      const newTeamData = {
        ...originalTeam,
        id: undefined, // Laisser Supabase générer un nouvel ID
        team_name: newTeamName,
        status: 'draft',
        created_at: undefined,
        updated_at: undefined,
        submitted_at: null,
        approved_at: null,
        rejected_at: null,
        music_file_url: null, // Ne pas copier le fichier musical
        song_title: originalTeam.song_title, // Mais garder le titre
        performance_video_url: null // Ne pas copier la vidéo non plus
      };

      // Créer la nouvelle équipe
      const { data, error } = await this.createTeam(newTeamData);
      
      return { data, error };

    } catch (error) {
      console.error('❌ Erreur duplication équipe:', error);
      return { data: null, error };
    }
  }
}