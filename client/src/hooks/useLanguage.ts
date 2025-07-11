import { useState, useEffect, createContext, useContext } from "react";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for when used outside provider
    const [currentLanguage, setCurrentLanguage] = useState(() => {
      return localStorage.getItem('language') || 'pt-BR';
    });

    const changeLanguage = (language: string) => {
      setCurrentLanguage(language);
      localStorage.setItem('language', language);
      // Trigger page reload to apply translations
      window.location.reload();
    };

    const t = (key: string, params?: Record<string, string>) => {
      return getTranslation(key, currentLanguage, params);
    };

    return { currentLanguage, changeLanguage, t };
  }
  return context;
}

// Translation function
function getTranslation(key: string, language: string, params?: Record<string, string>): string {
  const translations: Record<string, Record<string, string>> = {
    'pt-BR': {
      // Sidebar
      'dashboard': 'Dashboard',
      'create_quiz': 'Criar Quiz',
      'my_quizzes': 'Meus Quizzes',
      'analytics': 'Analytics',
      'real_time_analytics': 'Analytics em Tempo Real',
      'email_marketing': 'Email Marketing',
      'sms_campaigns': 'Campanhas SMS',
      'whatsapp_automation': 'Automação WhatsApp',
      'cloaker': 'Cloaker',
      'upgrade': 'Upgrade',
      'settings': 'Configurações',
      'awards': 'Premiações',
      'current_plan': 'Plano Atual',
      'quizzes_created': 'quizzes criados',
      'unlimited': 'ilimitado',
      'quizzes_used': 'quizzes utilizados',
      
      // Dashboard
      'welcome_back': 'Bem-vindo de volta!',
      'dashboard_subtitle': 'Acompanhe o desempenho dos seus quizzes',
      'total_quizzes': 'Total de Quizzes',
      'total_views': 'Total de Visualizações',
      'total_leads': 'Total de Leads',
      'conversion_rate': 'Taxa de Conversão',
      'your_quizzes': 'Seus Quizzes',
      'quick_buttons': 'Botões Rápidos',
      'create_quiz_btn': 'Criar Quiz',
      'view_analytics': 'Ver Analytics',
      'tutorials': 'Tutoriais',
      'plans': 'Planos',
      'marketing_automation': 'Automação de Marketing',
      'email_campaigns': 'Campanhas Email',
      'sms_marketing': 'Marketing SMS',
      'whatsapp_campaigns': 'Campanhas WhatsApp',
      'quick_actions': 'Ações Rápidas',
      'import_contacts': 'Importar Contatos',
      'export_data': 'Exportar Dados',
      'integrations': 'Integrações',
      'api_settings': 'Configurações API',
      
      // Common
      'loading': 'Carregando...',
      'error': 'Erro',
      'success': 'Sucesso',
      'cancel': 'Cancelar',
      'save': 'Salvar',
      'delete': 'Deletar',
      'edit': 'Editar',
      'view': 'Visualizar',
      'create': 'Criar',
      'update': 'Atualizar',
      'search': 'Pesquisar',
      'filter': 'Filtrar',
      'sort': 'Ordenar',
      'export': 'Exportar',
      'import': 'Importar',
      'close': 'Fechar',
      'open': 'Abrir',
      'yes': 'Sim',
      'no': 'Não',
      'back': 'Voltar',
      'next': 'Próximo',
      'previous': 'Anterior',
      'finish': 'Finalizar',
      'continue': 'Continuar',
      
      // Notifications
      'welcome_notification': 'Bem-vindo ao Vendzz!',
      'account_created': 'Sua conta foi criada com sucesso. Explore as funcionalidades da plataforma.',
      'system_updated': 'Sistema atualizado',
      'new_version_available': 'Nova versão disponível com melhorias de performance.',
      'sms_credits': 'Créditos SMS',
      'credits_available': 'Você tem {credits} créditos SMS disponíveis para suas campanhas.',
      'remarketing_sms': 'Remarketing SMS',
      'templates': 'Templates',
      'admin': 'Admin',
      'current_plan': 'Plano Atual',
      'upgrade': 'Upgrade',
      'settings': 'Configurações',
      'credits': 'Créditos',
      'awards': 'Premiações',
    },
    'en-US': {
      // Sidebar
      'dashboard': 'Dashboard',
      'create_quiz': 'Create Quiz',
      'my_quizzes': 'My Quizzes',
      'analytics': 'Analytics',
      'real_time_analytics': 'Real-time Analytics',
      'email_marketing': 'Email Marketing',
      'sms_campaigns': 'SMS Campaigns',
      'whatsapp_automation': 'WhatsApp Automation',
      'cloaker': 'Cloaker',
      'upgrade': 'Upgrade',
      'settings': 'Settings',
      'awards': 'Awards',
      'current_plan': 'Current Plan',
      'quizzes_created': 'quizzes created',
      'unlimited': 'unlimited',
      'quizzes_used': 'quizzes used',
      
      // Dashboard
      'welcome_back': 'Welcome back!',
      'dashboard_subtitle': 'Track your quiz performance',
      'total_quizzes': 'Total Quizzes',
      'total_views': 'Total Views',
      'total_leads': 'Total Leads',
      'conversion_rate': 'Conversion Rate',
      'your_quizzes': 'Your Quizzes',
      'quick_buttons': 'Quick Buttons',
      'create_quiz_btn': 'Create Quiz',
      'view_analytics': 'View Analytics',
      'tutorials': 'Tutorials',
      'plans': 'Plans',
      'marketing_automation': 'Marketing Automation',
      'email_campaigns': 'Email Campaigns',
      'sms_marketing': 'SMS Marketing',
      'whatsapp_campaigns': 'WhatsApp Campaigns',
      'quick_actions': 'Quick Actions',
      'import_contacts': 'Import Contacts',
      'export_data': 'Export Data',
      'integrations': 'Integrations',
      'api_settings': 'API Settings',
      
      // Common
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'view': 'View',
      'create': 'Create',
      'update': 'Update',
      'search': 'Search',
      'filter': 'Filter',
      'sort': 'Sort',
      'export': 'Export',
      'import': 'Import',
      'close': 'Close',
      'open': 'Open',
      'yes': 'Yes',
      'no': 'No',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'finish': 'Finish',
      'continue': 'Continue',
      
      // Notifications
      'welcome_notification': 'Welcome to Vendzz!',
      'account_created': 'Your account has been created successfully. Explore the platform features.',
      'system_updated': 'System Updated',
      'new_version_available': 'New version available with performance improvements.',
      'sms_credits': 'SMS Credits',
      'credits_available': 'You have {credits} SMS credits available for your campaigns.',
      'remarketing_sms': 'SMS Remarketing',
      'templates': 'Templates',
      'admin': 'Admin',
      'current_plan': 'Current Plan',
      'upgrade': 'Upgrade',
      'settings': 'Settings',
      'credits': 'Credits',
      'awards': 'Awards',
    },
    'es-ES': {
      // Sidebar
      'dashboard': 'Panel de Control',
      'create_quiz': 'Crear Quiz',
      'my_quizzes': 'Mis Quizzes',
      'analytics': 'Analíticas',
      'real_time_analytics': 'Analíticas en Tiempo Real',
      'email_marketing': 'Email Marketing',
      'sms_campaigns': 'Campañas SMS',
      'whatsapp_automation': 'Automatización WhatsApp',
      'cloaker': 'Cloaker',
      'upgrade': 'Actualizar',
      'settings': 'Configuraciones',
      'awards': 'Premios',
      'current_plan': 'Plan Actual',
      'quizzes_created': 'quizzes creados',
      'unlimited': 'ilimitado',
      'quizzes_used': 'quizzes utilizados',
      
      // Dashboard
      'welcome_back': '¡Bienvenido de vuelta!',
      'dashboard_subtitle': 'Rastrea el rendimiento de tus quizzes',
      'total_quizzes': 'Total de Quizzes',
      'total_views': 'Total de Visualizaciones',
      'total_leads': 'Total de Leads',
      'conversion_rate': 'Tasa de Conversión',
      'your_quizzes': 'Tus Quizzes',
      'quick_buttons': 'Botones Rápidos',
      'create_quiz_btn': 'Crear Quiz',
      'view_analytics': 'Ver Analíticas',
      'tutorials': 'Tutoriales',
      'plans': 'Planes',
      'marketing_automation': 'Automatización de Marketing',
      'email_campaigns': 'Campañas Email',
      'sms_marketing': 'Marketing SMS',
      'whatsapp_campaigns': 'Campañas WhatsApp',
      'quick_actions': 'Acciones Rápidas',
      'import_contacts': 'Importar Contactos',
      'export_data': 'Exportar Datos',
      'integrations': 'Integraciones',
      'api_settings': 'Configuraciones API',
      
      // Common
      'loading': 'Cargando...',
      'error': 'Error',
      'success': 'Éxito',
      'cancel': 'Cancelar',
      'save': 'Guardar',
      'delete': 'Eliminar',
      'edit': 'Editar',
      'view': 'Ver',
      'create': 'Crear',
      'update': 'Actualizar',
      'search': 'Buscar',
      'filter': 'Filtrar',
      'sort': 'Ordenar',
      'export': 'Exportar',
      'import': 'Importar',
      'close': 'Cerrar',
      'open': 'Abrir',
      'yes': 'Sí',
      'no': 'No',
      'back': 'Atrás',
      'next': 'Siguiente',
      'previous': 'Anterior',
      'finish': 'Finalizar',
      'continue': 'Continuar',
      
      // Notifications
      'welcome_notification': '¡Bienvenido a Vendzz!',
      'account_created': 'Tu cuenta ha sido creada exitosamente. Explora las funcionalidades de la plataforma.',
      'system_updated': 'Sistema Actualizado',
      'new_version_available': 'Nueva versión disponible con mejoras de rendimiento.',
      'sms_credits': 'Créditos SMS',
      'credits_available': 'Tienes {credits} créditos SMS disponibles para tus campañas.',
      'remarketing_sms': 'SMS Remarketing',
      'templates': 'Plantillas',
      'admin': 'Admin',
      'current_plan': 'Plan Actual',
      'upgrade': 'Actualizar',
      'settings': 'Configuraciones',
      'credits': 'Créditos',
      'awards': 'Premios',
    },
    'fr-FR': {
      // Sidebar
      'dashboard': 'Tableau de Bord',
      'create_quiz': 'Créer Quiz',
      'my_quizzes': 'Mes Quizzes',
      'analytics': 'Analytiques',
      'real_time_analytics': 'Analytiques en Temps Réel',
      'email_marketing': 'Email Marketing',
      'sms_campaigns': 'Campagnes SMS',
      'whatsapp_automation': 'Automatisation WhatsApp',
      'cloaker': 'Cloaker',
      'upgrade': 'Mise à Niveau',
      'settings': 'Paramètres',
      'awards': 'Récompenses',
      'current_plan': 'Plan Actuel',
      'quizzes_created': 'quizzes créés',
      'unlimited': 'illimité',
      'quizzes_used': 'quizzes utilisés',
      
      // Dashboard
      'welcome_back': 'Bon retour!',
      'dashboard_subtitle': 'Suivez les performances de vos quizzes',
      'total_quizzes': 'Total des Quizzes',
      'total_views': 'Total des Vues',
      'total_leads': 'Total des Leads',
      'conversion_rate': 'Taux de Conversion',
      'your_quizzes': 'Vos Quizzes',
      'quick_buttons': 'Boutons Rapides',
      'create_quiz_btn': 'Créer Quiz',
      'view_analytics': 'Voir Analytiques',
      'tutorials': 'Tutoriels',
      'plans': 'Plans',
      'marketing_automation': 'Automatisation Marketing',
      'email_campaigns': 'Campagnes Email',
      'sms_marketing': 'Marketing SMS',
      'whatsapp_campaigns': 'Campagnes WhatsApp',
      'quick_actions': 'Actions Rapides',
      'import_contacts': 'Importer Contacts',
      'export_data': 'Exporter Données',
      'integrations': 'Intégrations',
      'api_settings': 'Paramètres API',
      
      // Common
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
      'cancel': 'Annuler',
      'save': 'Sauvegarder',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'view': 'Voir',
      'create': 'Créer',
      'update': 'Mettre à jour',
      'search': 'Rechercher',
      'filter': 'Filtrer',
      'sort': 'Trier',
      'export': 'Exporter',
      'import': 'Importer',
      'close': 'Fermer',
      'open': 'Ouvrir',
      'yes': 'Oui',
      'no': 'Non',
      'back': 'Retour',
      'next': 'Suivant',
      'previous': 'Précédent',
      'finish': 'Terminer',
      'continue': 'Continuer',
      
      // Notifications
      'welcome_notification': 'Bienvenue sur Vendzz!',
      'account_created': 'Votre compte a été créé avec succès. Explorez les fonctionnalités de la plateforme.',
      'system_updated': 'Système Mis à Jour',
      'new_version_available': 'Nouvelle version disponible avec des améliorations de performance.',
      'sms_credits': 'Crédits SMS',
      'credits_available': 'Vous avez {credits} crédits SMS disponibles pour vos campagnes.',
      'remarketing_sms': 'SMS Remarketing',
      'templates': 'Modèles',
      'admin': 'Admin',
      'current_plan': 'Plan Actuel',
      'upgrade': 'Mise à Niveau',
      'settings': 'Paramètres',
      'credits': 'Crédits',
      'awards': 'Récompenses',
    }
  };

  const langTranslations = translations[language] || translations['pt-BR'];
  let translation = langTranslations[key] || key;

  // Replace parameters if provided
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value);
    });
  }

  return translation;
}