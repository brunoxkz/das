// Sistema de Sincronização em Tempo Real
// Garante que dados são sempre atualizados automaticamente

class RealTimeSync {
  constructor() {
    this.serverUrl = null;
    this.token = null;
    this.syncInterval = 10000; // 10 segundos
    this.isRunning = false;
    this.lastSyncTime = null;
    this.intervalId = null;
    
    this.cache = {
      quizzes: [],
      phones: new Map(),
      campaigns: [],
      lastUpdate: null
    };
  }

  async init(serverUrl, token) {
    this.serverUrl = serverUrl;
    this.token = token;
    
    console.log('🔄 Iniciando sincronização em tempo real...');
    await this.syncNow();
    this.startAutoSync();
  }

  startAutoSync() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.syncNow();
    }, this.syncInterval);
    
    console.log(`⏰ Auto-sync ativado: ${this.syncInterval/1000}s`);
  }

  stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏸️ Auto-sync pausado');
  }

  async syncNow() {
    if (!this.serverUrl || !this.token) {
      console.log('⚠️ Sync cancelado - sem servidor ou token');
      return false;
    }

    try {
      console.log('🔄 Sincronizando dados...');
      
      // 1. Buscar lista atualizada de quizzes
      const quizzesResponse = await fetch(`${this.serverUrl}/api/quizzes`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        this.cache.quizzes = quizzes;
        this.cache.lastUpdate = new Date().toISOString();
        
        console.log(`✅ Sync: ${quizzes.length} quizzes atualizados`);
        
        // Notificar sidebar sobre dados atualizados
        this.notifyDataUpdate('quizzes', quizzes);
        
        this.lastSyncTime = Date.now();
        return true;
      } else {
        console.log(`❌ Erro sync quizzes: ${quizzesResponse.status}`);
        return false;
      }
      
    } catch (error) {
      console.log(`❌ Erro sync: ${error.message}`);
      return false;
    }
  }

  async getQuizPhones(quizId, targetAudience = 'all', dateFilter = null, forceRefresh = false) {
    const cacheKey = `${quizId}_${targetAudience}_${dateFilter}`;
    
    // Se forceRefresh ou não tem cache, busca dados frescos
    if (forceRefresh || !this.cache.phones.has(cacheKey)) {
      console.log(`🔄 Buscando telefones frescos: Quiz ${quizId}`);
      
      try {
        const response = await fetch(`${this.serverUrl}/api/extension/quiz-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quizId,
            targetAudience,
            dateFilter
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Cache os dados com timestamp
          this.cache.phones.set(cacheKey, {
            ...data,
            cachedAt: Date.now(),
            realTime: true
          });
          
          console.log(`✅ ${data.phones?.length || 0} telefones atualizados`);
          
          // Notificar sidebar
          this.notifyDataUpdate('phones', data);
          
          return data;
        } else {
          console.log(`❌ Erro buscar telefones: ${response.status}`);
          return null;
        }
        
      } catch (error) {
        console.log(`❌ Erro buscar telefones: ${error.message}`);
        return null;
      }
    }
    
    // Retorna dados do cache
    const cached = this.cache.phones.get(cacheKey);
    console.log(`📋 Usando telefones do cache (${Math.round((Date.now() - cached.cachedAt)/1000)}s atrás)`);
    return cached;
  }

  async sendStatus(status) {
    if (!this.serverUrl || !this.token) return;

    try {
      await fetch(`${this.serverUrl}/api/whatsapp/extension-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...status,
          timestamp: new Date().toISOString(),
          syncVersion: this.cache.lastUpdate
        })
      });
    } catch (error) {
      console.log(`❌ Erro enviar status: ${error.message}`);
    }
  }

  notifyDataUpdate(type, data) {
    // Envia mensagem para todos os scripts da extensão
    const message = {
      type: 'DATA_UPDATED',
      dataType: type,
      data: data,
      timestamp: Date.now()
    };

    // Para popup
    chrome.runtime.sendMessage(message).catch(() => {});
    
    // Para content scripts
    chrome.tabs.query({url: "https://web.whatsapp.com/*"}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {});
      });
    });
  }

  getCachedQuizzes() {
    return this.cache.quizzes;
  }

  getCachedPhones(quizId, targetAudience = 'all', dateFilter = null) {
    const cacheKey = `${quizId}_${targetAudience}_${dateFilter}`;
    return this.cache.phones.get(cacheKey);
  }

  isDataFresh(maxAgeSeconds = 30) {
    if (!this.lastSyncTime) return false;
    const ageSeconds = (Date.now() - this.lastSyncTime) / 1000;
    return ageSeconds <= maxAgeSeconds;
  }

  getLastSyncAge() {
    if (!this.lastSyncTime) return 'Nunca';
    const ageSeconds = Math.round((Date.now() - this.lastSyncTime) / 1000);
    
    if (ageSeconds < 60) return `${ageSeconds}s atrás`;
    if (ageSeconds < 3600) return `${Math.round(ageSeconds/60)}min atrás`;
    return `${Math.round(ageSeconds/3600)}h atrás`;
  }
}

// Instância global
window.realTimeSync = new RealTimeSync();