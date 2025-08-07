import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traduções
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    lng: 'pt-BR', // idioma padrão
    
    interpolation: {
      escapeValue: false // react já faz escape por padrão
    },

    detection: {
      // ordem de detecção do idioma
      order: ['localStorage', 'navigator', 'htmlTag'],
      // cache no localStorage
      caches: ['localStorage'],
      // chave para salvar no localStorage
      lookupLocalStorage: 'vendzz-language'
    },

    // configurações para performance
    saveMissing: false,
    debug: false,
    
    react: {
      useSuspense: false // evita problemas de loading
    },
    
    // fallback para chaves não encontradas
    returnNull: false,
    returnEmptyString: false,
    
    // configurações para evitar erros
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
      return key;
    }
  });

export default i18n;