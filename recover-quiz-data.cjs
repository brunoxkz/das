/**
 * SCRIPT DE RECUPERAÇÃO DE DADOS DE QUIZ
 * Cria quizzes de exemplo para substituir os dados perdidos
 */

const Database = require('better-sqlite3');

// Função simples para gerar IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function recoverQuizData() {
  const db = new Database('db.sqlite');
  
  try {
    console.log('🔄 Iniciando recuperação de dados...');
    
    // Primeiro, vamos criar um usuário admin
    const adminId = '1EaY6vE0rYAkTXv5vHClm'; // Mesmo ID que estava sendo usado
    const adminEmail = 'admin@vendzz.com';
    
    // Criar usuário admin
    const insertUserSQL = `
      INSERT OR REPLACE INTO users (
        id, email, password, firstName, lastName, plan, role, 
        smsCredits, emailCredits, whatsappCredits, aiCredits,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const hashedPassword = '$2b$10$EixZxYVK.fsbw1l6Z1wyMemM2pP2OUwgL.CqaZNq/FGILTyWrgtSe'; // admin123
    
    db.prepare(insertUserSQL).run(
      adminId,
      adminEmail,
      hashedPassword,
      'Admin',
      'Vendzz',
      'enterprise',
      'admin',
      1500,
      1500,
      1500,
      1500,
      Date.now(),
      Date.now()
    );
    
    console.log('✅ Usuário admin criado');
    
    // Criar quizzes de exemplo baseados nos que estavam funcionando
    const quizzes = [
      {
        id: 'Fwu7L-y0L7eS8xA5sZQmq',
        title: 'Quiz de Teste Principal',
        description: 'Quiz principal para testes do sistema',
        structure: JSON.stringify({
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'el1',
                  type: 'heading',
                  properties: {
                    text: 'Bem-vindo ao Quiz de Teste',
                    level: 1
                  }
                },
                {
                  id: 'el2',
                  type: 'text',
                  properties: {
                    fieldId: 'nome_completo',
                    placeholder: 'Digite seu nome completo',
                    required: true
                  }
                },
                {
                  id: 'el3',
                  type: 'phone',
                  properties: {
                    fieldId: 'telefone_contato',
                    placeholder: 'Digite seu telefone',
                    required: true
                  }
                },
                {
                  id: 'el4',
                  type: 'email',
                  properties: {
                    fieldId: 'email_contato',
                    placeholder: 'Digite seu email',
                    required: true
                  }
                }
              ]
            }
          ]
        })
      },
      {
        id: generateId(),
        title: 'Quiz de Emagrecimento',
        description: 'Quiz para captura de leads interessados em emagrecimento',
        structure: JSON.stringify({
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'el1',
                  type: 'heading',
                  properties: {
                    text: 'Descubra seu Plano de Emagrecimento',
                    level: 1
                  }
                },
                {
                  id: 'el2',
                  type: 'multiple_choice',
                  properties: {
                    fieldId: 'faixa_etaria',
                    question: 'Qual sua faixa etária?',
                    options: [
                      { text: '18-25 anos', value: '18-25' },
                      { text: '26-35 anos', value: '26-35' },
                      { text: '36-45 anos', value: '36-45' },
                      { text: '46+ anos', value: '46+' }
                    ],
                    required: true
                  }
                },
                {
                  id: 'el3',
                  type: 'current_weight',
                  properties: {
                    fieldId: 'peso_atual',
                    placeholder: 'Peso atual em kg',
                    required: true
                  }
                },
                {
                  id: 'el4',
                  type: 'target_weight',
                  properties: {
                    fieldId: 'peso_desejado',
                    placeholder: 'Peso desejado em kg',
                    required: true
                  }
                },
                {
                  id: 'el5',
                  type: 'text',
                  properties: {
                    fieldId: 'nome_completo',
                    placeholder: 'Nome completo',
                    required: true
                  }
                },
                {
                  id: 'el6',
                  type: 'phone',
                  properties: {
                    fieldId: 'telefone_contato',
                    placeholder: 'WhatsApp',
                    required: true
                  }
                },
                {
                  id: 'el7',
                  type: 'email',
                  properties: {
                    fieldId: 'email_contato',
                    placeholder: 'Email',
                    required: true
                  }
                }
              ]
            }
          ]
        })
      },
      {
        id: generateId(),
        title: 'Quiz de Renda Extra',
        description: 'Quiz para captura de leads interessados em renda extra',
        structure: JSON.stringify({
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'el1',
                  type: 'heading',
                  properties: {
                    text: 'Descubra Como Ter Renda Extra',
                    level: 1
                  }
                },
                {
                  id: 'el2',
                  type: 'multiple_choice',
                  properties: {
                    fieldId: 'situacao_atual',
                    question: 'Qual sua situação atual?',
                    options: [
                      { text: 'Empregado CLT', value: 'clt' },
                      { text: 'Autônomo', value: 'autonomo' },
                      { text: 'Desempregado', value: 'desempregado' },
                      { text: 'Aposentado', value: 'aposentado' }
                    ],
                    required: true
                  }
                },
                {
                  id: 'el3',
                  type: 'multiple_choice',
                  properties: {
                    fieldId: 'valor_desejado',
                    question: 'Quanto gostaria de ganhar por mês?',
                    options: [
                      { text: 'R$ 500 - R$ 1.000', value: '500-1000' },
                      { text: 'R$ 1.000 - R$ 3.000', value: '1000-3000' },
                      { text: 'R$ 3.000 - R$ 5.000', value: '3000-5000' },
                      { text: 'R$ 5.000+', value: '5000+' }
                    ],
                    required: true
                  }
                },
                {
                  id: 'el4',
                  type: 'text',
                  properties: {
                    fieldId: 'nome_completo',
                    placeholder: 'Nome completo',
                    required: true
                  }
                },
                {
                  id: 'el5',
                  type: 'phone',
                  properties: {
                    fieldId: 'telefone_contato',
                    placeholder: 'WhatsApp',
                    required: true
                  }
                },
                {
                  id: 'el6',
                  type: 'email',
                  properties: {
                    fieldId: 'email_contato',
                    placeholder: 'Email',
                    required: true
                  }
                }
              ]
            }
          ]
        })
      }
    ];
    
    // Inserir quizzes
    const insertQuizSQL = `
      INSERT OR REPLACE INTO quizzes (
        id, title, description, structure, userId, isPublished, 
        cloakerEnabled, antiWebViewEnabled, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    quizzes.forEach(quiz => {
      db.prepare(insertQuizSQL).run(
        quiz.id,
        quiz.title,
        quiz.description,
        quiz.structure,
        adminId,
        1, // publicado
        0, // cloaker desabilitado
        0, // anti-webview desabilitado
        Date.now(),
        Date.now()
      );
    });
    
    console.log(`✅ ${quizzes.length} quizzes criados`);
    
    // Criar algumas respostas de exemplo para o quiz principal
    const responses = [
      {
        id: generateId(),
        quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
        responses: JSON.stringify({
          nome_completo: 'João Silva',
          telefone_contato: '11995133932',
          email_contato: 'joao@teste.com'
        }),
        metadata: JSON.stringify({
          isComplete: true,
          completionPercentage: 100,
          isPartial: false
        })
      },
      {
        id: generateId(),
        quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
        responses: JSON.stringify({
          nome_completo: 'Maria Santos',
          telefone_contato: '11987654321',
          email_contato: 'maria@teste.com'
        }),
        metadata: JSON.stringify({
          isComplete: true,
          completionPercentage: 100,
          isPartial: false
        })
      }
    ];
    
    const insertResponseSQL = `
      INSERT OR REPLACE INTO quiz_responses (
        id, quizId, responses, metadata, submittedAt
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    responses.forEach(response => {
      db.prepare(insertResponseSQL).run(
        response.id,
        response.quizId,
        response.responses,
        response.metadata,
        Date.now()
      );
    });
    
    console.log(`✅ ${responses.length} respostas de exemplo criadas`);
    
    // Verificar se os dados foram inseridos
    const totalQuizzes = db.prepare("SELECT COUNT(*) as count FROM quizzes").get().count;
    const totalResponses = db.prepare("SELECT COUNT(*) as count FROM quiz_responses").get().count;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    
    console.log(`\n📊 DADOS RECUPERADOS:`);
    console.log(`   - Usuários: ${totalUsers}`);
    console.log(`   - Quizzes: ${totalQuizzes}`);
    console.log(`   - Respostas: ${totalResponses}`);
    console.log(`\n✅ RECUPERAÇÃO CONCLUÍDA COM SUCESSO!`);
    
  } catch (error) {
    console.error('❌ Erro na recuperação:', error);
  } finally {
    db.close();
  }
}

recoverQuizData().catch(console.error);