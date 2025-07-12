# Facebook Ad Manager Data Checker - Chrome Extension

Extensão Chrome profissional para verificar e extrair dados do Facebook Ads Manager automaticamente.

## Recursos

📊 **Verificação Automática de Dados**
- Campanhas ativas e anúncios
- Gastos totais e métricas de performance
- Impressões, cliques e CTR
- Dados em tempo real

🔄 **Atualização Automática**
- Configuração de intervalos personalizados
- Monitoramento contínuo
- Notificações de mudanças importantes

📈 **Análise de Performance**
- Métricas detalhadas por período
- Comparação de dados históricos
- Alertas de performance

📁 **Exportação de Dados**
- Export para CSV e JSON
- Relatórios personalizados
- Backup automático de dados

## Instalação

1. Baixe todos os arquivos desta pasta
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione esta pasta
6. Navegue até o Facebook Ads Manager
7. Clique no ícone da extensão para começar

## Como Usar

### Verificação Básica
1. Abra o Facebook Ads Manager
2. Clique no ícone da extensão
3. Clique em "Verificar Anúncios"
4. Visualize os dados capturados

### Configurações Avançadas
- **Período de Dados**: Hoje, Ontem, 7 dias, 30 dias
- **Intervalo de Atualização**: 10-300 segundos
- **Auto-refresh**: Ativação automática
- **Notificações**: Alertas de mudanças

### Exportação
1. Capture os dados desejados
2. Clique em "Exportar CSV" ou "Exportar JSON"
3. Salve o arquivo no local desejado

## Funcionalidades Técnicas

### Detecção Automática
- Detecta tabelas de campanhas e anúncios
- Extrai métricas de performance
- Identifica mudanças em tempo real

### Seletores Inteligentes
- Múltiplos seletores para diferentes layouts
- Fallbacks para mudanças no Facebook
- Compatibilidade com diferentes idiomas

### Armazenamento Seguro
- Dados salvos localmente
- Sincronização entre dispositivos
- Limpeza automática de dados antigos

## Permissões Necessárias

- `activeTab` - Para acessar a página ativa
- `storage` - Para salvar configurações
- `downloads` - Para exportar dados
- `notifications` - Para alertas

## Domínios Suportados

- `https://www.facebook.com/*`
- `https://business.facebook.com/*`

## Arquivos da Extensão

- `manifest.json` - Configuração principal
- `popup.html` - Interface do usuário
- `popup.js` - Lógica da interface
- `content.js` - Script de extração de dados
- `background.js` - Script de segundo plano
- `README.md` - Documentação

## Limitações

- Funciona apenas no Facebook Ads Manager
- Requer permissões de acesso às páginas
- Dados dependem da estrutura atual do Facebook
- Pode necessitar atualizações com mudanças na interface

## Solução de Problemas

**Extensão não funciona:**
- Verifique se está no Facebook Ads Manager
- Atualize a página e tente novamente
- Verifique as permissões da extensão

**Dados não aparecem:**
- Aguarde o carregamento completo da página
- Tente diferentes períodos de dados
- Verifique se há anúncios ativos

**Exportação falha:**
- Verifique permissões de download
- Tente um formato diferente
- Limpe o cache do navegador

## Suporte

Esta extensão é parte do ecossistema Vendzz para análise de marketing digital e automação de campanhas.

Para suporte técnico ou melhorias, entre em contato através dos canais oficiais da Vendzz.

---
© 2025 Vendzz - Todos os direitos reservados