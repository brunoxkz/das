// Configuração da extensão para usar a URL do Replit
// Substitua 'REPL_NAME' pelo nome real do seu Repl
const REPLIT_CONFIG = {
  // URL base do servidor - domínio público automático do Replit
  serverUrl: 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev',
  
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
  return 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { REPLIT_CONFIG, getServerUrl };
}