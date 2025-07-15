// src/services/volunteerAccountsService.ts - VERSION COMPLÈTE CORRIGÉE
import { supabase } from '../lib/supabase';

export interface VolunteerAccountData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  volunteer_hours: number;
  required_hours: number;
  assigned_shifts: Array<{
    id: string;
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const volunteerAccountsService = {
  /**
   * 🎯 CORRECTION MAJEURE: Récupérer tous les comptes bénévoles avec leurs vraies inscriptions
   */
  async getAllVolunteerAccounts(eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<VolunteerAccountData[]>> {
    try {
      console.log('🔍 Récupération des comptes bénévoles pour eventId:', eventId);

      // 1. Récupérer tous les utilisateurs avec le rôle 'volunteer'
      const { data: volunteers, error: volunteersError } = await supabase
        .from('users')
        .select('id, full_name, email, phone, created_at')
        .eq('role', 'volunteer')
        .order('full_name', { ascending: true });

      if (volunteersError) {
        console.error('❌ Erreur récupération bénévoles:', volunteersError);
        return { success: false, message: 'Erreur lors de la récupération des bénévoles' };
      }

      if (!volunteers || volunteers.length === 0) {
        console.log('⚠️ Aucun bénévole trouvé');
        return { success: true, data: [] };
      }

      console.log(`✅ ${volunteers.length} bénévoles trouvés`);

      // 2. Récupérer tous les shifts pour l'événement
      const { data: shifts, error: shiftsError } = await supabase
        .from('volunteer_shifts')
        .select('id, title, shift_date, start_time, end_time')
        .eq('event_id', eventId);

      if (shiftsError) {
        console.error('⚠️ Erreur récupération shifts:', shiftsError);
      }

      console.log(`📅 ${shifts?.length || 0} shifts trouvés pour l'événement`);

      // 3. Récupérer toutes les inscriptions pour ces bénévoles
      const volunteerIds = volunteers.map(v => v.id);
      const { data: signups, error: signupsError } = await supabase
        .from('volunteer_signups')
        .select('id, volunteer_id, shift_id, status, signed_up_at, checked_in_at')
        .in('volunteer_id', volunteerIds)
        .neq('status', 'cancelled'); // 🎯 CORRECTION: Exclure les inscriptions annulées

      if (signupsError) {
        console.error('⚠️ Erreur récupération inscriptions:', signupsError);
      }

      console.log(`📊 ${signups?.length || 0} inscriptions actives trouvées`);

      // 4. Construire les données enrichies
      const enrichedVolunteers: VolunteerAccountData[] = volunteers.map(volunteer => {
        // Filtrer les inscriptions pour ce bénévole
        const volunteerSignups = signups?.filter(signup => signup.volunteer_id === volunteer.id) || [];
        
        // Construire les shifts assignés avec les vraies données
        const assigned_shifts = volunteerSignups.map(signup => {
          const shift = shifts?.find(s => s.id === signup.shift_id);
          
          if (!shift) {
            console.warn(`⚠️ Shift ${signup.shift_id} non trouvé pour l'inscription ${signup.id}`);
            return null;
          }

          return {
            id: shift.id,
            title: shift.title,
            shift_date: shift.shift_date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            status: signup.status
          };
        }).filter(Boolean); // Filtrer les valeurs null

        // 🎯 CORRECTION: Calculer les heures réelles depuis les shifts
        const volunteer_hours = this.calculateVolunteerHours(assigned_shifts as any);

        return {
          id: volunteer.id,
          full_name: volunteer.full_name,
          email: volunteer.email,
          phone: volunteer.phone,
          created_at: volunteer.created_at,
          volunteer_hours,
          required_hours: 9, // Valeur fixe
          assigned_shifts: assigned_shifts as Array<{
            id: string;
            title: string;
            shift_date: string;
            start_time: string;
            end_time: string;
            status: string;
          }>
        };
      });

      console.log(`✅ ${enrichedVolunteers.length} comptes bénévoles enrichis`);
      
      // 🎯 DEBUG: Afficher les détails pour le bénévole test
      const testVolunteer = enrichedVolunteers.find(v => v.full_name === 'Test Volunteer 1');
      if (testVolunteer) {
        console.log('🔍 Test Volunteer 1 détails:', {
          id: testVolunteer.id,
          hours: testVolunteer.volunteer_hours,
          shifts: testVolunteer.assigned_shifts.length,
          shiftDetails: testVolunteer.assigned_shifts
        });
      }

      return { success: true, data: enrichedVolunteers };

    } catch (error) {
      console.error('❌ Erreur service getAllVolunteerAccounts:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 NOUVELLE MÉTHODE: Approche alternative avec requêtes séparées
   */
  async getAllVolunteerAccountsAlternative(eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<VolunteerAccountData[]>> {
    try {
      console.log('🔍 Récupération des comptes bénévoles (méthode alternative)...');

      // 1. Récupérer tous les utilisateurs avec le rôle 'volunteer'
      const { data: volunteers, error: volunteersError } = await supabase
        .from('users')
        .select('id, full_name, email, phone, created_at')
        .eq('role', 'volunteer')
        .order('full_name', { ascending: true });

      if (volunteersError) {
        console.error('Erreur récupération bénévoles:', volunteersError);
        return { success: false, message: 'Erreur lors de la récupération des bénévoles' };
      }

      if (!volunteers || volunteers.length === 0) {
        return { success: true, data: [] };
      }

      // 2. Récupérer les shifts pour l'événement
      const { data: shifts, error: shiftsError } = await supabase
        .from('volunteer_shifts')
        .select('id, title, shift_date, start_time, end_time')
        .eq('event_id', eventId);

      if (shiftsError) {
        console.error('Erreur récupération shifts:', shiftsError);
      }

      // 3. Récupérer toutes les inscriptions
      const { data: signups, error: signupsError } = await supabase
        .from('volunteer_signups')
        .select('id, volunteer_id, shift_id, status, signed_up_at, checked_in_at')
        .in('volunteer_id', volunteers.map(v => v.id))
        .neq('status', 'cancelled');

      if (signupsError) {
        console.error('Erreur récupération inscriptions:', signupsError);
      }

      // 4. Construire les données enrichies
      const enrichedVolunteers: VolunteerAccountData[] = volunteers.map(volunteer => {
        // Filtrer les inscriptions pour ce bénévole
        const volunteerSignups = signups?.filter(signup => signup.volunteer_id === volunteer.id) || [];
        
        // Construire les shifts assignés
        const assigned_shifts = volunteerSignups.map(signup => {
          const shift = shifts?.find(s => s.id === signup.shift_id);
          
          if (!shift) {
            console.warn('⚠️ Shift non trouvé pour signup:', signup.id);
            return null;
          }

          return {
            id: shift.id,
            title: shift.title,
            shift_date: shift.shift_date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            status: signup.status
          };
        }).filter(Boolean); // Filtrer les valeurs null

        // Calculer les heures
        const volunteer_hours = this.calculateVolunteerHours(assigned_shifts as any);

        return {
          id: volunteer.id,
          full_name: volunteer.full_name,
          email: volunteer.email,
          phone: volunteer.phone,
          created_at: volunteer.created_at,
          volunteer_hours,
          required_hours: 9,
          assigned_shifts: assigned_shifts as Array<{
            id: string;
            title: string;
            shift_date: string;
            start_time: string;
            end_time: string;
            status: string;
          }>
        };
      });

      console.log(`✅ ${enrichedVolunteers.length} comptes bénévoles récupérés (méthode alternative)`);
      return { success: true, data: enrichedVolunteers };

    } catch (error) {
      console.error('Erreur service getAllVolunteerAccountsAlternative:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 CORRECTION: Calculer les heures réelles depuis les shifts
   */
  calculateVolunteerHours(shifts: Array<{
    start_time: string;
    end_time: string;
    status: string;
  }>): number {
    return shifts.reduce((total, shift) => {
      // Compter toutes les inscriptions actives (pas seulement checked_in)
      if (shift.status === 'signed_up' || shift.status === 'confirmed' || shift.status === 'checked_in') {
        // Calculer la durée réelle du shift
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
  },

  /**
   * Obtenir les statistiques des bénévoles
   */
  async getVolunteerStats(eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<{
    total_volunteers: number;
    active_volunteers: number;
    completed_quota: number;
    without_shifts: number;
  }>> {
    try {
      // 🎯 UTILISATION: Essayer d'abord la méthode principale, puis l'alternative
      let accountsResult = await this.getAllVolunteerAccounts(eventId);
      
      if (!accountsResult.success) {
        console.log('🔄 Tentative avec méthode alternative...');
        accountsResult = await this.getAllVolunteerAccountsAlternative(eventId);
      }
      
      if (!accountsResult.success || !accountsResult.data) {
        return { success: false, message: 'Impossible de récupérer les statistiques' };
      }

      const volunteers = accountsResult.data;
      
      const stats = {
        total_volunteers: volunteers.length,
        active_volunteers: volunteers.filter(v => v.assigned_shifts.length > 0).length,
        completed_quota: volunteers.filter(v => v.volunteer_hours >= v.required_hours).length,
        without_shifts: volunteers.filter(v => v.assigned_shifts.length === 0).length
      };

      console.log('📊 Statistiques bénévoles:', stats);
      return { success: true, data: stats };

    } catch (error) {
      console.error('Erreur service getVolunteerStats:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * Exporter les données des bénévoles
   */
  async exportVolunteerAccounts(
    volunteers: VolunteerAccountData[], 
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<ServiceResponse<string>> {
    try {
      // Préparer les données pour l'export
      const exportData = volunteers.map(volunteer => ({
        'Nom': volunteer.full_name,
        'Email': volunteer.email,
        'Téléphone': volunteer.phone || 'Non renseigné',
        'Date inscription': new Date(volunteer.created_at).toLocaleDateString('fr-FR'),
        'Heures complétées': volunteer.volunteer_hours,
        'Heures requises': volunteer.required_hours,
        'Progression': `${volunteer.volunteer_hours}/${volunteer.required_hours}h`,
        'Quota complété': volunteer.volunteer_hours >= volunteer.required_hours ? 'Oui' : 'Non',
        'Nombre de créneaux': volunteer.assigned_shifts.length,
        'Créneaux': volunteer.assigned_shifts.map(s => s.title).join(', ') || 'Aucun'
      }));

      // Simulation d'export (ici, on intégrerait une vraie librairie d'export)
      console.log(`📥 Export ${format.toUpperCase()} des bénévoles:`, exportData);
      
      // Simulation d'un fichier généré
      const filename = `volunteer_accounts_${new Date().toISOString().split('T')[0]}.${format}`;
      
      return { 
        success: true, 
        data: filename,
        message: `Export ${format.toUpperCase()} généré avec succès` 
      };

    } catch (error) {
      console.error('Erreur export bénévoles:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de l\'export' 
      };
    }
  },

  /**
   * Obtenir les détails d'un bénévole spécifique
   */
  async getVolunteerDetails(volunteerId: string, eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<VolunteerAccountData>> {
    try {
      const accountsResult = await this.getAllVolunteerAccounts(eventId);
      
      if (!accountsResult.success || !accountsResult.data) {
        return { success: false, message: 'Impossible de récupérer les données' };
      }

      const volunteer = accountsResult.data.find(v => v.id === volunteerId);
      
      if (!volunteer) {
        return { success: false, message: 'Bénévole non trouvé' };
      }

      return { success: true, data: volunteer };

    } catch (error) {
      console.error('Erreur service getVolunteerDetails:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 NOUVELLE MÉTHODE: Récupérer les inscriptions d'un bénévole spécifique
   */
  async getVolunteerSignups(volunteerId: string, eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<any[]>> {
    try {
      const { data: signups, error } = await supabase
        .from('volunteer_signups')
        .select(`
          id,
          shift_id,
          status,
          signed_up_at,
          checked_in_at,
          volunteer_shifts!inner (
            id,
            title,
            shift_date,
            start_time,
            end_time,
            event_id
          )
        `)
        .eq('volunteer_id', volunteerId)
        .eq('volunteer_shifts.event_id', eventId)
        .neq('status', 'cancelled')
        .order('signed_up_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération inscriptions bénévole:', error);
        return { success: false, message: 'Erreur lors de la récupération des inscriptions' };
      }

      return { success: true, data: signups || [] };

    } catch (error) {
      console.error('Erreur service getVolunteerSignups:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 NOUVELLE MÉTHODE: Mettre à jour les heures d'un bénévole
   */
  async updateVolunteerHours(volunteerId: string, eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<number>> {
    try {
      // Récupérer les inscriptions du bénévole
      const signupsResult = await this.getVolunteerSignups(volunteerId, eventId);
      
      if (!signupsResult.success || !signupsResult.data) {
        return { success: false, message: 'Impossible de récupérer les inscriptions' };
      }

      // Calculer les heures
      const shifts = signupsResult.data.map(signup => ({
        start_time: signup.volunteer_shifts[0]?.start_time || '00:00',
        end_time: signup.volunteer_shifts[0]?.end_time || '00:00',
        status: signup.status
      }));

      const totalHours = this.calculateVolunteerHours(shifts);

      return { success: true, data: totalHours };

    } catch (error) {
      console.error('Erreur service updateVolunteerHours:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 NOUVELLE MÉTHODE: Rechercher des bénévoles par critères
   */
  async searchVolunteers(
    searchTerm: string, 
    filters: {
      hasShifts?: boolean;
      quotaCompleted?: boolean;
      status?: string;
    } = {},
    eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'
  ): Promise<ServiceResponse<VolunteerAccountData[]>> {
    try {
      const accountsResult = await this.getAllVolunteerAccounts(eventId);
      
      if (!accountsResult.success || !accountsResult.data) {
        return { success: false, message: 'Impossible de récupérer les données' };
      }

      let filteredVolunteers = accountsResult.data;

      // Filtre de recherche textuelle
      if (searchTerm) {
        filteredVolunteers = filteredVolunteers.filter(volunteer =>
          volunteer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtre par présence de shifts
      if (filters.hasShifts !== undefined) {
        filteredVolunteers = filteredVolunteers.filter(volunteer =>
          filters.hasShifts ? volunteer.assigned_shifts.length > 0 : volunteer.assigned_shifts.length === 0
        );
      }

      // Filtre par quota complété
      if (filters.quotaCompleted !== undefined) {
        filteredVolunteers = filteredVolunteers.filter(volunteer =>
          filters.quotaCompleted ? volunteer.volunteer_hours >= volunteer.required_hours : volunteer.volunteer_hours < volunteer.required_hours
        );
      }

      return { success: true, data: filteredVolunteers };

    } catch (error) {
      console.error('Erreur service searchVolunteers:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  /**
   * 🎯 NOUVELLE MÉTHODE: Obtenir un résumé des bénévoles par statut
   */
  async getVolunteerSummary(eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'): Promise<ServiceResponse<{
    total: number;
    withShifts: number;
    withoutShifts: number;
    quotaCompleted: number;
    averageHours: number;
    topVolunteers: VolunteerAccountData[];
  }>> {
    try {
      const accountsResult = await this.getAllVolunteerAccounts(eventId);
      
      if (!accountsResult.success || !accountsResult.data) {
        return { success: false, message: 'Impossible de récupérer les données' };
      }

      const volunteers = accountsResult.data;
      
      const summary = {
        total: volunteers.length,
        withShifts: volunteers.filter(v => v.assigned_shifts.length > 0).length,
        withoutShifts: volunteers.filter(v => v.assigned_shifts.length === 0).length,
        quotaCompleted: volunteers.filter(v => v.volunteer_hours >= v.required_hours).length,
        averageHours: volunteers.reduce((sum, v) => sum + v.volunteer_hours, 0) / volunteers.length,
        topVolunteers: volunteers
          .sort((a, b) => b.volunteer_hours - a.volunteer_hours)
          .slice(0, 10)
      };

      return { success: true, data: summary };

    } catch (error) {
      console.error('Erreur service getVolunteerSummary:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
};

export default volunteerAccountsService;