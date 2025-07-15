// src/types/PerformanceTeam.ts - AJOUT DE DEFAULT_RATING_LABELS

export interface PerformanceTeam {
  id: string;
  event_id: string;
  
  // =====================================
  // 👔 TEAM DIRECTOR (gestionnaire/organisateur de l'équipe)
  // =====================================
  team_name: string;
  director_name: string;        // ← Directeur = gestionnaire (pas forcément performer)
  director_email: string;
  director_phone?: string | null;
  studio_name?: string | null;
  
  // Localisation
  city: string;
  state?: string | null;
  country?: string | null;
  
  // =====================================
  // 💃 PERFORMANCE INFO (concerne les performers)
  // =====================================
  group_size: number;           // ← Nombre de PERFORMERS (exclu le directeur)
  performers?: Performer[];     // ← Liste des performers actuels
  dance_styles?: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null;
  
  // Médias de la performance
  performance_video_url?: string | null;
  music_file_url?: string | null;
  music_file_name?: string | null;
  song_title?: string | null;
  song_artist?: string | null;
  team_photo_url?: string | null;
  
  // Autres champs...
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  backup_team?: boolean;
  instagram?: string | null;
  website_url?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Tech rehearsal rating, etc.
  tech_rehearsal_rating?: TechRehearsalRating | null;
  organizer_notes?: string | null;
  rejection_reason?: string | null;
  can_edit_until?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
}

// =====================================
// 💃 PERFORMER (danseur/danseuse individuel)
// =====================================
export interface Performer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;                // Ex: "Lead", "Follow", "Soloist", etc.
  is_team_director?: boolean;   // ← Indique si ce performer est AUSSI directeur
  profile_image?: string;
  bio?: string;
  experience_years?: number;
  specialties?: string[];
  created_at?: string;
  updated_at?: string;
}

// =====================================
// 🎯 TECH REHEARSAL RATING
// =====================================
export interface TechRehearsalRating {
  rating_1?: number;
  rating_1_label?: string;
  rating_2?: number;
  rating_2_label?: string;
  rating_3?: number;
  rating_3_label?: string;
  comments?: string;
  rated_by?: string;
  rated_at?: string;
  updated_by?: string;
  updated_at?: string;
}

// =====================================
// 🎯 HELPERS POUR LA LOGIQUE CORRIGÉE
// =====================================

/**
 * Calcule les statistiques de complétion des performers
 * (séparé de la logique Team Director)
 */
export interface PerformerCompletionStats {
  totalPerformers: number;       // Nombre attendu de performers
  completedPerformers: number;   // Nombre de performers avec infos complètes
  missingPerformers: number;     // Nombre de performers manquants
  percentage: number;            // Pourcentage de complétion
  missingFields: string[];       // Champs manquants par performer
}

/**
 * Calcule la complétion des informations performers
 */
export const calculatePerformerCompletion = (
  team: PerformanceTeam, 
  translate: (key: string) => string
): PerformerCompletionStats => {
  const totalPerformers = team.group_size || 0;
  const currentPerformers = team.performers || [];
  
  // Compter les performers avec infos complètes
  const completedPerformers = currentPerformers.filter(performer => 
    performer.name?.trim() && performer.email?.trim()
  ).length;
  
  const missingPerformers = Math.max(0, totalPerformers - completedPerformers);
  const percentage = totalPerformers > 0 ? Math.round((completedPerformers / totalPerformers) * 100) : 0;
  
  // Identifier les champs manquants
  const missingFields: string[] = [];
  currentPerformers.forEach((performer, index) => {
    if (!performer.name?.trim()) {
      missingFields.push(translate('performerNameRequired').replace('{index}', (index + 1).toString()));
    }
    if (!performer.email?.trim()) {
      missingFields.push(translate('performerEmailRequired').replace('{index}', (index + 1).toString()));
    }
  });
  
  // Ajouter les performers complètement manquants
  for (let i = currentPerformers.length; i < totalPerformers; i++) {
    missingFields.push(translate('performerMissing').replace('{index}', (i + 1).toString()));
  }
  
  return {
    totalPerformers,
    completedPerformers,
    missingPerformers,
    percentage,
    missingFields
  };
};

