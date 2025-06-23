// src/components/teams/TeamCreateModal.tsx - VERSION SÉCURISÉE AVEC FALLBACKS
import React, { useState } from 'react';
import { X, Music, Plus } from 'lucide-react';
import { CreateTeamData } from '../../hooks/useTeamActions';
import { useTeamValidation } from '../../hooks/useTeamValidation';
import { PhotoUploader } from './PhotoUploader';

// Import du système de traduction correct
import { useTranslation, type Language } from '../../locales';

interface TeamCreateModalProps {
  currentUser: any;
  translate: (key: string) => string;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (teamData: CreateTeamData) => Promise<boolean>;
  currentLanguage?: Language;
}

export const TeamCreateModal: React.FC<TeamCreateModalProps> = ({
  currentUser,
  translate,
  isCreating,
  onClose,
  onSubmit,
  currentLanguage = 'en'
}) => {
  // Utilisation du système de traduction avec fonction de fallback sécurisée
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

  const [formData, setFormData] = useState<CreateTeamData>({
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
    website_url: '',
    music_file: null,
    team_photo: null
  });

  const handleInputChange = (field: keyof CreateTeamData, value: any) => {
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

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const isFormValid = formData.team_name && formData.director_name && formData.director_email && formData.city;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              ✨ {safeTranslate('createTeam', 'Create Team')}
            </h2>
            <p className="text-gray-300">{safeTranslate('fillTeamInformation', 'Fill in your team information')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-700/50 border border-gray-600/30 flex items-center justify-center hover:bg-gray-600/50 transition-all duration-200"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Informations générales */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
              📝 {safeTranslate('generalInfo', 'General Information')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('teamName', 'Team Name')} *
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => handleInputChange('team_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('teamNamePlaceholder', 'Enter team name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('studioName', 'Studio Name')}
                </label>
                <input
                  type="text"
                  value={formData.studio_name}
                  onChange={(e) => handleInputChange('studio_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('studioNamePlaceholder', 'Enter studio name')}
                />
              </div>
            </div>
          </div>

          {/* Informations directeur */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
              👤 {safeTranslate('directorInfo', 'Director Information')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('directorName', 'Director Name')} *
                </label>
                <input
                  type="text"
                  value={formData.director_name}
                  onChange={(e) => handleInputChange('director_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('directorNamePlaceholder', 'Enter director name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('directorEmail', 'Director Email')} *
                </label>
                <input
                  type="email"
                  value={formData.director_email}
                  onChange={(e) => handleInputChange('director_email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('directorEmailPlaceholder', 'director@example.com')}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('directorPhone', 'Director Phone')}
              </label>
              <input
                type="tel"
                value={formData.director_phone}
                onChange={(e) => handleInputChange('director_phone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder={safeTranslate('directorPhonePlaceholder', 'Enter phone number')}
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
              📍 {safeTranslate('location', 'Location')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('city', 'City')} *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('cityPlaceholder', 'Enter city')}
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('statePlaceholder', 'Enter state/province')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('country', 'Country')}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('countryPlaceholder', 'Enter country')}
                />
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-300 flex items-center gap-2">
              🎭 {safeTranslate('performance', 'Performance')}
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('groupSize', 'Group Size')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.group_size}
                  onChange={(e) => handleInputChange('group_size', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              
              {/* Niveau de performance */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ⭐ {safeTranslate('performanceLevel', 'Performance Level')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('performance_level', formData.performance_level === level ? null : level)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.performance_level === level
                          ? 'bg-orange-500/30 border-2 border-orange-500/50 text-orange-300'
                          : 'bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-orange-300'
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
            </div>

            {/* Styles de danse */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('danceStyles', 'Dance Styles')}
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.dance_styles.map((style) => (
                  <span
                    key={style}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-300 text-sm font-medium"
                  >
                    {translateDanceStyle(style)}
                    <button
                      type="button"
                      onClick={() => removeDanceStyle(style)}
                      className="w-5 h-5 rounded-full bg-red-500/30 hover:bg-red-500/50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-red-300" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['salsa', 'bachata', 'zouk', 'merengue', 'reggaeton', 'cumbia', 'mambo', 'chacha'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => addDanceStyle(style)}
                    disabled={formData.dance_styles.includes(style)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.dance_styles.includes(style)
                        ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/30 text-gray-300 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/30 hover:text-purple-300'
                    }`}
                  >
                    {translateDanceStyle(style)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vidéo de performance */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
              🎬 {safeTranslate('performanceVideo', 'Performance Video')}
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                🎬 {safeTranslate('performanceVideo', 'Performance Video')}
              </label>
              <input
                type="url"
                value={formData.performance_video_url}
                onChange={(e) => handleInputChange('performance_video_url', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="https://youtube.com/watch?v=... ou Google Drive, Vimeo..."
              />
              <p className="text-gray-400 text-xs mt-2">
                💡 {safeTranslate('acceptedLinks', 'Accepted links')}: YouTube, Vimeo, Google Drive, Dropbox, etc.
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-pink-300 flex items-center gap-2">
              📱 {safeTranslate('socialMedia', 'Social Media')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('instagram', 'Instagram')}
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="@team_instagram"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('website', 'Website')}
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="https://votresite.com"
                />
              </div>
            </div>
          </div>

          {/* Upload photo équipe */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
              📸 {safeTranslate('media', 'Media')}
            </h3>
            
            <PhotoUploader
              onPhotoSelect={(file) => handleInputChange('team_photo', file)}
              translate={translate} // Garder l'ancienne fonction pour PhotoUploader
              required={true}
            />
          </div>

          {/* Upload MP3 */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              🎵 {safeTranslate('musicFile', 'Music File')} (MP3, WAV, M4A)
            </label>
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
              <input
                type="file"
                accept=".mp3,.wav,.m4a,audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleInputChange('music_file', file);
                  console.log('🎵 Fichier sélectionné:', file?.name);
                }}
                className="hidden"
                id="music-upload"
              />
              <label htmlFor="music-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    formData.music_file 
                      ? 'bg-green-500/20' 
                      : 'bg-purple-500/20'
                  }`}>
                    <Music className={`w-8 h-8 ${
                      formData.music_file 
                        ? 'text-green-400' 
                        : 'text-purple-400'
                    }`} />
                  </div>
                  {formData.music_file ? (
                    <div>
                      <p className="text-green-400 font-semibold">✅ {formData.music_file.name}</p>
                      <p className="text-green-300 text-sm">{safeTranslate('fileReadyToUpload', 'File ready to upload')}</p>
                      <p className="text-gray-400 text-xs mt-1">{safeTranslate('clickToChange', 'Click to change')}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-purple-300 font-semibold">{safeTranslate('clickToSelect', 'Click to select')}</p>
                      <p className="text-gray-400 text-sm">MP3, WAV, M4A {safeTranslate('accepted', 'accepted')}</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
            
            {formData.music_file && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs">
                <p className="text-green-300">
                  <strong>{safeTranslate('fileSelected', 'File selected')}:</strong> {formData.music_file.name} 
                  ({(formData.music_file.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-600/50 transition-all duration-200"
          >
            {safeTranslate('cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isCreating}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                {safeTranslate('creating', 'Creating')}...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {safeTranslate('createTeam', 'Create Team')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};