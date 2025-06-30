// src/services/volunteerService.ts
import { supabase } from '../lib/supabase'
import type { VolunteerShift, VolunteerSignup } from '../lib/supabase'

// 🎯 NOUVEAUTÉ: Interface pour les conflits d'horaires
interface OverlapConflict {
  conflictingShift: any;
  conflictingSignup: any;
  overlapType: 'complete' | 'partial';
  overlapStart: number;
  overlapEnd: number;
}

// 🎯 NOUVEAU: Interface pour un shift avec ses bénévoles assignés
export interface ShiftWithVolunteers extends VolunteerShift {
  volunteer_signups?: Array<{
    id: string;
    volunteer_id: string;
    status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';
    signed_up_at: string;
    checked_in_at?: string;
    volunteer: {
      id: string;
      full_name: string;
      email: string;
      phone?: string;
    };
  }>;
}

// 🎯 NOUVEAU: Interface pour les statistiques d'affectation
export interface ShiftAssignmentStats {
  total_assigned: number;
  confirmed: number;
  checked_in: number;
  no_show: number;
  spots_remaining: number;
  fill_percentage: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
}

export const volunteerService = {
  // Récupérer tous les shifts d'un événement - FIXED
  async getShifts(eventId: string) {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer_signups (
          id,
          volunteer_id,
          status,
          signed_up_at,
          checked_in_at,
          qr_code,
          volunteer:users!volunteer_signups_volunteer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('event_id', eventId)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    return { data, error }
  },

  // 🎯 NOUVEAU: Récupérer un shift spécifique avec détails complets des bénévoles
  async getShiftWithAssignments(shiftId: string): Promise<{
    data?: ShiftWithVolunteers;
    error?: any;
  }> {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer_signups!inner (
          id,
          volunteer_id,
          status,
          signed_up_at,
          checked_in_at,
          qr_code,
          volunteer:users!volunteer_signups_volunteer_id_fkey (
            id,
            full_name,
            email,
            phone,
            role
          )
        )
      `)
      .eq('id', shiftId)
      .single()

    return { data, error }
  },

  // 🎯 NOUVEAU: Obtenir les statistiques d'affectation d'un shift
  async getShiftAssignmentStats(shiftId: string): Promise<{
    data?: ShiftAssignmentStats;
    error?: any;
  }> {
    try {
      const { data: shift, error: shiftError } = await supabase
        .from('volunteer_shifts')
        .select(`
          id,
          max_volunteers,
          volunteer_signups (
            status
          )
        `)
        .eq('id', shiftId)
        .single()

      if (shiftError) return { error: shiftError }

      const signups = shift.volunteer_signups || []
      const activeSignups = signups.filter(s => s.status !== 'cancelled')
      
      const stats: ShiftAssignmentStats = {
        total_assigned: activeSignups.length,
        confirmed: signups.filter(s => s.status === 'confirmed').length,
        checked_in: signups.filter(s => s.status === 'checked_in').length,
        no_show: signups.filter(s => s.status === 'no_show').length,
        spots_remaining: Math.max(0, shift.max_volunteers - activeSignups.length),
        fill_percentage: Math.round((activeSignups.length / shift.max_volunteers) * 100),
        urgency_level: this.calculateUrgencyLevel(activeSignups.length, shift.max_volunteers)
      }

      return { data: stats, error: null }
    } catch (error) {
      return { error }
    }
  },

  // 🎯 NOUVEAU: Calculer le niveau d'urgence d'un shift
  calculateUrgencyLevel(assigned: number, maxVolunteers: number): 'low' | 'medium' | 'high' | 'critical' {
    const fillRate = assigned / maxVolunteers
    
    if (fillRate >= 1) return 'low'      // Complet
    if (fillRate >= 0.75) return 'low'    // 75%+
    if (fillRate >= 0.5) return 'medium'  // 50-74%
    if (fillRate >= 0.25) return 'high'   // 25-49%
    return 'critical'                      // Moins de 25%
  },

  // 🎯 NOUVEAU: Obtenir tous les shifts avec leurs affectations (pour vue organisateur)
  async getShiftsWithAssignments(eventId: string): Promise<{
    data?: ShiftWithVolunteers[];
    error?: any;
  }> {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer_signups (
          id,
          volunteer_id,
          status,
          signed_up_at,
          checked_in_at,
          volunteer:users!volunteer_signups_volunteer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('event_id', eventId)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    // Filtrer les inscriptions non-annulées pour le comptage
    const processedData = data?.map(shift => ({
      ...shift,
      volunteer_signups: shift.volunteer_signups?.filter((signup: any) => signup.status !== 'cancelled') || []
    }))

    return { data: processedData, error }
  },

  // 🎯 NOUVEAU: Retirer un bénévole d'un shift
  async removeVolunteerFromShift(signupId: string, removedBy?: string): Promise<{
    data?: any;
    error?: any;
  }> {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        // Optionnel : ajouter qui a retiré le bénévole
        // removed_by: removedBy
      })
      .eq('id', signupId)
      .select()
      .single()

    return { data, error }
  },

  // 🎯 NOUVEAU: Marquer un bénévole comme confirmé
  async confirmVolunteer(signupId: string, confirmedBy?: string): Promise<{
    data?: any;
    error?: any;
  }> {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        // confirmed_by: confirmedBy
      })
      .eq('id', signupId)
      .select()
      .single()

    return { data, error }
  },

  // Récupérer un shift spécifique
  async getShift(shiftId: string) {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer_signups (
          id,
          volunteer_id,
          status,
          signed_up_at,
          checked_in_at,
          volunteer:users!volunteer_signups_volunteer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('id', shiftId)
      .single()

    return { data, error }
  },

  // Créer un nouveau shift
  async createShift(shiftData: any) {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .insert(shiftData)
      .select()
      .single()

    return { data, error }
  },

  // Mettre à jour un shift
  async updateShift(shiftId: string, updates: any) {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .update(updates)
      .eq('id', shiftId)
      .select()
      .single()

    return { data, error }
  },

  // 🎯 NOUVEAUTÉ: Fonction pour vérifier les conflits d'horaires
  async checkOverlapConflicts(shiftId: string, volunteerId: string, eventId: string) {
    try {
      // Récupérer le shift cible
      const { data: targetShift, error: shiftError } = await supabase
        .from('volunteer_shifts')
        .select('*')
        .eq('id', shiftId)
        .single()

      if (shiftError) return { error: shiftError }

      // Récupérer les inscriptions actives du bénévole pour la même date
      const { data: existingSignups, error: signupsError } = await supabase
        .from('volunteer_signups')
        .select(`
          *,
          volunteer_shifts (
            id,
            title,
            shift_date,
            start_time,
            end_time
          )
        `)
        .eq('volunteer_id', volunteerId)
        .eq('event_id', eventId)
        .neq('status', 'cancelled')

      if (signupsError) return { error: signupsError }

      // Filtrer les shifts du même jour
      const sameDaySignups = existingSignups?.filter(signup => 
        signup.volunteer_shifts?.shift_date === targetShift.shift_date
      ) || []

      // Vérifier les chevauchements
      const conflicts: OverlapConflict[] = []
      for (const signup of sameDaySignups) {
        const existingShift = signup.volunteer_shifts
        if (!existingShift) continue

        // Convertir les heures en minutes pour la comparaison
        const targetStart = this.timeToMinutes(targetShift.start_time)
        const targetEnd = this.timeToMinutes(targetShift.end_time)
        const existingStart = this.timeToMinutes(existingShift.start_time)
        const existingEnd = this.timeToMinutes(existingShift.end_time)

        // Vérifier le chevauchement
        const hasOverlap = targetStart < existingEnd && targetEnd > existingStart

        if (hasOverlap) {
          const overlapType: 'complete' | 'partial' = (targetStart >= existingStart && targetEnd <= existingEnd) || 
                             (existingStart >= targetStart && existingEnd <= targetEnd) 
                             ? 'complete' : 'partial'

          conflicts.push({
            conflictingShift: existingShift,
            conflictingSignup: signup,
            overlapType,
            overlapStart: Math.max(targetStart, existingStart),
            overlapEnd: Math.min(targetEnd, existingEnd)
          })
        }
      }

      return { data: { conflicts, targetShift }, error: null }

    } catch (error) {
      return { error }
    }
  },

  // 🎯 NOUVEAUTÉ: Fonction utilitaire pour convertir l'heure en minutes
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  },

  // 🎯 NOUVEAUTÉ: S'inscrire à un shift avec vérification des conflits
  async signUpForShift(shiftId: string, volunteerId: string, eventId: string, forceSignup: boolean = false) {
    try {
      // 🎯 NOUVEAUTÉ: Vérifier les conflits d'horaires d'abord
      if (!forceSignup) {
        const { data: conflictCheck, error: conflictError } = await this.checkOverlapConflicts(shiftId, volunteerId, eventId)
        
        if (conflictError) return { error: conflictError }
        
        if (conflictCheck && conflictCheck.conflicts.length > 0) {
          return { 
            error: { 
              type: 'OVERLAP_CONFLICT',
              message: 'Des conflits d\'horaires ont été détectés',
              conflicts: conflictCheck.conflicts
            }
          }
        }
      }

      // Vérifier que le shift n'est pas plein
      const { data: shift, error: shiftError } = await supabase
        .from('volunteer_shifts')
        .select('current_volunteers, max_volunteers, status')
        .eq('id', shiftId)
        .single()

      if (shiftError) return { error: shiftError }
      
      if (shift?.status !== 'live') {
        return { error: { message: 'Ce créneau n\'est pas disponible' } }
      }

      if (shift && shift.current_volunteers >= shift.max_volunteers) {
        return { error: { message: 'Ce créneau est complet' } }
      }

      // Vérifier que le bénévole n'est pas déjà inscrit
      const { data: existingSignup } = await supabase
        .from('volunteer_signups')
        .select('id')
        .eq('shift_id', shiftId)
        .eq('volunteer_id', volunteerId)
        .neq('status', 'cancelled')
        .single()

      if (existingSignup) {
        return { error: { message: 'Vous êtes déjà inscrit à ce créneau' } }
      }

      // Créer l'inscription
      const { data, error } = await supabase
        .from('volunteer_signups')
        .insert({
          shift_id: shiftId,
          volunteer_id: volunteerId,
          event_id: eventId,
          status: 'signed_up',
          qr_code: `QR_${shiftId}_${volunteerId}_${Date.now()}`,
          reminder_sent: false
        })
        .select()
        .single()

      return { data, error }

    } catch (error) {
      return { error }
    }
  },

  // 🎯 NOUVEAUTÉ: S'inscrire en forçant malgré les conflits
  async forceSignUpForShift(shiftId: string, volunteerId: string, eventId: string) {
    return this.signUpForShift(shiftId, volunteerId, eventId, true)
  },

  // Annuler une inscription
  async cancelSignup(signupId: string) {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', signupId)
      .select()
      .single()

    return { data, error }
  },

  // Check-in manuel
  async checkIn(signupId: string, checkInBy?: string, method: 'manual' | 'qr_scan' = 'manual', notes?: string) {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        check_in_method: method,
        check_in_by: checkInBy || null,
        check_in_notes: notes || null
      })
      .eq('id', signupId)
      .select()
      .single()

    return { data, error }
  },

  // Récupérer les inscriptions d'un bénévole - FIXED
  async getVolunteerSignups(volunteerId: string, eventId?: string) {
    let query = supabase
      .from('volunteer_signups')
      .select(`
        *,
        volunteer_shifts (
          id,
          title,
          description,
          shift_date,
          start_time,
          end_time,
          role_type,
          emergency_contact_name,
          emergency_contact_phone
        )
      `)
      .eq('volunteer_id', volunteerId)
      .neq('status', 'cancelled')
      .order('signed_up_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    return { data, error }
  },

  // Récupérer les statistiques d'un bénévole
  async getVolunteerStats(volunteerId: string, eventId: string) {
    const { data: signups, error } = await supabase
      .from('volunteer_signups')
      .select(`
        status,
        volunteer_shifts (
          start_time,
          end_time
        )
      `)
      .eq('volunteer_id', volunteerId)
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    if (error) return { error }

    // Calculer les heures
    let totalHours = 0
    let completedHours = 0
    let upcomingShifts = 0
    let completedShifts = 0

    signups?.forEach(signup => {
      if (signup.volunteer_shifts && Array.isArray(signup.volunteer_shifts)) {
        signup.volunteer_shifts.forEach(shift => {
          const startTime = new Date(`2000-01-01 ${shift.start_time}`)
          const endTime = new Date(`2000-01-01 ${shift.end_time}`)
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          
          totalHours += hours
          
          if (signup.status === 'checked_in') {
            completedHours += hours
            completedShifts++
          } else {
            upcomingShifts++
          }
        })
      } else if (signup.volunteer_shifts) {
        // Si c'est un objet unique (cas alternatif)
        const shift = signup.volunteer_shifts as any
        const startTime = new Date(`2000-01-01 ${shift.start_time}`)
        const endTime = new Date(`2000-01-01 ${shift.end_time}`)
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        
        totalHours += hours
        
        if (signup.status === 'checked_in') {
          completedHours += hours
          completedShifts++
        } else {
          upcomingShifts++
        }
      }
    })

    return {
      data: {
        totalHours,
        completedHours,
        upcomingShifts,
        completedShifts,
        totalSignups: signups?.length || 0
      },
      error: null
    }
  },

  // Mettre à jour une inscription existante
  async updateSignup(signupId: string, updates: any) {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .update(updates)
      .eq('id', signupId)
      .select()
      .single()

    return { data, error }
  },

  // Récupérer tous les bénévoles pour un événement (pour organisateurs) - FIXED
  async getEventVolunteers(eventId: string) {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .select(`
        volunteer_id,
        status,
        volunteer:users!volunteer_signups_volunteer_id_fkey (
          id,
          full_name,
          email,
          phone,
          role
        ),
        volunteer_shifts (
          id,
          title,
          shift_date,
          start_time,
          end_time
        )
      `)
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    return { data, error }
  }
}