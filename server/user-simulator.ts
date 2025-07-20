import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';

// Simulador de usuários online em tempo real
export class UserSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private onlineUsers: Set<string> = new Set();
  private userActivities: Map<string, any> = new Map();

  // Nomes brasileiros realistas
  private firstNames = [
    'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Fernando', 'Juliana',
    'Ricardo', 'Patricia', 'André', 'Camila', 'Bruno', 'Mariana', 'Diego',
    'Beatriz', 'Thiago', 'Larissa', 'Gabriel', 'Amanda', 'Rafael', 'Isabella',
    'Marcos', 'Carla', 'Felipe', 'Fernanda', 'Leonardo', 'Priscila', 'Lucas',
    'Natália', 'Vinícius', 'Roberta', 'Gustavo', 'Vanessa', 'Rodrigo', 'Gabriela'
  ];

  private lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
    'Dias', 'Monteiro', 'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Araujo'
  ];

  private cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
    'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Belém',
    'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió',
    'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu',
    'São Bernardo do Campo', 'João Pessoa', 'Osasco', 'Santo André', 'Jaboatão'
  ];

  private activities = [
    { action: 'quiz_created', description: 'criou um novo quiz' },
    { action: 'quiz_published', description: 'publicou um quiz' },
    { action: 'campaign_sent', description: 'enviou uma campanha SMS' },
    { action: 'leads_captured', description: 'capturou novos leads' },
    { action: 'email_campaign', description: 'criou campanha de email' },
    { action: 'whatsapp_campaign', description: 'iniciou campanha WhatsApp' },
    { action: 'analytics_viewed', description: 'visualizou analytics' },
    { action: 'template_used', description: 'usou um template' },
    { action: 'forum_post', description: 'postou no fórum' },
    { action: 'course_accessed', description: 'acessou um curso' }
  ];

  constructor() {
    this.startSimulation();
  }

  private generateRandomUser() {
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    const city = this.cities[Math.floor(Math.random() * this.cities.length)];
    
    return {
      id: nanoid(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      city,
      joinedAt: new Date(),
      plan: Math.random() > 0.7 ? 'premium' : Math.random() > 0.4 ? 'basic' : 'free',
      isOnline: true,
      lastActivity: new Date()
    };
  }

  private generateActivity(user: any) {
    const activity = this.activities[Math.floor(Math.random() * this.activities.length)];
    return {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      city: user.city,
      action: activity.action,
      description: activity.description,
      timestamp: new Date(),
      value: Math.floor(Math.random() * 50) + 1 // Número aleatório para leads, campanhas, etc.
    };
  }

  private startSimulation() {
    console.log('🚀 Iniciando simulador de usuários online...');
    
    // Adicionar usuários iniciais
    for (let i = 0; i < 25; i++) {
      const user = this.generateRandomUser();
      this.onlineUsers.add(user.id);
      this.userActivities.set(user.id, this.generateActivity(user));
    }

    // Adicionar novos usuários a cada hora (3600000ms)
    this.intervalId = setInterval(() => {
      this.addNewUsers();
    }, 3600000); // 1 hora

    // Simular atividades a cada 30 segundos
    setInterval(() => {
      this.simulateUserActivities();
    }, 30000); // 30 segundos

    console.log(`✅ Simulador iniciado com ${this.onlineUsers.size} usuários online`);
  }

  private addNewUsers() {
    const newUsersCount = Math.floor(Math.random() * 8) + 3; // 3-10 novos usuários por hora
    
    for (let i = 0; i < newUsersCount; i++) {
      const user = this.generateRandomUser();
      this.onlineUsers.add(user.id);
      this.userActivities.set(user.id, this.generateActivity(user));
    }

    console.log(`👥 ${newUsersCount} novos usuários adicionados. Total online: ${this.onlineUsers.size}`);
  }

  private simulateUserActivities() {
    const onlineUserIds = Array.from(this.onlineUsers);
    const activeUsersCount = Math.floor(onlineUserIds.length * 0.3); // 30% dos usuários ativos

    for (let i = 0; i < activeUsersCount; i++) {
      const randomUserId = onlineUserIds[Math.floor(Math.random() * onlineUserIds.length)];
      const existingActivity = this.userActivities.get(randomUserId);
      
      if (existingActivity) {
        const newActivity = this.generateActivity({
          id: randomUserId,
          firstName: existingActivity.userName.split(' ')[0],
          lastName: existingActivity.userName.split(' ')[1],
          city: existingActivity.city
        });
        this.userActivities.set(randomUserId, newActivity);
      }
    }

    // Remover alguns usuários aleatoriamente (simulando logout)
    if (this.onlineUsers.size > 100) {
      const usersToRemove = Math.floor(Math.random() * 5) + 1;
      const userIds = Array.from(this.onlineUsers);
      
      for (let i = 0; i < usersToRemove; i++) {
        const randomId = userIds[Math.floor(Math.random() * userIds.length)];
        this.onlineUsers.delete(randomId);
        this.userActivities.delete(randomId);
      }
    }
  }

  // Métodos públicos para acessar dados do simulador
  public getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  public getRecentActivities(limit: number = 10): any[] {
    const activities = Array.from(this.userActivities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return activities;
  }

  public getOnlineUsersByPlan(): { free: number; basic: number; premium: number } {
    const stats = { free: 0, basic: 0, premium: 0 };
    
    this.userActivities.forEach(activity => {
      // Simular distribuição de planos baseada em atividade
      const planWeight = Math.random();
      if (planWeight > 0.7) stats.premium++;
      else if (planWeight > 0.4) stats.basic++;
      else stats.free++;
    });

    return stats;
  }

  public getUsersGrowthStats(): { hourly: number; daily: number; weekly: number } {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      hourly: Math.floor(Math.random() * 8) + 3, // 3-10 usuários por hora
      daily: Math.floor(Math.random() * 150) + 50, // 50-200 usuários por dia
      weekly: Math.floor(Math.random() * 800) + 400 // 400-1200 usuários por semana
    };
  }

  public getTopCities(): Array<{ city: string; users: number }> {
    const cityStats = new Map<string, number>();
    
    this.userActivities.forEach(activity => {
      cityStats.set(activity.city, (cityStats.get(activity.city) || 0) + 1);
    });

    return Array.from(cityStats.entries())
      .map(([city, users]) => ({ city, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Simulador de usuários parado');
    }
  }
}

// Instância global do simulador
export const userSimulator = new UserSimulator();