// src/types/PerformanceTeam.ts - VERSION COMPLÈTE AVEC NOTATION TECH REHEARSAL
export interface PerformanceTeam {
  id: string;
  event_id: string;
  
  // Informations équipe
  team_name: string;
  director_name: string;
  director_email: string;
  director_phone?: string | null;
  studio_name?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  
  // Statut et workflow
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  
  // Performance
  performance_video_url?: string | null;
  music_file_url?: string | null;
  music_file_name?: string | null;
  song_title?: string | null;
  song_artist?: string | null;
  group_size: number;
  dance_styles?: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null;
  performance_order?: number | null;
  performance_duration?: number | null;
  
  // Média
  team_photo_url?: string | null;
  
  // Métadonnées
  backup_team?: boolean;
  instagram?: string | null;
  website_url?: string | null;
  
  // Système
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // ⭐ NOUVEAU: Notation Tech Rehearsal (visible uniquement organisateurs)
  tech_rehearsal_rating?: {
    // 3 champs personnalisables 5 étoiles
    rating_1: number;           // 0-5 étoiles
    rating_1_label: string;     // Ex: "Wow Factor", "Technical Quality", etc.
    rating_2: number;           // 0-5 étoiles  
    rating_2_label: string;     // Ex: "Stage Presence", "Music Problems", etc.
    rating_3: number;           // 0-5 étoiles
    rating_3_label: string;     // Ex: "Choreography", "Costume/Lighting", etc.
    
    // Métadonnées de notation
    comments?: string;          // Commentaires organisateur
    rated_by?: string;          // ID/nom organisateur qui a noté
    rated_at?: string;          // Timestamp notation
    updated_by?: string;        // Dernière modification par
    updated_at?: string;        // Dernière modification quand
  } | null;
  
  // Scoring existant (pour compatibilité)
  scoring?: {
    technical_score?: number;
    wow_factor?: number;
    wow_factor_score?: number;
    size_score?: number;
    group_size_score?: number;
    variety_bonus?: number;
    style_variety_bonus?: number;
    total_score?: number;
  } | null;
  
  organizer_notes?: string | null;
  rejection_reason?: string | null;
  
  // Permissions et deadlines
  can_edit_until?: string | null;
  
  // Timestamps workflow
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
}

// ⭐ NOUVEAUX TYPES pour la notation tech rehearsal
export interface TechRehearsalRating {
  rating_1: number;
  rating_1_label: string;
  rating_2: number;
  rating_2_label: string;
  rating_3: number;
  rating_3_label: string;
  comments?: string;
  rated_by?: string;
  rated_at?: string;
  updated_by?: string;
  updated_at?: string;
}

// Interface pour les labels par défaut (personnalisables)
export interface RatingLabelsConfig {
  rating_1_label: string;
  rating_2_label: string;
  rating_3_label: string;
}

// Labels par défaut suggérés
export const DEFAULT_RATING_LABELS: RatingLabelsConfig = {
  rating_1_label: "Wow Factor",
  rating_2_label: "Technical Quality", 
  rating_3_label: "Stage Presence"
};

// Types existants
export type TeamStatus = PerformanceTeam['status'];
export type TeamLevel = PerformanceTeam['performance_level'];

export interface TeamStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface TeamFilters {
  status?: TeamStatus;
  level?: TeamLevel;
  hasMusic?: boolean;
  hasVideo?: boolean;
  hasPhoto?: boolean;
  hasRating?: boolean;  // ⭐ NOUVEAU filtre pour les équipes notées
  city?: string;
  country?: string;
  searchTerm?: string;
}

export type TeamSortBy = 
  | 'name' 
  | 'status' 
  | 'created' 
  | 'submitted' 
  | 'city' 
  | 'group_size'
  | 'performance_order'
  | 'rating_average';  // ⭐ NOUVEAU tri par note moyenne

export interface BulkTeamAction {
  action: 'approve' | 'reject' | 'export' | 'delete';
  teamIds: string[];
  reason?: string;
}

export interface TeamExportData {
  teams: PerformanceTeam[];
  eventName: string;
  exportDate: string;
  totalTeams: number;
  stats: TeamStats;
  includeRatings?: boolean;  // ⭐ NOUVEAU: inclure les notes dans l'export
}