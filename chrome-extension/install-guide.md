# 📦 Guia de Instalação - Extensão WhatsApp Vendzz

## 🚀 Como Instalar a Extensão

### **Passo 1: Baixar os Arquivos**
1. Baixe todos os arquivos da pasta `chrome-extension/`
2. Mantenha a estrutura de pastas intacta

### **Passo 2: Ativar Modo Desenvolvedor**
1. Abra o Google Chrome
2. Digite: `chrome://extensions/`
3. Ative o **"Modo do desenvolvedor"** no canto superior direito

### **Passo 3: Carregar Extensão**
1. Clique em **"Carregar sem compactação"**
2. Selecione a pasta `chrome-extension/` completa
3. A extensão aparecerá na lista

### **Passo 4: Configurar Token JWT**
1. Clique no ícone da extensão na barra do Chrome
2. Faça login no sistema Vendzz: http://localhost:5000
3. Copie o token JWT do localStorage ou configure manualmente

---

## ⚙️ Configuração Inicial

### **Token de Autenticação**
```javascript
// No popup da extensão, configure:
Server URL: http://localhost:5000
JWT Token: (copiado do localStorage após login)
```

### **Configurações Padrão**
- **Auto Send:** Habilitado
- **Message Delay:** 3 segundos
- **Max Messages/Day:** 100
- **Working Hours:** Desabilitado
- **Anti-Spam:** Habilitado (2-5s delay)

---

## 🔧 Como Usar

### **1. Abrir WhatsApp Web**
- Acesse: https://web.whatsapp.com
- Escaneie o QR Code com seu celular
- Aguarde carregar completamente

### **2. Ativar a Extensão**
- Clique no ícone da extensão
- Verifique se está "Connected" e "Active"
- Status deve mostrar: ✅ WhatsApp Loaded

### **3. Criar Campanha no Vendzz**
1. Acesse: http://localhost:5000
2. Vá em **"WhatsApp" > "Campanhas"**
3. Crie nova campanha com mensagens
4. Ative a campanha

### **4. Processamento Automático**
- A extensão detecta mensagens pendentes a cada 30s
- Processa automaticamente conforme configurações
- Logs aparecem no popup da extensão

---

## 📊 Monitoramento

### **Popup da Extensão**
```
Status: ✅ Connected
WhatsApp: ✅ Loaded
Pending: 3 messages
Sent: 15 messages
Failed: 1 message
Last Ping: 14:32:15
```

### **Logs em Tempo Real**
- Console do navegador (F12)
- Popup da extensão
- Sistema Vendzz (campanhas)

---

## 🚨 Solução de Problemas

### **Extensão não conecta ao servidor**
```javascript
// Verificar no popup:
1. Server URL correto: http://localhost:5000
2. JWT Token válido (não expirado)
3. Servidor Vendzz rodando
4. Firewall não bloqueando
```

### **WhatsApp não detectado**
```javascript
// Verificar:
1. WhatsApp Web carregado completamente
2. Página: https://web.whatsapp.com
3. QR Code escaneado
4. Não há sobreposições/popups
```

### **Mensagens não enviando**
```javascript
// Verificar:
1. Campanhas ativas no Vendzz
2. Mensagens pendentes disponíveis
3. Configurações de delay não muito altas
4. Anti-spam não bloqueando
```

### **Token expirado**
```javascript
// Soluções:
1. Fazer novo login no Vendzz
2. Copiar novo token para extensão
3. Aguardar sincronização automática (30s)
```

---

## 🛡️ Segurança

### **Dados Protegidos**
- ✅ JWT Authentication obrigatório
- ✅ Comunicação HTTPS (em produção)
- ✅ Tokens com expiração automática
- ✅ Isolamento por usuário

### **Permissões da Extensão**
- `activeTab`: Acesso à aba ativa
- `storage`: Salvar configurações locais
- `host permissions`: WhatsApp Web apenas

---

## 📋 Arquivos da Extensão

```
chrome-extension/
├── manifest.json       # Configuração da extensão
├── background.js      # Service worker principal
├── content.js         # Script do WhatsApp Web
├── popup.html         # Interface da extensão
├── popup.js           # Lógica do popup
├── popup.css          # Estilos do popup
└── install-guide.md   # Este guia
```

---

## ✅ Checklist de Instalação

- [ ] Arquivos baixados
- [ ] Modo desenvolvedor ativado
- [ ] Extensão carregada no Chrome
- [ ] Token JWT configurado
- [ ] WhatsApp Web funcionando
- [ ] Servidor Vendzz rodando
- [ ] Campanha criada e ativa
- [ ] Extensão conectada e ativa
- [ ] Teste de envio realizado

---

## 📞 Suporte

**Logs para debugging:**
1. Console da extensão (background)
2. Console do WhatsApp Web (F12)
3. Logs do servidor Vendzz
4. Popup da extensão (estatísticas)

**Status esperado quando funcionando:**
- Server: ✅ Connected
- WhatsApp: ✅ Loaded  
- Campaign: ✅ Active
- Messages: 🔄 Processing