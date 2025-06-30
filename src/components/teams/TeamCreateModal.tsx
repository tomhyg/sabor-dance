// src/components/teams/TeamCreateModal.tsx - VERSION AVEC PERFORMERS DYNAMIQUES
import React, { useState, useEffect } from 'react';
import { X, Music, Plus, User, Mail, Users, Minus } from 'lucide-react';
import { CreateTeamData } from '../../hooks/useTeamActions';
import { useTeamValidation } from '../../hooks/useTeamValidation';
import { PhotoUploader } from './PhotoUploader';

// Import du système de traduction correct
import { useTranslation, type Language } from '../../locales';

interface Performer {
  id: string;
  name: string;
  email: string;
}

interface TeamCreateModalProps {
  currentUser: any;
  translate: (key: string) => string;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (teamData: CreateTeamData & { performers: Performer[] }) => Promise<boolean>;
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
      const translation = (t as any)[key];
      if (translation && typeof translation === 'string') {
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

  // 🎯 NOUVEAUTÉ: État pour les performers
  const [performers, setPerformers] = useState<Performer[]>([]);

  // 🎯 NOUVEAUTÉ: Générer automatiquement les champs performers quand group_size change
  useEffect(() => {
    const newSize = formData.group_size || 1;
    
    if (newSize > performers.length) {
      // Ajouter des performers
      const newPerformers = Array.from({ length: newSize - performers.length }, (_, index) => ({
        id: `performer-${performers.length + index + 1}`,
        name: '',
        email: ''
      }));
      setPerformers(prev => [...prev, ...newPerformers]);
    } else if (newSize < performers.length) {
      // Supprimer des performers (garder les premiers)
      setPerformers(prev => prev.slice(0, newSize));
    }
  }, [formData.group_size, performers.length]);

  // 🎯 NOUVEAUTÉ: Initialiser avec au moins 1 performer
  useEffect(() => {
    if (performers.length === 0) {
      setPerformers([{
        id: 'performer-1',
        name: '',
        email: ''
      }]);
    }
  }, [performers.length]);

  const handleInputChange = (field: keyof CreateTeamData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🎯 NOUVEAUTÉ: Handler pour les performers
  const updatePerformer = (performerId: string, field: 'name' | 'email', value: string) => {
    setPerformers(prev => prev.map(performer => 
      performer.id === performerId ? { ...performer, [field]: value } : performer
    ));
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
    // 🎯 NOUVEAUTÉ: Inclure les performers dans la soumission
    const success = await onSubmit({ ...formData, performers });
    if (success) {
      onClose();
    }
  };

  // 🎯 NOUVEAUTÉ: Validation incluant les performers
  const isFormValid = formData.team_name && 
                     formData.director_name && 
                     formData.director_email && 
                     formData.city &&
                     performers.every(p => p.name && p.email);

  // 🎯 NOUVEAUTÉ: Calculer les stats de completion
  const getPerformerStats = () => {
    const totalFields = performers.length * 2; // nom + email
    const completedFields = performers.reduce((count, performer) => {
      return count + (performer.name ? 1 : 0) + (performer.email ? 1 : 0);
    }, 0);
    
    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    };
  };

  const performerStats = getPerformerStats();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 max-w-5xl max-h-[95vh] overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              ✨ {safeTranslate('createTeam', 'Créer une équipe')}
            </h2>
            <p className="text-gray-300">{safeTranslate('fillTeamInformation', 'Remplissez les informations de votre équipe')}</p>
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
              📝 {safeTranslate('generalInfo', 'Informations générales')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('teamName', 'Nom de l\'équipe')} *
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => handleInputChange('team_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('teamNamePlaceholder', 'Nom de votre équipe')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('studioName', 'Nom du studio')}
                </label>
                <input
                  type="text"
                  value={formData.studio_name}
                  onChange={(e) => handleInputChange('studio_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('studioNamePlaceholder', 'Nom de votre studio')}
                />
              </div>
            </div>
          </div>

          {/* Informations directeur */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
              👤 {safeTranslate('directorInfo', 'Informations du directeur')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('directorName', 'Nom du directeur')} *
                </label>
                <input
                  type="text"
                  value={formData.director_name}
                  onChange={(e) => handleInputChange('director_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('directorNamePlaceholder', 'Prénom Nom')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('directorEmail', 'Email du directeur')} *
                </label>
                <input
                  type="email"
                  value={formData.director_email}
                  onChange={(e) => handleInputChange('director_email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('directorEmailPlaceholder', 'directeur@example.com')}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('directorPhone', 'Téléphone du directeur')}
              </label>
              <input
                type="tel"
                value={formData.director_phone}
                onChange={(e) => handleInputChange('director_phone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder={safeTranslate('directorPhonePlaceholder', '+33 6 12 34 56 78')}
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
              📍 {safeTranslate('location', 'Localisation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('city', 'Ville')} *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('cityPlaceholder', 'Paris')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('state', 'État/Province')}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('statePlaceholder', 'Île-de-France')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {safeTranslate('country', 'Pays')}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder={safeTranslate('countryPlaceholder', 'France')}
                />
              </div>
            </div>
          </div>

          {/* 🎯 NOUVEAUTÉ: Taille de l'équipe avec contrôle */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-300 flex items-center gap-2">
              👥 {safeTranslate('teamComposition', 'Composition de l\'équipe')}
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                {safeTranslate('groupSize', 'Nombre de performers')} *
              </label>
              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleInputChange('group_size', Math.max(1, formData.group_size - 1))}
                  disabled={formData.group_size <= 1}
                  className="p-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <div className="flex-1 max-w-xs">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.group_size}
                    onChange={(e) => handleInputChange('group_size', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white text-center text-xl font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('group_size', Math.min(20, formData.group_size + 1))}
                  disabled={formData.group_size >= 20}
                  className="p-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* 🎯 NOUVEAUTÉ: Barre de progression des performers */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 font-medium">Informations des performers</span>
                  </div>
                  <span className="text-white font-bold">{performerStats.completed}/{performerStats.total}</span>
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${performerStats.percentage}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-400">
                  {performerStats.percentage}% complété - {performers.length} performer{performers.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* 🎯 NOUVEAUTÉ: Liste dynamique des performers */}
            <div className="space-y-4">
              {performers.map((performer, index) => (
                <div key={performer.id} className="bg-gray-800/50 border border-gray-600/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {index === 0 ? 'Directeur principal' : `Performer ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {index === 0 ? 'Contact principal de l\'équipe' : 'Membre de l\'équipe'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom du performer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom complet <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={performer.name}
                          onChange={(e) => updatePerformer(performer.id, 'name', e.target.value)}
                          placeholder="Prénom Nom"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Email du performer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          value={performer.email}
                          onChange={(e) => updatePerformer(performer.id, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Indicateurs de validation */}
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className={`flex items-center gap-1 ${performer.name ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${performer.name ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      Nom
                    </div>
                    <div className={`flex items-center gap-1 ${performer.email ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${performer.email ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      Email
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance - Niveaux et styles */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-300 flex items-center gap-2">
              🎭 {safeTranslate('performance', 'Performance')}
            </h3>
            
            {/* Niveau de performance */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                ⭐ {safeTranslate('performanceLevel', 'Niveau de performance')}
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
                    {level === 'beginner' && '🌱 Débutant'}
                    {level === 'intermediate' && '🔥 Intermédiaire'}
                    {level === 'advanced' && '⚡ Avancé'}
                    {level === 'professional' && '👑 Professionnel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Styles de danse */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {safeTranslate('danceStyles', 'Styles de danse')}
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
              🎬 {safeTranslate('performanceVideo', 'Vidéo de performance')}
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                🎬 {safeTranslate('performanceVideo', 'Lien vidéo de performance')}
              </label>
              <input
                type="url"
                value={formData.performance_video_url}
                onChange={(e) => handleInputChange('performance_video_url', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="https://youtube.com/watch?v=... ou Google Drive, Vimeo..."
              />
              <p className="text-gray-400 text-xs mt-2">
                💡 {safeTranslate('acceptedLinks', 'Liens acceptés')}: YouTube, Vimeo, Google Drive, Dropbox, etc.
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-pink-300 flex items-center gap-2">
              📱 {safeTranslate('socialMedia', 'Réseaux sociaux')}
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
                  {safeTranslate('website', 'Site web')}
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
              📸 {safeTranslate('media', 'Médias')}
            </h3>
            
            <PhotoUploader
              onPhotoSelect={(file) => handleInputChange('team_photo', file)}
              translate={translate}
              required={true}
            />
          </div>

          {/* Upload MP3 */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              🎵 {safeTranslate('musicFile', 'Fichier musical')} (MP3, WAV, M4A)
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
                      <p className="text-green-300 text-sm">{safeTranslate('fileReadyToUpload', 'Fichier prêt à télécharger')}</p>
                      <p className="text-gray-400 text-xs mt-1">{safeTranslate('clickToChange', 'Cliquer pour changer')}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-purple-300 font-semibold">{safeTranslate('clickToSelect', 'Cliquer pour sélectionner')}</p>
                      <p className="text-gray-400 text-sm">MP3, WAV, M4A {safeTranslate('accepted', 'acceptés')}</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
            
            {formData.music_file && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs">
                <p className="text-green-300">
                  <strong>{safeTranslate('fileSelected', 'Fichier sélectionné')}:</strong> {formData.music_file.name} 
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
            {safeTranslate('cancel', 'Annuler')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isCreating}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                {safeTranslate('creating', 'Création')}...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {safeTranslate('createTeam', 'Créer l\'équipe')}
              </>
            )}
          </button>
        </div>

        {/* 🎯 NOUVEAUTÉ: Résumé des erreurs */}
        {!isFormValid && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h4 className="text-red-400 font-medium mb-2">⚠️ Informations manquantes :</h4>
            <ul className="text-sm text-red-300 space-y-1">
              {!formData.team_name && <li>• Nom de l'équipe</li>}
              {!formData.director_name && <li>• Nom du directeur</li>}
              {!formData.director_email && <li>• Email du directeur</li>}
              {!formData.city && <li>• Ville</li>}
              {performers.some(p => !p.name || !p.email) && <li>• Informations complètes de tous les performers</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};