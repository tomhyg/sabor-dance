// src/components/teams/TeamDetailsModal.tsx - VERSION AVEC PERFORMERS
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Music, 
  Play, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Users,
  MapPin,
  Star,
  Instagram,
  Globe,
  Calendar,
  User,
  Award,
  Edit3,
  Save,
  Mail,
  Phone,
  Crown,
  UserCheck
} from 'lucide-react';
import { PerformanceTeam, TechRehearsalRating, DEFAULT_RATING_LABELS } from '../../types/PerformanceTeam';
import { getStatusColor, formatDanceStyles } from '../../utils/teamUtils';
import { teamService, Performer } from '../../services/teamService';

// Import du système de traduction
import { useTranslation, type Language, DEFAULT_LANGUAGE } from '../../locales';

interface TeamDetailsModalProps {
  team: PerformanceTeam;
  translate: (key: string, params?: Record<string, string | number>) => string;
  currentUser: any;
  currentLanguage?: Language;
  onClose: () => void;
  onApprove?: (teamId: string) => void;
  onReject?: (teamId: string) => void;
  onRatingUpdate?: (teamId: string, rating: TechRehearsalRating) => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  team,
  translate,
  currentUser,
  currentLanguage = DEFAULT_LANGUAGE,
  onClose,
  onApprove,
  onReject,
  onRatingUpdate
}) => {
  // 🌐 SYSTÈME DE TRADUCTION LOCAL
  const { translate: t } = useTranslation(currentLanguage);

  // 🎯 NOUVEAUTÉ: État pour les performers
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loadingPerformers, setLoadingPerformers] = useState(true);

  // Fonction helper pour les traductions sécurisées
  const safeTranslate = (key: string, fallbackEn: string = key): string => {
    try {
      const translation = t(key);
      if (translation && translation !== key) {
        return translation;
      }
      
      try {
        const customTranslation = translate(key);
        if (customTranslation && customTranslation !== key) {
          return customTranslation;
        }
      } catch (e) {
        // Ignore les erreurs
      }
      
      return fallbackEn;
    } catch (e) {
      return fallbackEn;
    }
  };

  // 🎯 NOUVEAUTÉ: Charger les performers
  useEffect(() => {
    const loadPerformers = async () => {
      try {
        setLoadingPerformers(true);
        console.log('🔍 Chargement performers pour équipe:', team.id);
        
        const result = await teamService.getTeamWithPerformers(team.id);
        
        if (result.success && result.data?.performers) {
          setPerformers(result.data.performers);
          console.log('✅ Performers chargés:', result.data.performers);
        } else {
          console.log('⚠️ Aucun performer trouvé ou erreur:', result.message);
          setPerformers([]);
        }
      } catch (error) {
        console.error('❌ Erreur chargement performers:', error);
        setPerformers([]);
      } finally {
        setLoadingPerformers(false);
      }
    };

    if (team.id) {
      loadPerformers();
    }
  }, [team.id]);

  const statusColors = getStatusColor(team.status);
  const isOrganizer = currentUser?.role === 'organizer' || currentUser?.role === 'admin';

  // ⭐ ÉTAT POUR LA NOTATION
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [editingRating, setEditingRating] = useState<TechRehearsalRating>({
    rating_1: team.tech_rehearsal_rating?.rating_1 || 0,
    rating_1_label: team.tech_rehearsal_rating?.rating_1_label || DEFAULT_RATING_LABELS.rating_1_label,
    rating_2: team.tech_rehearsal_rating?.rating_2 || 0,
    rating_2_label: team.tech_rehearsal_rating?.rating_2_label || DEFAULT_RATING_LABELS.rating_2_label,
    rating_3: team.tech_rehearsal_rating?.rating_3 || 0,
    rating_3_label: team.tech_rehearsal_rating?.rating_3_label || DEFAULT_RATING_LABELS.rating_3_label,
    comments: team.tech_rehearsal_rating?.comments || '',
  });

  // LOGIQUE DE NOTATION
  const canRate = isOrganizer && (team.status === 'submitted' || team.status === 'approved');
  const hasRating = team.tech_rehearsal_rating && (
    team.tech_rehearsal_rating.rating_1 > 0 || 
    team.tech_rehearsal_rating.rating_2 > 0 || 
    team.tech_rehearsal_rating.rating_3 > 0
  );

  const handleSaveRating = async () => {
    if (onRatingUpdate) {
      const newRating: TechRehearsalRating = {
        ...editingRating,
        rated_by: currentUser?.full_name || currentUser?.email || 'Organisateur',
        rated_at: new Date().toISOString(),
        updated_by: currentUser?.full_name || currentUser?.email || 'Organisateur',
        updated_at: new Date().toISOString()
      };
      onRatingUpdate(team.id, newRating);
    }
    setIsEditingRating(false);
  };

  const handleCancelRating = () => {
    setEditingRating({
      rating_1: team.tech_rehearsal_rating?.rating_1 || 0,
      rating_1_label: team.tech_rehearsal_rating?.rating_1_label || DEFAULT_RATING_LABELS.rating_1_label,
      rating_2: team.tech_rehearsal_rating?.rating_2 || 0,
      rating_2_label: team.tech_rehearsal_rating?.rating_2_label || DEFAULT_RATING_LABELS.rating_2_label,
      rating_3: team.tech_rehearsal_rating?.rating_3 || 0,
      rating_3_label: team.tech_rehearsal_rating?.rating_3_label || DEFAULT_RATING_LABELS.rating_3_label,
      comments: team.tech_rehearsal_rating?.comments || '',
    });
    setIsEditingRating(false);
  };

  // ⭐ COMPOSANT ÉTOILES
  const StarRating: React.FC<{
    rating: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    label: string;
    onLabelChange?: (label: string) => void;
  }> = ({ rating, onChange, readonly = false, label, onLabelChange }) => {
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    return (
      <div className="bg-slate-800/30 rounded-xl p-4">
        {isEditingRating && onLabelChange ? (
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full mb-3 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-medium focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            placeholder={safeTranslate('criteriaName', 'Nom du critère...')}
          />
        ) : (
          <span className="block text-sm font-medium text-gray-300 mb-3">{label}</span>
        )}
        
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={readonly}
              className={`w-8 h-8 transition-all duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              onMouseEnter={!readonly ? () => setHoveredRating(star) : undefined}
              onMouseLeave={!readonly ? () => setHoveredRating(0) : undefined}
              onClick={!readonly && onChange ? () => onChange(star) : undefined}
            >
              <Star
                className={`w-full h-full transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {rating > 0 ? `${rating}/5` : safeTranslate('notRated', 'Non noté')}
        </span>
      </div>
    );
  };

  // 🎯 NOUVEAUTÉ: Composant pour afficher un performer
  const PerformerCard: React.FC<{ performer: Performer; index: number }> = ({ performer, index }) => (
    <div className="bg-gray-800/30 border border-gray-600/20 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
          {performer.is_team_director && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-yellow-900" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">
            {performer.name}
            {performer.is_team_director && (
              <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                {safeTranslate('director', 'Directeur')}
              </span>
            )}
          </h4>
          {performer.role && performer.role !== 'performer' && (
            <p className="text-sm text-gray-400 capitalize">{performer.role}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{performer.email}</span>
        </div>
        {performer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{performer.phone}</span>
          </div>
        )}
      </div>
    </div>
  );

  // INFOS MUSIQUE
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
    const displayName = team.music_file_name || team.song_title || safeTranslate('musicFile', 'Music File');
    
    return {
      displayName,
      hasFile: true,
      isRenamed: hasRenamedFile,
      originalTitle: hasRenamedFile && team.song_title && team.song_title !== team.music_file_name ? team.song_title : null
    };
  };

  const musicInfo = getMusicDisplayInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-3xl max-w-7xl max-h-[95vh] overflow-y-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            {team.team_photo_url ? (
              <img
                src={team.team_photo_url}
                alt={team.team_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-black text-white mb-2">{team.team_name}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                  {safeTranslate(team.status, team.status)}
                </span>
                {team.performance_level && (
                  <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {safeTranslate(team.performance_level, team.performance_level)}
                  </span>
                )}
                {/* 🎯 NOUVEAUTÉ: Badge nombre de performers */}
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {performers.length || team.group_size} {safeTranslate('members', 'membres')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-700/50 border border-gray-600/30 flex items-center justify-center hover:bg-gray-600/50 transition-all duration-200"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          
          {/* Colonne gauche - Informations générales */}
          <div className="space-y-6">
            
            {/* Informations de base */}
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                ℹ️ {safeTranslate('generalInfo', 'Informations générales')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <div>
                    <strong className="text-gray-300">{safeTranslate('director', 'Directeur')}:</strong>
                    <span className="ml-2 text-white">{team.director_name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <div>
                    <strong className="text-gray-300">{safeTranslate('location', 'Localisation')}:</strong>
                    <span className="ml-2 text-white">
                      {[team.city, team.state, team.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>

                {team.studio_name && (
                  <div>
                    <strong className="text-gray-300">{safeTranslate('studio', 'Studio')}:</strong>
                    <span className="ml-2 text-white">{team.studio_name}</span>
                  </div>
                )}

                <div>
                  <strong className="text-gray-300">{safeTranslate('groupSize', 'Taille du groupe')}:</strong>
                  <span className="ml-2 text-white">{team.group_size} {safeTranslate('dancers', 'danseurs')}</span>
                </div>
                
                {/* Styles de danse */}
                {team.dance_styles && team.dance_styles.length > 0 && (
                  <div>
                    <strong className="text-gray-300">{safeTranslate('danceStyles', 'Styles de danse')}:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {team.dance_styles.map((style, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vidéo de performance */}
                {team.performance_video_url && (
                  <div>
                    <strong className="text-gray-300">{safeTranslate('performanceVideo', 'Vidéo de performance')}:</strong>
                    <div className="mt-2">
                      <a 
                        href={team.performance_video_url ?? undefined}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        {safeTranslate('watchVideo', 'Regarder la vidéo')}
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Fichier musical */}
                <div>
                  <strong className="text-gray-300">{safeTranslate('musicFile', 'Fichier musical')}:</strong>
                  <div className="mt-2">
                    {musicInfo.hasFile ? (
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <Music className="w-5 h-5 text-green-400" />
                        <div className="flex-1">
                          <div className="text-green-300 font-medium">
                            {musicInfo.displayName}
                          </div>
                          {musicInfo.originalTitle && (
                            <div className="text-xs text-green-400/70">
                              {safeTranslate('originalTitle', 'Titre original')}: {musicInfo.originalTitle}
                            </div>
                          )}
                        </div>
                        <a
                          href={team.music_file_url ?? undefined}
                          download
                          className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg text-sm transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          {safeTranslate('download', 'Télécharger')}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{safeTranslate('musicFileMissing', 'Fichier musical manquant')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            {(team.instagram || team.website_url) && (
              <div>
                <h3 className="text-xl font-bold text-pink-300 mb-4 flex items-center gap-2">
                  📱 {safeTranslate('socialMedia', 'Réseaux sociaux')}
                </h3>
                <div className="space-y-3">
                  {team.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-400" />
                      <a 
                        href={`https://instagram.com/${team.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        @{team.instagram.replace('@', '')}
                      </a>
                    </div>
                  )}
                  {team.website_url && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <a 
                        href={team.website_url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                      >
                        {team.website_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne centrale - Performers */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                👥 {safeTranslate('teamMembers', 'Membres de l\'équipe')}
                <span className="text-sm font-normal bg-purple-500/20 px-2 py-1 rounded-full">
                  {loadingPerformers ? '...' : performers.length}
                </span>
              </h3>
              
              {loadingPerformers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-400">{safeTranslate('loading', 'Chargement')}...</span>
                </div>
              ) : performers.length > 0 ? (
                <div className="space-y-3">
                  {performers
                    .sort((a, b) => {
                      // Directeur en premier
                      if (a.is_team_director && !b.is_team_director) return -1;
                      if (!a.is_team_director && b.is_team_director) return 1;
                      // Puis par position
                      return (a.position_in_team || 999) - (b.position_in_team || 999);
                    })
                    .map((performer, index) => (
                      <PerformerCard key={performer.id || index} performer={performer} index={index} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">{safeTranslate('noPerformersFound', 'Aucun membre trouvé')}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {safeTranslate('performersNotMigrated', 'Les membres de cette équipe n\'ont pas encore été migrés')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Historique et Actions */}
          <div className="space-y-6">
            
            {/* Historique */}
            <div>
              <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                📅 {safeTranslate('history', 'Historique')}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{safeTranslate('createdOn', 'Créé le')}:</span>
                  <span className="text-white">
                    {team.created_at ? new Date(team.created_at).toLocaleDateString(currentLanguage) : 'N/A'}
                  </span>
                </div>
                
                {team.submitted_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400">{safeTranslate('submittedOn', 'Soumis le')}:</span>
                    <span className="text-white">
                      {new Date(team.submitted_at).toLocaleDateString(currentLanguage)}
                    </span>
                  </div>
                )}
                
                {team.approved_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400">{safeTranslate('approvedOn', 'Approuvé le')}:</span>
                    <span className="text-white">
                      {new Date(team.approved_at).toLocaleDateString(currentLanguage)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes organisateur */}
            {team.organizer_notes && (
              <div>
                <h3 className="text-xl font-bold text-yellow-300 mb-4">
                  📝 {safeTranslate('organizerNotes', 'Notes de l\'organisateur')}
                </h3>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-300">{team.organizer_notes}</p>
                </div>
              </div>
            )}

            {/* Actions organisateur */}
            {isOrganizer && team.status === 'submitted' && (onApprove || onReject) && (
              <div>
                <h3 className="text-xl font-bold text-blue-300 mb-4">
                  🎯 {safeTranslate('organizerActions', 'Actions de l\'organisateur')}
                </h3>
                <div className="flex gap-3">
                  {onApprove && (
                    <button
                      onClick={() => onApprove(team.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      ✅ {safeTranslate('approve', 'Approuver')}
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(team.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      ❌ {safeTranslate('reject', 'Rejeter')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Raison du rejet */}
            {team.rejection_reason && (
              <div>
                <h3 className="text-xl font-bold text-red-300 mb-4">
                  ❌ {safeTranslate('rejectionReason', 'Raison du rejet')}
                </h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300">{team.rejection_reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ⭐ SECTION NOTATION TECH REHEARSAL - Pleine largeur en bas */}
        {(isOrganizer || hasRating) && (
          <div className="border-t border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                <Award className="w-7 h-7" />
                🎭 {safeTranslate('techRehearsalRating', 'Notation répétition technique')}
              </h3>
              
              {!canRate && !hasRating && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  👀 {safeTranslate('organizersOnly', 'Organisateurs uniquement')}
                </span>
              )}
            </div>

            {canRate ? (
              <div className="space-y-6">
                {/* Grille des 3 critères */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StarRating
                    label={editingRating.rating_1_label}
                    rating={editingRating.rating_1}
                    onChange={isEditingRating ? (rating) => setEditingRating(prev => ({ ...prev, rating_1: rating })) : undefined}
                    onLabelChange={isEditingRating ? (label) => setEditingRating(prev => ({ ...prev, rating_1_label: label })) : undefined}
                    readonly={!isEditingRating}
                  />
                  
                  <StarRating
                    label={editingRating.rating_2_label}
                    rating={editingRating.rating_2}
                    onChange={isEditingRating ? (rating) => setEditingRating(prev => ({ ...prev, rating_2: rating })) : undefined}
                    onLabelChange={isEditingRating ? (label) => setEditingRating(prev => ({ ...prev, rating_2_label: label })) : undefined}
                    readonly={!isEditingRating}
                  />
                  
                  <StarRating
                    label={editingRating.rating_3_label}
                    rating={editingRating.rating_3}
                    onChange={isEditingRating ? (rating) => setEditingRating(prev => ({ ...prev, rating_3: rating })) : undefined}
                    onLabelChange={isEditingRating ? (label) => setEditingRating(prev => ({ ...prev, rating_3_label: label })) : undefined}
                    readonly={!isEditingRating}
                  />
                </div>

                {/* Commentaires */}
                <div className="bg-slate-800/30 rounded-xl p-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    💬 {safeTranslate('comments', 'Commentaires')} ({safeTranslate('optional', 'optionnel')})
                  </label>
                  {isEditingRating ? (
                    <textarea
                      value={editingRating.comments}
                      onChange={(e) => setEditingRating(prev => ({ ...prev, comments: e.target.value }))}
                      className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      rows={4}
                      placeholder={safeTranslate('performanceNotesPlaceholder', 'Notes sur la performance technique, problèmes rencontrés, points forts...')}
                    />
                  ) : (
                    <p className="text-gray-300 min-h-[1.5rem] italic">
                      {team.tech_rehearsal_rating?.comments || safeTranslate('noComments', 'Aucun commentaire')}
                    </p>
                  )}
                </div>

                {/* Info notation */}
                {hasRating && !isEditingRating && team.tech_rehearsal_rating && (
                  <div className="text-sm text-gray-500 bg-slate-800/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4" />
                      {safeTranslate('ratedBy', 'Noté par')} {team.tech_rehearsal_rating.rated_by || safeTranslate('organizer', 'Organisateur')}
                    </div>
                    <div>
                      {safeTranslate('on', 'Le')} {team.tech_rehearsal_rating.rated_at ? 
                        new Date(team.tech_rehearsal_rating.rated_at).toLocaleDateString(currentLanguage, {
                          day: 'numeric', month: 'long', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit'
                        }) : ''}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex items-center gap-4">
                  {!isEditingRating ? (
                    <button
                      onClick={() => setIsEditingRating(true)}
                      className="flex items-center gap-2 px-8 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl font-medium transition-all duration-200"
                    >
                      <Edit3 className="w-5 h-5" />
                      {hasRating ? safeTranslate('modifyRating', 'Modifier la notation') : safeTranslate('rateThisTeam', 'Noter cette équipe')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSaveRating}
                        className="flex items-center gap-2 px-8 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl font-medium transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                        {safeTranslate('save', 'Sauvegarder')}
                      </button>
                      <button
                        onClick={handleCancelRating}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30 rounded-xl font-medium transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                        {safeTranslate('cancel', 'Annuler')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : hasRating ? (
              // Vue lecture seule
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StarRating
                    label={team.tech_rehearsal_rating!.rating_1_label}
                    rating={team.tech_rehearsal_rating!.rating_1}
                    readonly={true}
                  />
                  <StarRating
                    label={team.tech_rehearsal_rating!.rating_2_label}
                    rating={team.tech_rehearsal_rating!.rating_2}
                    readonly={true}
                  />
                  <StarRating
                    label={team.tech_rehearsal_rating!.rating_3_label}
                    rating={team.tech_rehearsal_rating!.rating_3}
                    readonly={true}
                  />
                </div>
                {team.tech_rehearsal_rating?.comments && (
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{safeTranslate('comments', 'Commentaires')}</label>
                    <p className="text-gray-300 italic">{team.tech_rehearsal_rating.comments}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};