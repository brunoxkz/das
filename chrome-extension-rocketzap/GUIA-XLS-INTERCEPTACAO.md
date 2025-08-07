# 🚀 Guia: Interceptação Automática de XLS do RocketZap

## ✅ Funcionalidades Implementadas

### Interceptação Automática
- **Monitora downloads** do arquivo "Audiencia.xls" automaticamente
- **Não precisa** manter aba aberta - funciona em background
- **Processa arquivo** antes de chegar no download do usuário
- **Extrai leads** automaticamente dos dados Excel

### Exportação Automática A Cada Hora
- **Timer automático** executa a cada 1 hora
- **Abre página /contacts** automaticamente se necessário
- **Clica no botão "Exportar"** sem intervenção manual
- **Processa XLS** imediatamente após download

### Sistema Anti-Duplicação
- **Compara com histórico** de números já processados
- **Armazena localmente** lista de telefones únicos
- **Filtra duplicatas** antes de enviar para SMS
- **Mantém estatísticas** precisas

## 🔧 Como Funciona

### Fluxo Automático
```
⏰ Timer (1 hora) → 🌐 Abre /contacts → 🔽 Clica "Exportar" → 
📥 Intercepta XLS → 📊 Processa dados → 🔍 Filtra duplicatas → 
📱 Envia novos leads → 📈 Atualiza estatísticas
```

### Interceptação WebRequest
```javascript
// Intercepta TODOS os downloads de arquivos Audiencia
chrome.webRequest.onBeforeRequest.addListener(
  processXLS,
  { urls: ["*://app.rocketzap.com.br/*"] }
);
```

### Parser Inteligente
- **Detecta formato** automaticamente (.xls, .xlsx, .csv)
- **Mapeia campos** flexivelmente (nome, telefone, email)
- **Normaliza telefones** brasileiros (+55)
- **Valida estrutura** antes de processar

## 🎯 Configurações

### Intervalo de Exportação
```javascript
AUTO_EXPORT_INTERVAL: 60 * 60 * 1000  // 1 hora
```

### Padrões de Arquivo
```javascript
XLS_FILE_PATTERNS: [
  'Audiencia.xls', 
  'Audiencia.xlsx', 
  'audiencia'
]
```

### Campos Mapeados
```javascript
nameFields: ['nome', 'name', 'contact', 'contato']
phoneFields: ['telefone', 'phone', 'celular', 'whatsapp']
emailFields: ['email', 'e-mail', 'correio']
```

## 📱 Interface do Popup

### Novos Controles
- **"📥 Exportar Agora"** - força exportação manual
- **"📤 Sincronizar"** - envia leads para servidor
- **"🔄 Atualizar"** - atualiza estatísticas
- **"🗑️ Limpar"** - limpa histórico local

### Notificações
- **"📊 XLS processado: X novos de Y total"**
- **"📱 Novo lead: (11) 99999-9999"**
- **"✅ X leads sincronizados com sucesso"**

## 🔄 Permissões Necessárias

### Novas Permissões
```json
"permissions": [
  "webRequest",    // Interceptar downloads
  "alarms",        // Timer automático
  "downloads"      // Gerenciar downloads
]
```

## ⚙️ Configuração Avançada

### Habilitar/Desabilitar Auto-Export
```javascript
chrome.storage.local.set({
  settings: { 
    autoExport: true,  // true/false
    exportInterval: 3600000  // ms
  }
});
```

### Personalizar Seletores
```javascript
// Função injetada para diferentes layouts
function clickExportButton() {
  // Busca flexível por texto
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent.includes('Exportar')) {
      btn.click();
      return;
    }
  }
  
  // Fallback CSS específico
  document.querySelector('[data-testid="export-btn"]')?.click();
}
```

## 📊 Processamento de Dados

### Estrutura de Lead Extraído
```javascript
{
  name: "João Silva",
  phone: "5511999999999",  // Normalizado
  email: "joao@email.com",
  source: "rocketzap-xls",
  timestamp: 1641234567890
}
```

### Normalização de Telefone
```javascript
// Entrada: "(11) 99999-9999"
// Saída: "5511999999999"

// Entrada: "11999999999" 
// Saída: "5511999999999"

// Entrada: "999999999"
// Saída: "5511999999999" (assume SP)
```

## 🐛 Resolução de Problemas

### Exportação Não Funciona
1. **Verificar permissões** da extensão
2. **Abrir DevTools** e ver console
3. **Verificar seletor** do botão Exportar
4. **Testar manualmente** na página /contacts

### XLS Não É Interceptado
1. **Verificar URL** do download
2. **Ver logs** no background script
3. **Confirmar padrão** do nome do arquivo
4. **Testar permissões** webRequest

### Leads Não Aparecem
1. **Verificar parsing** do arquivo XLS
2. **Ver estrutura** dos dados extraídos
3. **Confirmar mapeamento** de campos
4. **Testar normalização** de telefones

## 🚀 Próximos Passos

### Melhorias Sugeridas
1. **SheetJS real** para parsing robusto
2. **Interface configuração** para intervalos
3. **Logs detalhados** para debug
4. **Backup automático** na nuvem
5. **Relatórios** de performance

### Integrações
1. **Webhook** para notificações
2. **CRM** para sincronização
3. **Analytics** para métricas
4. **Dashboard web** para monitoramento

## ✅ Checklist de Instalação

- [ ] Extensão instalada no Chrome/Opera
- [ ] Permissões concedidas (webRequest, alarms)
- [ ] Testado clique manual "Exportar"
- [ ] Verificado interceptação XLS
- [ ] Configurado intervalo automático
- [ ] Testado anti-duplicação
- [ ] Integrado com sistema SMS

## 🎉 Resultado Final

A extensão agora funciona **100% automaticamente**:

1. **Roda em background** sem precisar de aba aberta
2. **Exporta automaticamente** a cada 1 hora
3. **Processa XLS** instantaneamente
4. **Filtra duplicatas** inteligentemente  
5. **Envia leads novos** para SMS
6. **Funciona 24/7** sem intervenção

**A captação de leads do RocketZap está completamente automatizada! 🚀**