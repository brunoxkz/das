// Fluxo de testes completo para sincronização automática WhatsApp
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:5000';
const QUIZ_ID = 'Qm4wxpfPgkMrwoMhDFNLZ';

class TestSuite {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testResults = [];
    this.createdLeads = [];
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${SERVER_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  log(category, message, success = true) {
    const status = success ? '✅' : '❌';
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${status} ${category}: ${message}`);
    
    this.testResults.push({
      timestamp,
      category,
      message,
      success
    });
  }

  // Teste 1: Autenticação
  async testAuthentication() {
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });

      this.token = response.accessToken;
      this.userId = response.user.id;
      this.log('AUTH', `Login bem-sucedido - User ID: ${this.userId}`);
      return true;
    } catch (error) {
      this.log('AUTH', `Falha no login: ${error.message}`, false);
      return false;
    }
  }

  // Teste 2: Criar leads de teste
  async testCreateLeads() {
    const leadTypes = [
      { type: 'completed', isComplete: true, completionPercentage: 100, isPartial: false },
      { type: 'abandoned', isComplete: false, completionPercentage: 60, isPartial: false },
      { type: 'partial', isComplete: false, completionPercentage: 30, isPartial: true }
    ];

    for (const leadType of leadTypes) {
      try {
        const phone = `1199${Math.floor(Math.random() * 10000000)}`;
        const name = `Lead ${leadType.type} ${Date.now()}`;
        
        const response = await this.makeRequest(`/api/quizzes/${QUIZ_ID}/submit`, {
          method: 'POST',
          body: JSON.stringify({
            responses: {
              nome: name,
              telefone_principal: phone,
              email: `${phone}@teste.com`,
              idade: '25'
            },
            metadata: {
              ...leadType,
              completedAt: new Date().toISOString(),
              userAgent: 'test-suite',
              ip: '127.0.0.1',
              totalPages: 4,
              timeSpent: 120000,
              leadData: {}
            }
          })
        });

        this.createdLeads.push({
          phone,
          name,
          type: leadType.type,
          createdAt: new Date().toISOString()
        });

        this.log('LEAD', `Lead ${leadType.type} criado: ${name} - ${phone}`);
      } catch (error) {
        this.log('LEAD', `Erro ao criar lead ${leadType.type}: ${error.message}`, false);
      }
    }
  }

  // Teste 3: Verificar arquivo de automação
  async testAutomationFile() {
    try {
      const response = await this.makeRequest(`/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}`);
      this.log('FILE', `Arquivo de automação encontrado: ${response.id}`);
      return response;
    } catch (error) {
      this.log('FILE', `Erro ao buscar arquivo: ${error.message}`, false);
      return null;
    }
  }

  // Teste 4: Sincronização com diferentes timestamps
  async testSyncWithTimestamps() {
    const timestamps = [
      { name: '5 segundos atrás', offset: 5000 },
      { name: '30 segundos atrás', offset: 30000 },
      { name: '2 minutos atrás', offset: 120000 },
      { name: '5 minutos atrás', offset: 300000 }
    ];

    for (const timestamp of timestamps) {
      try {
        const lastSync = new Date(Date.now() - timestamp.offset).toISOString();
        const response = await this.makeRequest(
          `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync?lastSync=${lastSync}`
        );

        this.log('SYNC', `${timestamp.name}: ${response.newLeads?.length || 0} novos leads detectados`);
      } catch (error) {
        this.log('SYNC', `Erro sync ${timestamp.name}: ${error.message}`, false);
      }
    }
  }

  // Teste 5: Sincronização sem parâmetro lastSync
  async testSyncWithoutLastSync() {
    try {
      const response = await this.makeRequest(
        `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync`
      );

      this.log('SYNC', `Sync sem lastSync: ${response.newLeads?.length || 0} leads desde último update`);
    } catch (error) {
      this.log('SYNC', `Erro sync sem lastSync: ${error.message}`, false);
    }
  }

  // Teste 6: Validar estrutura de dados dos leads
  async testLeadDataStructure() {
    try {
      const lastSync = new Date(Date.now() - 600000).toISOString(); // 10 minutos atrás
      const response = await this.makeRequest(
        `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync?lastSync=${lastSync}`
      );

      if (response.newLeads && response.newLeads.length > 0) {
        const lead = response.newLeads[0];
        const requiredFields = ['phone', 'isComplete', 'submittedAt', 'allResponses'];
        
        let validStructure = true;
        for (const field of requiredFields) {
          if (!lead.hasOwnProperty(field)) {
            this.log('STRUCTURE', `Campo obrigatório ausente: ${field}`, false);
            validStructure = false;
          }
        }

        if (validStructure) {
          this.log('STRUCTURE', `Estrutura de dados válida: ${JSON.stringify(Object.keys(lead))}`);
          this.log('STRUCTURE', `Exemplo de lead: ${lead.phone} - ${lead.isComplete ? 'Completo' : 'Abandonado'}`);
        }
      } else {
        this.log('STRUCTURE', 'Nenhum lead disponível para validação de estrutura');
      }
    } catch (error) {
      this.log('STRUCTURE', `Erro na validação de estrutura: ${error.message}`, false);
    }
  }

  // Teste 7: Performance da sincronização
  async testSyncPerformance() {
    const iterations = 5;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        const lastSync = new Date(Date.now() - 30000).toISOString();
        
        await this.makeRequest(
          `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync?lastSync=${lastSync}`
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        times.push(duration);
        
        // Aguardar 1 segundo entre requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.log('PERFORMANCE', `Erro na iteração ${i + 1}: ${error.message}`, false);
      }
    }

    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      this.log('PERFORMANCE', `Média: ${avgTime.toFixed(0)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
    }
  }