/**
 * Vérifie si le Team Director est aussi un performer
 */
export const isDirectorAlsoPerformer = (team: PerformanceTeam): boolean => {
  if (!team.performers || !team.director_email) return false;
  
  return team.performers.some(performer => 
    performer.email === team.director_email || performer.is_team_director === true
  );
};

/**
 * Génère la liste des performers avec le directeur inclus si nécessaire
 */
export const getCompletePerformerList = (team: PerformanceTeam): Performer[] => {
  const performers = team.performers || [];
  
  // Si le directeur est aussi un performer, ne pas le dupliquer
  if (isDirectorAlsoPerformer(team)) {
    return performers;
  }
  
  // Sinon, option d'inclure le directeur comme performer séparé
  // (selon les besoins métier - à discuter avec Hernan)
  return performers;
};

/**
 * Valide les informations des performers séparément du directeur
 */
export const validatePerformers = (
  performers: Performer[], 
  expectedCount: number,
  translate: (key: string) => string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérifier le nombre de performers
  if (performers.length < expectedCount) {
    errors.push(
      translate('insufficientPerformers')
        .replace('{current}', performers.length.toString())
        .replace('{expected}', expectedCount.toString())
    );
  }
  
  // Vérifier chaque performer
  performers.forEach((performer, index) => {
    if (!performer.name?.trim()) {
      errors.push(translate('performerNameRequired').replace('{index}', (index + 1).toString()));
    }
    
    if (!performer.email?.trim()) {
      errors.push(translate('performerEmailRequired').replace('{index}', (index + 1).toString()));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(performer.email)) {
      errors.push(translate('performerEmailInvalid').replace('{index}', (index + 1).toString()));
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// =====================================
// 📊 CONSTANTES POUR LES RATINGS
// =====================================
export const DEFAULT_RATING_LABELS = {
  rating_1_label: 'Technique',
  rating_2_label: 'Présence Scénique',
  rating_3_label: 'Créativité'
} as const;

// Valeurs par défaut pour une nouvelle notation
export const DEFAULT_RATING_VALUES: TechRehearsalRating = {
  rating_1: 0,
  rating_1_label: DEFAULT_RATING_LABELS.rating_1_label,
  rating_2: 0,
  rating_2_label: DEFAULT_RATING_LABELS.rating_2_label,
  rating_3: 0,
  rating_3_label: DEFAULT_RATING_LABELS.rating_3_label,
  comments: '',
} as const;

// =====================================
// 🏆 LEGACY SCORING (ancien système)
// =====================================
export interface LegacyScoring {
  technical_score?: number;
  wow_factor?: number;
  wow_factor_score?: number;
  size_score?: number;
  group_size_score?: number;
  variety_bonus?: number;
  style_variety_bonus?: number;
  total_score?: number;
}

// =====================================
// 🎭 TYPES UTILITAIRES
// =====================================
export type TeamStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
export type PerformanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

// Fonction helper pour calculer la moyenne des ratings
export const calculateAverageRating = (rating: TechRehearsalRating): number => {
  if (!rating) return 0;
  
  const { rating_1, rating_2, rating_3 } = rating;
  const validRatings = [rating_1, rating_2, rating_3].filter((r): r is number => r !== undefined && r > 0);
  
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
};

// Fonction helper pour vérifier si une équipe a des ratings
export const hasRating = (team: PerformanceTeam): boolean => {
  if (!team.tech_rehearsal_rating) return false;
  
  const { rating_1, rating_2, rating_3 } = team.tech_rehearsal_rating;
  return Boolean(rating_1 && rating_1 > 0) || Boolean(rating_2 && rating_2 > 0) || Boolean(rating_3 && rating_3 > 0);
};

// Export des constantes de validation
export const VALIDATION_RULES = {
  MIN_GROUP_SIZE: 1,
  MAX_GROUP_SIZE: 50,
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_TEAM_NAME_LENGTH: 100,
  MAX_DIRECTOR_NAME_LENGTH: 100,
  MAX_STUDIO_NAME_LENGTH: 100,
  MAX_CITY_LENGTH: 50,
  MAX_COMMENTS_LENGTH: 1000,
} as const;