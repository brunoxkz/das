// Service Worker para a extensão Sidebar To-Do
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sidebar To-Do Manager instalado');
});

// Configurar sidebar permanente quando a extensão for ativada
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Abrir/alternar a sidebar
        await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch (error) {
        console.error('Erro ao abrir sidebar:', error);
    }
});

// Garantir que a sidebar esteja sempre disponível
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        // Manter a sidebar disponível em todas as abas
        await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
        console.error('Erro ao configurar sidebar:', error);
    }
});

// Listener para mensagens da sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
        // Retornar dados salvos se necessário
        chrome.storage.local.get(['todoColumns'], (result) => {
            sendResponse({ data: result.todoColumns });
        });
        return true; // Manter o canal aberto para resposta assíncrona
    }
    
    if (request.action === 'saveData') {
        // Salvar dados se necessário
        chrome.storage.local.set({ todoColumns: request.data }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Manter a sidebar funcionando
chrome.runtime.onStartup.addListener(() => {
    console.log('Sidebar To-Do Manager iniciado');
});