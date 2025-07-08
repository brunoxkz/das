// Configuração da extensão para usar a URL do Replit
// Substitua 'REPL_NAME' pelo nome real do seu Repl
const REPLIT_CONFIG = {
  // URL base do servidor - substitua pelo seu domínio público do Replit
  serverUrl: 'https://REPL_NAME.replit.dev',
  
  // Configurações padrão
  defaultSettings: {
    autoMode: false,
    refreshInterval: 30000, // 30 segundos
    debug: false
  },
  
  // Endpoints da API
  endpoints: {
    automationFiles: '/api/whatsapp-automation/files',
    fileContacts: '/api/whatsapp-automation/file-contacts',
    status: '/api/whatsapp-automation/status'
  }
};

// Função para obter a URL base baseada no ambiente
function getServerUrl() {
  // Se estiver rodando no Replit, use o domínio público
  if (typeof window !== 'undefined' && window.location.hostname.includes('replit')) {
    return `https://${window.location.hostname}`;
  }
  
  // Caso contrário, use a configuração padrão
  return REPLIT_CONFIG.serverUrl;
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { REPLIT_CONFIG, getServerUrl };
}