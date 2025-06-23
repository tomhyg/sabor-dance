import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

interface EmailConfirmationProps {
  onBackToHome: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ onBackToHome }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmation de votre email en cours...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Récupérer le token depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Lien de confirmation invalide.');
          return;
        }

        // Simuler la confirmation (vous devrez implémenter authService.confirmEmail)
        // const result = await authService.confirmEmail(token);
        
        // Pour l'instant, simulons un succès
        setTimeout(() => {
          setStatus('success');
          setMessage('Votre email a été confirmé avec succès ! Vous pouvez maintenant vous connecter.');
        }, 2000);

      } catch (error) {
        console.error('Erreur confirmation email:', error);
        setStatus('error');
        setMessage('Erreur lors de la confirmation de l\'email.');
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icône de statut */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'Confirmation en cours...'}
          {status === 'success' && 'Email confirmé !'}
          {status === 'error' && 'Erreur de confirmation'}
        </h1>

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
              Se connecter maintenant
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
            <h3 className="font-semibold text-red-800 mb-2">Que faire ?</h3>
            <ul className="text-sm text-red-600 text-left space-y-1">
              <li>• Vérifiez que le lien n'est pas expiré</li>
              <li>• Essayez de vous inscrire à nouveau</li>
              <li>• Contactez le support si le problème persiste</li>
            </ul>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Mail size={16} />
              <span className="text-sm font-medium">
                Votre compte est maintenant actif !
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;
