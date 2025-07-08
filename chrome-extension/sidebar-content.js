// Content script para injetar a sidebar no WhatsApp Web
(function() {
  'use strict';
  
  let sidebarInjected = false;
  
  function injectSidebar() {
    if (sidebarInjected) return;
    
    // Verificar se estamos no WhatsApp Web
    if (!window.location.href.includes('web.whatsapp.com')) {
      return;
    }
    
    console.log('📱 Injetando sidebar Vendzz WhatsApp...');
    
    // Criar iframe para a sidebar
    const sidebarFrame = document.createElement('iframe');
    sidebarFrame.id = 'vendzz-whatsapp-sidebar';
    sidebarFrame.src = chrome.runtime.getURL('sidebar.html');
    sidebarFrame.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: 350px !important;
      height: 100vh !important;
      border: none !important;
      z-index: 999999 !important;
      background: transparent !important;
      pointer-events: auto !important;
    `;
    
    // Adicionar ao body
    document.body.appendChild(sidebarFrame);
    
    // Ajustar layout do WhatsApp para dar espaço à sidebar
    adjustWhatsAppLayout();
    
    sidebarInjected = true;
    console.log('✅ Sidebar Vendzz injetada com sucesso');
  }
  
  function adjustWhatsAppLayout() {
    // Adicionar CSS para ajustar o layout do WhatsApp
    const style = document.createElement('style');
    style.id = 'vendzz-layout-adjustments';
    style.textContent = `
      /* Ajustar container principal do WhatsApp */
      #app {
        margin-right: 350px !important;
        transition: margin-right 0.3s ease !important;
      }
      
      /* Quando sidebar estiver minimizada */
      .sidebar-minimized #app {
        margin-right: 80px !important;
      }
      
      /* Responsivo para telas menores */
      @media (max-width: 1200px) {
        #app {
          margin-right: 300px !important;
        }
        
        #vendzz-whatsapp-sidebar {
          width: 300px !important;
        }
      }
      
      @media (max-width: 900px) {
        #app {
          margin-right: 0 !important;
        }
        
        #vendzz-whatsapp-sidebar {
          width: 100% !important;
          background: rgba(0, 0, 0, 0.9) !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  function removeSidebar() {
    const sidebar = document.getElementById('vendzz-whatsapp-sidebar');
    const style = document.getElementById('vendzz-layout-adjustments');
    
    if (sidebar) {
      sidebar.remove();
    }
    
    if (style) {
      style.remove();
    }
    
    sidebarInjected = false;
    console.log('🗑️ Sidebar Vendzz removida');
  }
  
  // Listener para comandos do background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'INJECT_SIDEBAR':
        injectSidebar();
        sendResponse({ success: true });
        break;
        
      case 'REMOVE_SIDEBAR':
        removeSidebar();
        sendResponse({ success: true });
        break;
        
      case 'TOGGLE_SIDEBAR':
        if (sidebarInjected) {
          removeSidebar();
        } else {
          injectSidebar();
        }
        sendResponse({ success: true });
        break;
        
      case 'GET_SIDEBAR_STATUS':
        sendResponse({ injected: sidebarInjected });
        break;
    }
  });
  
  // Aguardar WhatsApp carregar completamente antes de injetar
  function waitForWhatsApp() {
    const checkInterval = setInterval(() => {
      const selectors = [
        '[data-testid="chat-list"]',
        '[data-testid="main"]',
        '#side'
      ];
      
      const whatsappLoaded = selectors.some(selector => 
        document.querySelector(selector) !== null
      );
      
      if (whatsappLoaded) {
        clearInterval(checkInterval);
        console.log('✅ WhatsApp Web detectado, injetando sidebar...');
        setTimeout(injectSidebar, 2000); // Aguardar 2s para garantir carregamento
      }
    }, 1000);
    
    // Timeout de 30 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⏰ Timeout na detecção do WhatsApp Web');
    }, 30000);
  }
  
  // Verificar se a extensão está habilitada para este site
  chrome.storage.sync.get(['sidebarEnabled'], (result) => {
    if (result.sidebarEnabled !== false) { // Habilitada por padrão
      waitForWhatsApp();
    }
  });
  
  // Observar mudanças na URL (SPA)
  let currentUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      
      // Se saiu do WhatsApp Web, remover sidebar
      if (!currentUrl.includes('web.whatsapp.com')) {
        removeSidebar();
      }
      // Se entrou no WhatsApp Web, aguardar e injetar
      else if (currentUrl.includes('web.whatsapp.com') && !sidebarInjected) {
        setTimeout(waitForWhatsApp, 1000);
      }
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
  
})();