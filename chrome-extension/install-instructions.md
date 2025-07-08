# 🔧 Como Instalar a Extensão Vendzz WhatsApp

## ⚠️ Pré-requisitos
- Google Chrome instalado
- Sistema Vendzz rodando (http://localhost:5000)
- WhatsApp Web funcionando normalmente

## 📦 Passos para Instalação

### 1. Preparar os Arquivos
Os arquivos da extensão já estão prontos na pasta `chrome-extension/`:
- ✅ manifest.json (configuração da extensão)
- ✅ background.js (service worker principal)
- ✅ content.js (script para WhatsApp Web)
- ✅ popup.html + popup.js (interface)
- ✅ README.md (documentação completa)

### 2. Instalar no Chrome

#### Passo 1: Abrir Extensões do Chrome
```
1. Abra o Google Chrome
2. Digite na barra de endereços: chrome://extensions/
3. Pressione Enter
```

#### Passo 2: Ativar Modo Desenvolvedor
```
1. No canto superior direito, ative "Modo do desenvolvedor"
2. Você verá novos botões aparecerem
```

#### Passo 3: Carregar Extensão
```
1. Clique em "Carregar sem compactação"
2. Navegue até a pasta do projeto
3. Selecione a pasta "chrome-extension"
4. Clique em "Selecionar pasta"
```

#### Passo 4: Verificar Instalação
```
✅ A extensão "Vendzz WhatsApp Automation" aparecerá na lista
✅ Um ícone 📱 aparecerá na barra de ferramentas do Chrome
```

### 3. Configurar a Extensão

#### Passo 1: Abrir Interface
```
1. Clique no ícone 📱 da extensão na barra de ferramentas
2. Uma janela popup será aberta
```

#### Passo 2: Configurar Servidor
```
1. URL do Servidor: http://localhost:5000
2. Token de Acesso: [Seu token JWT do sistema Vendzz]
3. Clique em "💾 Salvar Configuração"
```

#### Passo 3: Testar Conexão
```
1. Clique em "🔌 Testar Conexão"
2. Status deve mostrar "Conectado" (verde)
3. Se aparecer erro, verifique URL e token
```

### 4. Configurar WhatsApp Web

#### Passo 1: Abrir WhatsApp
```
1. Clique em "📱 Abrir WhatsApp Web" na extensão
2. OU acesse manualmente: https://web.whatsapp.com
```

#### Passo 2: Fazer Login
```
1. Escaneie o QR Code com seu celular
2. Aguarde carregar completamente
3. Status na extensão deve mostrar "WhatsApp: Ativo"
```

## 🎯 Como Usar

### 1. Verificar Status
- **Conexão**: Verde = conectado, Amarelo = erro
- **WhatsApp**: Ativo = funcionando, Fechado = não detectado
- **Pendentes**: Quantidade de mensagens aguardando envio
- **Enviadas**: Total de mensagens enviadas

### 2. Fluxo Automático
```
Sistema Vendzz → Cria campanha WhatsApp
     ↓
Extensão → Detecta mensagens pendentes (30s)
     ↓
WhatsApp Web → Envia mensagens automaticamente
     ↓
Sistema Vendzz → Recebe confirmação de entrega
```

### 3. Monitoramento
- Logs aparecem na interface da extensão
- Estatísticas são atualizadas em tempo real
- Erros são reportados automaticamente

## 🔧 Solução de Problemas

### ❌ Extensão não conecta
**Soluções:**
1. Verificar se sistema Vendzz está rodando
2. Confirmar URL: http://localhost:5000
3. Verificar token JWT válido
4. Testar conexão manual

### ❌ WhatsApp não detectado
**Soluções:**
1. Abrir https://web.whatsapp.com
2. Fazer login novamente
3. Recarregar página do WhatsApp
4. Verificar permissões da extensão

### ❌ Mensagens não enviam
**Soluções:**
1. Verificar campanhas ativas no sistema
2. Confirmar WhatsApp desbloqueado
3. Verificar se há mensagens pendentes
4. Reabrir WhatsApp Web

### ❌ Logs de erro aparecem
**Soluções:**
1. Verificar bloqueios do WhatsApp
2. Confirmar números válidos
3. Verificar limites de envio
4. Aguardar delays entre mensagens

## 🛡️ Segurança e Limites

### ⚠️ Limites do WhatsApp
- Máximo ~100 mensagens por dia (número não oficial)
- Delays obrigatórios entre mensagens (2-5 segundos)
- Evitar spam ou comportamento robótico
- Respeitar termos de uso do WhatsApp

### 🔒 Segurança
- Token JWT criptografado
- Dados armazenados localmente no Chrome
- Comunicação segura com servidor
- Sem armazenamento de mensagens

## 📞 Suporte

### 🆘 Se precisar de ajuda:
1. Verificar logs na interface da extensão
2. Consultar documentação completa (README.md)
3. Testar com uma campanha pequena primeiro
4. Verificar console do navegador (F12) para erros técnicos

### ✅ Sistema funcionando:
- Status: Conectado (verde)
- WhatsApp: Ativo
- Mensagens sendo enviadas automaticamente
- Logs de sucesso aparecendo

**🎉 Pronto! Sua extensão está funcionando e integrada ao sistema Vendzz.**