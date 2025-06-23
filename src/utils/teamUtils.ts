// src/utils/teamUtils.ts - GÉNÉRATION OPTIMISÉE DES NOMS DE FICHIERS
import { PerformanceTeam } from '../types/PerformanceTeam';

/**
 * Génère un nom de fichier standardisé pour les équipes
 * Format: NomStudio-NomEquipe_type.extension
 * Ex: BostonSalsa-FireTeam_music.mp3
 */
export const generateTeamFileName = (
  team: Partial<PerformanceTeam>, 
  file: File, 
  type: 'music' | 'photo'
): string => {
  // Nettoyer les chaînes (supprimer caractères spéciaux et limiter longueur)
  const cleanString = (str: string) => 
    str
      .replace(/[^a-zA-Z0-9\s]/g, '') // Supprimer caractères spéciaux
      .replace(/\s+/g, '') // Supprimer espaces
      .substring(0, 15); // Max 15 caractères pour éviter noms trop longs
  
  // Génerer les parties du nom
  const studio = team.studio_name ? cleanString(team.studio_name) : 'NoStudio';
  const teamName = team.team_name ? cleanString(team.team_name) : 'UnknownTeam';
  const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
  
  // Format final: Studio-Team_type.ext
  return `${studio}-${teamName}_${type}.${extension}`;
};

/**
 * Génère un nom de fichier unique avec timestamp si nécessaire
 */
export const generateUniqueFileName = (
  team: Partial<PerformanceTeam>, 
  file: File, 
  type: 'music' | 'photo'
): string => {
  const baseName = generateTeamFileName(team, file, type);
  
  // Si pas de nom d'équipe ou studio, ajouter timestamp pour éviter conflits
  if (!team.team_name || !team.studio_name) {
    const timestamp = Date.now();
    const [name, ext] = baseName.split('.');
    return `${name}_${timestamp}.${ext}`;
  }
  
  return baseName;
};

/**
 * Génère un aperçu du nom de fichier pour l'interface utilisateur
 */
export const previewFileName = (
  teamName: string = '',
  studioName: string = '',
  originalFileName: string,
  type: 'music' | 'photo'
): string => {
  const cleanString = (str: string) => 
    str.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '').substring(0, 15);
  
  const studio = studioName ? cleanString(studioName) : 'Studio';
  const team = teamName ? cleanString(teamName) : 'Team';
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'file';
  
  return `${studio}-${team}_${type}.${extension}`;
};

/**
 * Valide le type de fichier pour les uploads
 */
export const validateFileType = (file: File, type: 'music' | 'photo'): boolean => {
  const musicTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a'];
  const photoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const allowedTypes = type === 'music' ? musicTypes : photoTypes;
  
  // Vérifier le type MIME ET l'extension
  return allowedTypes.includes(file.type) || 
         (type === 'music' && /\.(mp3|wav|m4a)$/i.test(file.name)) ||
         (type === 'photo' && /\.(jpg|jpeg|png|webp)$/i.test(file.name));
};

/**
 * Valide la taille du fichier
 */
export const validateFileSize = (file: File, type: 'music' | 'photo'): boolean => {
  const maxSizes = {
    music: 50 * 1024 * 1024, // 50MB pour la musique
    photo: 10 * 1024 * 1024   // 10MB pour les photos
  };
  
  return file.size <= maxSizes[type];
};

/**
 * Formate la taille du fichier pour l'affichage
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Détermine si une équipe peut passer au statut "completed"
 */
export const canMarkAsCompleted = (team: PerformanceTeam): { 
  canComplete: boolean; 
  missing: string[] 
} => {
  const required = [
    { field: 'team_name', label: 'Nom équipe' },
    { field: 'director_name', label: 'Nom directeur' },
    { field: 'director_email', label: 'Email directeur' },
    { field: 'music_file_url', label: 'Fichier musical' },
    { field: 'team_photo_url', label: 'Photo équipe' }
  ];
  
  const missing = required
    .filter(req => !team[req.field as keyof PerformanceTeam])
    .map(req => req.label);
  
  return {
    canComplete: missing.length === 0,
    missing
  };
};

/**
 * Calcule le pourcentage de complétion d'une équipe
 */
export const getCompletionPercentage = (team: PerformanceTeam): number => {
  const allFields = [
    'team_name', 'director_name', 'director_email', 'city',
    'studio_name', 'music_file_url', 'team_photo_url', 
    'performance_video_url', 'dance_styles', 'performance_level'
  ];
  
  const completedFields = allFields.filter(field => {
    const value = team[field as keyof PerformanceTeam];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  });
  
  return Math.round((completedFields.length / allFields.length) * 100);
};

/**
 * Génère un aperçu des informations manquantes
 */
export const getMissingFieldsSummary = (team: PerformanceTeam, translate: (key: string) => string): string[] => {
  const missing: string[] = [];
  
  if (!team.team_name) missing.push(translate('teamName'));
  if (!team.director_name) missing.push(translate('directorName'));
  if (!team.director_email) missing.push(translate('directorEmail'));
  if (!team.music_file_url) missing.push(translate('musicFile'));
  if (!team.team_photo_url) missing.push(translate('teamPhoto'));
  if (!team.city && !team.country) missing.push(translate('location'));
  
  return missing;
};

/**
 * Génère le titre de la chanson à partir du nom de fichier
 */
export const generateSongTitleFromFileName = (fileName: string): string => {
  // Supprimer l'extension et nettoyer
  return fileName
    .replace(/\.[^/.]+$/, '') // Supprimer extension
    .replace(/[-_]/g, ' ') // Remplacer - et _ par espaces
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
};

/**
 * Valide les données d'équipe avant soumission
 */
export const validateTeamData = (team: Partial<PerformanceTeam>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Champs obligatoires
  if (!team.team_name?.trim()) errors.push('Nom d\'équipe requis');
  if (!team.director_name?.trim()) errors.push('Nom du directeur requis');
  if (!team.director_email?.trim()) errors.push('Email du directeur requis');
  if (!team.city?.trim()) errors.push('Ville requise');
  
  // Validation email
  if (team.director_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(team.director_email)) {
    errors.push('Format d\'email invalide');
  }
  
  // Validation taille groupe
  if (team.group_size && (team.group_size < 1 || team.group_size > 50)) {
    errors.push('Taille du groupe doit être entre 1 et 50');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Génère un ID unique pour les équipes
 */
export const generateTeamId = (): string => {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formate les styles de danse pour l'affichage
 */
export const formatDanceStyles = (styles: string[]): string => {
  if (!styles || styles.length === 0) return 'Aucun style';
  
  if (styles.length === 1) return styles[0];
  if (styles.length === 2) return styles.join(' et ');
  
  const last = styles[styles.length - 1];
  const others = styles.slice(0, -1);
  
  return `${others.join(', ')} et ${last}`;
};

/**
 * Détermine la couleur du statut pour l'affichage
 */
export const getStatusColor = (status: PerformanceTeam['status']): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors = {
    draft: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      border: 'border-gray-500/30'
    },
    submitted: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30'
    },
    approved: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30'
    },
    rejected: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30'
    },
    completed: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  };
  
  return colors[status];
};