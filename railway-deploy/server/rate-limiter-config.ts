/**
 * CONFIGURAÇÃO AVANÇADA DE RATE LIMITING
 * Regras específicas para diferentes tipos de usuários e operações
 */

export const RATE_LIMITS = {
  // Usuários normais - quizzes simples
  BASIC_USER: {
    QUIZ_CREATION: 10,      // 10 quizzes por hora
    ELEMENTS_PER_QUIZ: 100, // 100 elementos por quiz
    REQUESTS_PER_MINUTE: 60 // 60 requisições por minuto
  },
  
  // Usuários premium - quizzes complexos
  PREMIUM_USER: {
    QUIZ_CREATION: 50,      // 50 quizzes por hora
    ELEMENTS_PER_QUIZ: 500, // 500 elementos por quiz
    REQUESTS_PER_MINUTE: 300 // 300 requisições por minuto
  },
  
  // Usuários enterprise - sem limites rígidos
  ENTERPRISE_USER: {
    QUIZ_CREATION: 200,     // 200 quizzes por hora
    ELEMENTS_PER_QUIZ: 1000, // 1000 elementos por quiz
    REQUESTS_PER_MINUTE: 1000 // 1000 requisições por minuto
  },
  
  // Limites para diferentes endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: 5,           // 5 tentativas de login por minuto
      REGISTER: 3,        // 3 registros por minuto
      REFRESH: 20         // 20 refreshes por minuto
    },
    QUIZ: {
      CREATE: 10,         // 10 criações por hora
      UPDATE: 60,         // 60 atualizações por hora
      DELETE: 5,          // 5 exclusões por hora
      ELEMENT_ADD: 100    // 100 elementos por hora
    },
    CAMPAIGNS: {
      SMS: 20,            // 20 campanhas SMS por hora
      EMAIL: 50,          // 50 campanhas email por hora
      WHATSAPP: 10        // 10 campanhas WhatsApp por hora
    }
  }
};

// Detecção de comportamento malicioso
export const SUSPICIOUS_PATTERNS = {
  // Velocidade muito alta (provável bot)
  HIGH_SPEED_REQUESTS: {
    threshold: 10,        // 10 requisições
    timeWindow: 5,        // em 5 segundos
    suspicionLevel: 0.8   // 80% de suspeita
  },
  
  // Padrões repetitivos
  REPETITIVE_ACTIONS: {
    threshold: 20,        // 20 ações idênticas
    timeWindow: 60,       // em 1 minuto
    suspicionLevel: 0.6   // 60% de suspeita
  },
  
  // Falta de interação humana
  NO_HUMAN_INTERACTION: {
    threshold: 100,       // 100 requisições
    timeWindow: 300,      // em 5 minutos
    suspicionLevel: 0.7   // 70% de suspeita
  }
};

// Configuração de whitelist para usuários especiais
export const WHITELIST = {
  // IPs de confiança (escritórios, servidores próprios)
  TRUSTED_IPS: [
    '127.0.0.1',
    '::1'
  ],
  
  // Usuários com acesso ilimitado
  UNLIMITED_USERS: [
    'admin@vendzz.com'
  ],
  
  // User agents permitidos
  ALLOWED_USER_AGENTS: [
    'VendzZBot/1.0',
    'MonitoringService/1.0'
  ]
};

// Configuração de crescimento dinâmico
export const DYNAMIC_LIMITS = {
  // Multiplicadores baseados em legitimidade
  LEGITIMACY_MULTIPLIERS: {
    VERY_HIGH: 3.0,  // 95%+ legitimidade
    HIGH: 2.0,       // 80%+ legitimidade
    MEDIUM: 1.5,     // 60%+ legitimidade
    LOW: 1.0,        // 40%+ legitimidade
    VERY_LOW: 0.5    // <40% legitimidade
  },
  
  // Multiplicadores baseados em complexidade
  COMPLEXITY_MULTIPLIERS: {
    SIMPLE: 1.0,     // <10 elementos
    MEDIUM: 1.5,     // 10-30 elementos
    COMPLEX: 2.0,    // 30-50 elementos
    VERY_COMPLEX: 3.0, // 50+ elementos
    EXTREME: 5.0     // 100+ elementos
  }
};