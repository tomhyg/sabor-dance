// src/components/teams/TeamEditModal.tsx - VERSION AVEC SUPPORT DES LANGUES
import React, { useState, useEffect } from 'react';
import { X, Upload, Music, Camera } from 'lucide-react';
import { PerformanceTeam } from '../../types/PerformanceTeam';
import { UpdateTeamData } from '../../hooks/useTeamActions';
import { useTeamValidation } from '../../hooks/useTeamValidation';

// Import du système de traduction
import { useTranslation, type Language, DEFAULT_LANGUAGE } from '../../locales';

interface TeamEditModalProps {
  team: PerformanceTeam;
  currentUser: any;
  translate: (key: string) => string;
  currentLanguage?: Language; // ← AJOUT DU PROP LANGUE
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (teamId: string, teamData: UpdateTeamData) => Promise<boolean>;
}

export const TeamEditModal: React.FC<TeamEditModalProps> = ({
  team,
  currentUser,
  translate,
  currentLanguage = DEFAULT_LANGUAGE, // ← VALEUR PAR DÉFAUT
  isUpdating,
  onClose,
  onSubmit
}) => {
  // 🌐 SYSTÈME DE TRADUCTION LOCAL
  const { t } = useTranslation(currentLanguage);

  // Fonction helper pour les traductions sécurisées
  const safeTranslate = (key: string, fallback: string = key): string => {
    try {
      // Essayer d'abord avec le système de traduction principal
      const translation = (t as any)[key];
      if (translation && typeof translation === 'string') {
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
      
      // Dernier fallback
      return fallback;
    } catch (e) {
      return fallback;
    }
  };

  const { translateDanceStyle, translateLevel } = useTeamValidation({ currentUser, translate });

  const [formData, setFormData] = useState<UpdateTeamData>({
    team_name: '',
    director_name: '',
    director_email: '',
    director_phone: '',
    studio_name: '',
    city: '',
    state: '',
    country: '',
    group_size: 4,
    dance_styles: [],
    performance_level: null,
    performance_video_url: '',
    instagram: '',
    website_url: ''
  });

  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Initialiser le formulaire avec les données de l'équipe
  useEffect(() => {
    setFormData({
      team_name: team.team_name,
      director_name: team.director_name,
      director_email: team.director_email,
      director_phone: team.director_phone || '',
      studio_name: team.studio_name || '',
      city: team.city,
      state: team.state || '',
      country: team.country || '',
      group_size: team.group_size,
      dance_styles: [...(team.dance_styles || [])],
      performance_level: team.performance_level,
      performance_video_url: team.performance_video_url || '',
      instagram: team.instagram || '',
      website_url: team.website_url || ''
    });
  }, [team]);

  const handleInputChange = (field: keyof UpdateTeamData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDanceStyle = (style: string) => {
    if (style && !formData.dance_styles.includes(style)) {
      handleInputChange('dance_styles', [...formData.dance_styles, style]);
    }
  };

  const removeDanceStyle = (style: string) => {
    handleInputChange('dance_styles', formData.dance_styles.filter(s => s !== style));
  };

  const handleMusicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
      if (validTypes.includes(file.type)) {
        setMusicFile(file);
      } else {
        alert(safeTranslate('invalidMusicFormat', 'Invalid music format'));
      }
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type)) {
        setPhotoFile(file);
      } else {
        alert(safeTranslate('invalidPhotoFormat', 'Invalid photo format'));
      }
    }
  };

  const handleSubmit = async () => {
    // Ajouter les fichiers aux données si ils existent
    const submitData = {
      ...formData,
      ...(musicFile && { music_file: musicFile }),
      ...(photoFile && { team_photo: photoFile })
    };
    
    const success = await onSubmit(team.id, submitData);
    if (success) {
      onClose();
    }
  };

  const isFormValid = formData.team_name && formData.director_name && formData.director_email && formData.city && formData.country;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">{safeTranslate('editTeam', 'Edit Team')}</h2>
          <button 
            onClick={onClose} 
            disabled={isUpdating}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('teamName', 'Team Name')} *
              </label>
              <input
                type="text"
                value={formData.team_name}
                onChange={(e) => handleInputChange('team_name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('directorName', 'Director Name')} *
              </label>
              <input
                type="text"
                value={formData.director_name}
                onChange={(e) => handleInputChange('director_name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('directorEmail', 'Director Email')} *
              </label>
              <input
                type="email"
                value={formData.director_email}
                onChange={(e) => handleInputChange('director_email', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('directorPhone', 'Phone')}
              </label>
              <input
                type="tel"
                value={formData.director_phone}
                onChange={(e) => handleInputChange('director_phone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Studio et taille */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('studioName', 'Studio Name')}
              </label>
              <input
                type="text"
                value={formData.studio_name}
                onChange={(e) => handleInputChange('studio_name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('groupSize', 'Group Size')} *
              </label>
              <input
                type="number"
                min="2"
                value={formData.group_size}
                onChange={(e) => handleInputChange('group_size', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('city', 'City')} *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('state', 'State/Province')}
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('country', 'Country')} *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                📸 {safeTranslate('instagram', 'Instagram')}
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="@votre_equipe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                🌐 {safeTranslate('website', 'Website')}
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="https://votre-site.com"
              />
            </div>
          </div>

          {/* Lien vidéo */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              🎬 {safeTranslate('performanceVideo', 'Performance Video')}
            </label>
            <input
              type="url"
              value={formData.performance_video_url}
              onChange={(e) => handleInputChange('performance_video_url', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="https://youtube.com/watch?v=... ou Google Drive, Vimeo..."
            />
            <p className="text-gray-400 text-xs mt-2">
              💡 {safeTranslate('acceptedLinks', 'Accepted links')}: YouTube, Vimeo, Google Drive, Dropbox, etc.
            </p>
          </div>

          {/* Styles de danse */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              {safeTranslate('danceStyles', 'Dance Styles')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.dance_styles.map(style => (
                <span key={style} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 flex items-center gap-2">
                  {translateDanceStyle(style)}
                  <button
                    onClick={() => removeDanceStyle(style)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Salsa', 'Bachata', 'Kizomba', 'Zouk', 'Mambo', 'Cha-cha'].map(style => (
                <button
                  key={style}
                  onClick={() => addDanceStyle(style)}
                  disabled={formData.dance_styles.includes(style)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.dance_styles.includes(style) 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  {translateDanceStyle(style)}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau de performance */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              ⭐ {safeTranslate('performanceLevel', 'Performance Level')}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => handleInputChange('performance_level', formData.performance_level === level ? null : level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.performance_level === level
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30'
                  }`}
                >
                  {level === 'beginner' && '🌱 ' + safeTranslate('beginner', 'Beginner')}
                  {level === 'intermediate' && '🔥 ' + safeTranslate('intermediate', 'Intermediate')}
                  {level === 'advanced' && '⚡ ' + safeTranslate('advanced', 'Advanced')}
                  {level === 'professional' && '👑 ' + safeTranslate('professional', 'Professional')}
                </button>
              ))}
            </div>
          </div>

          {/* Section Media */}
          <div>
            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
              📸 {safeTranslate('media', 'Media')}
            </h3>
            
            {/* Photo d'équipe */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">
                📷 {safeTranslate('teamPhoto', 'Team Photo')} *
              </label>
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                  id="team-photo-input"
                />
                <label
                  htmlFor="team-photo-input"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium">
                      {photoFile ? `${safeTranslate('changePhoto', 'Change Photo')}: ${photoFile.name}` : 
                       team.team_photo_url ? safeTranslate('changePhoto', 'Change Photo') : safeTranslate('clickToSelectPhoto', 'Click to select photo')}
                    </p>
                    <p className="text-gray-400 text-sm">JPG, PNG, WEBP {safeTranslate('accepted', 'accepted')}</p>
                  </div>
                </label>
              </div>
              {team.team_photo_url && !photoFile && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {safeTranslate('currentPhotoWillBeKept', 'Current photo will be kept')}
                </p>
              )}
            </div>

            {/* Fichier musical */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                🎵 {safeTranslate('musicFile', 'Music File')} (MP3, WAV, M4A)
              </label>
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a"
                  onChange={handleMusicFileChange}
                  className="hidden"
                  id="music-file-input"
                />
                <label
                  htmlFor="music-file-input"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium">
                      {musicFile ? `${safeTranslate('changeMusicFile', 'Change Music File')}: ${musicFile.name}` : 
                       team.music_file_url ? safeTranslate('changeMusicFile', 'Change Music File') : safeTranslate('clickToSelect', 'Click to select')}
                    </p>
                    <p className="text-gray-400 text-sm">MP3, WAV, M4A {safeTranslate('accepted', 'accepted')}</p>
                  </div>
                </label>
              </div>
              {team.music_file_url && !musicFile && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {safeTranslate('currentMusicFileWillBeKept', 'Current music file will be kept')}
                </p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {safeTranslate('cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating || !isFormValid}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {safeTranslate('saving', 'Saving')}...
                </div>
              ) : (
                safeTranslate('saveChanges', 'Save Changes')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};