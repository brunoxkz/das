# Chrome Extension v2.0 - Vendzz WhatsApp Automation

## Configuração para Uso com Replit

### Passo 1: Obter a URL Pública do Replit

1. Abra seu projeto no Replit
2. Clique em "Run" para iniciar o servidor
3. Copie a URL pública que aparece (ex: `https://nomedobreu.replit.dev`)

### Passo 2: Configurar a Extensão

1. Abra o arquivo `chrome-extension-v2/background.js`
2. Na linha 3, substitua `REPL_NAME` pela URL real do seu Replit:
   ```javascript
   serverUrl: 'https://NOMEDOBREU.replit.dev',
   ```

### Passo 3: Instalar a Extensão

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `chrome-extension-v2/`

### Passo 4: Configurar o Token de Acesso

1. Na aplicação web, faça login com suas credenciais
2. Copie o token de acesso das ferramentas do desenvolvedor (F12)
3. Clique no ícone da extensão no Chrome
4. Cole o token no campo de configuração
5. Clique em "Conectar"

### Passo 5: Usar no WhatsApp Web

1. Abra o WhatsApp Web (web.whatsapp.com)
2. A sidebar da extensão aparecerá automaticamente
3. Selecione um arquivo de automação gerado
4. Visualize a lista de contatos filtrados

## Funcionalidades

- **Detecção Automática**: Monitora novos arquivos de automação
- **Filtros de Audiência**: Separação entre leads completos e abandonados
- **Interface Responsiva**: Sidebar integrada ao WhatsApp Web
- **Sincronização em Tempo Real**: Atualização automática dos dados

## Troubleshooting

### Conexão Falhando
- Verifique se a URL do Replit está correta
- Confirme que o servidor está rodando
- Teste a conexão na aplicação web primeiro

### Sidebar Não Aparece
- Recarregue a página do WhatsApp Web
- Verifique se a extensão está ativa
- Confirme as permissões do Chrome

### Arquivos Não Carregam
- Verifique se há arquivos de automação gerados
- Confirme que o token de acesso está válido
- Teste a autenticação na aplicação web

## Estrutura de Arquivos

```
chrome-extension-v2/
├── manifest.json      # Configuração da extensão
├── background.js      # Service worker principal
├── content.js         # Script injetado no WhatsApp Web
├── popup.html         # Interface do popup
├── popup.js           # Lógica do popup
├── config.js          # Configurações da extensão
├── styles.css         # Estilos da sidebar
└── icons/             # Ícones da extensão
```

## Domínios Suportados

A extensão possui permissões para:
- `web.whatsapp.com` (WhatsApp Web)
- `*.replit.dev` (Domínios de desenvolvimento)
- `*.replit.app` (Domínios de produção)
- `*.replit.co` (Domínios alternativos)

## ✅ Arquivos Faltantes Corrigidos

**Status**: EXTENSÃO COMPLETA E PRONTA PARA USO

Os problemas identificados foram resolvidos:

### Ícones Criados
- ✅ `icon-16.svg` - Ícone 16x16 pixels com tema Vendzz (verde gradiente)
- ✅ `icon-48.svg` - Ícone 48x48 pixels com tema Vendzz (verde gradiente)  
- ✅ `icon-128.svg` - Ícone 128x128 pixels com tema Vendzz (verde gradiente)

### Configurações Atualizadas
- ✅ `manifest.json` - Ícones SVG referenciados corretamente
- ✅ Permissões para domínios Replit já configuradas
- ✅ URLs atualizadas para domínio público real do Replit
- ✅ `config.js` e `background.js` - URL: `https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev`
- ✅ Sistema de edição de token implementado no popup
- ✅ Todos os arquivos principais estão presentes e funcionais

### Token de Acesso Atual

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktqY3ROQ09sTTVqY2FmZ0FfZHJWUSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUxOTU0NjYxLCJleHAiOjE3NTE5NTU1NjF9.UnbGgZm4QuJOW7o_KDgZnvPoNlG_dskiRqKC6tUfLLk
```

**Validade**: 15 minutos (expira às 6:19 AM)
**URL Configurada**: `https://workspace--brunotamaso.replit.app`

## Versão

Chrome Extension v2.0 - Compatível com Manifest V3