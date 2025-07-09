import { nanoid } from 'nanoid';

export interface EmailTemplateBase {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  description: string;
}

export const BASE_EMAIL_TEMPLATES: EmailTemplateBase[] = [
  {
    id: 'quiz-completed',
    name: 'E-mail de Quiz Completo',
    subject: 'Parabéns {nome}! Você completou o quiz!',
    content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #16a34a; margin-bottom: 20px;">🎉 Parabéns, {nome}!</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Você completou nosso quiz com sucesso! Agora você faz parte de um grupo seleto de pessoas que deram o primeiro passo para transformar sua vida.
    </p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
      <h3 style="color: #16a34a; margin-bottom: 10px;">🏆 Suas Informações:</h3>
      <p style="color: #374151; margin: 5px 0;"><strong>Nome:</strong> {nome}</p>
      <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> {email}</p>
      <p style="color: #374151; margin: 5px 0;"><strong>Data:</strong> {data}</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Fique atento(a) aos próximos passos. Em breve você receberá informações exclusivas sobre como alcançar seus objetivos.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{link_continuar}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Continuar Jornada
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Obrigado por fazer parte da nossa comunidade!<br>
      Equipe Vendzz
    </p>
  </div>
</div>`,
    category: 'conversion',
    variables: ['nome', 'email', 'data', 'link_continuar'],
    description: 'Template para leads que completaram o quiz totalmente'
  },
  
  {
    id: 'quiz-abandoned',
    name: 'E-mail de Quiz Abandonado',
    subject: 'Ei {nome}, você esqueceu de finalizar algo importante...',
    content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #f59e0b; margin-bottom: 20px;">⏰ Ei, {nome}!</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Notamos que você começou nosso quiz, mas não conseguiu finalizar. Não se preocupe, isso acontece com todo mundo!
    </p>
    
    <div style="background-color: #fffbeb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #f59e0b; margin-bottom: 10px;">🎯 Você estava tão perto!</h3>
      <p style="color: #374151;">
        Seu progresso foi salvo e você pode continuar de onde parou. Leva apenas mais alguns minutos para descobrir informações valiosas sobre você mesmo.
      </p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Que tal finalizar agora? Milhares de pessoas já transformaram suas vidas com essas informações.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{link_continuar}" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Finalizar Quiz Agora
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Não perca essa oportunidade de transformação!<br>
      Equipe Vendzz
    </p>
  </div>
</div>`,
    category: 'remarketing',
    variables: ['nome', 'link_continuar'],
    description: 'Template para leads que abandonaram o quiz sem completar'
  },
  
  {
    id: 'email-with-name',
    name: 'E-mail citando o nome',
    subject: 'Uma mensagem especial para você, {nome}',
    content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #16a34a; margin-bottom: 20px;">Olá, {nome}! 👋</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Espero que você esteja bem! Meu nome é [SEU_NOME] e queria ter uma conversa mais pessoal com você.
    </p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
      <h3 style="color: #16a34a; margin-bottom: 10px;">💬 {nome}, isso é para você</h3>
      <p style="color: #374151;">
        Sei que receber e-mails pode ser chato, mas prometo que este é diferente. Preparei algo especial pensando especificamente em você.
      </p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      <strong>{nome}</strong>, você já parou para pensar no que realmente quer alcançar nos próximos meses? 
      Muitas pessoas vivem no piloto automático, mas você parece diferente.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Por isso, {nome}, gostaria de te convidar para uma conversa exclusiva sobre como você pode acelerar seus resultados.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{link_acao}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Quero Conversar, {nome}
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Até breve, {nome}!<br>
      [SEU_NOME] - Equipe Vendzz
    </p>
  </div>
</div>`,
    category: 'personalization',
    variables: ['nome', 'link_acao'],
    description: 'Template personalizado com foco no nome do lead para criar conexão'
  },
  
  {
    id: 'email-weight-height',
    name: 'E-mail citando Peso & Altura',
    subject: '{nome}, sobre seus {peso}kg e {altura}m...',
    content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #16a34a; margin-bottom: 20px;">Olá, {nome}! 📊</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Analisei suas informações e quero compartilhar algo importante com você sobre seus {peso}kg e {altura}m.
    </p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
      <h3 style="color: #16a34a; margin-bottom: 10px;">📈 Seus Dados Atuais:</h3>
      <p style="color: #374151; margin: 5px 0;"><strong>Peso atual:</strong> {peso}kg</p>
      <p style="color: #374151; margin: 5px 0;"><strong>Altura:</strong> {altura}m</p>
      <p style="color: #374151; margin: 5px 0;"><strong>IMC:</strong> {imc}</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      <strong>{nome}</strong>, com base em seus {peso}kg e {altura}m, identifiquei algumas oportunidades específicas para você alcançar seus objetivos.
    </p>
    
    <div style="background-color: #fffbeb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #f59e0b; margin-bottom: 10px;">🎯 Recomendação Personalizada</h3>
      <p style="color: #374151;">
        Para alguém com {altura}m e {peso}kg, existe um caminho específico que pode acelerar significativamente seus resultados. 
        Gostaria de compartilhar isso com você.
      </p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      {nome}, preparei um plano personalizado considerando exatamente seu perfil: {peso}kg, {altura}m. 
      Isso fará toda a diferença na sua jornada.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{link_plano}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Ver Meu Plano Personalizado
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Feito especialmente para você, {nome}!<br>
      Equipe Vendzz
    </p>
  </div>
</div>`,
    category: 'health',
    variables: ['nome', 'peso', 'altura', 'imc', 'link_plano'],
    description: 'Template que utiliza dados de peso e altura para personalização profunda'
  }
];

export function createEmailTemplateForUser(templateBase: EmailTemplateBase, userId: string) {
  return {
    id: nanoid(),
    name: templateBase.name,
    subject: templateBase.subject,
    content: templateBase.content,
    category: templateBase.category,
    variables: JSON.stringify(templateBase.variables),
    userId: userId,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000)
  };
}

export function getBaseTemplateById(id: string): EmailTemplateBase | undefined {
  return BASE_EMAIL_TEMPLATES.find(template => template.id === id);
}

export function getAllBaseTemplates(): EmailTemplateBase[] {
  return BASE_EMAIL_TEMPLATES;
}