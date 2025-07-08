# 🔐 Sistema de Segurança da Extensão Vendzz WhatsApp

## 🛡️ Como Funciona a Autenticação

### 1. **JWT Token Obrigatório**
- A extensão **NUNCA** funciona sem um token JWT válido
- Token gerado no sistema Vendzz após login
- Cada usuário tem seu próprio token único
- Token expira e precisa ser renovado

### 2. **Identificação do Usuário**
```javascript
// A extensão armazena:
config = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT único
  userId: "KjctNCOlM5jcafgA_drVQ",                    // ID do usuário
  userEmail: "admin@vendzz.com",                       // Email para logs
  serverUrl: "http://localhost:5000"                   // URL validada
}
```

### 3. **Verificação em Cada Requisição**
```javascript
// Servidor verifica SEMPRE:
1. Token JWT válido? ✅
2. Usuário existe? ✅
3. Campanha pertence ao usuário? ✅
4. Log pertence ao usuário? ✅
```

## 🔒 Proteções Implementadas

### **No Servidor (routes-sqlite.ts)**

#### 1. Autenticação JWT
```javascript
app.get("/api/whatsapp-extension/status", verifyJWT, async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  // Verificar se usuário existe
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(403).json({ error: 'Usuário não encontrado' });
  }
  
  console.log(`🔐 EXTENSÃO AUTENTICADA: ${userEmail} (${userId})`);
```

#### 2. Filtro por Usuário
```javascript
// ANTES: Qualquer pessoa via todas as mensagens
const scheduledLogs = await storage.getScheduledWhatsappLogs(currentTime);

// AGORA: Só vê suas próprias mensagens
const scheduledLogs = await storage.getScheduledWhatsappLogsByUser(userId, currentTime);
```

#### 3. Verificação de Propriedade
```javascript
// Verificar se o log pertence ao usuário
const log = await storage.getWhatsappLogById(logId);
const campaign = await storage.getWhatsappCampaignById(log.campaign_id);

if (!campaign || campaign.userId !== userId) {
  return res.status(403).json({ error: 'Acesso negado: log não pertence ao usuário' });
}
```

### **No Storage (storage-sqlite.ts)**

#### 1. Consultas Filtradas por Usuário
```sql
-- Só busca mensagens do usuário autenticado
SELECT wl.* FROM whatsapp_logs wl
INNER JOIN whatsapp_campaigns wc ON wl.campaign_id = wc.id
WHERE wl.status = 'scheduled' 
AND wl.scheduled_at <= ?
AND wc.user_id = ?  -- ← FILTRO CRÍTICO
```

### **Na Extensão (background.js)**

#### 1. Token Obrigatório
```javascript
if (!config.token) {
  throw new Error('Token de autenticação não configurado');
}
```

#### 2. Tratamento de Expiração
```javascript
if (response.status === 401) {
  console.error('❌ Token expirado ou inválido');
  config.isConnected = false;
  throw new Error('Token de autenticação inválido ou expirado');
}
```

#### 3. Logs de Segurança
```javascript
console.log(`📡 Requisição (${config.userEmail}): ${method} ${endpoint}`);
console.log(`🔐 Usuário autenticado: ${config.userEmail} (${config.userId})`);
```

## 🚨 Cenários de Segurança

### ❌ **O QUE NÃO PODE ACONTECER:**
1. **Extensão sem token** → Bloqueada instantaneamente
2. **Token inválido** → HTTP 401, extensão desconectada
3. **Token de outro usuário** → Mensagens filtradas, zero acesso
4. **Mensagens de outras campanhas** → Bloqueadas por verificação de propriedade
5. **Logs de outros usuários** → Filtrados no banco de dados

### ✅ **O QUE FUNCIONA:**
1. **Token válido do dono** → Acesso total às suas campanhas
2. **Mensagens próprias** → Envio autorizado
3. **Logs próprios** → Atualização permitida
4. **Campanhas próprias** → Total controle

## 🔍 Como Verificar Segurança

### 1. **Logs do Servidor**
```bash
# Conectar extensão
🔐 EXTENSÃO AUTENTICADA: admin@vendzz.com (KjctNCOlM5jcafgA_drVQ)

# Buscar mensagens
📤 MENSAGENS PENDENTES PARA admin@vendzz.com: 0

# Reportar status
📊 LOG EXTENSÃO admin@vendzz.com: 11999999999 - sent
```

### 2. **Logs da Extensão**
```bash
# Conexão
📡 Requisição (admin@vendzz.com): GET /api/whatsapp-extension/status
🔐 Usuário autenticado: admin@vendzz.com (KjctNCOlM5jcafgA_drVQ)

# Token inválido
❌ Token expirado ou inválido
```

### 3. **Teste de Segurança**
```javascript
// Teste 1: Sem token
config.token = null;
// Resultado: "Token de autenticação não configurado"

// Teste 2: Token inválido
config.token = "token-falso";
// Resultado: HTTP 401, "Token de autenticação inválido"

// Teste 3: Token de outro usuário
config.token = "token-do-user-X";
// Resultado: Mensagens filtradas, zero acesso às campanhas de outros
```

## 🛠️ Como Usar com Segurança

### 1. **Configurar Token**
1. Fazer login no sistema Vendzz
2. Copiar token JWT do localStorage ou cookie
3. Colar na extensão Chrome
4. Testar conexão

### 2. **Monitorar Logs**
- Servidor: Verificar autenticação nos logs
- Extensão: Console do Chrome (F12)
- Sistema: Analytics de campanhas

### 3. **Renovar Token**
- Tokens expiram periodicamente
- Re-login no sistema quando necessário
- Atualizar token na extensão

## 🎯 Resumo de Segurança

**PROBLEMA RESOLVIDO:** ✅
- ❌ Antes: Qualquer extensão podia enviar mensagens
- ✅ Agora: Só usuários autenticados com campanhas próprias

**FLUXO SEGURO:**
1. Login no Vendzz → JWT gerado
2. Token na extensão → Autenticação validada
3. Campanhas criadas → Associadas ao usuário
4. Mensagens enviadas → Só do usuário logado
5. Logs reportados → Verificação de propriedade

**GARANTIA TOTAL:** Impossível enviar mensagens sem ser o dono da campanha! 🔒