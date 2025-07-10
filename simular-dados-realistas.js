/**
 * SIMULAÇÃO DE DADOS REALISTAS - ANALYTICS COMPLETO
 * Cria quizzes com estruturas diferentes e simula leads variados
 */

async function makeRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    return response.accessToken;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    throw error;
  }
}

async function criarQuizzesVariados(token) {
  console.log('🎯 CRIANDO QUIZZES COM ESTRUTURAS DIFERENTES:');
  
  const quizzes = [
    {
      title: "Quiz Lead Magnet - 3 Páginas",
      description: "Quiz curto para captura rápida de leads",
      structure: {
        pages: [
          {
            id: 1,
            title: "Qual seu objetivo principal?",
            elements: [
              {
                id: 1,
                type: "multiple_choice",
                properties: {
                  text: "Qual seu principal objetivo?",
                  options: ["Perder peso", "Ganhar massa", "Definir músculos", "Melhorar saúde"],
                  fieldId: "objetivo_principal"
                }
              }
            ]
          },
          {
            id: 2,
            title: "Dados de Contato",
            elements: [
              {
                id: 2,
                type: "text",
                properties: {
                  text: "Seu nome completo",
                  fieldId: "nome_completo",
                  required: true
                }
              },
              {
                id: 3,
                type: "email",
                properties: {
                  text: "Seu melhor email",
                  fieldId: "email_contato",
                  required: true
                }
              }
            ]
          },
          {
            id: 3,
            title: "Resultado Personalizado",
            elements: [
              {
                id: 4,
                type: "paragraph",
                properties: {
                  text: "Obrigado! Seu plano personalizado será enviado por email em 24h."
                }
              }
            ]
          }
        ],
        settings: {
          theme: "vendzz",
          showProgressBar: true
        }
      }
    },
    {
      title: "Quiz Fitness Completo - 7 Páginas",
      description: "Quiz detalhado para segmentação avançada",
      structure: {
        pages: [
          {
            id: 1,
            title: "Perfil Básico",
            elements: [
              {
                id: 1,
                type: "multiple_choice",
                properties: {
                  text: "Qual sua faixa etária?",
                  options: ["18-25", "26-35", "36-45", "46-55", "55+"],
                  fieldId: "faixa_etaria"
                }
              }
            ]
          },
          {
            id: 2,
            title: "Dados Físicos",
            elements: [
              {
                id: 2,
                type: "height",
                properties: {
                  text: "Sua altura",
                  fieldId: "altura_atual",
                  required: true
                }
              },
              {
                id: 3,
                type: "current_weight",
                properties: {
                  text: "Peso atual",
                  fieldId: "peso_atual",
                  required: true
                }
              }
            ]
          },
          {
            id: 3,
            title: "Objetivos",
            elements: [
              {
                id: 4,
                type: "target_weight",
                properties: {
                  text: "Peso objetivo",
                  fieldId: "peso_objetivo"
                }
              }
            ]
          },
          {
            id: 4,
            title: "Experiência",
            elements: [
              {
                id: 5,
                type: "multiple_choice",
                properties: {
                  text: "Há quanto tempo treina?",
                  options: ["Nunca treinei", "Menos de 1 ano", "1-3 anos", "3-5 anos", "Mais de 5 anos"],
                  fieldId: "experiencia_treino"
                }
              }
            ]
          },
          {
            id: 5,
            title: "Disponibilidade",
            elements: [
              {
                id: 6,
                type: "multiple_choice",
                properties: {
                  text: "Quantos dias pode treinar por semana?",
                  options: ["1-2 dias", "3-4 dias", "5-6 dias", "Todos os dias"],
                  fieldId: "dias_treino"
                }
              }
            ]
          },
          {
            id: 6,
            title: "Contato",
            elements: [
              {
                id: 7,
                type: "text",
                properties: {
                  text: "Nome completo",
                  fieldId: "nome_completo",
                  required: true
                }
              },
              {
                id: 8,
                type: "email",
                properties: {
                  text: "Email para receber o plano",
                  fieldId: "email_contato",
                  required: true
                }
              },
              {
                id: 9,
                type: "text",
                properties: {
                  text: "WhatsApp (opcional)",
                  fieldId: "telefone_whatsapp"
                }
              }
            ]
          },
          {
            id: 7,
            title: "Plano Personalizado",
            elements: [
              {
                id: 10,
                type: "paragraph",
                properties: {
                  text: "Parabéns! Seu plano fitness personalizado está sendo preparado com base nas suas respostas. Você receberá por email em até 2 horas."
                }
              }
            ]
          }
        ],
        settings: {
          theme: "vendzz",
          showProgressBar: true
        }
      }
    },
    {
      title: "Quiz Rápido - 2 Páginas",
      description: "Quiz super rápido para alta conversão",
      structure: {
        pages: [
          {
            id: 1,
            title: "Pergunta Única",
            elements: [
              {
                id: 1,
                type: "multiple_choice",
                properties: {
                  text: "Qual sua maior dificuldade hoje?",
                  options: ["Falta de tempo", "Falta de motivação", "Não sei por onde começar", "Falta de resultados"],
                  fieldId: "maior_dificuldade"
                }
              },
              {
                id: 2,
                type: "email",
                properties: {
                  text: "Email para receber a solução",
                  fieldId: "email_solucao",
                  required: true
                }
              }
            ]
          },
          {
            id: 2,
            title: "Solução Enviada",
            elements: [
              {
                id: 3,
                type: "paragraph",
                properties: {
                  text: "Perfeito! A solução para sua dificuldade foi enviada para seu email. Verifique sua caixa de entrada!"
                }
              }
            ]
          }
        ],
        settings: {
          theme: "vendzz",
          showProgressBar: true
        }
      }
    },
    {
      title: "Quiz Segmentação Avançada - 5 Páginas",
      description: "Quiz para remarketing detalhado",
      structure: {
        pages: [
          {
            id: 1,
            title: "Perfil Demográfico",
            elements: [
              {
                id: 1,
                type: "multiple_choice",
                properties: {
                  text: "Sua renda mensal familiar",
                  options: ["Até R$ 3.000", "R$ 3.001 a R$ 8.000", "R$ 8.001 a R$ 15.000", "Acima de R$ 15.000"],
                  fieldId: "renda_familiar"
                }
              }
            ]
          },
          {
            id: 2,
            title: "Comportamento",
            elements: [
              {
                id: 2,
                type: "multiple_choice",
                properties: {
                  text: "Como prefere consumir conteúdo?",
                  options: ["Vídeos curtos", "Artigos detalhados", "Podcasts", "Lives/Webinars"],
                  fieldId: "preferencia_conteudo"
                }
              }
            ]
          },
          {
            id: 3,
            title: "Momento de Compra",
            elements: [
              {
                id: 3,
                type: "multiple_choice",
                properties: {
                  text: "Quando planeja investir em uma solução?",
                  options: ["Imediatamente", "Próximas 2 semanas", "Próximo mês", "Ainda estou pesquisando"],
                  fieldId: "momento_compra"
                }
              }
            ]
          },
          {
            id: 4,
            title: "Contato",
            elements: [
              {
                id: 4,
                type: "text",
                properties: {
                  text: "Nome",
                  fieldId: "nome_lead",
                  required: true
                }
              },
              {
                id: 5,
                type: "email",
                properties: {
                  text: "Email",
                  fieldId: "email_lead",
                  required: true
                }
              },
              {
                id: 6,
                type: "text",
                properties: {
                  text: "Telefone",
                  fieldId: "telefone_lead"
                }
              }
            ]
          },
          {
            id: 5,
            title: "Obrigado",
            elements: [
              {
                id: 7,
                type: "paragraph",
                properties: {
                  text: "Obrigado pelas respostas! Nossa equipe entrará em contato em breve com uma proposta personalizada."
                }
              }
            ]
          }
        ],
        settings: {
          theme: "vendzz",
          showProgressBar: true
        }
      }
    }
  ];

  const quizIds = [];
  
  for (let i = 0; i < quizzes.length; i++) {
    const quiz = quizzes[i];
    console.log(`   📝 Criando: ${quiz.title}`);
    
    try {
      const newQuiz = await makeRequest('/api/quizzes', {
        method: 'POST',
        token,
        body: JSON.stringify(quiz)
      });
      
      // Publicar o quiz
      await makeRequest(`/api/quizzes/${newQuiz.id}/publish`, {
        method: 'POST',
        token
      });
      
      quizIds.push(newQuiz.id);
      console.log(`   ✅ Quiz criado e publicado: ${newQuiz.id} (${quiz.structure.pages.length} páginas)`);
    } catch (error) {
      console.log(`   ❌ Erro ao criar quiz: ${error.message}`);
    }
  }
  
  return quizIds;
}

