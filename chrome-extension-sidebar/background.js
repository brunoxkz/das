// Service Worker para Sidebar To-Do + Pomodoro
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sidebar To-Do + Pomodoro instalado');
});

// Abrir sidebar quando o ícone for clicado - com verificação de compatibilidade
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Verificar se sidePanel está disponível
        if (chrome.sidePanel && chrome.sidePanel.open) {
            await chrome.sidePanel.open({ windowId: tab.windowId });
        } else {
            // Fallback: criar nova aba com a sidebar
            chrome.tabs.create({
                url: chrome.runtime.getURL('sidebar.html'),
                pinned: true,
                index: 0
            });
        }
    } catch (error) {
        console.log('Erro ao abrir sidebar, usando fallback:', error);
        // Fallback seguro
        chrome.tabs.create({
            url: chrome.runtime.getURL('sidebar.html'),
            pinned: true,
            index: 0
        });
    }
});