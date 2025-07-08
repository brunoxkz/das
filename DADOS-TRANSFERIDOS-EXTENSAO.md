# Dados Transferidos para a Chrome Extension

## 🔄 Informações Enviadas pelo Sistema Vendzz

### 1. **Token de Autenticação (JWT)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-08-07T04:21:00.000Z",
  "createdAt": "2025-07-08T04:21:00.000Z",
  "purpose": "chrome_extension",
  "userId": "KjctNCOlM5jcafgA_drVQ"
}
```

### 2. **Lista de Quizzes Disponíveis**
```json
[
  {
    "id": "Qm4wxpfPgkMrwoMhDFNLZ",
    "title": "novo 1 min",
    "description": "Quiz rápido para teste",
    "isPublished": true,
    "createdAt": "2025-07-07T20:25:24.000Z",
    "phoneCount": 3
  },
  {
    "id": "xyz789",
    "title": "Quiz de Emagrecimento Rápido", 
    "description": "Perda de peso em 30 dias",
    "isPublished": true,
    "phoneCount": 156
  }
]
```

### 3. **Telefones por Quiz Selecionado**
```json
{
  "success": true,
  "quiz": {
    "id": "Qm4wxpfPgkMrwoMhDFNLZ",
    "title": "novo 1 min"
  },
  "phones": [
    {
      "phone": "11996595909",
      "name": "João Silva",
      "email": "joao@exemplo.com", 
      "status": "abandoned",
      "completionPercentage": 45,
      "submittedAt": "2025-07-07T20:57:00.000Z",
      "responses": {
        "nome": "João Silva",
        "telefone_principal": "11996595909",
        "peso_atual": "85kg",
        "altura": "1.75m"
      }
    },
    {
      "phone": "113232333232",
      "name": "Maria Santos",
      "status": "completed", 
      "completionPercentage": 100,
      "submittedAt": "2025-07-07T20:56:37.000Z"
    }
  ],
  "total": 3,
  "filtered": 2
}
```

### 4. **Variáveis Disponíveis para Mensagens**
```json
{
  "variables": [
    "{nome}",
    "{telefone}", 
    "{quiz_titulo}",
    "{status}",
    "{data_resposta}",
    "{completacao_percentual}",
    "{peso_atual}",
    "{altura}",
    "{email}"
  ],
  "examples": {
    "{nome}": "João Silva",
    "{telefone}": "11996595909", 
    "{quiz_titulo}": "novo 1 min",
    "{status}": "abandonado",
    "{data_resposta}": "07/07/2025",
    "{completacao_percentual}": "45%"
  }
}
```

### 5. **Configurações de Segurança**
```json
{
  "securitySettings": {
    "minInterval": 7000,
    "maxInterval": 10000,
    "randomDelay": 3000,
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    },
    "maxMessagesPerDay": 100,
    "minMessagesForRotation": 4,
    "antiSpamEnabled": true
  }
}
```

### 6. **Status de Conexão em Tempo Real**
```json
{
  "isConnected": true,
  "isActive": true,
  "phoneCount": 156,
  "lastSync": "2025-07-08T04:21:00.000Z",
  "serverTime": "2025-07-08T04:21:00.000Z",
  "campaignsActive": 2,
  "messagesQueued": 45
}
```

## 📤 Informações Enviadas PELA Extensão

### 1. **Status da Extensão**
```json
{
  "version": "1.0.0",
  "isActive": true,
  "whatsappConnected": true,
  "pendingMessages": 12,
  "sentMessages": 45,
  "failedMessages": 2,
  "lastActivity": "2025-07-08T04:21:00.000Z"
}
```

### 2. **Logs de Atividade**
```json
{
  "logs": [
    {
      "timestamp": "2025-07-08T04:21:00.000Z",
      "level": "info",
      "message": "Mensagem enviada para 11996595909",
      "campaignId": "camp_123",
      "phone": "11996595909"
    },
    {
      "timestamp": "2025-07-08T04:20:50.000Z", 
      "level": "success",
      "message": "Campanha ativada com 15 telefones",
      "campaignId": "camp_123"
    }
  ]
}
```

### 3. **Confirmação de Mensagens Enviadas**
```json
{
  "messageId": "msg_456",
  "phone": "11996595909",
  "status": "sent",
  "timestamp": "2025-07-08T04:21:00.000Z",
  "campaignId": "camp_123",
  "messageText": "Olá João! Obrigado por responder nosso quiz.",
  "deliveryStatus": "delivered"
}
```

### 4. **Estatísticas de Desempenho**
```json
{
  "stats": {
    "totalSent": 45,
    "totalDelivered": 42,
    "totalFailed": 3,
    "successRate": 93.3,
    "averageDelay": 8.5,
    "activeCampaigns": 2,
    "todayQuota": {
      "used": 45,
      "limit": 100,
      "remaining": 55
    }
  }
}
```

## 🔐 Dados Sensíveis Protegidos

### ❌ NUNCA São Enviados:
- Senhas de usuários
- Tokens de outros usuários
- Dados de quizzes de outros clientes
- Informações bancárias ou de pagamento
- Logs do servidor interno
- Configurações de banco de dados

### ✅ Sempre Criptografados:
- Tokens JWT com expiração
- Dados de telefones com hash
- Logs de atividade com timestamp
- Status de conexão validado

## 📋 Endpoints Específicos da Extensão

### GET `/api/whatsapp/extension-status`
**Envia:** Status atual do sistema e da extensão

### POST `/api/whatsapp/extension-token` 
**Envia:** Token JWT válido por 30 dias

### POST `/api/extension/quiz-data`
**Envia:** Lista completa de telefones do quiz selecionado

### GET `/api/quizzes`
**Envia:** Todos os quizzes do usuário autenticado

### POST `/api/extension/command-executed`
**Recebe:** Confirmação de mensagem enviada pela extensão

### GET `/api/extension/sync`
**Envia:** Sincronização bidirecional de configurações

## 🛡️ Validações de Segurança

### Verificações Automáticas:
1. **Token JWT válido** - Verifica em cada requisição
2. **Usuário autorizado** - Só acessa seus próprios dados  
3. **Quiz ownership** - Só telefones dos seus quizzes
4. **Rate limiting** - Máximo 1000 req/min por usuário
5. **Filtros de audience** - Completed/abandoned respeitados
6. **Validação de telefone** - Apenas números válidos (10-15 dígitos)

### Logs de Auditoria:
```
🔑 [admin@vendzz.com] Token gerado para extensão
📱 [admin@vendzz.com] Acessou telefones do quiz: novo 1 min  
📤 [admin@vendzz.com] Sincronizou 3 telefones para extensão
✅ [admin@vendzz.com] Extensão reportou 1 mensagem enviada
```

O sistema garante que a extensão recebe apenas os dados necessários para funcionar, sempre validando a propriedade dos dados e mantendo logs de auditoria completos.