// src/components/teams/TeamCard.tsx - VERSION AVEC TRADUCTIONS FONCTIONNELLES
import React from 'react';
import { 
  Music, 
  CheckCircle, 
  Play, 
  Users, 
  MapPin, 
  Star,
  Edit,
  Eye,
  Send,
  X,
  Download
} from 'lucide-react';
import { PerformanceTeam } from '../../types/PerformanceTeam';

// Import du système de traduction
import { useTranslation, type Language, DEFAULT_LANGUAGE } from '../../locales';

interface TeamCardProps {
  team: PerformanceTeam;
  translate: (key: string, params?: Record<string, string | number>) => string;
  currentUser: any;
  currentLanguage?: Language; // ← AJOUT DU PROP LANGUE
  uploadingMusic?: string | null;
  uploadingPhoto?: string | null;
  onEdit?: (team: PerformanceTeam) => void;
  onView?: (team: PerformanceTeam) => void;
  onDetails?: (team: PerformanceTeam) => void; // Alias pour onView
  onSubmit?: (teamId: string) => void;
  onApprove?: (teamId: string) => void;
  onReject?: (teamId: string) => void;
  onMarkCompleted?: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  translate,
  currentUser,
  currentLanguage = DEFAULT_LANGUAGE, // ← VALEUR PAR DÉFAUT
  uploadingMusic,
  uploadingPhoto,
  onEdit,
  onView,
  onDetails,
  onSubmit,
  onApprove,
  onReject,
  onMarkCompleted
}) => {
  // 🌐 SYSTÈME DE TRADUCTION LOCAL
  const { translate: t } = useTranslation(currentLanguage);

  // Fonction helper pour les traductions sécurisées
  const safeTranslate = (key: string, fallbackEn: string = key): string => {
    try {
      // Utiliser la fonction translate du hook useTranslation
      const translation = t(key);
      if (translation && translation !== key) {
        return translation;
      }
      
      // Fallback vers la fonction translate personnalisée
      try {
        const customTranslation = translate(key);
        if (customTranslation && customTranslation !== key) {
          return customTranslation;
        }
      } catch (e) {
        // Ignore les erreurs de la fonction translate personnalisée
      }
      
      // Dernier fallback - utiliser l'anglais par défaut pour BSF
      return fallbackEn;
    } catch (e) {
      return fallbackEn;
    }
  };

  const isOrganizer = currentUser?.role === 'organizer' || currentUser?.role === 'admin';
  const canEdit = team.created_by === currentUser?.id && team.status !== 'approved';

  // Gérer onView et onDetails (même fonction)
  const handleViewDetails = onView || onDetails;

  // ✅ LOGIQUE CORRECTE D'AFFICHAGE MUSICAL
  const getMusicDisplayInfo = () => {
    if (!team.music_file_url) {
      return {
        displayName: safeTranslate('noMusicFile', 'No music file'),
        hasFile: false,
        isRenamed: false,
        originalTitle: null
      };
    }

    const hasRenamedFile = !!team.music_file_name;
    const displayName = team.music_file_name || team.song_title || safeTranslate('musicFile', 'Music file');
    
    return {
      displayName,
      hasFile: true,
      isRenamed: hasRenamedFile,
      originalTitle: hasRenamedFile && team.song_title && team.song_title !== team.music_file_name ? team.song_title : null
    };
  };

  const musicInfo = getMusicDisplayInfo();

  // Couleurs du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Calcul du pourcentage de complétion
  const calculateCompletionPercentage = (team: PerformanceTeam): number => {
    const requiredFields = [
      team.team_name,
      team.director_name,
      team.director_email,
      team.city,
      team.music_file_url,
      team.team_photo_url
    ];
    
    const optionalFields = [
      team.studio_name,
      team.performance_video_url,
      team.dance_styles && team.dance_styles.length > 0,
      team.performance_level
    ];
    
    const requiredCompleted = requiredFields.filter(Boolean).length;
    const optionalCompleted = optionalFields.filter(Boolean).length;
    
    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = requiredCompleted + optionalCompleted;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 hover:border-purple-500/30 transition-all duration-300">
      
      {/* Header avec photo et titre */}
      <div className="flex items-start gap-4 mb-6">
        {team.team_photo_url ? (
          <img
            src={team.team_photo_url}
            alt={team.team_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white truncate">{team.team_name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(team.status)}`}>
              {safeTranslate(team.status, team.status)}
            </span>
          </div>
          
          <div className="text-gray-300 text-sm space-y-1">
            <p><strong>{safeTranslate('directorName', 'Director')}:</strong> {team.director_name}</p>
            {team.studio_name && (
              <p><strong>{safeTranslate('studioName', 'Studio')}:</strong> {team.studio_name}</p>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{team.city}{team.state && `, ${team.state}`}{team.country && `, ${team.country}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{team.group_size} {safeTranslate('members', 'members')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles de danse */}
      {team.dance_styles && team.dance_styles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {team.dance_styles.slice(0, 3).map((style, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
            >
              {style}
            </span>
          ))}
          {team.dance_styles.length > 3 && (
            <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-400 text-sm">
              +{team.dance_styles.length - 3}
            </span>
          )}
          {team.performance_level && (
            <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              {safeTranslate(team.performance_level, team.performance_level)}
            </span>
          )}
        </div>
      )}

      {/* Fichier musical - VERSION SIMPLIFIÉE */}
      {musicInfo.hasFile ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-green-400" />
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div className="flex-1 min-w-0">
              <span className="text-green-400 font-medium truncate">
                {musicInfo.displayName}
              </span>
            </div>
            {isOrganizer && team.music_file_url && (
              <div className="flex items-center gap-2">
                <a
                  href={team.music_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
                  title={safeTranslate('playMusic', 'Play music')}
                >
                  <Play className="w-4 h-4 text-green-400" />
                </a>
                <a
                  href={team.music_file_url}
                  download={team.music_file_name || `${team.team_name}_music`}
                  className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors"
                  title={safeTranslate('downloadMusic', 'Download music')}
                >
                  <Download className="w-4 h-4 text-blue-400" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
          <X className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{safeTranslate('noMusicFile', 'No music file')}</span>
        </div>
      )}

      {/* Progression */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-300">{safeTranslate('overallProgress', 'Overall progress')}</span>
          <span className="text-purple-400 font-bold">
            {calculateCompletionPercentage(team)}%
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateCompletionPercentage(team)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Voir détails */}
        <button
          onClick={() => handleViewDetails?.(team)}
          className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {safeTranslate('details', 'Details')}
        </button>

        {/* Éditer (si autorisé) */}
        {canEdit && onEdit && (
          <button
            onClick={() => onEdit(team)}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {safeTranslate('edit', 'Edit')}
          </button>
        )}

        {/* Soumettre (pour les brouillons) */}
        {team.status === 'draft' && team.created_by === currentUser?.id && onSubmit && (
          <button
            onClick={() => onSubmit(team.id)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {safeTranslate('submitTeam', 'Submit')}
          </button>
        )}

        {/* Actions organisateur */}
        {isOrganizer && team.status === 'submitted' && (
          <>
            <button
              onClick={() => onApprove?.(team.id)}
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-3 py-2 rounded-xl font-medium transition-all duration-200"
            >
              ✅ {safeTranslate('approve', 'Approve')}
            </button>
            <button
              onClick={() => onReject?.(team.id)}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-3 py-2 rounded-xl font-medium transition-all duration-200"
            >
              ❌ {safeTranslate('reject', 'Reject')}
            </button>
          </>
        )}

        {/* Marquer comme complété */}
        {isOrganizer && team.status === 'approved' && onMarkCompleted && (
          <button
            onClick={() => onMarkCompleted(team.id)}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-xl font-medium transition-all duration-200"
          >
            🎯 {safeTranslate('markAsCompleted', 'Mark as completed')}
          </button>
        )}
      </div>

      {/* États de chargement */}
      {(uploadingMusic || uploadingPhoto) && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-3 text-blue-300 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
            <span className="font-medium">
              {uploadingMusic && safeTranslate('uploadingMusic', 'Uploading music...')}
              {uploadingPhoto && safeTranslate('uploadingPhoto', 'Uploading photo...')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};