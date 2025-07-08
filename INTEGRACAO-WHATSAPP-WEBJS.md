# Integração WhatsApp Web.js - Guia Completo de Conexão

## Overview
Sistema completo para automação de mensagens WhatsApp usando Chrome Extension conectada ao sistema Vendzz rodando em localhost.

## Arquitetura da Conexão

```
[Sistema Vendzz - localhost:5000] ←→ [Chrome Extension] ←→ [WhatsApp Web]
                                         ↓
                                  [localStorage Bridge]
```

## Configuração do Sistema Local

### 1. Sistema Vendzz (Backend)
```bash
# Certifique-se que está rodando em:
http://localhost:5000

# Endpoints principais para extensão:
POST /api/extension/quiz-data        # Buscar dados do quiz
GET  /api/whatsapp/extension-status  # Status da conexão
POST /api/whatsapp/activate-quiz     # Ativar quiz
POST /api/whatsapp/automation        # Criar campanha
```

### 2. Frontend Vendzz
```bash
# Interface web disponível em:
http://localhost:5000

# Páginas importantes:
/login                    # Login no sistema
/whatsapp-campaigns       # Gerenciar campanhas
/analytics               # Monitorar resultados
```

## Instalação da Chrome Extension

### Arquivos Necessários
```
chrome-extension-webjs/
├── manifest.json         # Configuração da extensão
├── background.js         # Service worker principal
├── content.js           # Script para WhatsApp Web
├── popup.html           # Interface da extensão
├── popup.js             # Lógica da interface
├── sidebar.html         # Sidebar no WhatsApp
├── sidebar.js           # Controles da sidebar
└── sidebar-content.js   # Injeção da sidebar
```

### Passos de Instalação
1. **Abrir Chrome Extensions:**
   - Chrome → Menu → Mais ferramentas → Extensões
   - Ou digitar: `chrome://extensions/`

2. **Ativar Modo Desenvolvedor:**
   - Toggle "Modo do desenvolvedor" (canto superior direito)

3. **Carregar Extensão:**
   - Clicar "Carregar sem compactação"
   - Selecionar pasta `chrome-extension-webjs/`
   - Extensão aparece na lista

4. **Verificar Instalação:**
   - Ícone da extensão no Chrome
   - Status: "Ativada"

## Configuração da Extensão

### 1. Configuração Inicial
```javascript
// Configurações automáticas detectadas:
const config = {
  serverUrl: 'http://localhost:5000',
  apiEndpoints: {
    auth: '/api/auth/login',
    quizData: '/api/extension/quiz-data',
    status: '/api/whatsapp/extension-status'
  },
  autoDetect: true,
  pingInterval: 30000 // 30 segundos
};
```

### 2. Autenticação
- Extensão usa mesmo sistema JWT do Vendzz
- Token compartilhado via localStorage
- Renovação automática quando expira

## Fluxo de Trabalho Completo

### Passo 1: Preparar Sistema
```bash
# 1. Iniciar sistema Vendzz
npm run dev

# 2. Verificar se está rodando
curl http://localhost:5000/api/quizzes

# 3. Fazer login no navegador
# Ir para: http://localhost:5000/login
```

### Passo 2: Instalar e Configurar Extensão
```bash
# 1. Instalar extensão Chrome (passos acima)
# 2. Abrir WhatsApp Web
# 3. Fazer login no WhatsApp
# 4. Sidebar aparece automaticamente
```

### Passo 3: Conectar Sistemas
```javascript
// 1. No Vendzz (http://localhost:5000):
// - Login com admin@vendzz.com
// - Ir para "Campanhas WhatsApp"
// - Selecionar quiz com telefones

// 2. Configurar campanha:
const campaignData = {
  quizId: 'quiz-id-aqui',
  targetAudience: 'all', // ou 'completed', 'abandoned'
  messages: [
    'Mensagem 1 com {nome} e {telefone}',
    'Mensagem 2 com {quiz_titulo}',
    'Mensagem 3 com {status} em {data_resposta}',
    'Mensagem 4 final'
  ],
  sendingConfig: {
    delay: 7, // 7 segundos (recomendado)
    randomInterval: true,
    workingHours: { start: '09:00', end: '18:00' },
    maxPerDay: 100
  }
};

// 3. Enviar para extensão via localStorage
localStorage.setItem('vendzz_campaign_data', JSON.stringify(campaignData));
```

### Passo 4: Ativar Automação
```javascript
// Na sidebar da extensão:
// 1. Verificar dados recebidos
// 2. Configurar filtros (se necessário)
// 3. Clicar "Ativar Automação"
// 4. Monitorar logs em tempo real
```

## Endpoints da API

### 1. Buscar Dados do Quiz
```bash
POST /api/extension/quiz-data
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "quizId": "quiz-id",
  "targetAudience": "all", // all, completed, abandoned
  "dateFilter": "2025-07-08" // opcional
}

# Resposta:
{
  "success": true,
  "quiz": {
    "id": "quiz-id",
    "title": "Nome do Quiz",
    "description": "Descrição"
  },
  "phones": [
    {
      "phone": "11999887766",
      "status": "completed",
      "completionPercentage": 100,
      "submittedAt": "2025-07-08T10:30:00Z"
    }
  ],
  "total": 1,
  "variables": {
    "nome": "{nome}",
    "telefone": "{telefone}",
    "quiz_titulo": "Nome do Quiz",
    "status": "{status}",
    "data_resposta": "{data_resposta}"
  }
}
```

