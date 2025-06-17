// 📁 src/types/PerformanceTeam.ts
// Créer ce nouveau fichier avec le type unifié

export interface PerformanceTeam {
  id: string;
  event_id: string;
  team_name: string;
  director_name: string;
  director_email: string;
  director_phone?: string | null;
  studio_name?: string | null; // ← Unifié comme optionnel et nullable
  city: string;
  state?: string | null;
  country: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  performance_video_url?: string | null; // ← Unifié avec null
  music_file_url?: string | null;
  song_title?: string | null;
  song_artist?: string | null;
  group_size: number;
  dance_styles: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null | undefined;
  performance_order?: number | null;
  scoring?: {
    group_size_score: number;
    wow_factor_score: number;
    technical_score: number;
    style_variety_bonus: number;
    total_score: number;
  } | null;
  organizer_notes?: string | null;
  rejection_reason?: string | null;
  can_edit_until?: string | null;
  backup_team?: boolean | null;
  instagram?: string | null;
  website_url?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
}
