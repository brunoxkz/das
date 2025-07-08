// Auto-detecção de servidor para Chrome Extension
// Resolve problema de localhost e garante conexão automática

class ServerAutoDetector {
  constructor() {
    this.serverUrl = null;
    this.possibleUrls = [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev', // URL atual do Replit
    ];
  }

  async detectServer() {
    console.log('🔍 Detectando servidor Vendzz...');
    
    for (const url of this.possibleUrls) {
      try {
        console.log(`⏳ Testando: ${url}`);
        
        const response = await fetch(`${url}/api/whatsapp/extension-status`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        // Status 401 = servidor funcionando, só precisa de token
        // Status 200 = servidor funcionando
        if (response.status === 401 || response.status === 200) {
          this.serverUrl = url;
          console.log(`✅ Servidor detectado: ${url}`);
          
          // Salva no storage para uso futuro
          await this.saveServerUrl(url);
          return url;
        }
        
      } catch (error) {
        console.log(`❌ Falhou: ${url} - ${error.message}`);
        continue;
      }
    }
    
    // Se nenhum funcionou, usa localhost como fallback
    this.serverUrl = 'http://localhost:5000';
    console.log(`⚠️ Usando fallback: ${this.serverUrl}`);
    await this.saveServerUrl(this.serverUrl);
    return this.serverUrl;
  }
  
  async saveServerUrl(url) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ vendzz_server_url: url }, () => {
        console.log(`💾 URL salva: ${url}`);
        resolve();
      });
    });
  }
  
  async loadServerUrl() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['vendzz_server_url'], (result) => {
        if (result.vendzz_server_url) {
          this.serverUrl = result.vendzz_server_url;
          console.log(`📋 URL carregada: ${this.serverUrl}`);
        }
        resolve(this.serverUrl);
      });
    });
  }
  
  async getServerUrl() {
    // Primeiro tenta carregar do storage
    const savedUrl = await this.loadServerUrl();
    if (savedUrl) {
      // Testa se ainda funciona
      try {
        const response = await fetch(`${savedUrl}/api/whatsapp/extension-status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        
        if (response.status === 401 || response.status === 200) {
          return savedUrl;
        }
      } catch (e) {
        console.log('⚠️ URL salva não funciona mais, detectando novamente...');
      }
    }
    
    // Se não tiver ou não funcionar, detecta novamente
    return await this.detectServer();
  }
}

// Instância global para usar em toda extensão
window.serverDetector = new ServerAutoDetector();