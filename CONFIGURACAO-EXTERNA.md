# 🌐 CONFIGURAÇÃO PARA ACESSO EXTERNO

## 🎯 PROBLEMA
O servidor está rodando no Replit (localhost:5000) mas a extensão Chrome estará no seu PC. Precisamos configurar acesso externo.

## 🔧 SOLUÇÕES DISPONÍVEIS

### **OPÇÃO 1: URL PÚBLICA DO REPLIT (RECOMENDADO)**

#### 1️⃣ **Obter URL Pública**
- Replit gera automaticamente uma URL pública
- Formato: `https://[repl-name].[username].repl.co`
- Acesso via internet (mais estável)

#### 2️⃣ **Configurar CORS**
```javascript
// Adicionar no servidor para permitir acesso externo
app.use(cors({
  origin: ['chrome-extension://*', 'https://*.repl.co'],
  credentials: true
}));
```

#### 3️⃣ **Usar na Extensão**
- URL do Servidor: `https://[repl-name].[username].repl.co`
- Token JWT: mesmo processo
- Funciona de qualquer lugar

---

### **OPÇÃO 2: TÚNEL NGROK**

#### 1️⃣ **Instalar ngrok**
```bash
# No seu PC
npm install -g ngrok
ngrok http 5000
```

#### 2️⃣ **URL Temporária**
- ngrok fornece URL como: `https://abc123.ngrok.io`
- Redireciona para localhost:5000
- Válida por 8 horas (versão gratuita)

---

### **OPÇÃO 3: EXECUTAR LOCALMENTE**

#### 1️⃣ **Baixar Projeto**
```bash
git clone [projeto]
cd projeto
npm install
npm run dev
```

#### 2️⃣ **Configurar Banco Local**
- SQLite já incluído
- Dados independentes
- Configuração automática

---

## 🚀 **IMPLEMENTAÇÃO RECOMENDADA**

### **CONFIGURAR URL PÚBLICA DO REPLIT**

#### Passo 1: Verificar URL Pública
1. No Replit, vá em `Webview`
2. Copie a URL que aparece
3. Formato: `https://[nome-do-repl].[seu-usuario].repl.co`

#### Passo 2: Testar Acesso
```bash
curl https://[sua-url-replit]/api/health
```

#### Passo 3: Configurar Extensão
- URL do Servidor: `https://[sua-url-replit]`
- Token JWT: mesmo processo
- Salvar e testar conexão

#### Passo 4: Verificar CORS
- Extensão pode acessar APIs externas
- Chrome permite requisições HTTPS
- Sistema funcionará normalmente

---

## 🔒 **CONFIGURAÇÕES DE SEGURANÇA**

### **Headers CORS**
```javascript
app.use(cors({
  origin: [
    'chrome-extension://*',
    'https://*.repl.co',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Rate Limiting Ajustado**
```javascript
// Permitir mais requests para extensão
const extensionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200, // 200 requests por minuto
  skip: (req) => req.headers['user-agent']?.includes('Chrome-Extension')
});
```

---

## 📱 **CONFIGURAÇÃO FINAL DA EXTENSÃO**

### **Configurações Recomendadas**
```json
{
  "serverUrl": "https://[seu-repl].repl.co",
  "token": "[seu-jwt-token]",
  "settings": {
    "autoSend": true,
    "messageDelay": 5000,
    "maxMessagesPerDay": 1000,
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    }
  }
}
```

### **Teste de Conectividade**
1. Abrir extensão
2. Configurar URL pública
3. Inserir token
4. Testar conexão
5. Verificar status verde

---

## 🎯 **VANTAGENS DE CADA OPÇÃO**

### **Replit URL Pública**
- ✅ Sempre disponível
- ✅ HTTPS nativo
- ✅ Sem configuração extra
- ✅ Compartilhável

### **ngrok**
- ✅ Funciona com localhost
- ✅ Fácil de configurar
- ❌ Temporário (8h)
- ❌ URL muda sempre

### **Execução Local**
- ✅ Controle total
- ✅ Sem dependências
- ❌ Só funciona no seu PC
- ❌ Configuração manual

---

## 🔧 **IMPLEMENTAÇÃO IMEDIATA**

**Use a URL pública do Replit:**
`https://[nome-do-seu-repl].[seu-usuario].repl.co`

Esta é a solução mais simples e estável!