  // Teste 8: Teste de concorrência
  async testConcurrency() {
    const concurrentRequests = 3;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const lastSync = new Date(Date.now() - 60000).toISOString();
      const promise = this.makeRequest(
        `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync?lastSync=${lastSync}`
      ).then(response => ({
        request: i + 1,
        leads: response.newLeads?.length || 0,
        success: true
      })).catch(error => ({
        request: i + 1,
        error: error.message,
        success: false
      }));
      
      promises.push(promise);
    }

    try {
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      this.log('CONCURRENCY', `${successful}/${concurrentRequests} requests simultâneos bem-sucedidos`);
      
      results.forEach(result => {
        if (result.success) {
          this.log('CONCURRENCY', `Request ${result.request}: ${result.leads} leads`);
        } else {
          this.log('CONCURRENCY', `Request ${result.request} falhou: ${result.error}`, false);
        }
      });
    } catch (error) {
      this.log('CONCURRENCY', `Erro no teste de concorrência: ${error.message}`, false);
    }
  }

  // Teste 9: Atualização do last_updated
  async testLastUpdatedTracking() {
    try {
      // Primeira sync
      const beforeSync = await this.makeRequest(`/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}`);
      const initialLastUpdated = beforeSync.last_updated;
      
      // Aguardar 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Executar sync
      const lastSync = new Date(Date.now() - 30000).toISOString();
      await this.makeRequest(
        `/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}/sync?lastSync=${lastSync}`
      );
      
      // Verificar se last_updated foi atualizado
      const afterSync = await this.makeRequest(`/api/whatsapp-automation-file/${this.userId}/${QUIZ_ID}`);
      const updatedLastUpdated = afterSync.last_updated;
      
      if (new Date(updatedLastUpdated) > new Date(initialLastUpdated)) {
        this.log('TRACKING', `last_updated atualizado corretamente: ${initialLastUpdated} → ${updatedLastUpdated}`);
      } else {
        this.log('TRACKING', `last_updated não foi atualizado: ${initialLastUpdated} = ${updatedLastUpdated}`, false);
      }
    } catch (error) {
      this.log('TRACKING', `Erro no teste de tracking: ${error.message}`, false);
    }
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 INICIANDO FLUXO DE TESTES COMPLETO - SINCRONIZAÇÃO AUTOMÁTICA');
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    
    // 1. Autenticação
    console.log('\n📋 1. TESTE DE AUTENTICAÇÃO');
    const authSuccess = await this.testAuthentication();
    if (!authSuccess) return;
    
    // 2. Criar leads de teste
    console.log('\n📋 2. CRIAÇÃO DE LEADS DE TESTE');
    await this.testCreateLeads();
    
    // Aguardar 3 segundos para garantir que os leads foram salvos
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Verificar arquivo de automação
    console.log('\n📋 3. VERIFICAÇÃO DO ARQUIVO DE AUTOMAÇÃO');
    await this.testAutomationFile();
    
    // 4. Testes de sincronização
    console.log('\n📋 4. TESTES DE SINCRONIZAÇÃO COM DIFERENTES TIMESTAMPS');
    await this.testSyncWithTimestamps();
    
    // 5. Sync sem lastSync
    console.log('\n📋 5. SINCRONIZAÇÃO SEM PARÂMETRO LASTSYNC');
    await this.testSyncWithoutLastSync();
    
    // 6. Validar estrutura de dados
    console.log('\n📋 6. VALIDAÇÃO DA ESTRUTURA DE DADOS');
    await this.testLeadDataStructure();
    
    // 7. Teste de performance
    console.log('\n📋 7. TESTE DE PERFORMANCE');
    await this.testSyncPerformance();
    
    // 8. Teste de concorrência
    console.log('\n📋 8. TESTE DE CONCORRÊNCIA');
    await this.testConcurrency();
    
    // 9. Tracking do last_updated
    console.log('\n📋 9. TESTE DE TRACKING DO LAST_UPDATED');
    await this.testLastUpdatedTracking();
    
    // Relatório final
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(80));
    
    const successful = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    console.log(`\n✅ Testes bem-sucedidos: ${successful}/${total} (${successRate}%)`);
    console.log(`⏱️  Tempo total de execução: ${totalTime}ms`);
    console.log(`📱 Leads criados para teste: ${this.createdLeads.length}`);
    
    if (this.createdLeads.length > 0) {
      console.log('\n📋 LEADS CRIADOS:');
      this.createdLeads.forEach(lead => {
        console.log(`  - ${lead.name} (${lead.phone}) - ${lead.type}`);
      });
    }
    
    // Testes que falharam
    const failures = this.testResults.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      failures.forEach(failure => {
        console.log(`  - ${failure.category}: ${failure.message}`);
      });
    }
    
    console.log('\n🎉 FLUXO DE TESTES FINALIZADO!');
  }
}

// Executar testes
const testSuite = new TestSuite();
testSuite.runAllTests().catch(error => {
  console.error('❌ Erro fatal nos testes:', error);
});