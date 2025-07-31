// Background Script - Gerencia toggle da sidebar
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sidebar To-Do + Pomodoro extension installed');
});

// Toggle sidebar quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Verificar se é uma página válida (não chrome:// ou extension://)
        if (!tab.url.startsWith('chrome://') && 
            !tab.url.startsWith('chrome-extension://') && 
            !tab.url.startsWith('moz-extension://') &&
            !tab.url.startsWith('about:')) {
            
            // Enviar mensagem para o content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "toggleSidebar"
            });
            
            console.log('Sidebar toggled:', response);
        } else {
            // Mostrar notificação se não pode injetar na página
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.svg',
                title: 'Sidebar To-Do + Pomodoro',
                message: 'Esta extensão não pode ser usada em páginas do navegador. Vá para qualquer site da web.'
            });
        }
    } catch (error) {
        console.error('Erro ao toggle sidebar:', error);
        
        // Se o content script não está carregado, tentar recarregar a página
        try {
            chrome.tabs.reload(tab.id);
        } catch (reloadError) {
            console.error('Erro ao recarregar página:', reloadError);
        }
    }
});

// Manter estado da sidebar entre sessões
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveSidebarState") {
        chrome.storage.local.set({
            sidebarVisible: request.visible
        });
    }
    sendResponse({success: true});
});

// Verificar permissões necessárias
chrome.runtime.onStartup.addListener(() => {
    // Solicitar permissão para notificações se necessário
    chrome.permissions.contains({
        permissions: ['notifications']
    }, (hasPermission) => {
        if (!hasPermission) {
            chrome.permissions.request({
                permissions: ['notifications']
            });
        }
    });
});