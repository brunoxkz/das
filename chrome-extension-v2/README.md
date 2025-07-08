# Vendzz WhatsApp Automation Chrome Extension v2.0

Extensão Chrome para automação de contatos do WhatsApp Web baseada em arquivos de automação gerados pelo sistema Vendzz.

## 🚀 Instalação

### 1. Preparar a Extensão
1. Baixe ou clone todos os arquivos da pasta `chrome-extension-v2/`
2. Certifique-se de que você tem todos os arquivos:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `popup.html`
   - `popup.js`
   - `styles.css`

### 2. Instalar no Chrome
1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" no canto superior direito
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `chrome-extension-v2/`
5. A extensão aparecerá na lista e no ícone da barra de ferramentas

### 3. Configurar a Extensão
1. Clique no ícone da extensão na barra de ferramentas
2. Configure o servidor (ex: `http://localhost:5000`)
3. Insira seu token de acesso do sistema Vendzz
4. Clique em "Conectar"

## 📱 Como Usar

### 1. Gerar Arquivo de Automação
1. Acesse o sistema Vendzz
2. Vá para "Automação WhatsApp"
3. Selecione um quiz com campos de telefone
4. Configure filtros (público-alvo, data)
5. Clique em "Gerar Arquivo de Automação"

### 2. Usar no WhatsApp Web
1. Abra o WhatsApp Web
2. A sidebar aparecerá automaticamente à direita
3. Configure servidor e token (se não fez no popup)
4. Selecione um arquivo de automação na lista
5. Visualize os contatos carregados

## ✨ Funcionalidades

### Interface Principal
- **Popup**: Configuração rápida e status da extensão
- **Sidebar**: Interface completa no WhatsApp Web
- **Status em Tempo Real**: Conexão, arquivos e logs

### Gerenciamento de Contatos
- **Lista de Arquivos**: Todos os arquivos do usuário
- **Filtros Automáticos**: Por público-alvo e data
- **Status de Leads**: Completos vs Abandonados
- **Atualização Automática**: Novos contatos detectados

### Segurança
- **Autenticação JWT**: Token obrigatório para acesso
- **Isolamento de Usuário**: Apenas arquivos próprios
- **Validação de Dados**: Verificação de integridade
- **Logs de Auditoria**: Rastreamento de ações

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```javascript
const config = {
  serverUrl: 'http://localhost:5000',  // URL do servidor Vendzz
  accessToken: 'seu_token_jwt',        // Token de autenticação
  refreshInterval: 30000               // Intervalo de atualização (ms)
};
```

### Endpoints da API
- `GET /api/whatsapp-automation-files` - Listar arquivos
- `GET /api/whatsapp-automation-files/:fileId` - Buscar arquivo
- `POST /api/whatsapp-extension/status` - Enviar status
- `GET /api/auth/verify` - Verificar autenticação

## 🐛 Resolução de Problemas

### Extensão não conecta
1. Verifique se o servidor está rodando
2. Confirme o token de acesso
3. Verifique o console do navegador (F12)

### Sidebar não aparece
1. Recarregue a página do WhatsApp Web
2. Aguarde alguns segundos para carregamento
3. Verifique se a extensão está ativa

### Contatos não carregam
1. Gere um novo arquivo de automação
2. Verifique se o quiz tem campos de telefone
3. Confirme filtros aplicados

## 📊 Logs e Debug

### Console da Extensão
```javascript
// Abrir console no popup
chrome.runtime.getBackgroundPage().console

// Ver logs da sidebar
// F12 no WhatsApp Web, console
```

### Logs do Sistema
- **Background**: `🌐`, `✅`, `❌` - Comunicação com API
- **Content**: `🎯`, `📱`, `📄` - Interface e contatos  
- **Popup**: `📊`, `🔄`, `⚙️` - Status e configuração

## 🚀 Desenvolvimento

### Estrutura de Arquivos
```
chrome-extension-v2/
├── manifest.json         # Configurações da extensão
├── background.js         # Service worker
├── content.js           # Script injetado no WhatsApp
├── popup.html           # Interface do popup
├── popup.js             # Lógica do popup
├── styles.css           # Estilos da sidebar
└── README.md            # Este arquivo
```

### Ciclo de Desenvolvimento
1. Modificar arquivos
2. Recarregar extensão em `chrome://extensions/`
3. Testar no WhatsApp Web
4. Verificar logs no console

## 🔒 Segurança

### Dados Protegidos
- Tokens JWT criptografados
- Isolamento por usuário
- Validação de entrada
- Logs de auditoria

### Permissões Mínimas
- `activeTab`: Acesso à aba ativa
- `storage`: Salvar configurações
- `scripting`: Injetar scripts
- Hosts específicos apenas

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no console
2. Teste conexão com a API
3. Confirme permissões da extensão
4. Entre em contato com o suporte Vendzz

---

**Vendzz WhatsApp Automation v2.0** - Sistema de automação de marketing via WhatsApp Web