async function simularViews(quizIds, token) {
  console.log('\n📊 SIMULANDO VIEWS REALISTAS:');
  
  const viewsDistribution = [
    { quizId: quizIds[0], views: 45 }, // Quiz 3 páginas - alta conversão
    { quizId: quizIds[1], views: 32 }, // Quiz 7 páginas - conversão média
    { quizId: quizIds[2], views: 78 }, // Quiz 2 páginas - muitas views
    { quizId: quizIds[3], views: 23 }  // Quiz 5 páginas - segmentação
  ];
  
  for (const item of viewsDistribution) {
    if (!item.quizId) continue;
    
    console.log(`   👀 Simulando ${item.views} views para quiz ${item.quizId}`);
    
    for (let i = 0; i < item.views; i++) {
      try {
        await makeRequest(`/api/analytics/${item.quizId}/view`, {
          method: 'POST',
          token
        });
      } catch (error) {
        // Continuar mesmo se houver erro
      }
    }
  }
}

async function simularRespostas(quizIds, token) {
  console.log('\n👥 SIMULANDO RESPOSTAS COM DIFERENTES CENÁRIOS:');
  
  const nomesBrasileiros = [
    "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
    "Juliana Lima", "Rafael Pereira", "Camila Rodrigues", "Bruno Almeida", "Fernanda Martins",
    "Lucas Ferreira", "Gabriela Nascimento", "Mateus Ribeiro", "Larissa Carvalho", "Diego Barbosa",
    "Mariana Araújo", "Gustavo Mendes", "Beatriz Gomes", "Felipe Rocha", "Amanda Silva"
  ];
  
  const emailsDomains = ["@gmail.com", "@hotmail.com", "@yahoo.com.br", "@outlook.com", "@uol.com.br"];
  const telefones = ["11987654321", "21976543210", "31965432109", "47954321098", "85943210987"];
  
  // Quiz 1 (3 páginas) - Alta conversão: 15 completos de 45 views = 33%
  console.log('   📝 Quiz 3 páginas (alta conversão):');
  for (let i = 0; i < 18; i++) {
    const nome = nomesBrasileiros[i % nomesBrasileiros.length];
    const email = nome.toLowerCase().replace(" ", ".") + emailsDomains[i % emailsDomains.length];
    const isCompleto = i < 15; // 15 completos de 18 respostas
    
    const tempoResposta = Math.floor(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)); // Últimos 7 dias
    
    try {
      await makeRequest('/api/quiz-responses', {
        method: 'POST',
        token,
        body: JSON.stringify({
          quizId: quizIds[0],
          responses: [
            {
              elementId: 1,
              elementFieldId: "objetivo_principal",
              answer: ["Perder peso", "Ganhar massa", "Definir músculos"][i % 3]
            },
            {
              elementId: 2,
              elementFieldId: "nome_completo",
              answer: nome
            },
            {
              elementId: 3,
              elementFieldId: "email_contato",
              answer: email
            }
          ],
          metadata: {
            isComplete: isCompleto,
            isPartial: !isCompleto,
            completionPercentage: isCompleto ? 100 : 67,
            submittedAt: new Date(tempoResposta).toISOString(),
            responseTime: Math.floor(120 + Math.random() * 180) // 2-5 minutos
          }
        })
      });
    } catch (error) {
      console.log(`     ❌ Erro na resposta ${i}: ${error.message}`);
    }
  }
  
  // Quiz 2 (7 páginas) - Conversão média: 8 completos de 32 views = 25%
  console.log('   📝 Quiz 7 páginas (conversão média):');
  for (let i = 0; i < 12; i++) {
    const nome = nomesBrasileiros[(i + 5) % nomesBrasileiros.length];
    const email = nome.toLowerCase().replace(" ", ".") + emailsDomains[i % emailsDomains.length];
    const telefone = telefones[i % telefones.length];
    const isCompleto = i < 8; // 8 completos de 12 respostas
    
    const tempoResposta = Math.floor(Date.now() - (Math.random() * 14 * 24 * 60 * 60 * 1000)); // Últimos 14 dias
    
    try {
      await makeRequest('/api/quiz-responses', {
        method: 'POST',
        token,
        body: JSON.stringify({
          quizId: quizIds[1],
          responses: [
            {
              elementId: 1,
              elementFieldId: "faixa_etaria",
              answer: ["18-25", "26-35", "36-45"][i % 3]
            },
            {
              elementId: 2,
              elementFieldId: "altura_atual",
              answer: (165 + Math.random() * 20).toFixed(0)
            },
            {
              elementId: 3,
              elementFieldId: "peso_atual",
              answer: (60 + Math.random() * 40).toFixed(0)
            },
            {
              elementId: 7,
              elementFieldId: "nome_completo",
              answer: nome
            },
            {
              elementId: 8,
              elementFieldId: "email_contato",
              answer: email
            },
            {
              elementId: 9,
              elementFieldId: "telefone_whatsapp",
              answer: telefone
            }
          ],
          metadata: {
            isComplete: isCompleto,
            isPartial: !isCompleto,
            completionPercentage: isCompleto ? 100 : 57,
            submittedAt: new Date(tempoResposta).toISOString(),
            responseTime: Math.floor(480 + Math.random() * 720) // 8-20 minutos
          }
        })
      });
    } catch (error) {
      console.log(`     ❌ Erro na resposta ${i}: ${error.message}`);
    }
  }
  
  // Quiz 3 (2 páginas) - Altíssima conversão: 35 completos de 78 views = 45%
  console.log('   📝 Quiz 2 páginas (conversão alta):');
  for (let i = 0; i < 42; i++) {
    const nome = nomesBrasileiros[(i + 10) % nomesBrasileiros.length];
    const email = nome.toLowerCase().replace(" ", ".") + emailsDomains[i % emailsDomains.length];
    const isCompleto = i < 35; // 35 completos de 42 respostas
    
    const tempoResposta = Math.floor(Date.now() - (Math.random() * 3 * 24 * 60 * 60 * 1000)); // Últimos 3 dias
    
    try {
      await makeRequest('/api/quiz-responses', {
        method: 'POST',
        token,
        body: JSON.stringify({
          quizId: quizIds[2],
          responses: [
            {
              elementId: 1,
              elementFieldId: "maior_dificuldade",
              answer: ["Falta de tempo", "Falta de motivação", "Não sei por onde começar"][i % 3]
            },
            {
              elementId: 2,
              elementFieldId: "email_solucao",
              answer: email
            }
          ],
          metadata: {
            isComplete: isCompleto,
            isPartial: !isCompleto,
            completionPercentage: isCompleto ? 100 : 50,
            submittedAt: new Date(tempoResposta).toISOString(),
            responseTime: Math.floor(45 + Math.random() * 90) // 45s-2.5min
          }
        })
      });
    } catch (error) {
      console.log(`     ❌ Erro na resposta ${i}: ${error.message}`);
    }
  }
  
  // Quiz 4 (5 páginas) - Conversão baixa: 3 completos de 23 views = 13%
  console.log('   📝 Quiz 5 páginas (conversão baixa):');
  for (let i = 0; i < 8; i++) {
    const nome = nomesBrasileiros[(i + 15) % nomesBrasileiros.length];
    const email = nome.toLowerCase().replace(" ", ".") + emailsDomains[i % emailsDomains.length];
    const telefone = telefones[i % telefones.length];
    const isCompleto = i < 3; // 3 completos de 8 respostas
    
    const tempoResposta = Math.floor(Date.now() - (Math.random() * 21 * 24 * 60 * 60 * 1000)); // Últimos 21 dias
    
    try {
      await makeRequest('/api/quiz-responses', {
        method: 'POST',
        token,
        body: JSON.stringify({
          quizId: quizIds[3],
          responses: [
            {
              elementId: 1,
              elementFieldId: "renda_familiar",
              answer: ["Até R$ 3.000", "R$ 3.001 a R$ 8.000", "R$ 8.001 a R$ 15.000"][i % 3]
            },
            {
              elementId: 4,
              elementFieldId: "nome_lead",
              answer: nome
            },
            {
              elementId: 5,
              elementFieldId: "email_lead",
              answer: email
            },
            {
              elementId: 6,
              elementFieldId: "telefone_lead",
              answer: telefone
            }
          ],
          metadata: {
            isComplete: isCompleto,
            isPartial: !isCompleto,
            completionPercentage: isCompleto ? 100 : 60,
            submittedAt: new Date(tempoResposta).toISOString(),
            responseTime: Math.floor(600 + Math.random() * 900) // 10-25 minutos
          }
        })
      });
    } catch (error) {
      console.log(`     ❌ Erro na resposta ${i}: ${error.message}`);
    }
  }
}

