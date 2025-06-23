// src/components/teams/TeamCardHorizontal.tsx - VERSION AVEC TRADUCTIONS FONCTIONNELLES
import React from 'react';
import { 
  Music, 
  Users, 
  MapPin, 
  Star,
  Edit,
  Eye,
  Send,
  CheckCircle,
  X,
  Play,
  Calendar,
  Mail,
  Phone,
  Building2,
  User
} from 'lucide-react';
import { PerformanceTeam } from '../../types/PerformanceTeam';

// Import du système de traduction
import { useTranslation, type Language, DEFAULT_LANGUAGE } from '../../locales';

interface TeamCardHorizontalProps {
  team: PerformanceTeam;
  currentUser: any;
  translate: (key: string) => string;
  currentLanguage?: Language; // ← AJOUT DU PROP LANGUE
  onEdit?: () => void;
  onView?: () => void;
  onSubmit?: () => void;
  uploadingMusic?: boolean;
  uploadingPhoto?: boolean;
}

export const TeamCardHorizontal: React.FC<TeamCardHorizontalProps> = ({
  team,
  currentUser,
  translate,
  currentLanguage = DEFAULT_LANGUAGE, // ← VALEUR PAR DÉFAUT
  onEdit,
  onView,
  onSubmit,
  uploadingMusic,
  uploadingPhoto
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

  const isOwner = team.created_by === currentUser?.id;
  const canEdit = isOwner && team.status !== 'approved' && team.status !== 'rejected';
  const canSubmit = isOwner && team.status === 'draft';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'submitted': return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
      case 'approved': return 'bg-green-400/20 text-green-300 border-green-400/30';
      case 'rejected': return 'bg-red-400/20 text-red-300 border-red-400/30';
      case 'completed': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const translateStatus = (status: string) => {
    return safeTranslate(status, status);
  };

  const calculateCompletionPercentage = () => {
    const requiredFields = [
      team.team_name,
      team.director_name,
      team.director_email,
      team.city,
      team.country,
      team.group_size
    ];
    
    const optionalFields = [
      team.director_phone,
      team.studio_name,
      team.state,
      team.music_file_url,
      team.performance_video_url,
      team.dance_styles && team.dance_styles.length > 0,
      team.performance_level,
      team.team_photo_url,
      team.instagram,
      team.website_url
    ];
    
    const requiredCompleted = requiredFields.filter(Boolean).length;
    const optionalCompleted = optionalFields.filter(Boolean).length;
    
    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = requiredCompleted + optionalCompleted;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-md to-violet-600/80 backdrop-blur-md rounded-4xl shadow-2xl border border-purple-600/30 p-10 hover:shadow-purple-500/20 hover:border-purple-400/40 transition-all duration-500 transform hover:scale-[1.02]">
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/5 to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header avec titre et statut */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            {/* Photo d'équipe */}
            {team.team_photo_url ? (
              <div className="relative">
                <img
                  src={team.team_photo_url}
                  alt={team.team_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400/50 shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-2xl"></div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/40 to-pink-500/40 border-2 border-purple-400/50 flex items-center justify-center shadow-xl backdrop-blur-sm">
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            )}
            
            {/* Titre et statut */}
            <div>
              <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
                {team.team_name}
              </h2>
              <span className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-sm ${getStatusColor(team.status)}`}>
                {translateStatus(team.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Barre de progression pleine largeur */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-purple-200 uppercase tracking-wide font-medium">
              {safeTranslate('progress', 'Progress')}
            </span>
            <span className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
              {calculateCompletionPercentage()}%
            </span>
          </div>
          <div className="w-full bg-purple-900/60 rounded-full h-4 overflow-hidden border border-purple-600/30">
            <div 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 h-4 rounded-full transition-all duration-1000 shadow-lg shadow-purple-400/30"
              style={{ width: `${calculateCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Informations principales en grille compacte */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-300" />
              <div className="text-xs text-purple-200 uppercase tracking-wide">
                {safeTranslate('director', 'Director')}
              </div>
            </div>
            <div className="font-semibold text-white text-sm">{team.director_name}</div>
          </div>
          
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-purple-300" />
              <div className="text-xs text-purple-200 uppercase tracking-wide">Email</div>
            </div>
            <div className="font-semibold text-white text-sm truncate">{team.director_email}</div>
          </div>
          
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-300" />
              <div className="text-xs text-purple-200 uppercase tracking-wide">
                {safeTranslate('location', 'Location')}
              </div>
            </div>
            <div className="font-semibold text-white text-sm">
              {team.city}{team.country && `, ${team.country}`}
            </div>
          </div>
          
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-300" />
              <div className="text-xs text-purple-200 uppercase tracking-wide">
                {safeTranslate('size', 'Size')}
              </div>
            </div>
            <div className="font-semibold text-white text-sm">
              {team.group_size} {safeTranslate('members', 'members')}
            </div>
          </div>
        </div>

        {/* Performance et Médias côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Performance */}
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              🎭 <span className="bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">
                {safeTranslate('performance', 'Performance')}
              </span>
            </h3>
            
            {/* Styles */}
            {team.dance_styles && team.dance_styles.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-purple-200 uppercase tracking-wide mb-2">
                  {safeTranslate('styles', 'Styles')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.dance_styles.map((style, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-violet-500/30 text-purple-200 rounded-full text-sm font-medium border border-purple-400/30 backdrop-blur-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Niveau */}
            {team.performance_level && (
              <div>
                <div className="text-xs text-purple-200 uppercase tracking-wide mb-2">
                  {safeTranslate('level', 'Level')}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-300" />
                  <span className="px-3 py-1 bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-200 rounded-full text-sm font-medium border border-violet-400/30 backdrop-blur-sm">
                    {safeTranslate(team.performance_level, team.performance_level)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Médias */}
          <div className="bg-purple-700/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              📁 <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                {safeTranslate('media', 'Media')}
              </span>
            </h3>
            
            {/* Musique */}
            <div className="mb-4">
              <div className="text-xs text-purple-200 uppercase tracking-wide mb-2">
                {safeTranslate('music', 'Music')}
              </div>
              <div className="flex items-center justify-between bg-purple-800/30 rounded-xl p-3 border border-purple-600/20">
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-purple-300" />
                  <span className={`text-sm font-medium ${team.music_file_url ? 'text-white' : 'text-purple-400'}`}>
                    {team.music_file_url ? 
                      (team.music_file_name || team.song_title || safeTranslate('musicFile', 'Music file')) : 
                      safeTranslate('noFile', 'No file')
                    }
                  </span>
                </div>
                {team.music_file_url && <CheckCircle className="w-4 h-4 text-purple-300" />}
              </div>
            </div>
            
            {/* Vidéo */}
            <div>
              <div className="text-xs text-purple-200 uppercase tracking-wide mb-2">
                {safeTranslate('video', 'Video')}
              </div>
              <div className="flex items-center justify-between bg-purple-800/30 rounded-xl p-3 border border-purple-600/20">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-purple-300" />
                  <span className={`text-sm font-medium ${team.performance_video_url ? 'text-white' : 'text-purple-400'}`}>
                    {team.performance_video_url ? 
                      safeTranslate('videoUploaded', 'Video uploaded') : 
                      safeTranslate('noVideo', 'No video')
                    }
                  </span>
                </div>
                {team.performance_video_url && <CheckCircle className="w-4 h-4 text-purple-300" />}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          
          {/* Voir détails */}
          <button
            onClick={onView}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/60 to-violet-600/60 hover:from-purple-500/70 hover:to-violet-500/70 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-purple-400/40 hover:border-purple-300/60 transform hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            {safeTranslate('viewDetails', 'View details')}
          </button>

          {/* Éditer */}
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600/60 to-purple-600/60 hover:from-violet-500/70 hover:to-purple-500/70 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-violet-400/40 hover:border-violet-300/60 transform hover:scale-105"
            >
              <Edit className="w-4 h-4" />
              {safeTranslate('edit', 'Edit')}
            </button>
          )}

          {/* Soumettre */}
          {canSubmit && onSubmit && (
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/70 to-violet-500/70 hover:from-purple-400/80 hover:to-violet-400/80 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-purple-400/40 hover:border-purple-300/60 transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              <Send className="w-4 h-4" />
              {safeTranslate('submit', 'Submit')}
            </button>
          )}
        </div>

        {/* États de chargement */}
        {(uploadingMusic || uploadingPhoto) && (
          <div className="mt-6 p-4 bg-purple-500/20 border border-purple-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-purple-200 text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-200"></div>
              <span className="font-medium">
                {uploadingMusic && safeTranslate('uploadingMusic', 'Uploading music...')}
                {uploadingPhoto && safeTranslate('uploadingPhoto', 'Uploading photo...')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};