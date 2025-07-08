# 🚀 Configuração da Chrome Extension para WhatsApp

## ✅ Extensão Configurada para Produção

A Chrome Extension v2.0 já está configurada e pronta para uso! 

### 📋 O que você precisa fazer:

## 1️⃣ Instalar a Extensão

1. Abra o Chrome e digite: `chrome://extensions/`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `chrome-extension-v2/` do projeto

## 2️⃣ Configurar a URL do Servidor

1. Copie a URL pública do seu Replit (que aparece quando você roda o projeto)
2. Abra o arquivo `chrome-extension-v2/background.js`
3. Na linha 3, substitua `REPL_NAME` pela sua URL:
   ```javascript
   serverUrl: 'https://SUA-URL-AQUI.replit.dev',
   ```

## 3️⃣ Obter o Token de Acesso

**PASSO A PASSO DETALHADO:**

1. Na aplicação web, faça login (admin@vendzz.com / admin123)
2. Pressione **F12** para abrir ferramentas do desenvolvedor
3. Clique na aba **"Application"** (ou "Aplicação")
4. No painel esquerdo, expanda **"Local Storage"** 
5. Clique na URL do seu site (ex: https://seusite.replit.dev)
6. Procure pela chave **"access_token"**
7. **Copie o valor** (uma string longa começando com "eyJ...")

**Exemplo do que você vai ver:**
```
Key: access_token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ikt...
```

**IMPORTANTE:** Copie APENAS o valor (a string longa), não a palavra "access_token"

## 4️⃣ Configurar a Extensão

1. Clique no ícone da extensão na barra do Chrome
2. Cole o token no campo "Token de Acesso"
3. Clique em "Conectar"

## 5️⃣ Usar no WhatsApp Web

1. Vá para `web.whatsapp.com`
2. A sidebar aparecerá automaticamente do lado direito
3. Selecione o arquivo de automação que você gerou
4. Visualize os 3 contatos encontrados:
   - 11996595909 (abandonado)
   - 113232333232 (abandonado) 
   - 11995133932 (abandonado)

## 🔧 Funcionalidades da Extensão

- ✅ **Detecção Automática**: Monitora novos arquivos de automação
- ✅ **Filtros de Audiência**: Separa leads completos e abandonados  
- ✅ **Interface Integrada**: Sidebar fixa no WhatsApp Web
- ✅ **Domínios Suportados**: Funciona com todos os domínios do Replit

## 📱 Como Funciona

### 🔐 **Autenticação com Token:**
- O token do localStorage identifica você no sistema
- A extensão usa esse token para fazer requisições autenticadas 
- Sem o token, a extensão não consegue acessar seus dados

### 🗂️ **Acesso aos Arquivos:**
1. **Você gera um arquivo** → Sistema extrai telefones do quiz e salva no banco
2. **Extensão autentica** → Usa o token para se conectar à API
3. **API retorna dados** → Apenas seus arquivos (filtrados por usuário)
4. **Sidebar atualiza** → Mostra lista de contatos em tempo real

### 📊 **Endpoints que a extensão usa:**
- `GET /api/whatsapp-automation/files` - Lista seus arquivos de automação
- `GET /api/whatsapp-automation/file-contacts/ID` - Busca contatos de um arquivo específico  
- `GET /api/whatsapp-extension/status` - Verifica se está conectado

**IMPORTANTE:** Cada usuário só vê seus próprios arquivos graças ao token de autenticação!

## ⚠️ Importante

- A extensão precisa de internet para sincronizar
- Use sempre a URL pública do Replit (não localhost)
- O token de acesso expira, renove se necessário
- Recarregue o WhatsApp Web se a sidebar não aparecer

## 🎯 Status Atual

✅ **Arquivo gerado com sucesso** - 3 telefones encontrados  
✅ **API funcionando** - Endpoint /api/whatsapp-automation/files ativo  
✅ **Extensão configurada** - Pronta para instalação  
✅ **Domínios aprovados** - Permissões para *.replit.dev  

**Próximo passo**: Instalar a extensão e configurar a URL do seu Replit!