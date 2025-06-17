// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { PerformanceTeam } from '../types/PerformanceTeam';
export type { PerformanceTeam };
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types pour notre base de données
export type User = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'organizer' | 'assistant' | 'volunteer' | 'team_director' | 'artist' | 'attendee'
  phone?: string
  profile_image?: string
  bio?: string
  location?: string
  instagram?: string
  website_url?: string
  qr_code?: string
  verified: boolean
  experience_years?: number
  specialties?: string[]
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  location: string
  venue_address?: string
  capacity?: number
  required_volunteer_hours: number
  registration_deadline?: string
  team_submission_deadline?: string
  team_submission_limit: number
  team_performance_duration: number
  website_url?: string
  instagram_handle?: string
  contact_email?: string
  status: 'draft' | 'live' | 'completed' | 'cancelled'
  notifications_enabled: boolean
  allow_team_video_preview: boolean
  scoring_enabled: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type VolunteerShift = {
  id: string
  event_id: string
  title: string
  description?: string
  shift_date: string
  start_time: string
  end_time: string
  max_volunteers: number
  current_volunteers: number
  role_type: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  emergency_contact_id?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  team_restrictions?: string[]
  special_requirements?: string
  status: 'draft' | 'live' | 'full' | 'cancelled'
  check_in_required: boolean
  qr_code_enabled: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type VolunteerSignup = {
  id: string
  shift_id: string
  volunteer_id: string
  event_id: string
  status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled'
  signed_up_at: string
  confirmed_at?: string
  checked_in_at?: string
  cancelled_at?: string
  check_in_method?: string
  check_in_by?: string
  check_in_notes?: string
  reminder_sent: boolean
  reminder_sent_at?: string
  qr_code?: string
  created_at: string
  updated_at: string
}
/*
export type PerformanceTeam = {
  id: string
  event_id: string
  team_name: string
  studio_name?: string
  city: string
  state?: string
  country: string
  director_id?: string
  director_name: string
  director_email: string
  director_phone?: string
  group_size: number
  dance_styles: string[]
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null | undefined;
  performance_video_url?: string
  music_file_url?: string
  song_title?: string
  song_artist?: string
  youtube_links?: string[]
  vimeo_links?: string[]
  additional_documents?: string[]
  performance_order?: number
  performance_duration: number
  backup_team: boolean
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  scoring?: any
  organizer_notes?: string
  rejection_reason?: string
  can_edit_until?: string
  submitted_at?: string
  approved_at?: string
  rejected_at?: string
  created_by: string
  created_at: string
  updated_at: string
}
*/