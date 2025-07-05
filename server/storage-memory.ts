// Sistema de armazenamento em memória temporário
// Usado como fallback quando o banco de dados está indisponível

interface MemoryUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  plan: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  refreshToken?: string;
  profileImageUrl?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
}

interface MemoryQuiz {
  id: string;
  title: string;
  description?: string;
  structure: any;
  userId: string;
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: any;
  facebookPixel?: string;
  googlePixel?: string;
  customHeadScript?: string;
  embedCode?: string;
}

class MemoryStorage {
  private users: Map<string, MemoryUser> = new Map();
  private quizzes: Map<string, MemoryQuiz> = new Map();
  private userQuizzes: Map<string, string[]> = new Map();

  constructor() {
    // Criar usuários padrão
    this.createDefaultUsers();
  }

  private createDefaultUsers() {
    const defaultUsers = [
      {
        id: "admin-user-id",
        email: "admin@vendzz.com",
        password: "$2b$10$hashedpassword",
        firstName: "Admin",
        lastName: "Vendzz",
        plan: "enterprise",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "editor-user-id", 
        email: "editor@vendzz.com",
        password: "$2b$10$hashedpassword",
        firstName: "Editor",
        lastName: "Vendzz",
        plan: "premium",
        role: "editor",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "user-user-id",
        email: "user@vendzz.com", 
        password: "$2b$10$hashedpassword",
        firstName: "User",
        lastName: "Vendzz",
        plan: "free",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
      this.userQuizzes.set(user.id, []);
    });
  }

  // User methods
  async getUser(id: string): Promise<MemoryUser | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<MemoryUser | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: Partial<MemoryUser>): Promise<MemoryUser> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user: MemoryUser = {
      id,
      email: userData.email || '',
      password: userData.password || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      plan: userData.plan || 'free',
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    
    this.users.set(id, user);
    this.userQuizzes.set(id, []);
    return user;
  }

  // Quiz methods
  async getQuizzesByUserId(userId: string): Promise<MemoryQuiz[]> {
    const userQuizIds = this.userQuizzes.get(userId) || [];
    return userQuizIds.map(id => this.quizzes.get(id)).filter(Boolean) as MemoryQuiz[];
  }

  async getQuizById(id: string): Promise<MemoryQuiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(quizData: Partial<MemoryQuiz>): Promise<MemoryQuiz> {
    const id = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const quiz: MemoryQuiz = {
      id,
      title: quizData.title || 'Novo Quiz',
      description: quizData.description,
      structure: quizData.structure || { pages: [], settings: {} },
      userId: quizData.userId || '',
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...quizData
    };

    this.quizzes.set(id, quiz);
    
    const userQuizIds = this.userQuizzes.get(quiz.userId) || [];
    userQuizIds.push(id);
    this.userQuizzes.set(quiz.userId, userQuizIds);

    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<MemoryQuiz>): Promise<MemoryQuiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;

    const updatedQuiz = {
      ...quiz,
      ...updates,
      updatedAt: new Date()
    };

    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return false;

    this.quizzes.delete(id);
    
    const userQuizIds = this.userQuizzes.get(quiz.userId) || [];
    const filteredIds = userQuizIds.filter(qId => qId !== id);
    this.userQuizzes.set(quiz.userId, filteredIds);

    return true;
  }

  // Dashboard stats
  async getDashboardStats(userId: string) {
    const userQuizzes = await this.getQuizzesByUserId(userId);
    return {
      quizzes: userQuizzes,
      totalQuizzes: userQuizzes.length,
      totalResponses: userQuizzes.length * Math.floor(Math.random() * 100), // Mock data
      totalViews: userQuizzes.length * Math.floor(Math.random() * 500), // Mock data
    };
  }
}

export const memoryStorage = new MemoryStorage();