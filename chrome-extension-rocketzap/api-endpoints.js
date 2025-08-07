// APIs para integrar com a extensão RocketZap Lead Extractor
// Adicione este código ao seu server Express

// ===== API PARA EXTENSÃO ROCKETZAP =====
console.log('🚀 CONFIGURANDO API PARA EXTENSÃO ROCKETZAP');

// Middleware para CORS (permitir extensão acessar API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Endpoint para receber leads da extensão
app.post('/api/leads', async (req, res) => {
  try {
    const lead = req.body;
    console.log('📱 Novo lead recebido da extensão:', lead);
    
    // Validar dados obrigatórios
    if (!lead.phone) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone é obrigatório'
      });
    }
    
    // Normalizar telefone brasileiro
    let normalizedPhone = lead.phone.replace(/\D/g, '');
    if (normalizedPhone.length === 11 && normalizedPhone.startsWith('9')) {
      normalizedPhone = '55' + normalizedPhone;
    } else if (normalizedPhone.length === 10) {
      normalizedPhone = '559' + normalizedPhone;
    }
    
    const processedLead = {
      phone: normalizedPhone,
      name: lead.name || 'Nome não informado',
      source: lead.source || 'rocketzap',
      timestamp: lead.timestamp || Date.now(),
      status: 'pending' // Para agendamento SMS
    };
    
    console.log('✅ Lead processado:', processedLead);
    
    // AQUI: Integrar com seu sistema de SMS
    // Exemplo: await smsService.addToSchedule(processedLead);
    
    res.json({
      success: true,
      message: 'Lead recebido com sucesso',
      leadId: Date.now(),
      processed: processedLead
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Endpoint para sincronização em lote
app.post('/api/leads/bulk', async (req, res) => {
  try {
    const { leads, source } = req.body;
    console.log(`📦 Sincronização em lote: ${leads.length} leads de ${source}`);
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de leads vazia ou inválida'
      });
    }
    
    let processedCount = 0;
    const results = [];
    
    for (const leadPhone of leads) {
      try {
        // Normalizar telefone
        let normalizedPhone = leadPhone.replace(/\D/g, '');
        if (normalizedPhone.length === 11 && normalizedPhone.startsWith('9')) {
          normalizedPhone = '55' + normalizedPhone;
        }
        
        const leadData = {
          phone: normalizedPhone,
          source: source || 'rocketzap-bulk',
          timestamp: Date.now(),
          status: 'pending'
        };
        
        // AQUI: Integrar com sistema SMS
        // await smsService.addToSchedule(leadData);
        
        results.push({ phone: normalizedPhone, status: 'processed' });
        processedCount++;
        
      } catch (error) {
        results.push({ phone: leadPhone, status: 'error', error: error.message });
      }
    }
    
    console.log(`✅ Processados ${processedCount}/${leads.length} leads`);
    
    res.json({
      success: true,
      message: `${processedCount} leads sincronizados com sucesso`,
      processed: processedCount,
      total: leads.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização',
      error: error.message
    });
  }
});

// Endpoint para estatísticas
app.get('/api/leads/stats', async (req, res) => {
  try {
    // AQUI: Buscar estatísticas reais do seu banco de dados
    // const stats = await db.getLeadStats();
    
    // Mock temporário - substituir por dados reais
    const mockStats = {
      totalLeads: 0,
      todayLeads: 0,
      thisWeekLeads: 0,
      thisMonthLeads: 0,
      bySource: {
        rocketzap: 0,
        manual: 0,
        import: 0
      },
      lastUpdate: new Date().toISOString()
    };
    
    res.json(mockStats);
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

// Endpoint para verificar status da API
app.get('/api/leads/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      post_leads: '/api/leads',
      post_bulk: '/api/leads/bulk',
      get_stats: '/api/leads/stats',
      get_health: '/api/leads/health'
    }
  });
});

// Endpoint para listar leads processados (admin)
app.get('/api/leads/list', async (req, res) => {
  try {
    const { page = 1, limit = 50, source } = req.query;
    
    // AQUI: Buscar leads do banco de dados
    // const leads = await db.getLeads({ page, limit, source });
    
    // Mock temporário
    const mockLeads = [];
    
    res.json({
      success: true,
      leads: mockLeads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar leads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar leads',
      error: error.message
    });
  }
});

console.log('✅ APIs da extensão RocketZap configuradas');
console.log('📋 Endpoints disponíveis:');
console.log('   POST /api/leads - Receber lead individual');
console.log('   POST /api/leads/bulk - Sincronização em lote');
console.log('   GET  /api/leads/stats - Estatísticas');
console.log('   GET  /api/leads/health - Status da API');
console.log('   GET  /api/leads/list - Listar leads (admin)');