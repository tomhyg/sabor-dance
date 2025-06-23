import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string, userData: any) => Promise<{ error: any; message?: string | null }>;
  onResetPassword: (email: string) => Promise<{ error: any; message?: string | null }>;
  t: any;
}

const AuthModal: React.FC<AuthModalProps> = ({
  showAuth,
  setShowAuth,
  authMode,
  setAuthMode,
  onSignIn,
  onSignUp,
  onResetPassword,
  t
}) => {
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Données utilisateur pour inscription (SIMPLIFIÉ)
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+33'); // Défaut France
  const [role, setRole] = useState<'volunteer' | 'team_director' | 'artist' | 'attendee'>('volunteer');

  // États UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    if (!password) {
      setError('Mot de passe requis');
      return;
    }

    setLoading(true);
    const result = await onSignIn(email, password);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setShowAuth(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    // Validation
    if (!lastName.trim()) {
      setError('Nom requis');
      return;
    }

    if (!firstName.trim()) {
      setError('Prénom requis');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    if (!phone.trim()) {
      setError('Téléphone requis');
      return;
    }

    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    
    const userData = {
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      role: role,
      phone: `${countryCode} ${phone.trim()}`, // Combine l'indicatif et le numéro
      // Garder les champs individuels pour référence
      first_name: firstName.trim(),
      last_name: lastName.trim()
    };

    const result = await onSignUp(email, password, userData);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(result.message || 'Inscription réussie ! Vérifiez votre email.');
      setTimeout(() => {
        setShowAuth(false);
        resetForm();
      }, 3000);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (authMode === 'login') {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleResetPassword = async () => {    
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    setLoading(true);
    const result = await onResetPassword(email);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(result.message || 'Email de réinitialisation envoyé !');
      setShowResetPassword(false);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLastName('');
    setFirstName('');
    setPhone('');
    setCountryCode('+33'); // Reset à France par défaut
    setRole('volunteer');
    setError('');
    setMessage('');
    setShowResetPassword(false);
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {showResetPassword 
              ? 'Réinitialiser le mot de passe'
              : authMode === 'login' 
                ? 'Connexion'
                : 'Inscription'
            }
          </h2>
          <button
            onClick={() => {
              setShowAuth(false);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Formulaire de réinitialisation */}
        {showResetPassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="votre@email.com"
                style={{ color: '#111827' }}
              />
            </div>
            
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            
            <button
              onClick={() => setShowResetPassword(false)}
              className="w-full text-violet-600 hover:text-violet-700 font-semibold"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {/* Formulaire principal */}
        {!showResetPassword && (
          <div className="space-y-4">
            {/* INSCRIPTION : Nom */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Votre nom de famille"
                  style={{ color: '#111827' }}
                  required
                />
              </div>
            )}

            {/* INSCRIPTION : Prénom */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Prénom *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Votre prénom"
                  style={{ color: '#111827' }}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="votre@email.com"
                style={{ color: '#111827' }}
                required
              />
            </div>

            {/* INSCRIPTION : Téléphone avec sélecteur de pays */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Téléphone *
                </label>
                <div className="flex">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-3 border-2 border-gray-200 border-r-0 rounded-l-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+58">🇻🇪 +58</option>
                    <option value="+507">🇵🇦 +507</option>
                    <option value="+506">🇨🇷 +506</option>
                    <option value="+53">🇨🇺 +53</option>
                    <option value="+1-809">🇩🇴 +1-809</option>
                    <option value="+1-787">🇵🇷 +1-787</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 border-l-0 rounded-r-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="6 12 34 56 78"
                    style={{ color: '#111827' }}
                    required
                  />
                </div>
              </div>
            )}

            {/* INSCRIPTION : Rôle */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white"
                  style={{ color: '#111827' }}
                  required
                >
                  <option value="volunteer">🙋‍♀️ Bénévole - Je veux aider pendant l'événement</option>
                  <option value="team_director">💃 Directeur d'équipe - Je dirige une équipe de danse</option>
                  <option value="artist">🎭 Artiste - Je suis un performer/instructeur</option>
                  <option value="attendee">🎪 Participant - Je viens profiter de l'événement</option>
                </select>
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="••••••••"
                  style={{ color: '#111827' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* INSCRIPTION : Confirmation mot de passe */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="••••••••"
                    style={{ color: '#111827' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Bouton principal */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 mt-6"
            >
              {loading ? 'Chargement...' : 
               authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </div>
        )}

        {/* Liens de navigation */}
        {!showResetPassword && authMode === 'login' && (
          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={() => setShowResetPassword(true)}
              className="text-violet-600 hover:text-violet-700 font-semibold text-sm"
            >
              Mot de passe oublié ?
            </button>
            <div>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setMessage('');
                }}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                Pas encore de compte ? S'inscrire
              </button>
            </div>
          </div>
        )}

        {!showResetPassword && authMode === 'register' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
                setMessage('');
              }}
              className="text-violet-600 hover:text-violet-700 font-semibold"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;