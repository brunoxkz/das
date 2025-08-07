// Injected script para RocketZap Lead Extractor
// Este arquivo é injetado diretamente nas páginas web para funcionalidades avançadas

console.log('🚀 RocketZap Lead Extractor - Script Injetado Carregado');

// Função para interceptar XLS downloads
function interceptXLSDownloads() {
  console.log('📊 Configurando interceptação de XLS...');
  
  // Interceptar cliques em botões de download/exportar
  document.addEventListener('click', function(event) {
    const target = event.target;
    const text = target.textContent.toLowerCase();
    
    // Detectar botões de exportação
    if (text.includes('exportar') || text.includes('download') || text.includes('excel')) {
      console.log('📥 Botão de exportação detectado:', target);
      
      // Notificar extensão
      window.postMessage({
        type: 'ROCKETZAP_EXPORT_DETECTED',
        source: 'injected-script',
        timestamp: Date.now(),
        buttonText: target.textContent,
        url: window.location.href
      }, '*');
    }
  });
  
  // Interceptar requisições XLS/XLSX
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && (url.includes('.xls') || url.includes('.xlsx') || url.includes('export'))) {
      console.log('📊 Requisição XLS detectada:', url);
      
      window.postMessage({
        type: 'ROCKETZAP_XLS_REQUEST',
        source: 'injected-script',
        url: url,
        timestamp: Date.now()
      }, '*');
    }
    
    return originalFetch.apply(this, args);
  };
}

// Função para detectar dados de leads na página
function detectLeadsData() {
  console.log('👥 Procurando dados de leads na página...');
  
  // Buscar tabelas com dados que parecem leads
  const tables = document.querySelectorAll('table');
  const leadsData = [];
  
  tables.forEach((table, index) => {
    const rows = table.querySelectorAll('tr');
    
    if (rows.length > 1) { // Tem header + dados
      const headerRow = rows[0];
      const headers = Array.from(headerRow.querySelectorAll('th, td')).map(cell => 
        cell.textContent.trim().toLowerCase()
      );
      
      // Verificar se parece tabela de leads (tem telefone, nome, etc)
      const hasPhoneColumn = headers.some(h => 
        h.includes('telefone') || h.includes('phone') || h.includes('whatsapp')
      );
      const hasNameColumn = headers.some(h => 
        h.includes('nome') || h.includes('name') || h.includes('contato')
      );
      
      if (hasPhoneColumn && hasNameColumn) {
        console.log(`📋 Tabela de leads encontrada (${index}):`, headers);
        
        // Extrair dados das linhas
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = Array.from(row.querySelectorAll('td'));
          
          if (cells.length >= headers.length) {
            const leadData = {};
            headers.forEach((header, cellIndex) => {
              if (cells[cellIndex]) {
                leadData[header] = cells[cellIndex].textContent.trim();
              }
            });
            
            leadsData.push(leadData);
          }
        }
      }
    }
  });
  
  if (leadsData.length > 0) {
    console.log(`✅ ${leadsData.length} leads detectados na página`);
    
    // Enviar dados para extensão
    window.postMessage({
      type: 'ROCKETZAP_LEADS_DETECTED',
      source: 'injected-script',
      leads: leadsData,
      timestamp: Date.now(),
      url: window.location.href
    }, '*');
  }
  
  return leadsData;
}

// Função para monitorar mudanças na página (SPA)
function observePageChanges() {
  console.log('👀 Monitorando mudanças na página...');
  
  const observer = new MutationObserver(function(mutations) {
    let shouldCheckLeads = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verificar se adicionaram tabelas ou elementos relevantes
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'TABLE' || node.querySelector('table')) {
              shouldCheckLeads = true;
            }
          }
        });
      }
    });
    
    if (shouldCheckLeads) {
      setTimeout(detectLeadsData, 1000); // Aguardar um pouco para página carregar
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Função para verificar se estamos na página correta do RocketZap
function checkRocketZapPage() {
  const url = window.location.href;
  const isRocketZap = url.includes('app.rocketzap.com.br');
  
  if (isRocketZap) {
    console.log('✅ Página RocketZap detectada:', url);
    
    // Notificar extensão que estamos na página correta
    window.postMessage({
      type: 'ROCKETZAP_PAGE_DETECTED',
      source: 'injected-script',
      url: url,
      timestamp: Date.now()
    }, '*');
    
    return true;
  }
  
  return false;
}

// Inicialização do script
function initializeInjectedScript() {
  console.log('🚀 Inicializando RocketZap Lead Extractor...');
  
  if (checkRocketZapPage()) {
    // Configurar interceptação
    interceptXLSDownloads();
    
    // Detectar leads imediatamente
    setTimeout(detectLeadsData, 2000);
    
    // Monitorar mudanças
    observePageChanges();
    
    console.log('✅ Script injetado configurado com sucesso!');
  } else {
    console.log('ℹ️ Página não é RocketZap, script em standby');
  }
}

// Esperar página carregar e inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInjectedScript);
} else {
  initializeInjectedScript();
}

// Listener para mensagens da extensão
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  
  const message = event.data;
  
  switch (message.type) {
    case 'EXTENSION_PING':
      console.log('📡 Ping recebido da extensão');
      window.postMessage({
        type: 'EXTENSION_PONG',
        source: 'injected-script',
        timestamp: Date.now()
      }, '*');
      break;
      
    case 'REQUEST_LEADS_SCAN':
      console.log('🔍 Solicitação de scan de leads recebida');
      detectLeadsData();
      break;
      
    default:
      // Ignorar outras mensagens
      break;
  }
});

console.log('✅ RocketZap Lead Extractor - Script Injetado Pronto!');