// Popup Script para abrir a sidebar
document.addEventListener('DOMContentLoaded', () => {
    const openSidebarBtn = document.getElementById('openSidebar');
    
    openSidebarBtn.addEventListener('click', async () => {
        try {
            // Obter a aba ativa atual
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                // Abrir a sidebar na janela atual
                await chrome.sidePanel.open({ windowId: tab.windowId });
                
                // Fechar o popup
                window.close();
            }
        } catch (error) {
            console.error('Erro ao abrir sidebar:', error);
            
            // Fallback: tentar através do background script
            try {
                await chrome.runtime.sendMessage({ action: 'openSidebar' });
                window.close();
            } catch (fallbackError) {
                console.error('Erro no fallback:', fallbackError);
                alert('Erro ao abrir sidebar. Tente novamente.');
            }
        }
    });
    
    // Verificar se a sidebar já está aberta
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
            try {
                const isOpen = await chrome.sidePanel.getOptions({ tabId: tabs[0].id });
                if (isOpen && isOpen.enabled) {
                    openSidebarBtn.textContent = 'Sidebar Aberta ✓';
                    openSidebarBtn.style.background = '#48bb78';
                }
            } catch (error) {
                // Sidebar não está disponível ou não está aberta
                console.log('Sidebar não detectada');
            }
        }
    });
});