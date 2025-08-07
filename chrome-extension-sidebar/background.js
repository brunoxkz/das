// Background Script - Gerencia toggle da sidebar
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sidebar To-Do + Pomodoro extension installed');
});

// Toggle sidebar quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Verificar se é uma página válida
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('edge://') ||
            tab.url.startsWith('opera://') ||
            tab.url.startsWith('file://')) {
            
            // Mostrar notificação para páginas especiais
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.svg',
                title: 'Sidebar To-Do + Pomodoro',
                message: 'Extensão não funciona em páginas especiais do navegador. Abra um site qualquer (google.com, youtube.com, etc.)'
            });
            return;
        }

        // Tentar enviar mensagem para o content script
        let response = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !response) {
            try {
                response = await chrome.tabs.sendMessage(tab.id, {
                    action: "toggleSidebar"
                });
                console.log('Sidebar toggled:', response);
                break;
            } catch (error) {
                attempts++;
                console.log(`Tentativa ${attempts} falhou:`, error);
                
                if (attempts === maxAttempts) {
                    // Injetar content script manualmente se necessário
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        });
                        
                        await chrome.scripting.insertCSS({
                            target: { tabId: tab.id },
                            files: ['sidebar-content.css']
                        });

                        // Tentar novamente após injeção
                        setTimeout(async () => {
                            try {
                                await chrome.tabs.sendMessage(tab.id, {
                                    action: "toggleSidebar"
                                });
                            } catch (e) {
                                console.error('Erro final:', e);
                            }
                        }, 500);
                        
                    } catch (injectError) {
                        console.error('Erro ao injetar script:', injectError);
                        
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icons/icon48.svg',
                            title: 'Sidebar To-Do + Pomodoro',
                            message: 'Erro ao carregar extensão. Recarregue a página e tente novamente.'
                        });
                    }
                } else {
                    // Esperar antes da próxima tentativa
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }
        
    } catch (error) {
        console.error('Erro geral ao toggle sidebar:', error);
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