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

1. Na aplicação web, faça login (admin@vendzz.com / admin123)
2. Abra as ferramentas do desenvolvedor (F12)
3. Vá na aba "Application" > "Local Storage"
4. Copie o valor de `access_token`

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

1. **Você gera um arquivo** → Sistema extrai telefones do quiz
2. **Extensão detecta** → Busca novos arquivos automaticamente  
3. **WhatsApp Web** → Sidebar mostra lista de contatos
4. **Você visualiza** → Contatos organizados por status

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