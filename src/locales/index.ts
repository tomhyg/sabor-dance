// src/locales/index.ts - Export helper pour les traductions

export {
  translations,
  useTranslation,
  getTranslation,
  detectBrowserLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  type Language,
  type TranslationKey,
  type TranslationParams
} from './translations';

// Import getTranslation pour l'utiliser dans la fonction t
import { getTranslation } from './translations';

// Fonction helper rapide pour récupérer une traduction
export const t = (language: 'fr' | 'en' | 'es', key: string) => {
  return getTranslation(language, key);
};

// Export des traductions par langue pour utilisation directe
export { translations as allTranslations } from './translations';