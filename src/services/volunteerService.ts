// src/services/volunteerService.ts
import { supabase } from '../lib/supabase'
import type { VolunteerShift, VolunteerSignup } from '../lib/supabase'

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

  // S'inscrire à un shift
  async signUpForShift(shiftId: string, volunteerId: string, eventId: string) {
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