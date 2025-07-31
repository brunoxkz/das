// Content Script para comunicação com a sidebar
(function() {
    'use strict';
    
    // Verificar se já foi inicializado
    if (window.sidebarTodoInitialized) {
        return;
    }
    window.sidebarTodoInitialized = true;
    
    // Listener para mensagens da sidebar
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            sendResponse({ status: 'active' });
        }
        
        if (request.action === 'getPageInfo') {
            sendResponse({
                url: window.location.href,
                title: document.title
            });
        }
    });
    
    // Notificar que o content script está carregado
    console.log('Sidebar To-Do Content Script carregado');
})();