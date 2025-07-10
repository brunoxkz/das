// ==================== I.A. CONVERSION + ENDPOINTS ====================

// Listar campanhas I.A. Conversion
app.get("/api/ai-conversion-campaigns", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = await storage.getAiConversionCampaigns(userId);
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching AI conversion campaigns:", error);
    res.status(500).json({ error: "Erro ao buscar campanhas I.A. Conversion" });
  }
});

// Criar campanha I.A. Conversion
app.post("/api/ai-conversion-campaigns", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      quizId, 
      quizTitle, 
      scriptTemplate, 
      heygenAvatar, 
      heygenVoice 
    } = req.body;

    // Validar dados obrigatórios
    if (!name || !quizId || !scriptTemplate || !heygenAvatar || !heygenVoice) {
      return res.status(400).json({ 
        error: "Nome, quiz, template do script, avatar e voz são obrigatórios" 
      });
    }

    // Verificar se o quiz pertence ao usuário
    const quiz = await storage.getQuiz(quizId);
    if (!quiz || quiz.userId !== userId) {
      return res.status(404).json({ error: "Quiz não encontrado ou sem permissão" });
    }

    const campaignId = nanoid();
    const campaign = await storage.createAiConversionCampaign({
      id: campaignId,
      userId,
      name,
      quizId,
      quizTitle: quizTitle || quiz.title,
      scriptTemplate,
      heygenAvatar,
      heygenVoice,
      isActive: true,
      totalGenerated: 0,
      totalViews: 0,
      totalConversions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json(campaign);
  } catch (error) {
    console.error("Error creating AI conversion campaign:", error);
    res.status(500).json({ error: "Erro ao criar campanha I.A. Conversion" });
  }
});

// Atualizar campanha I.A. Conversion
app.put("/api/ai-conversion-campaigns/:id", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const campaign = await storage.getAiConversionCampaign(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
    }

    const updates = req.body;
    const updatedCampaign = await storage.updateAiConversionCampaign(id, updates);
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating AI conversion campaign:", error);
    res.status(500).json({ error: "Erro ao atualizar campanha I.A. Conversion" });
  }
});

// Deletar campanha I.A. Conversion
app.delete("/api/ai-conversion-campaigns/:id", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const campaign = await storage.getAiConversionCampaign(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
    }

    await storage.deleteAiConversionCampaign(id);
    res.json({ message: "Campanha deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting AI conversion campaign:", error);
    res.status(500).json({ error: "Erro ao deletar campanha I.A. Conversion" });
  }
});

// Gerar vídeo I.A. personalizado
app.post("/api/ai-conversion-campaigns/:id/generate-video", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { responseId } = req.body;
    
    const campaign = await storage.getAiConversionCampaign(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
    }

    // Buscar resposta do quiz
    const response = await storage.getQuizResponse(responseId);
    if (!response || response.quizId !== campaign.quizId) {
      return res.status(404).json({ error: "Resposta do quiz não encontrada" });
    }

    // Extrair variáveis da resposta
    const variables = extractVariablesFromResponse(response);
    
    // Personalizar script com variáveis
    let personalizedScript = campaign.scriptTemplate;
    Object.entries(variables).forEach(([key, value]) => {
      personalizedScript = personalizedScript.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    // Criar geração de vídeo
    const generationId = nanoid();
    const videoGeneration = await storage.createAiVideoGeneration({
      id: generationId,
      campaignId: id,
      responseId,
      script: personalizedScript,
      variables: JSON.stringify(variables),
      heygenAvatar: campaign.heygenAvatar,
      heygenVoice: campaign.heygenVoice,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Aqui seria feita a chamada para HeyGen API
    // Por enquanto, simulamos o processo
    
    res.json({
      videoGeneration,
      message: "Vídeo em processo de geração"
    });
  } catch (error) {
    console.error("Error generating AI video:", error);
    res.status(500).json({ error: "Erro ao gerar vídeo I.A." });
  }
});

// Listar gerações de vídeo
app.get("/api/ai-conversion-campaigns/:id/video-generations", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const campaign = await storage.getAiConversionCampaign(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
    }

    const videoGenerations = await storage.getAiVideoGenerations(id);
    res.json(videoGenerations);
  } catch (error) {
    console.error("Error fetching AI video generations:", error);
    res.status(500).json({ error: "Erro ao buscar gerações de vídeo" });
  }
});

// Obter estatísticas da campanha I.A. Conversion
app.get("/api/ai-conversion-campaigns/:id/stats", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const campaign = await storage.getAiConversionCampaign(id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
    }

    const stats = {
      totalGenerated: campaign.totalGenerated,
      totalViews: campaign.totalViews,
      totalConversions: campaign.totalConversions,
      conversionRate: campaign.totalViews > 0 ? (campaign.totalConversions / campaign.totalViews * 100).toFixed(2) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching AI conversion stats:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas da campanha" });
  }
});

console.log('✅ I.A. CONVERSION + ENDPOINTS REGISTRADOS');