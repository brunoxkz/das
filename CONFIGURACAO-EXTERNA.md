# Configuração para Uso Externo da Chrome Extension

## 🌐 **URLs Públicas Configuradas**

### **URL Principal (Replit Deploy)**
```
https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev
```

### **URLs de Fallback**
```
1. https://vendzz.replit.app (URL de deploy)
2. http://localhost:5000 (desenvolvimento local)
3. http://127.0.0.1:5000 (IP local alternativo)
```

## ⚙️ **Configuração da Chrome Extension**

### **Host Permissions (manifest.json)**
```json
{
  "host_permissions": [
    "https://web.whatsapp.com/*",
    "https://*.replit.app/*",
    "https://*.replit.dev/*",
    "https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/*",
    "http://localhost:5000/*"
  ]
}
```

### **Auto-Detecção de Servidor**
```javascript
// A extensão testa automaticamente essas URLs:
possibleUrls = [
  'https://51f74588-...replit.dev',  // URL pública PRIMEIRO
  'http://localhost:5000',           // Local para desenvolvimento
  'https://vendzz.replit.app'        // Deploy público
]

// Processo:
1. Testa URL pública primeiro
2. Se falhar, tenta localhost
3. Salva URL funcional no Chrome storage
4. Usa URL salva nas próximas vezes
5. Re-testa se URL salva falhar
```

## 🔄 **CORS Configurado para Extensão Externa**

### **Headers Permitidos**
```javascript
// server/index.ts - CORS configurado
'Access-Control-Allow-Origin': '*' (para Chrome Extensions)
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
'Access-Control-Allow-Credentials': 'true'
```

### **Detecção de Chrome Extension**
```javascript
// O servidor detecta requisições da extensão automaticamente
const origin = req.headers.origin;

if (!origin || origin.startsWith('chrome-extension://') || origin === 'null') {
  res.setHeader('Access-Control-Allow-Origin', '*');
}
```

## 📱 **Processo de Conexão Externa**

### **1. Instalação da Extensão**
```bash
# Usuário baixa pasta: chrome-extension-webjs/
# Chrome → chrome://extensions/
# Ativar "Modo desenvolvedor"
# "Carregar sem compactação" 
# Selecionar pasta da extensão
```

### **2. Primeiro Uso (Auto-Setup)**
```javascript
// Extensão detecta automaticamente:
1. Testa https://...replit.dev (URL pública)
2. Se funcionar: salva e usa essa URL
3. Se falhar: tenta localhost (desenvolvimento)
4. URL salva no Chrome storage permanentemente
```

### **3. Obter Token de Acesso**
```javascript
// Usuário acessa URL pública no navegador:
https://51f74588-...replit.dev

// Vai em: WhatsApp Extension → Gerar Token
// Copia token gerado (válido 30 dias)
// Cola na extensão Chrome
```

### **4. Configuração na Extensão**
```javascript
// Popup da extensão (clique no ícone):
- Server URL: (detectado automaticamente)
- Token: (colar token copiado do site)
- Clique "Conectar"
```

## 🎯 **Funcionalidades Disponíveis Externamente**

### **✅ Funcionando via URL Pública:**

#### **Lista de Quizzes**
```javascript
GET https://...replit.dev/api/quizzes
Authorization: Bearer <user_token>
// Retorna todos os quizzes do usuário
```

#### **Telefones por Quiz**
```javascript
POST https://...replit.dev/api/extension/quiz-data
Authorization: Bearer <extension_token>
Body: {
  "quizId": "abc123",
  "targetAudience": "completed|abandoned|all",
  "dateFilter": "2025-07-08" // opcional
}
// Retorna telefones filtrados
```

#### **Criação de Campanhas**
```javascript
POST https://...replit.dev/api/whatsapp-campaigns
Authorization: Bearer <extension_token>
Body: {
  "name": "Campanha Teste",
  "quizId": "abc123",
  "messages": ["Mensagem 1", "Mensagem 2"],
  "targetAudience": "completed"
}
// Cria campanha automática
```

#### **Status da Extensão**
```javascript
GET https://...replit.dev/api/whatsapp/extension-status
Authorization: Bearer <extension_token>
// Retorna status de conexão
```

## 🚀 **Deploy para Produção**

### **URL Final de Produção**
```
https://vendzz.replit.app
```

### **Configuração de Deploy**
```toml
# .replit
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"] 
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80
```

### **Variáveis de Ambiente**
```bash
# Automáticas no Replit:
REPL_URL="https://vendzz.replit.app"
NODE_ENV="production"

# Opcionais (para funcionalidades extras):
TWILIO_ACCOUNT_SID="..." # SMS
TWILIO_AUTH_TOKEN="..."
STRIPE_SECRET_KEY="..." # Pagamentos
```

## 🔧 **Teste de Conectividade Externa**

### **Verificar URL Pública**
```bash
# Testar se API está acessível externamente:
curl -I https://51f74588-...replit.dev/api/whatsapp/extension-status

# Deve retornar:
HTTP/2 401 (esperado - sem token)
content-type: application/json
access-control-allow-origin: *
```

### **Teste com Token**
```bash
# 1. Gerar token via web
# 2. Testar endpoint:
curl -H "Authorization: Bearer <token>" \
  https://...replit.dev/api/whatsapp/extension-status

# Deve retornar:
{"isConnected": true, "phoneCount": 0, ...}
```

## 📋 **Resumo de Configuração Externa**

### **✅ Configurado e Funcional:**
- [x] URL pública acessível de qualquer lugar
- [x] CORS configurado para Chrome Extensions
- [x] Auto-detecção de servidor na extensão
- [x] Permissões de host para URLs externas
- [x] Sistema de tokens JWT para autenticação
- [x] Endpoints prontos para uso externo
- [x] Documentação de instalação
- [x] Teste de conectividade

### **🎯 Pronto para Uso:**
1. **Fazer deploy** do Replit (botão Deploy)
2. **Instalar extensão** Chrome da pasta chrome-extension-webjs/
3. **Gerar token** na URL pública do site
4. **Configurar token** na extensão
5. **Usar WhatsApp Web** com automação completa

**Sistema 100% configurado para uso externo via URL pública!** 🌐