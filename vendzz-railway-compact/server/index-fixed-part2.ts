    const totalTime = Date.now() - startTime;
    
    // Log com mais detalhes de performance
    if (totalTime > 2000) { // Log apenas se demorar mais que 2s
      console.log(`⚡ DETECÇÃO CONCLUÍDA: ${totalTime}ms - Ciclo ${autoDetectionCount}/${MAX_DETECTION_CYCLES} (${Math.round((autoDetectionCount / MAX_DETECTION_CYCLES) * 100)}% utilização)`);
    }
    
    // Alerta se performance estiver degradada
    if (totalTime > 5000) { // Mais de 5 segundos
      console.log(`🚨 PERFORMANCE DEGRADADA: Detecção demorou ${totalTime}ms - Considere otimizar campanhas`);
    }
  };
  
  // Sistema de detecção automática OTIMIZADO para 100.000+ usuários
  let autoDetectionRunning = false;
  let autoDetectionCount = 0;
  const MAX_DETECTION_CYCLES = 100; // Limite de ciclos por hora
  
  const autoDetectionInterval = setInterval(async () => {
    if (!autoDetectionRunning && autoDetectionCount < MAX_DETECTION_CYCLES) {
      autoDetectionRunning = true;
      autoDetectionCount++;
      try {
        await autoDetectionSystem();
      } finally {
        autoDetectionRunning = false;
      }
    }
  }, 60000); // Aumentado para 1 minuto (menos agressivo)
  
  // Reset contador a cada hora
  setInterval(() => {
    autoDetectionCount = 0;
    console.log(`🔄 RESET CONTADOR DETECÇÃO AUTOMÁTICA - Reiniciando ciclo de ${MAX_DETECTION_CYCLES} execuções`);
  }, 3600000); // 1 hora
  
  // Monitor de performance avançado
  setInterval(() => {
    const stats = {
      ciclosExecutados: autoDetectionCount,
      ciclossMaximos: MAX_DETECTION_CYCLES,
      utilizacao: Math.round((autoDetectionCount / MAX_DETECTION_CYCLES) * 100),
      memoria: process.memoryUsage(),
      uptime: Math.round(process.uptime() / 60) // minutos
    };
    
    if (stats.utilizacao > 80) {
      console.log(`⚠️ ALTA UTILIZAÇÃO DETECÇÃO: ${stats.utilizacao}% (${stats.ciclosExecutados}/${stats.ciclossMaximos})`);
    }
    
    if (stats.memoria.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.log(`⚠️ ALTA UTILIZAÇÃO MEMÓRIA: ${Math.round(stats.memoria.heapUsed / 1024 / 1024)}MB`);
    }
  }, 300000); // A cada 5 minutos
  
  // Sistema de processamento de WhatsApp agendados
  const whatsappScheduledProcessor = async () => {
    try {
      const { storage } = await import('./storage-sqlite');
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Buscar logs WhatsApp agendados que devem ser enviados agora
      const scheduledLogs = await storage.getScheduledWhatsappLogs(currentTime);
      
      if (scheduledLogs.length > 0) {
        console.log(`📱 PROCESSANDO ${scheduledLogs.length} WhatsApp agendados`);
        
        for (const log of scheduledLogs) {
          try {
            // 🔒 VALIDAÇÃO DE CRÉDITOS WHATSAPP - ANTI-BURLA
            const creditValidation = await storage.validateCreditsForCampaign(log.user_id, 'whatsapp', 1);
            if (!creditValidation.valid) {
              console.log(`🚫 CRÉDITOS WHATSAPP INSUFICIENTES - Pausando mensagem ${log.id}`);
              await storage.updateWhatsappLogStatus(log.id, 'failed', undefined, `Créditos WhatsApp insuficientes. Atual: ${creditValidation.currentCredits}`);
              
              // Pausar campanhas automaticamente
              await storage.pauseCampaignsWithoutCredits(log.user_id);
              continue;
            }
            
            // Marcar como pronto para extensão
            await storage.updateWhatsappLogStatus(log.id, 'pending');
            console.log(`📤 WhatsApp ${log.phone} pronto para envio via extensão (${creditValidation.currentCredits} créditos restantes)`);
          } catch (error) {
            console.error(`❌ Erro ao processar WhatsApp ${log.phone}:`, error.message);
            await storage.updateWhatsappLogStatus(log.id, 'failed', undefined, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro no processamento WhatsApp agendados:', error);
    }
  };
  
  // Sistema de processamento WhatsApp REATIVADO com proteções
  let whatsappProcessingRunning = false;
  const whatsappInterval = setInterval(async () => {
    if (!whatsappProcessingRunning) {
      whatsappProcessingRunning = true;
      try {
        await whatsappScheduledProcessor();
      } finally {
        whatsappProcessingRunning = false;
      }
    }
  }, 60000); // A cada 1 minuto

  // Sistema de processamento de emails agendados
  const emailScheduledProcessor = async () => {
    try {
      console.log(`📧 PROCESSAMENTO DE EMAILS AGENDADOS - ${new Date().toLocaleTimeString()}`);
      
      const processedEmails = await emailService.processScheduledEmails();
      
      if (processedEmails > 0) {
        console.log(`✅ ${processedEmails} emails processados com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro no processamento de emails agendados:', error);
    }
  };

  // Sistema de processamento Email REATIVADO com proteções
  let emailProcessingRunning = false;
  const emailInterval = setInterval(async () => {
    if (!emailProcessingRunning) {
      emailProcessingRunning = true;
      try {
        await emailScheduledProcessor();
      } finally {
        emailProcessingRunning = false;
      }
    }
  }, 60000); // A cada 1 minuto

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();