### 2. Status da Extensão
```bash
GET /api/whatsapp/extension-status
Authorization: Bearer <jwt-token>

# Resposta:
{
  "isConnected": false,
  "isActive": false,
  "phoneCount": 0,
  "lastSync": "Nunca"
}
```

### 3. Ativar Quiz
```bash
POST /api/whatsapp/activate-quiz
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "quizId": "quiz-id"
}
```

## Configurações de Segurança

### Intervalos Recomendados
```javascript
const safetyConfig = {
  // MUITO SEGURO (recomendado para produção)
  interval: 7000,        // 7 segundos base
  randomDelay: 3000,     // +0-3s aleatório
  totalDelay: '7-10s',   // Total por mensagem
  
  // Horário comercial
  workingHours: {
    start: '09:00',
    end: '18:00',
    enabled: true
  },
  
  // Limites diários
  maxPerDay: 100,
  
  // Anti-spam
  messagesRotation: 4, // Mínimo 4 mensagens diferentes
  variableSubstitution: true
};
```

### Variáveis Disponíveis
```javascript
const variables = {
  '{nome}': 'Nome do lead (se disponível)',
  '{telefone}': 'Número do telefone limpo',
  '{quiz_titulo}': 'Título do quiz respondido',
  '{status}': 'completed ou abandoned',
  '{data_resposta}': 'Data da resposta (DD/MM/AAAA)',
  '{completacao_percentual}': 'Percentual completado (0-100)'
};

// Exemplo de mensagem:
const message = 'Olá! Obrigado por responder nosso quiz "{quiz_titulo}". ' +
                'Seu telefone {telefone} foi confirmado com status {status}. ' +
                'Resposta enviada em {data_resposta}.';
```

## Monitoramento e Logs

### Console da Extensão
```javascript
// Logs principais:
console.log('[VENDZZ] Dados recebidos:', campaignData);
console.log('[VENDZZ] Telefones filtrados:', filteredPhones);
console.log('[VENDZZ] Mensagem enviada:', processedMessage);
console.log('[VENDZZ] Status:', { sent: 10, failed: 0, pending: 5 });
```

### Interface da Sidebar
```
┌─────────────────────────────┐
│ VENDZZ WHATSAPP AUTOMATION  │
├─────────────────────────────┤
│ Status: ● Ativo             │
│ Quiz: Nome do Quiz          │
│ Telefones: 15 (todos)       │
│ Enviadas: 8                 │
│ Pendentes: 7                │
│ Falhas: 0                   │
├─────────────────────────────┤
│ [●] Pausar  [⚙] Config     │
│ [📊] Stats  [📋] Logs      │
└─────────────────────────────┘
```

## Troubleshooting

### Problemas Comuns

1. **Extensão não aparece no WhatsApp:**
   ```bash
   # Verificar se extensão está ativa
   chrome://extensions/
   
   # Recarregar página do WhatsApp
   F5 ou Ctrl+R
   ```

2. **Erro de conexão com localhost:**
   ```bash
   # Verificar se sistema está rodando
   curl http://localhost:5000/api/whatsapp/extension-status
   
   # Verificar logs do servidor
   npm run dev
   ```

3. **Token expirado:**
   ```bash
   # Fazer login novamente no sistema
   http://localhost:5000/login
   
   # Token é renovado automaticamente
   ```

4. **Mensagens não enviando:**
   ```javascript
   // Verificar dados no localStorage
   console.log(localStorage.getItem('vendzz_campaign_data'));
   
   // Verificar se WhatsApp está carregado
   document.querySelector('[data-testid="conversation-compose-box-input"]');
   ```

## Exemplo Completo de Uso

### 1. Sistema (Terminal)
```bash
# Iniciar Vendzz
npm run dev
# → Sistema rodando em http://localhost:5000
```

### 2. Navegador (http://localhost:5000)
```javascript
// Login → Campanhas WhatsApp → Configurar:
{
  quiz: "Quiz de Emagrecimento",
  phones: 15,
  messages: [
    "Olá {nome}! Parabéns por completar o quiz {quiz_titulo}! 🎉",
    "Seu resultado foi processado. Telefone: {telefone}",
    "Status: {status}. Data: {data_resposta}",
    "Preparamos uma oferta especial para você!"
  ],
  timing: "7s + aleatorio",
  audience: "all"
}
// → Enviar para Extensão
```

### 3. WhatsApp Web + Extensão
```javascript
// Extensão detecta dados automaticamente
// Sidebar mostra: "15 telefones prontos"
// Clicar: "Ativar Automação"
// Monitorar: Logs em tempo real
```

### 4. Resultado
```
[10:30:15] Enviando para 11999887766...
[10:30:22] ✅ Mensagem enviada (7.2s)
[10:30:30] Enviando para 11888776655...
[10:30:38] ✅ Mensagem enviada (8.1s)
...
Estatísticas: 15 enviadas, 0 falhas, 100% sucesso
```

## Status do Sistema

- ✅ Backend funcionando (localhost:5000)
- ✅ Frontend operacional
- ✅ API endpoints validados
- ✅ Chrome Extension completa
- ✅ Sistema de variáveis implementado
- ✅ Filtros de audiência funcionais
- ✅ Intervalos de segurança configurados
- ✅ Monitoramento em tempo real

**Sistema 100% pronto para uso em produção!**