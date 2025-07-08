// Content Script para injetar sidebar automaticamente no WhatsApp Web
// Parte da nova arquitetura Vendzz WhatsApp 2.0

console.log('🎨 Vendzz Sidebar Content Script carregado');

let sidebar = null;
let isInjected = false;

// ========================================
// INJEÇÃO DA SIDEBAR
// ========================================

function injectSidebar() {
  if (isInjected || sidebar) {
    console.log('⚠️ Sidebar já foi injetada');
    return;
  }

  console.log('🎨 Injetando sidebar Vendzz...');

  try {
    // Criar container da sidebar
    sidebar = document.createElement('div');
    sidebar.id = 'vendzz-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      z-index: 10000;
      background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      box-shadow: -2px 0 10px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
      overflow: hidden;
    `;

    // Carregar conteúdo da sidebar
    fetch(chrome.runtime.getURL('sidebar.html'))
      .then(response => response.text())
      .then(html => {
        sidebar.innerHTML = html;
        
        // Injetar script da sidebar
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('sidebar.js');
        sidebar.appendChild(script);
        
        console.log('✅ Sidebar Vendzz injetada com sucesso');
      })
      .catch(error => {
        console.error('❌ Erro ao carregar sidebar:', error);
      });

    // Adicionar ao body
    document.body.appendChild(sidebar);
    
    // Ajustar layout do WhatsApp
    adjustWhatsAppLayout();
    
    isInjected = true;

  } catch (error) {
    console.error('❌ Erro ao injetar sidebar:', error);
  }
}

// ========================================
// AJUSTE DO LAYOUT DO WHATSAPP
// ========================================

function adjustWhatsAppLayout() {
  try {
    // Buscar container principal do WhatsApp
    const whatsappContainer = document.querySelector('#app') || document.querySelector('[data-testid="app"]');
    
    if (whatsappContainer) {
      // Reduzir largura para acomodar sidebar
      whatsappContainer.style.marginRight = '300px';
      whatsappContainer.style.transition = 'margin-right 0.3s ease';
      
      console.log('📐 Layout do WhatsApp ajustado para sidebar');
    }
    
  } catch (error) {
    console.error('❌ Erro ao ajustar layout:', error);
  }
}

// ========================================
// REMOÇÃO DA SIDEBAR
// ========================================

function removeSidebar() {
  if (sidebar) {
    sidebar.remove();
    sidebar = null;
    isInjected = false;
    
    // Restaurar layout original
    const whatsappContainer = document.querySelector('#app') || document.querySelector('[data-testid="app"]');
    if (whatsappContainer) {
      whatsappContainer.style.marginRight = '0';
    }
    
    console.log('🗑️ Sidebar removida');
  }
}

// ========================================
// DETECÇÃO E INICIALIZAÇÃO
// ========================================

function waitForWhatsApp() {
  const checkWhatsApp = () => {
    // Verificar se WhatsApp carregou completamente
    const chatList = document.querySelector('[data-testid="chat-list"]');
    const mainPanel = document.querySelector('[data-testid="main"]');
    
    if (chatList || mainPanel) {
      console.log('✅ WhatsApp Web detectado - injetando sidebar');
      
      // Aguardar um pouco para estabilizar
      setTimeout(() => {
        injectSidebar();
      }, 2000);
      
    } else {
      // Continuar verificando
      setTimeout(checkWhatsApp, 1000);
    }
  };
  
  checkWhatsApp();
}

// ========================================
// CONTROLE DE VISIBILIDADE
// ========================================

// Escutar mensagens do background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'TOGGLE_SIDEBAR':
      if (isInjected) {
        removeSidebar();
      } else {
        injectSidebar();
      }
      sendResponse({ success: true, isVisible: isInjected });
      break;
      
    case 'SHOW_SIDEBAR':
      if (!isInjected) {
        injectSidebar();
      }
      sendResponse({ success: true });
      break;
      
    case 'HIDE_SIDEBAR':
      removeSidebar();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Ação desconhecida' });
  }
  
  return true;
});

// ========================================
// INICIALIZAÇÃO
// ========================================

// Verificar se estamos no WhatsApp Web
if (window.location.hostname === 'web.whatsapp.com') {
  console.log('📱 Detectado WhatsApp Web - aguardando carregamento...');
  
  // Aguardar DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForWhatsApp);
  } else {
    waitForWhatsApp();
  }
  
  // Detectar mudanças de rota no WhatsApp (SPA)
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      console.log('🔄 Mudança de rota detectada');
      
      // Re-ajustar layout se necessário
      if (isInjected) {
        setTimeout(adjustWhatsAppLayout, 500);
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
} else {
  console.log('⚠️ Content script carregado fora do WhatsApp Web');
}