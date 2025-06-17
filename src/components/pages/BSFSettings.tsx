import React, { useState } from 'react';
import { Settings, X, Save, Calendar, MapPin, Users, Clock, Bell, Download, Upload, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface EventSettings {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  venue_address: string;
  description: string;
  capacity: number;
  required_volunteer_hours: number;
  team_submission_deadline: string;
  team_submission_limit: number;
  registration_deadline: string;
  website_url?: string;
  instagram_handle?: string;
  contact_email: string;
  status: 'draft' | 'live' | 'completed' | 'cancelled';
  notifications_enabled: boolean;
  allow_team_video_preview: boolean;
  team_performance_duration: number;
  scoring_enabled: boolean;
}

interface User {
  id: string;
  role: 'admin' | 'organizer' | 'assistant' | 'volunteer' | 'team_director' | 'artist' | 'attendee';
  full_name: string;
  email: string;
}

interface BSFSettingsProps {
  eventSettings: EventSettings;
  setEventSettings: (settings: EventSettings) => void;
  currentUser: User | null;
  onClose: () => void;
  onSave: (settings: EventSettings) => void;
}

const BSFSettings: React.FC<BSFSettingsProps> = ({
  eventSettings,
  setEventSettings,
  currentUser,
  onClose,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<EventSettings>(eventSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'teams' | 'volunteers' | 'notifications' | 'advanced'>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(localSettings);
      setEventSettings(localSettings);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventSettings, value: any) => {
    setLocalSettings({ ...localSettings, [field]: value });
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'teams', label: 'Équipes', icon: Users },
    { id: 'volunteers', label: 'Bénévoles', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Avancé', icon: AlertTriangle }
  ];

  if (!currentUser || !['admin', 'organizer'].includes(currentUser.role)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-600/30">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-red-400" />
              Paramètres BSF - {localSettings.name}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
              localSettings.status === 'live' ? 'bg-green-500/20 text-green-300' :
              localSettings.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
              localSettings.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {localSettings.status === 'live' ? '🟢 En cours' :
               localSettings.status === 'draft' ? '🟡 Brouillon' :
               localSettings.status === 'completed' ? '🔵 Terminé' :
               '🔴 Annulé'}
            </div>
            <div className="text-gray-400 text-sm">
              Dernière modification: {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        <div className="flex h-full max-h-[600px]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-900/50 border-r border-gray-600/30 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Informations Générales</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Nom de l'événement *
                    </label>
                    <input
                      type="text"
                      value={localSettings.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="ex: Boston Salsa Festival 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={localSettings.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    >
                      <option value="draft">🟡 Brouillon</option>
                      <option value="live">🟢 En cours</option>
                      <option value="completed">🔵 Terminé</option>
                      <option value="cancelled">🔴 Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={localSettings.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      value={localSettings.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Lieu *
                    </label>
                    <input
                      type="text"
                      value={localSettings.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="ex: Hynes Convention Center"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Capacité maximale
                    </label>
                    <input
                      type="number"
                      value={localSettings.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    value={localSettings.venue_address}
                    onChange={(e) => handleInputChange('venue_address', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="900 Boylston Street, Boston, MA 02115"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={localSettings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={localSettings.website_url || ''}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="https://bostonsalsafestival.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={localSettings.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="info@bostonsalsafestival.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Paramètres Équipes</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Date limite d'inscription équipes *
                    </label>
                    <input
                      type="datetime-local"
                      value={localSettings.team_submission_deadline}
                      onChange={(e) => handleInputChange('team_submission_deadline', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Nombre maximum d'équipes
                    </label>
                    <input
                      type="number"
                      value={localSettings.team_submission_limit}
                      onChange={(e) => handleInputChange('team_submission_limit', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Durée performance (minutes)
                    </label>
                    <input
                      type="number"
                      value={localSettings.team_performance_duration}
                      onChange={(e) => handleInputChange('team_performance_duration', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="5"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="scoring_enabled"
                      checked={localSettings.scoring_enabled}
                      onChange={(e) => handleInputChange('scoring_enabled', e.target.checked)}
                      className="w-5 h-5 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <label htmlFor="scoring_enabled" className="text-gray-300 font-semibold">
                      Activer le système de notation
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="allow_video_preview"
                      checked={localSettings.allow_team_video_preview}
                      onChange={(e) => handleInputChange('allow_team_video_preview', e.target.checked)}
                      className="w-5 h-5 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <label htmlFor="allow_video_preview" className="text-gray-300 font-semibold">
                      Autoriser la prévisualisation des vidéos
                    </label>
                  </div>
                </div>

                {/* Critères de scoring */}
                {localSettings.scoring_enabled && (
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Critères de notation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>• Technique (0-10 points)</div>
                      <div>• Créativité (0-10 points)</div>
                      <div>• Synchronisation (0-10 points)</div>
                      <div>• Présence scénique (0-10 points)</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'volunteers' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Paramètres Bénévoles</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Heures de bénévolat requises
                    </label>
                    <input
                      type="number"
                      value={localSettings.required_volunteer_hours}
                      onChange={(e) => handleInputChange('required_volunteer_hours', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="8"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Nombre d'heures minimum pour obtenir l'entrée gratuite
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Date limite d'inscription bénévoles
                    </label>
                    <input
                      type="datetime-local"
                      value={localSettings.registration_deadline}
                      onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Rôles de bénévoles */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                  <h4 className="text-lg font-bold text-white mb-4">Rôles disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Accueil', icon: '👋', description: 'Accueil participants' },
                      { name: 'Sécurité', icon: '🛡️', description: 'Contrôle accès' },
                      { name: 'Technique', icon: '🎛️', description: 'Son et éclairage' },
                      { name: 'Scène', icon: '🎭', description: 'Gestion performances' },
                      { name: 'Nettoyage', icon: '🧹', description: 'Maintenance lieux' },
                      { name: 'Boutique', icon: '🛍️', description: 'Vente merchandising' }
                    ].map((role, index) => (
                      <div key={index} className="bg-gray-700/50 p-4 rounded-xl">
                        <div className="text-2xl mb-2">{role.icon}</div>
                        <div className="font-semibold text-white">{role.name}</div>
                        <div className="text-xs text-gray-400">{role.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
                    <div>
                      <div className="font-semibold text-white">Notifications générales</div>
                      <div className="text-sm text-gray-400">Activer les notifications email pour l'événement</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications_enabled}
                      onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                      className="w-5 h-5 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                  </div>

                  {localSettings.notifications_enabled && (
                    <div className="space-y-3 ml-6">
                      <div className="text-sm text-gray-300">
                        ✅ Confirmations d'inscription
                        <br />
                        ✅ Rappels de créneaux
                        <br />
                        ✅ Modifications de programme
                        <br />
                        ✅ Notifications urgentes
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-300">Configuration email</div>
                      <div className="text-sm text-blue-200 mt-1">
                        Les emails seront envoyés depuis noreply@sabordance.com avec {localSettings.contact_email} en réponse.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Paramètres Avancés</h3>
                
                <div className="space-y-6">
                  {/* Export/Import */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="text-lg font-bold text-white mb-4">Export / Import</h4>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors">
                        <Download size={16} />
                        Exporter configuration
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors">
                        <Upload size={16} />
                        Importer configuration
                      </button>
                    </div>
                  </div>

                  {/* Zone dangereuse */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-red-300 mb-4">Zone dangereuse</h4>
                    <div className="space-y-4">
                      <div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                          <Trash2 size={16} />
                          Supprimer l'événement
                        </button>
                        <p className="text-xs text-red-400 mt-2">
                          Cette action est irréversible. Toutes les données seront perdues.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-600/30 bg-gray-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              * Champs obligatoires
            </div>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-red-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Supprimer l'événement ?
              </h3>
              <p className="text-gray-300 mb-6">
                Cette action supprimera définitivement "{localSettings.name}" 
                et toutes les données associées (équipes, bénévoles, créneaux...).
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-300 hover:text-white font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // Logique de suppression ici
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSFSettings;