async function exibirResultados(token) {
  console.log('\n📈 RESULTADOS FINAIS DA SIMULAÇÃO:');
  console.log('================================================================================');
  
  const analytics = await makeRequest('/api/analytics', { token });
  const dashboardStats = await makeRequest('/api/dashboard/stats', { token });
  
  console.log('📊 DASHBOARD GERAL:');
  console.log(`   • Total de Quizzes: ${dashboardStats.totalQuizzes}`);
  console.log(`   • Total de Leads: ${dashboardStats.totalLeads}`);
  console.log(`   • Total de Views: ${dashboardStats.totalViews}`);
  console.log(`   • Taxa Média: ${dashboardStats.avgConversionRate.toFixed(1)}%`);
  
  console.log('\n🎯 ANALYTICS POR QUIZ:');
  analytics.forEach((quiz, index) => {
    const pages = [3, 7, 2, 5][index] || '?';
    console.log(`\n   Quiz ${index + 1} - ${quiz.quizTitle} (${pages} páginas):`);
    console.log(`   📊 Views: ${quiz.totalViews}`);
    console.log(`   👥 Leads: ${quiz.leadsWithContact} (captaram contato)`);
    console.log(`   ✅ Conversões: ${quiz.completedResponses} (chegaram ao final)`);
    console.log(`   📈 Taxa: ${quiz.conversionRate}%`);
    console.log(`   ⏱️ Tempo médio: ${quiz.completedResponses > 0 ? 
      ['2-5 min', '8-20 min', '45s-2.5min', '10-25 min'][index] : 'N/A'}`);
  });
  
  console.log('\n💡 INSIGHTS SIMULADOS:');
  console.log('   • Quiz curto (2 páginas): 45% conversão - ideal para captura rápida');
  console.log('   • Quiz médio (3 páginas): 33% conversão - equilíbrio entre qualificação e conversão');
  console.log('   • Quiz longo (7 páginas): 25% conversão - leads mais qualificados');
  console.log('   • Quiz complexo (5 páginas): 13% conversão - segmentação avançada');
}

async function executarSimulacao() {
  console.log('🚀 INICIANDO SIMULAÇÃO COMPLETA DE DADOS REALISTAS');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticação realizada');
    
    // 2. Criar quizzes variados
    const quizIds = await criarQuizzesVariados(token);
    
    if (quizIds.length === 0) {
      console.log('❌ Nenhum quiz foi criado. Abortando simulação.');
      return;
    }
    
    // 3. Simular views
    await simularViews(quizIds, token);
    
    // 4. Simular respostas com diferentes cenários
    await simularRespostas(quizIds, token);
    
    // 5. Aguardar processamento
    console.log('\n⏳ Aguardando processamento dos dados...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Exibir resultados
    await exibirResultados(token);
    
    console.log('\n✅ SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('   Sistema agora possui dados realistas para demonstração');
    
  } catch (error) {
    console.error('❌ ERRO NA SIMULAÇÃO:', error.message);
  }
}

// Executar simulação
executarSimulacao().catch(console.error);