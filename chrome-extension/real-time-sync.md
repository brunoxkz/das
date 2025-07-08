# 🔄 Sistema de Sincronização em Tempo Real

## Visão Geral

O sistema de sincronização em tempo real conecta a extensão Chrome com as configurações do usuário no servidor Vendzz, garantindo que:

- **Configurações sejam sincronizadas bidirecionalmente** entre extensão e servidor
- **Mudanças no sistema sejam refletidas automaticamente** na extensão
- **Múltiplas instâncias da extensão** mantenham configurações consistentes
- **Segurança seja mantida** com autenticação JWT obrigatória

## Arquitetura de Sincronização

### 1. **Ping Automático com Sync**
```javascript
// A cada 30 segundos, a extensão faz ping e recebe configurações atualizadas
POST /api/whatsapp-extension/status
{
  "version": "1.0.0",
  "pendingMessages": 3,
  "sentMessages": 15,
  "failedMessages": 0,
  "isActive": true
}

// Resposta inclui configurações sincronizadas
{
  "success": true,
  "serverTime": "2025-07-08T01:42:00.082Z",
  "settings": {
    "autoSend": true,
    "messageDelay": 3000,
    "maxMessagesPerDay": 100,
    "workingHours": { "enabled": false },
    "antiSpam": { "enabled": true, "minDelay": 2000 }
  }
}
```

### 2. **Configurações Dedicadas**
```javascript
// Buscar configurações
GET /api/whatsapp-extension/settings
Authorization: Bearer <JWT_TOKEN>

// Salvar configurações
POST /api/whatsapp-extension/settings
{
  "autoSend": true,
  "messageDelay": 5000,
  "maxMessagesPerDay": 200,
  "workingHours": {
    "enabled": true,
    "start": "09:00",
    "end": "18:00"
  }
}
```

### 3. **Persistência no Banco**
```sql
-- Campo extension_settings na tabela users
ALTER TABLE users ADD COLUMN extension_settings TEXT DEFAULT NULL;

-- Armazena JSON com configurações do usuário
UPDATE users 
SET extension_settings = '{"autoSend":true,"messageDelay":3000}' 
WHERE id = 'user_id';
```

## Fluxo de Sincronização

### **Inicialização da Extensão**
1. **Conectar** - Extensão se conecta ao servidor com JWT
2. **Buscar configurações** - Solicita configurações do usuário
3. **Aplicar localmente** - Salva configurações na extensão
4. **Iniciar ping** - Ativa sincronização automática

### **Sincronização Contínua**
1. **Ping periódico** (30s) - Extensão envia status + recebe configurações
2. **Detecção de mudanças** - Compara configurações recebidas com locais
3. **Aplicar atualizações** - Aplica configurações do servidor
4. **Logging** - Registra mudanças para auditoria

### **Mudanças no Sistema**
1. **Usuário altera configurações** no painel Vendzz
2. **Servidor salva** no campo extension_settings
3. **Próximo ping** retorna configurações atualizadas
4. **Extensão aplica** mudanças automaticamente

## Configurações Suportadas

### **Comportamento de Envio**
- `autoSend`: Habilita/desabilita envio automático
- `messageDelay`: Intervalo entre mensagens (ms)
- `maxMessagesPerDay`: Limite diário de mensagens

### **Horário de Funcionamento**
- `workingHours.enabled`: Ativa/desativa horário comercial
- `workingHours.start`: Hora de início (HH:MM)
- `workingHours.end`: Hora de fim (HH:MM)

### **Proteção Anti-Spam**
- `antiSpam.enabled`: Ativa proteção
- `antiSpam.minDelay`: Delay mínimo (ms)
- `antiSpam.maxDelay`: Delay máximo (ms)
- `antiSpam.randomization`: Randomização de delays

## Segurança

### **Autenticação Obrigatória**
- Todas as rotas exigem JWT válido
- Token verificado a cada requisição
- Configurações isoladas por usuário

### **Validação de Propriedade**
- Usuário só acessa suas configurações
- Impossible acessar dados de outros usuários
- Logs de auditoria com email/ID do usuário

## Tratamento de Conflitos

### **Prioridade do Servidor**
- Configurações do servidor sempre têm prioridade
- Extensão nunca sobrescreve configurações do sistema
- Mudanças críticas (limites, segurança) são aplicadas imediatamente

### **Resolução de Conflitos**
1. **Servidor detecta conflito** (configurações diferentes)
2. **Aplica configuração mais restritiva** (segurança)
3. **Notifica extensão** no próximo ping
4. **Extensão aplica** configuração do servidor

## Monitoramento

### **Logs de Sincronização**
```
⚙️ CONFIGURAÇÕES SOLICITADAS para admin@vendzz.com
⚙️ CONFIGURAÇÕES ATUALIZADAS para admin@vendzz.com: {...}
📱 PING EXTENSÃO admin@vendzz.com: v1.0.0, pendentes: 2, enviadas: 10
```

### **Métricas Disponíveis**
- Frequência de sincronização
- Configurações mais alteradas
- Usuários ativos por período
- Conflitos detectados e resolvidos

## Exemplo de Uso

### **Na Extensão (background.js)**
```javascript
// Conectar e sincronizar
await connectToServer();
await syncSettingsFromServer();

// Aplicar configurações recebidas
if (config.serverSettings.autoSend) {
  await processMessages();
}

// Enviar configurações para servidor
await syncSettingsToServer({
  messageDelay: 5000,
  maxMessagesPerDay: 150
});
```

### **No Sistema Vendzz**
```javascript
// Usuário altera configurações no painel
updateUserSettings({
  messageDelay: 3000,
  workingHours: { enabled: true }
});

// Servidor salva no banco
await storage.updateUserExtensionSettings(userId, settings);

// Próximo ping da extensão recebe as mudanças
```

## Vantagens do Sistema

✅ **Configurações sempre sincronizadas** - Mudanças aplicadas em tempo real
✅ **Múltiplas instâncias suportadas** - Várias extensões do mesmo usuário
✅ **Segurança garantida** - JWT obrigatório, isolamento por usuário
✅ **Persistência confiável** - Configurações salvas no banco de dados
✅ **Conflitos resolvidos** - Prioridade do servidor para segurança
✅ **Monitoramento completo** - Logs e métricas para auditoria
✅ **Escalabilidade** - Suporta milhares de usuários simultâneos

## Implementação Completa

O sistema está **100% funcional** com:
- ✅ Rotas de API implementadas
- ✅ Sincronização bidirecional ativa
- ✅ Persistência no banco SQLite
- ✅ Autenticação JWT obrigatória
- ✅ Tratamento de conflitos
- ✅ Logs de auditoria
- ✅ Configurações padrão inteligentes

**Resultado:** Extensão Chrome completamente independente mas conectada em tempo real com o sistema Vendzz.