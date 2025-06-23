// src/components/AuthPages.tsx - Version avec intégration Supabase
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, ArrowLeft, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==================== PAGE DE CONFIRMATION EMAIL ====================
interface EmailConfirmationProps {
  onBackToHome: () => void;
  onSuccess?: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ 
  onBackToHome, 
  onSuccess 
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmation de votre email en cours...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token_hash');
        const type = urlParams.get('type');

        console.log('🔍 Paramètres URL:', { token, type });

        if (!token) {
          setStatus('error');
          setMessage('Lien de confirmation invalide ou expiré.');
          return;
        }

        // Confirmer l'email avec Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        console.log('🔍 Résultat confirmation:', { data, error });

        if (error) {
          console.error('Erreur confirmation:', error);
          setStatus('error');
          setMessage('Erreur lors de la confirmation. Le lien est peut-être expiré.');
          return;
        }

        if (data.user) {
          // Marquer l'utilisateur comme vérifié dans notre table
          const { error: updateError } = await supabase
            .from('users')
            .update({ verified: true })
            .eq('id', data.user.id);

          if (updateError) {
            console.warn('Erreur mise à jour verified:', updateError);
          }

          setStatus('success');
          setMessage('¡Email confirmado! Votre compte est maintenant actif.');
          
          if (onSuccess) {
            setTimeout(() => onSuccess(), 2000);
          }
        } else {
          setStatus('error');
          setMessage('Erreur lors de la confirmation de l\'email.');
        }

      } catch (error) {
        console.error('Erreur confirmation email:', error);
        setStatus('error');
        setMessage('Erreur lors de la confirmation de l\'email.');
      }
    };

    confirmEmail();
  }, [onSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Header Sabor Dance */}
        <div className="mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sabor Dance
          </h1>
          <div className="text-2xl mb-4">💃 🕺 🎵 ✨</div>
        </div>

        {/* Icône de statut */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
          )}

          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
          )}
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'Confirmation en cours...'}
          {status === 'success' && '¡Email confirmado!'}
          {status === 'error' && 'Erreur de confirmation'}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="space-y-4">
          {status === 'success' && (
            <button
              onClick={onBackToHome}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🎉 Se connecter maintenant
            </button>
          )}

          <button
            onClick={onBackToHome}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </button>
        </div>

        {/* Instructions supplémentaires */}
        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">¿Qué hacer?</h3>
            <ul className="text-sm text-red-600 text-left space-y-1">
              <li>• Vérifiez que le lien n'est pas expiré</li>
              <li>• Essayez de vous inscrire à nouveau</li>
              <li>• Contactez support@sabordance.com</li>
            </ul>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Mail size={16} />
              <span className="text-sm font-medium">
                ¡Bienvenido a la comunidad Sabor Dance!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PAGE DE RESET PASSWORD ====================
interface PasswordResetProps {
  onBackToHome: () => void;
  onSuccess?: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ 
  onBackToHome, 
  onSuccess 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleResetPassword = async () => {
    setError('');

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Récupérer les paramètres de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const access_token = urlParams.get('access_token');
      const refresh_token = urlParams.get('refresh_token');

      if (!access_token || !refresh_token) {
        setError('Lien de réinitialisation invalide ou expiré');
        setLoading(false);
        return;
      }

      // Définir la session avec les tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (sessionError) {
        console.error('Erreur session:', sessionError);
        setError('Lien de réinitialisation invalide ou expiré');
        setLoading(false);
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Erreur mise à jour password:', updateError);
        setError('Erreur lors de la mise à jour du mot de passe');
        setLoading(false);
        return;
      }

      console.log('✅ Mot de passe mis à jour avec succès');
      setSuccess(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }

    } catch (error) {
      console.error('Erreur reset password:', error);
      setError('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Sabor Dance
            </h1>
            <div className="text-2xl mb-4">🔒 ✅ 🎉</div>
          </div>

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Contraseña actualizada!
          </h2>

          <p className="text-gray-600 mb-8">
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>

          <button
            onClick={onBackToHome}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎉 Se connecter maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Sabor Dance
          </h1>
          <div className="text-2xl mb-4">🔐 🔑 ✨</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Nouveau mot de passe
          </h2>
          <p className="text-gray-600 mt-2">
            Choisissez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="••••••••"
                style={{ color: '#111827' }}
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

          {/* Confirmer mot de passe */}
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
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="••••••••"
                style={{ color: '#111827' }}
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

          {/* Critères de sécurité */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2">Critères de sécurité :</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                • Au moins 6 caractères
              </li>
              <li className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                • Une lettre minuscule
              </li>
              <li className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                • Une lettre majuscule
              </li>
              <li className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                • Un chiffre
              </li>
            </ul>
          </div>

          {/* Boutons */}
          <div className="space-y-4">
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Mise à jour...
                </div>
              ) : (
                '🔒 Mettre à jour le mot de passe'
              )}
            </button>

            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft size={20} />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};