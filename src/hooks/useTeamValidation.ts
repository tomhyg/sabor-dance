// src/hooks/useTeamValidation.ts
import { useMemo } from 'react';
import { PerformanceTeam } from '../types/PerformanceTeam';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CompletionStatus {
  completed: number;
  total: number;
  isComplete: boolean;
  missing: string[];
  checks: Array<{
    label: string;
    completed: boolean;
    required: boolean;
  }>;
}

export interface TeamPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canUploadFiles: boolean;
}

interface UseTeamValidationProps {
  currentUser: any;
  translate: (key: string) => string;
}

export const useTeamValidation = ({ currentUser, translate }: UseTeamValidationProps) => {
  
  // 🔐 PERMISSIONS UTILISATEUR
  const getUserPermissions = (team: PerformanceTeam): TeamPermissions => {
    const isOrganizer = currentUser?.role === 'organizer' || currentUser?.role === 'admin';
    const isTeamDirector = currentUser?.role === 'team_director';
    const isOwner = team.created_by === currentUser?.id;
    const canEditBasedOnStatus = team.status !== 'approved' && team.status !== 'rejected';

    return {
      canView: true, // Tout le monde peut voir
      canEdit: isOrganizer || (isTeamDirector && isOwner && canEditBasedOnStatus),
      canDelete: isOrganizer || (isTeamDirector && isOwner && team.status === 'draft'),
      canSubmit: isTeamDirector && isOwner && team.status === 'draft',
      canApprove: isOrganizer && team.status === 'submitted',
      canReject: isOrganizer && team.status === 'submitted',
      canUploadFiles: isOrganizer || (isTeamDirector && isOwner && canEditBasedOnStatus),
    };
  };

  // ✅ VALIDATION ÉQUIPE
  const validateTeam = (team: Partial<PerformanceTeam>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Champs obligatoires
    if (!team.team_name?.trim()) {
      errors.push(translate('teamNameRequired'));
    }
    
    if (!team.director_name?.trim()) {
      errors.push(translate('directorNameRequired'));
    }
    
    if (!team.director_email?.trim()) {
      errors.push(translate('directorEmailRequired'));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(team.director_email)) {
      errors.push(translate('invalidEmail'));
    }

    if (!team.city?.trim()) {
      errors.push(translate('cityRequired'));
    }

    // Pays maintenant optionnel - mais au moins ville OU pays requis
    if (!team.city?.trim() && !team.country?.trim()) {
      errors.push(translate('locationRequired'));
    }

    if (!team.group_size || team.group_size < 2) {
      errors.push(translate('groupSizeMinimum'));
    }

    // Validations optionnelles avec warnings
    if (!team.studio_name?.trim()) {
      warnings.push(translate('studioNameRecommended'));
    }

    if (!team.dance_styles?.length) {
      warnings.push(translate('danceStylesRecommended'));
    }

    if (!team.performance_level) {
      warnings.push(translate('performanceLevelRecommended'));
    }

    if (!team.performance_video_url?.trim()) {
      warnings.push(translate('performanceVideoRecommended'));
    }

    if (!team.music_file_url?.trim() && !team.song_title?.trim()) {
      warnings.push(translate('musicFileRecommended'));
    }

    // Validation des réseaux sociaux
    if (team.instagram && !team.instagram.match(/^@?[\w.]+$/)) {
      errors.push(translate('invalidInstagramHandle'));
    }

    if (team.website_url && !team.website_url.match(/^https?:\/\/.+/)) {
      warnings.push(translate('websiteUrlShouldStartWithHttp'));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // 📊 STATUT DE COMPLÉTION
  const getCompletionStatus = (team: PerformanceTeam): CompletionStatus => {
    const checks = [
      {
        label: translate('teamName'),
        completed: !!team.team_name?.trim(),
        required: true
      },
      {
        label: translate('directorInfo'),
        completed: !!(team.director_name?.trim() && team.director_email?.trim()),
        required: true
      },
      {
        label: translate('musicFile'),
        completed: !!(team.music_file_url || team.song_title),
        required: true
      },
      {
        label: translate('teamPhoto'), // ← Nouveau requis
        completed: !!team.team_photo_url,
        required: true
      },
      {
        label: translate('location'),
        completed: !!(team.city?.trim() || team.country?.trim()), // ← Ville OU pays
        required: false // ← Plus obligatoire mais recommandé
      },
      {
        label: translate('studioName'),
        completed: !!team.studio_name?.trim(),
        required: false
      },
      {
        label: translate('danceStyles'),
        completed: !!(team.dance_styles?.length),
        required: false
      },
      {
        label: translate('performanceLevel'),
        completed: !!team.performance_level,
        required: false
      },
      {
        label: translate('performanceVideo'),
        completed: !!team.performance_video_url?.trim(),
        required: false
      }
    ];

    const requiredChecks = checks.filter(c => c.required);
    const completedRequired = requiredChecks.filter(c => c.completed).length;
    const totalCompleted = checks.filter(c => c.completed).length;
    
    const missing = checks
      .filter(c => !c.completed && c.required)
      .map(c => c.label);

    return {
      completed: totalCompleted,
      total: checks.length,
      isComplete: completedRequired === requiredChecks.length,
      missing,
      checks
    };
  };

  // 🎯 PEUT SOUMETTRE
  const canSubmitTeam = (team: PerformanceTeam): { canSubmit: boolean; reason?: string } => {
    const permissions = getUserPermissions(team);
    
    if (!permissions.canSubmit) {
      return { canSubmit: false, reason: translate('noPermissionToSubmit') };
    }

    if (team.status !== 'draft') {
      return { canSubmit: false, reason: translate('teamAlreadySubmitted') };
    }

    const validation = validateTeam(team);
    if (!validation.isValid) {
      return { 
        canSubmit: false, 
        reason: `${translate('validationErrors')}: ${validation.errors.join(', ')}` 
      };
    }

    const completion = getCompletionStatus(team);
    if (!completion.isComplete) {
      return { 
        canSubmit: false, 
        reason: `${translate('missingRequiredFields')}: ${completion.missing.join(', ')}` 
      };
    }

    return { canSubmit: true };
  };

  // 🏷️ TRADUCTION STATUTS
  const translateStatus = (status: PerformanceTeam['status']): string => {
    const statusMap: Record<string, string> = {
      'draft': translate('draft'),
      'submitted': translate('submitted'),
      'approved': translate('approved'),
      'rejected': translate('rejected'),
      'completed': translate('completed') // ← Nouveau statut
    };
    return statusMap[status] || status;
  };

  // 🏷️ TRADUCTION NIVEAUX
  const translateLevel = (level: string): string => {
    const levelMap: Record<string, string> = {
      'beginner': translate('beginner'),
      'intermediate': translate('intermediate'),
      'advanced': translate('advanced'),
      'professional': translate('professional'),
      'pro': translate('professional')
    };
    return levelMap[level] || level;
  };

  // 🏷️ TRADUCTION STYLES DE DANSE
  const translateDanceStyle = (style: string): string => {
    const styleMap: Record<string, string> = {
      'Salsa': translate('salsa'),
      'Bachata': translate('bachata'),
      'Kizomba': translate('kizomba'),
      'Zouk': translate('zouk'),
      'Mambo': translate('mambo'),
      'Cha-cha': translate('chacha'),
      'Merengue': translate('merengue'),
      'Rumba': translate('rumba'),
      'Samba': translate('samba')
    };
    return styleMap[style] || style;
  };

  // 🎨 COULEURS STATUT
  const getStatusColor = (status: PerformanceTeam['status']) => {
    const colorMap = {
      'draft': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'submitted': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'approved': 'bg-green-500/20 text-green-300 border-green-500/30',
      'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
      'completed': 'bg-blue-500/20 text-blue-300 border-blue-500/30' // ← Nouveau statut
    };
    return colorMap[status] || colorMap.draft;
  };

  // 🎨 COULEURS NIVEAU
  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      'beginner': 'bg-green-500/20 text-green-300 border-green-500/30',
      'intermediate': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'advanced': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'pro': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colorMap[level] || 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  };

  return {
    // Permissions
    getUserPermissions,
    
    // Validation
    validateTeam,
    getCompletionStatus,
    canSubmitTeam,
    
    // Traductions
    translateStatus,
    translateLevel,
    translateDanceStyle,
    
    // Styles
    getStatusColor,
    getLevelColor,
  };
};