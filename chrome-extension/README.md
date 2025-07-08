# 📱 Vendzz WhatsApp Chrome Extension

## Descrição
Extensão Chrome para automação de campanhas WhatsApp integrada com a plataforma Vendzz.

## Funcionalidades
- ✅ Conexão automática com servidor Vendzz
- ✅ Detecção de mensagens pendentes
- ✅ Envio automático com rotação de mensagens
- ✅ Interface de monitoramento em tempo real
- ✅ Sistema anti-spam com delays configuráveis
- ✅ Relatórios de entrega e status

## Como Instalar

### 1. Preparar a extensão
```bash
# Baixar arquivos da extensão
# Todos os arquivos já estão na pasta chrome-extension/
```

### 2. Instalar no Chrome
1. Abra o Chrome
2. Digite `chrome://extensions/` na barra de endereços
3. Ative o "Modo do desenvolvedor" (Developer mode)
4. Clique em "Carregar sem compactação" (Load unpacked)
5. Selecione a pasta `chrome-extension`
6. A extensão aparecerá na barra de ferramentas

### 3. Configurar a extensão
1. Clique no ícone da extensão na barra de ferramentas
2. Configure a URL do servidor: `http://localhost:5000`
3. Digite seu token de acesso (obtido no sistema Vendzz)
4. Clique em "Salvar Configuração"
5. Teste a conexão

### 4. Usar com WhatsApp Web
1. Abra https://web.whatsapp.com
2. Faça login normalmente
3. A extensão detectará automaticamente o WhatsApp
4. Mensagens pendentes serão enviadas automaticamente

## Como Usar

### Interface da Extensão
- **Status da Conexão**: Verde = conectado, Amarelo = desconectado
- **WhatsApp Status**: Mostra se o WhatsApp Web está ativo
- **Estatísticas**: Mensagens pendentes e enviadas
- **Configuração**: URL do servidor e token

### Fluxo Automático
1. Sistema Vendzz cria campanha WhatsApp
2. Extensão detecta mensagens pendentes (a cada 30s)
3. Mensagens são enviadas automaticamente com delays
4. Status é reportado de volta ao sistema
5. Estatísticas são atualizadas em tempo real

## Recursos Técnicos

### Arquitetura
- **Background Script**: Gerencia conexão com API e processamento
- **Content Script**: Interage diretamente com WhatsApp Web
- **Popup Interface**: Configuração e monitoramento

### Segurança
- Todas as comunicações são via HTTPS (produção)
- Tokens JWT para autenticação
- Dados armazenados localmente no Chrome

### Performance
- Processamento em lote de mensagens
- Delays inteligentes para evitar bloqueios
- Cache local para otimização

## Troubleshooting

### Extensão não conecta
1. Verifique se o servidor Vendzz está rodando
2. Confirme a URL correta (http://localhost:5000)
3. Verifique seu token de acesso
4. Teste a conexão manual

### WhatsApp não detectado
1. Certifique-se que está em https://web.whatsapp.com
2. Faça login no WhatsApp Web
3. Recarregue a página
4. Verifique permissões da extensão

### Mensagens não enviam
1. Verifique se há mensagens pendentes no sistema
2. Confirme que a campanha está ativa
3. Verifique se o WhatsApp está desbloqueado
4. Observe logs na interface da extensão

## Desenvolvimento

### Estrutura de Arquivos
```
chrome-extension/
├── manifest.json          # Configuração da extensão
├── background.js          # Service worker principal
├── content.js            # Script para WhatsApp Web
├── popup.html            # Interface de configuração
├── popup.js             # Lógica da interface
├── icons/               # Ícones da extensão
└── README.md           # Esta documentação
```

### API Endpoints Utilizados
- `GET /api/whatsapp-extension/status` - Status da conexão
- `GET /api/whatsapp-extension/pending` - Mensagens pendentes
- `POST /api/whatsapp-extension/logs` - Enviar logs de status

## Notas Importantes
- ⚠️ Mantenha o WhatsApp Web sempre aberto e logado
- ⚠️ Não feche a aba do WhatsApp durante campanhas ativas
- ⚠️ Respeite os limites do WhatsApp para evitar bloqueios
- ⚠️ Use delays adequados entre mensagens (mínimo 2-5 segundos)

## Suporte
Para suporte técnico, consulte a documentação do sistema Vendzz ou entre em contato com o administrador.