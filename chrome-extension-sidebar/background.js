// Service Worker simples para Sidebar To-Do + Pomodoro
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sidebar To-Do + Pomodoro instalado');
});

// Abrir sidebar quando o ícone for clicado
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});