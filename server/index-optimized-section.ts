  // Sistema de detecção automática ULTRA-OTIMIZADO para 100.000+ usuários
  const autoDetectionSystem = async () => {
    const startTime = Date.now();
    console.log(`🔍 DETECÇÃO AUTOMÁTICA - ${new Date().toLocaleTimeString()} (Ciclo ${autoDetectionCount}/${MAX_DETECTION_CYCLES})`);
    
    try {
      const { storage } = await import('./storage-sqlite');
      
      // OTIMIZAÇÃO 1: Buscar campanhas com LIMITE para evitar sobrecarga
      const MAX_CAMPAIGNS_PER_CYCLE = 25; // Máximo 25 campanhas por ciclo
      
      const smsCampaigns = await storage.getAllSMSCampaigns();
      const whatsappCampaigns = await storage.getAllWhatsappCampaigns();
      const emailCampaigns = await storage.getAllEmailCampaigns();
      
      // Aplicar limite de campanhas por ciclo
      const limitedSMS = smsCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
      const limitedWhatsapp = whatsappCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
      const limitedEmail = emailCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
      
      console.log(`📊 CAMPANHAS: ${limitedSMS.length}/${smsCampaigns.length} SMS, ${limitedWhatsapp.length}/${whatsappCampaigns.length} WhatsApp, ${limitedEmail.length}/${emailCampaigns.length} Email`);
      
      // OTIMIZAÇÃO 2: Processamento em lotes com delay para evitar sobrecarga
      const BATCH_SIZE = 3; // Processar 3 campanhas por vez
      const BATCH_DELAY = 200; // 200ms entre lotes
      
      // Processar campanhas SMS ativas em lotes
      for (let i = 0; i < limitedSMS.length; i += BATCH_SIZE) {
        const batch = limitedSMS.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (campaign) => {
          if (campaign.status === 'draft' && campaign.scheduledAt) {
            console.log(`✅ PROCESSANDO SMS: "${campaign.name}" - Quiz: ${campaign.quizId}`);
            
            const responses = await storage.getQuizResponses(campaign.quizId);
            const logs = await storage.getSMSLogs(campaign.id);
            
            // Mapear telefones já processados com seus timestamps
            const processedPhones = new Map();
            logs.forEach(log => {
              const phone = log.phone;
              const logTime = new Date(log.createdAt).getTime();
              
              if (!processedPhones.has(phone) || logTime > processedPhones.get(phone).time) {
                processedPhones.set(phone, {
                  time: logTime,
                  status: log.status
                });
              }
            });
            
            // Verificar apenas telefones que ainda não foram processados
            const phoneResponseTimes = new Map();
            
            // Mapear tempo de resposta mais recente para cada telefone
            for (const response of responses) {
              const responseArray = Array.isArray(response.responses) ? response.responses : JSON.parse(response.responses || '[]');
              const responseTime = new Date(response.submittedAt || response.createdAt).getTime();
              
              for (const resp of responseArray) {
                if (resp.elementType === 'phone' && resp.answer && resp.answer.length >= 10) {
                  const phone = resp.answer;
                  const currentTime = phoneResponseTimes.get(phone) || 0;
                  if (responseTime > currentTime) {
                    phoneResponseTimes.set(phone, responseTime);
                  }
                }
              }
            }
            
            // Processar apenas telefones que atendem aos critérios
            for (const [phone, responseTime] of phoneResponseTimes) {
              const processed = processedPhones.get(phone);
              
              if (!processed) {
                // Telefone completamente novo - criar apenas um log
                console.log(`🆕 NOVO TELEFONE DETECTADO: ${phone} - AGENDANDO...`);
                
                await storage.createSMSLog({
                  id: crypto.randomUUID(),
                  campaignId: campaign.id,
                  phone,
                  message: campaign.message,
                  status: 'scheduled',
                  scheduledAt: Math.floor(Date.now() / 1000) + (campaign.triggerDelay * 60)
                });
                
                console.log(`✅ TELEFONE ${phone} AGENDADO COM SUCESSO`);
              } else {
                // Telefone já processado - NÃO reagendar automaticamente
                console.log(`⏭️ TELEFONE ${phone} JÁ PROCESSADO - status: ${processed.status}, não reagendar automaticamente`);
              }
            }
          }
        }));
        
        // Delay entre lotes para evitar sobrecarga
        if (i + BATCH_SIZE < limitedSMS.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
      
      // Processar campanhas WhatsApp ativas em lotes
      for (let i = 0; i < limitedWhatsapp.length; i += BATCH_SIZE) {
        const batch = limitedWhatsapp.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (campaign) => {
          const campaignStartTime = Date.now();
          
          try {
            // Verificar se quizId é válido antes de continuar
            if (!campaign.quizId || campaign.quizId === 'NULL' || campaign.quizId === 'undefined' || campaign.quizId === null) {
              console.log(`⚠️ CAMPANHA ${campaign.name}: quiz_id inválido (${campaign.quizId}), pulando detecção automática`);
              return; // Retornar da função map
            }
            
            // Buscar dados necessários em paralelo
            const [currentPhones, existingLogs] = await Promise.all([
              storage.getQuizPhoneNumbers(campaign.quizId),
              storage.getWhatsappLogs(campaign.id)
            ]);
            
            // Criar mapa de telefones já processados para busca O(1)
            const processedPhones = new Map();
            existingLogs.forEach(log => {
              processedPhones.set(log.phone, {
                status: log.status,
                createdAt: log.created_at
              });
            });
            
            // Aplicar filtros da campanha
            let eligiblePhones = currentPhones;
            
            // Filtro de data
            if (campaign.date_filter) {
              const filterDate = new Date(campaign.date_filter);
              eligiblePhones = eligiblePhones.filter(p => 
                new Date(p.submittedAt || p.created_at) >= filterDate
              );
            }
            
            // Filtro de audiência
            if (campaign.target_audience === 'completed') {
              eligiblePhones = eligiblePhones.filter(p => 
                p.status === 'completed'
              );
            } else if (campaign.target_audience === 'abandoned') {
              eligiblePhones = eligiblePhones.filter(p => 
                p.status === 'abandoned'
              );
            }
            
            // Encontrar novos leads
            const newLeads = [];
            for (const phone of eligiblePhones) {
              const phoneNumber = phone.phone || phone.telefone || phone.number;
              if (!phoneNumber || phoneNumber.length < 10) continue;
              
              if (!processedPhones.has(phoneNumber)) {
                newLeads.push({
                  phone: phoneNumber,
                  status: phone.status,
                  submittedAt: phone.submittedAt || phone.created_at
                });
              }
            }
            
            if (newLeads.length > 0) {
              console.log(`🆕 WHATSAPP "${campaign.name}": ${newLeads.length} novos leads detectados`);
              
              // Calcular delay baseado na configuração da campanha
              const baseDelay = campaign.trigger_delay || 10; // minutos
              const delaySeconds = baseDelay * 60;
              
              // Preparar logs em lote para inserção
              const logsToCreate = [];
              const messages = campaign.messages || [];
              
              for (let i = 0; i < newLeads.length; i++) {
                const lead = newLeads[i];
                
                // Selecionar mensagem rotativa
                const selectedMessage = messages[i % messages.length] || messages[0];
                
                // Aplicar delay configurado + distribuição (evitar sobrecarga)
                const distributionDelay = Math.floor(Math.random() * 300); // 0-5 min distribuição
                const scheduledAt = Math.floor(Date.now() / 1000) + delaySeconds + distributionDelay;
                
                logsToCreate.push({
                  id: crypto.randomUUID(),
                  campaignId: campaign.id,
                  phone: lead.phone,
                  message: selectedMessage,
                  status: 'scheduled',
                  scheduledAt: scheduledAt,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
              
              // Inserir todos os logs em lote (performance)
              for (const logData of logsToCreate) {
                await storage.createWhatsappLog(logData);
              }
              
              // Atualizar lista de telefones da campanha
              await storage.updateWhatsappCampaign(campaign.id, {
                phones: eligiblePhones,
                updatedAt: new Date()
              });
              
              const campaignTime = Date.now() - campaignStartTime;
              console.log(`✅ WHATSAPP "${campaign.name}": ${newLeads.length} leads agendados (${campaignTime}ms)`);
            }
            
          } catch (error) {
            console.error(`❌ ERRO campanha WhatsApp "${campaign.name}":`, error.message);
          }
        }));
        
        // Delay entre lotes
        if (i + BATCH_SIZE < limitedWhatsapp.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
      
      // Processar campanhas Email ativas em lotes
      for (let i = 0; i < limitedEmail.length; i += BATCH_SIZE) {
        const batch = limitedEmail.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (campaign) => {
          if (campaign.status === 'active') {
            try {
              const campaignStartTime = Date.now();
              console.log(`📧 PROCESSANDO EMAIL: "${campaign.name}" - Quiz: ${campaign.quizId}`);
              
              // Buscar respostas do quiz e logs existentes em paralelo
              const [responses, existingLogs] = await Promise.all([
                storage.getQuizResponsesForEmails(campaign.quizId),
                storage.getEmailLogsByCampaign(campaign.id)
              ]);
              
              // Criar mapa de emails já processados
              const processedEmails = new Map();
              existingLogs.forEach(log => {
                processedEmails.set(log.email, {
                  status: log.status,
                  createdAt: log.createdAt
                });
              });
              
              // Aplicar filtros da campanha
              let eligibleLeads = responses;
              
              // Filtro de audiência
              if (campaign.targetAudience === 'completed') {
                eligibleLeads = eligibleLeads.filter(lead => 
                  lead.metadata?.isComplete === true || 
                  lead.metadata?.completionPercentage === 100
                );
              } else if (campaign.targetAudience === 'abandoned') {
                eligibleLeads = eligibleLeads.filter(lead => 
                  lead.metadata?.isComplete === false && 
                  lead.metadata?.isPartial !== true
                );
              }
              
              // Extrair emails dos leads elegíveis
              const emailsWithData = [];
              for (const lead of eligibleLeads) {
                const responseArray = Array.isArray(lead.responses) ? lead.responses : JSON.parse(lead.responses || '[]');
                
                for (const resp of responseArray) {
                  if (resp.elementType === 'email' && resp.answer && !processedEmails.has(resp.answer)) {
                    emailsWithData.push({
                      email: resp.answer,
                      leadData: lead,
                      submittedAt: lead.submittedAt
                    });
                  }
                }
              }
              
              if (emailsWithData.length > 0) {
                console.log(`🆕 EMAIL "${campaign.name}": ${emailsWithData.length} novos leads detectados`);
                
                for (const emailData of emailsWithData) {
                  try {
                    // Criar log do email
                    await storage.createEmailLog({
                      id: crypto.randomUUID(),
                      campaignId: campaign.id,
                      email: emailData.email,
                      subject: campaign.subject,
                      message: campaign.message,
                      status: 'scheduled',
                      scheduledAt: Math.floor(Date.now() / 1000) + (campaign.triggerDelay * 60),
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                    
                    // Atualizar status do log
                    await storage.updateEmailLogStatus(
                      emailData.email,
                      campaign.id,
                      'sent'
                    );
                    
                    console.log(`📧 EMAIL agendado para ${emailData.email}`);
                  } catch (error) {
                    console.error(`❌ Erro ao agendar email para ${emailData.email}:`, error.message);
                  }
                }
              }
              
              const campaignTime = Date.now() - campaignStartTime;
              console.log(`✅ EMAIL "${campaign.name}": ${emailsWithData.length} leads processados (${campaignTime}ms)`);
              
            } catch (error) {
              console.error(`❌ ERRO campanha EMAIL "${campaign.name}":`, error.message);
            }
          }
        }));
        
        // Delay entre lotes
        if (i + BATCH_SIZE < limitedEmail.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
      
    } catch (error) {
      console.error('❌ ERRO NA DETECÇÃO AUTOMÁTICA:', error);
    }
    
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