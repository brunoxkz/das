# 🚀 RocketZap Lead Extractor - Chrome Extension

Extensão Chrome/Opera para extrair automaticamente leads do app.rocketzap.com.br e integrar com sistema de SMS marketing.

## ✨ Funcionalidades

- **Extração Automática**: Monitora e extrai leads em tempo real do RocketZap
- **Anti-Duplicação**: Sistema inteligente para evitar números duplicados
- **Integração SMS**: Envia leads automaticamente para sistema de agendamento
- **Interface Visual**: Popup com estatísticas e controles
- **Sincronização**: Backup e sync com servidor local

## 📋 Pré-requisitos

1. **Chrome ou Opera** (versões recentes)
2. **Servidor local** rodando em `http://localhost:5000`
3. **Acesso ao RocketZap** (app.rocketzap.com.br)

## 🔧 Instalação

### Passo 1: Preparar Arquivos

1. Baixe todos os arquivos da pasta `chrome-extension-rocketzap`
2. Crie os ícones necessários (veja `icons/create-icons.md`)

### Passo 2: Instalar no Chrome

1. Abra o Chrome
2. Digite `chrome://extensions/` na barra de endereços
3. Ative o **Modo de desenvolvedor** (toggle no canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta `chrome-extension-rocketzap`
6. A extensão aparecerá na lista e na barra de ferramentas

### Passo 3: Instalar no Opera

1. Abra o Opera
2. Digite `opera://extensions/` na barra de endereços
3. Ative o **Modo de desenvolvedor**
4. Clique em **Carregar extensão descompactada**
5. Selecione a pasta `chrome-extension-rocketzap`

### Passo 4: Verificar Instalação

1. Vá para `app.rocketzap.com.br`
2. Clique no ícone da extensão na barra de ferramentas
3. Deve aparecer o popup com status "Ativo no RocketZap"

## 🎯 Como Usar

### ⚠️ Requisito Importante: Login Ativo

**A extensão só funciona se você estiver logado no RocketZap!**

### Extração Automática

1. **Faça login no RocketZap** (app.rocketzap.com.br) 
2. **Mantenha uma aba** do RocketZap aberta (pode minimizar)
3. **A extensão verifica automaticamente** se você está logado
4. **Exporta a cada 1 hora** automaticamente
5. **Processa XLS** e filtra duplicatas
6. **Envia novos leads** para sistema SMS

### Funcionamento Inteligente

- **Verifica login** antes de cada exportação
- **Cancela automaticamente** se não estiver logado  
- **Notifica no popup** quando precisa fazer login
- **Funciona em background** enquanto RocketZap estiver aberto

### Monitoramento

- **Popup da extensão** mostra estatísticas em tempo real
- **Leads recentes** aparecem na lista do popup
- **Status de conexão** indica se está funcionando

### Sincronização

- **Clique em "Sincronizar Leads"** para enviar ao servidor
- **Dados são enviados** para `http://localhost:5000/api/leads`
- **Sistema de SMS** processa automaticamente

## 🔍 Como Funciona

### Detecção de Leads

A extensão monitora:
- **Container de chats** (simulação WhatsApp Web)
- **Nomes de contatos** em elementos de chat
- **Números de telefone** em texto e atributos
- **Novos chats** adicionados dinamicamente

### Extração de Dados

1. **Nome do contato** - extraído de elementos com classes como `.contact-name`, `.chat-name`
2. **Número de telefone** - regex para formatos brasileiros (+55, DDD, celular)
3. **Timestamp** - momento da extração
4. **Fonte** - sempre marcado como "rocketzap"

### Prevenção de Duplicatas

- **Storage local** mantém histórico de números processados
- **Verificação** antes de processar novos leads
- **Sincronização** mantém dados entre sessões do browser

## 🛠️ Configuração Avançada

### Seletores Personalizados

No `content.js`, você pode ajustar os seletores:

```javascript
const CONFIG = {
  SELECTORS: {
    chatContainer: '[data-testid="chat-list"], .chat-list, #chat-list',
    contactName: '.contact-name, .chat-name, [data-testid="contact-name"]',
    phoneNumber: '.phone-number, .contact-phone, [data-testid="phone"]'
  }
};
```

### Intervalo de Verificação

```javascript
const CONFIG = {
  CHECK_INTERVAL: 2000, // Verifica a cada 2 segundos
};
```

### URL da API

```javascript
const CONFIG = {
  API_URL: 'http://localhost:5000/api/leads',
};
```

## 📊 APIs Disponíveis

### POST /api/leads
Recebe lead individual da extensão:
```json
{
  "phone": "5511999999999",
  "name": "João Silva",
  "source": "rocketzap",
  "timestamp": 1641234567890
}
```

### POST /api/leads/bulk
Sincronização em lote:
```json
{
  "leads": ["5511999999999", "5511888888888"],
  "source": "rocketzap-extension"
}
```

### GET /api/leads/stats
Estatísticas do sistema:
```json
{
  "totalLeads": 150,
  "todayLeads": 12,
  "thisWeekLeads": 85,
  "thisMonthLeads": 320
}
```

## 🐛 Resolução de Problemas

### Extensão não carrega
- Verifique se o **modo desenvolvedor** está ativo
- Confirme que todos os **arquivos estão presentes**
- Veja o **console de extensões** para erros

### Não extrai leads
- **Abra o DevTools** (F12) na página do RocketZap
- Verifique **console** para logs da extensão
- Confirme que está na página correta (`app.rocketzap.com.br`)

### Erro de sincronização
- Verifique se o **servidor local** está rodando (porta 5000)
- Teste a API manualmente: `curl http://localhost:5000/api/leads/stats`
- Veja **console da extensão** para detalhes do erro

## 📱 Interface do RocketZap

A extensão é compatível com:
- **Layout padrão** do RocketZap
- **Chat em tempo real** (WebSocket)
- **Múltiplas conversas** simultâneas
- **Updates dinâmicos** do DOM

## 🔒 Segurança e Privacidade

- **Dados locais**: Tudo salvo no browser do usuário
- **HTTPS only**: Funciona apenas em conexões seguras
- **Permissões mínimas**: Só acessa RocketZap e localhost
- **Sem telemetria**: Nenhum dado enviado para terceiros

## 📈 Próximos Passos

1. **Criar ícones** personalizados na pasta `icons/`
2. **Testar com dados reais** no RocketZap
3. **Integrar com sistema SMS** existente
4. **Ajustar seletores** conforme necessário
5. **Publicar na Chrome Web Store** (opcional)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os **logs do console** (F12)
2. Teste as **APIs manualmente**
3. Confirme **permissões da extensão**
4. Reinicie o **browser** se necessário