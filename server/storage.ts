import { 
  siteContent, 
  news, 
  events, 
  solutions, 
  insights, 
  newsletter, 
  adminUsers, 
  siteSettings,
  type SiteContent,
  type News,
  type Events,
  type Solutions,
  type Insights,
  type Newsletter,
  type AdminUser,
  type SiteSettings,
  type InsertSiteContent,
  type InsertNews,
  type InsertEvents,
  type InsertSolutions,
  type InsertInsights,
  type InsertNewsletter,
  type InsertAdminUser,
  type InsertSiteSettings
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface IStorage {
  // Site Content Management
  getSiteContent(section: string): Promise<SiteContent[]>;
  updateSiteContent(id: number, data: Partial<InsertSiteContent>): Promise<SiteContent>;
  createSiteContent(data: InsertSiteContent): Promise<SiteContent>;
  deleteSiteContent(id: number): Promise<void>;

  // News Management
  getAllNews(): Promise<News[]>;
  getPublishedNews(limit?: number): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  getNewsBySlug(slug: string): Promise<News | undefined>;
  createNews(data: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;

  // Events Management
  getAllEvents(): Promise<Events[]>;
  getActiveEvents(): Promise<Events[]>;
  getUpcomingEvents(limit?: number): Promise<Events[]>;
  createEvent(data: InsertEvents): Promise<Events>;
  updateEvent(id: number, data: Partial<InsertEvents>): Promise<Events>;
  deleteEvent(id: number): Promise<void>;

  // Solutions Management
  getAllSolutions(): Promise<Solutions[]>;
  getActiveSolutions(): Promise<Solutions[]>;
  createSolution(data: InsertSolutions): Promise<Solutions>;
  updateSolution(id: number, data: Partial<InsertSolutions>): Promise<Solutions>;
  deleteSolution(id: number): Promise<void>;

  // Insights Management
  getAllInsights(): Promise<Insights[]>;
  getPublishedInsights(limit?: number): Promise<Insights[]>;
  getInsightById(id: number): Promise<Insights | undefined>;
  getInsightBySlug(slug: string): Promise<Insights | undefined>;
  createInsight(data: InsertInsights): Promise<Insights>;
  updateInsight(id: number, data: Partial<InsertInsights>): Promise<Insights>;
  deleteInsight(id: number): Promise<void>;

  // Newsletter Management
  subscribeToNewsletter(email: string, source?: string): Promise<Newsletter>;
  unsubscribeFromNewsletter(email: string): Promise<void>;
  getAllSubscribers(): Promise<Newsletter[]>;
  getActiveSubscribers(): Promise<Newsletter[]>;

  // Admin Users
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(data: InsertAdminUser): Promise<AdminUser>;
  updateAdmin(id: number, data: Partial<InsertAdminUser>): Promise<AdminUser>;

  // Site Settings
  getSetting(key: string): Promise<SiteSettings | undefined>;
  updateSetting(key: string, value: string): Promise<SiteSettings>;
  getAllSettings(): Promise<SiteSettings[]>;
  getSettingsByGroup(group: string): Promise<SiteSettings[]>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private siteContent: SiteContent[] = [];
  private news: News[] = [];
  private events: Events[] = [];
  private solutions: Solutions[] = [];
  private insights: Insights[] = [];
  private newsletter: Newsletter[] = [];
  private adminUsers: AdminUser[] = [];
  private siteSettings: SiteSettings[] = [];
  private nextId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed hero content
    this.siteContent.push({
      id: this.nextId++,
      section: 'hero',
      title: 'Welcome to the future of digital asset trading',
      subtitle: 'We are B2C2',
      content: 'Founded in 2015, B2C2 is the world\'s largest digital asset liquidity provider. We serve over 600 counterparties including retail platforms, market makers, hedge funds, family offices, high-net-worth individuals and traditional banks.',
      buttonText: 'Explore our solutions',
      buttonUrl: '#solutions',
      imageUrl: null,
      isActive: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed news
    this.news.push(
      {
        id: this.nextId++,
        title: 'B2C2 and PV01 Pioneer Corporate Bond on Blockchain',
        excerpt: 'Revolutionary partnership bringing traditional finance to blockchain.',
        content: 'B2C2 and PV01 have successfully completed the first corporate bond transaction on blockchain, marking a significant milestone in the digitization of traditional financial instruments.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        category: 'Press release',
        publishedAt: new Date('2024-11-25'),
        isPublished: true,
        author: 'B2C2',
        slug: 'b2c2-pv01-corporate-bond-blockchain',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.nextId++,
        title: 'B2C2 Partners with OpenPayd to Expand Global Instant Settlement Network',
        excerpt: 'Strategic partnership enhances global payment infrastructure.',
        content: 'B2C2 announces strategic partnership with OpenPayd to expand its global instant settlement network, enabling faster and more efficient cross-border transactions.',
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
        category: 'Press release',
        publishedAt: new Date('2024-10-28'),
        isPublished: true,
        author: 'B2C2',
        slug: 'b2c2-openpaid-partnership',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Seed solutions
    this.solutions.push(
      {
        id: this.nextId++,
        title: 'Trading overview',
        description: 'Comprehensive trading solutions for institutional clients',
        icon: 'chart-line',
        color: 'purple',
        url: '/trading',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.nextId++,
        title: 'OTC Products',
        description: 'Over-the-counter trading products and services',
        icon: 'handshake',
        color: 'blue',
        url: '/otc',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Seed insights
    this.insights.push({
      id: this.nextId++,
      title: 'A Treasurer\'s guide to Becoming Crypto-ready',
      excerpt: 'Essential guide for corporate treasurers entering digital assets.',
      content: 'This comprehensive guide provides corporate treasurers with the knowledge and tools needed to navigate the digital asset landscape safely and effectively.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
      category: 'Thought leadership',
      publishedAt: new Date('2022-09-20'),
      isPublished: true,
      readTime: 8,
      slug: 'treasurer-guide-crypto-ready',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed admin user
    this.adminUsers.push({
      id: this.nextId++,
      username: 'admin',
      email: 'admin@b2c2.com',
      password: '$2a$10$rQ8K8K8K8K8K8K8K8K8K8K', // Hashed 'admin123'
      role: 'admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed settings
    this.siteSettings.push(
      {
        id: this.nextId++,
        key: 'site_title',
        value: 'B2C2 - Digital Asset Liquidity Provider',
        type: 'text',
        description: 'Main site title',
        group: 'general',
        updatedAt: new Date()
      },
      {
        id: this.nextId++,
        key: 'primary_color',
        value: '#8B5CF6',
        type: 'color',
        description: 'Primary brand color',
        group: 'design',
        updatedAt: new Date()
      }
    );
  }

  // Site Content Methods
  async getSiteContent(section: string): Promise<SiteContent[]> {
    return this.siteContent.filter(c => c.section === section && c.isActive);
  }

  async updateSiteContent(id: number, data: Partial<InsertSiteContent>): Promise<SiteContent> {
    const index = this.siteContent.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Content not found');
    
    const updated = { ...this.siteContent[index], ...data, updatedAt: new Date() };
    this.siteContent[index] = updated;
    return updated;
  }

  async createSiteContent(data: InsertSiteContent): Promise<SiteContent> {
    const newContent: SiteContent = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.siteContent.push(newContent);
    return newContent;
  }

  async deleteSiteContent(id: number): Promise<void> {
    this.siteContent = this.siteContent.filter(c => c.id !== id);
  }

  // News Methods
  async getAllNews(): Promise<News[]> {
    return [...this.news].sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  }

  async getPublishedNews(limit = 10): Promise<News[]> {
    return this.news
      .filter(n => n.isPublished)
      .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime())
      .slice(0, limit);
  }

  async getNewsById(id: number): Promise<News | undefined> {
    return this.news.find(n => n.id === id);
  }

  async getNewsBySlug(slug: string): Promise<News | undefined> {
    return this.news.find(n => n.slug === slug);
  }

  async createNews(data: InsertNews): Promise<News> {
    const newNews: News = {
      id: this.nextId++,
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.news.push(newNews);
    return newNews;
  }

  async updateNews(id: number, data: Partial<InsertNews>): Promise<News> {
    const index = this.news.findIndex(n => n.id === id);
    if (index === -1) throw new Error('News not found');
    
    const updated = { ...this.news[index], ...data, updatedAt: new Date() };
    this.news[index] = updated;
    return updated;
  }

  async deleteNews(id: number): Promise<void> {
    this.news = this.news.filter(n => n.id !== id);
  }

  // Events Methods
  async getAllEvents(): Promise<Events[]> {
    return [...this.events].sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  }

  async getActiveEvents(): Promise<Events[]> {
    return this.events.filter(e => e.isActive);
  }

  async getUpcomingEvents(limit = 10): Promise<Events[]> {
    const now = new Date();
    return this.events
      .filter(e => e.isActive && e.eventDate > now)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
      .slice(0, limit);
  }

  async createEvent(data: InsertEvents): Promise<Events> {
    const newEvent: Events = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: number, data: Partial<InsertEvents>): Promise<Events> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    const updated = { ...this.events[index], ...data, updatedAt: new Date() };
    this.events[index] = updated;
    return updated;
  }

  async deleteEvent(id: number): Promise<void> {
    this.events = this.events.filter(e => e.id !== id);
  }

  // Solutions Methods
  async getAllSolutions(): Promise<Solutions[]> {
    return [...this.solutions].sort((a, b) => a.order - b.order);
  }

  async getActiveSolutions(): Promise<Solutions[]> {
    return this.solutions
      .filter(s => s.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async createSolution(data: InsertSolutions): Promise<Solutions> {
    const newSolution: Solutions = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.solutions.push(newSolution);
    return newSolution;
  }

  async updateSolution(id: number, data: Partial<InsertSolutions>): Promise<Solutions> {
    const index = this.solutions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Solution not found');
    
    const updated = { ...this.solutions[index], ...data, updatedAt: new Date() };
    this.solutions[index] = updated;
    return updated;
  }

  async deleteSolution(id: number): Promise<void> {
    this.solutions = this.solutions.filter(s => s.id !== id);
  }

  // Insights Methods
  async getAllInsights(): Promise<Insights[]> {
    return [...this.insights].sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  }

  async getPublishedInsights(limit = 10): Promise<Insights[]> {
    return this.insights
      .filter(i => i.isPublished)
      .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime())
      .slice(0, limit);
  }

  async getInsightById(id: number): Promise<Insights | undefined> {
    return this.insights.find(i => i.id === id);
  }

  async getInsightBySlug(slug: string): Promise<Insights | undefined> {
    return this.insights.find(i => i.slug === slug);
  }

  async createInsight(data: InsertInsights): Promise<Insights> {
    const newInsight: Insights = {
      id: this.nextId++,
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.insights.push(newInsight);
    return newInsight;
  }

  async updateInsight(id: number, data: Partial<InsertInsights>): Promise<Insights> {
    const index = this.insights.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Insight not found');
    
    const updated = { ...this.insights[index], ...data, updatedAt: new Date() };
    this.insights[index] = updated;
    return updated;
  }

  async deleteInsight(id: number): Promise<void> {
    this.insights = this.insights.filter(i => i.id !== id);
  }

  // Newsletter Methods
  async subscribeToNewsletter(email: string, source = 'website'): Promise<Newsletter> {
    const existing = this.newsletter.find(n => n.email === email);
    if (existing) {
      if (existing.isActive) {
        throw new Error('Email already subscribed');
      }
      // Reactivate subscription
      existing.isActive = true;
      existing.unsubscribedAt = null;
      return existing;
    }

    const newSubscription: Newsletter = {
      id: this.nextId++,
      email,
      isActive: true,
      source,
      subscribedAt: new Date(),
      unsubscribedAt: null
    };
    this.newsletter.push(newSubscription);
    return newSubscription;
  }

  async unsubscribeFromNewsletter(email: string): Promise<void> {
    const subscription = this.newsletter.find(n => n.email === email);
    if (subscription) {
      subscription.isActive = false;
      subscription.unsubscribedAt = new Date();
    }
  }

  async getAllSubscribers(): Promise<Newsletter[]> {
    return [...this.newsletter];
  }

  async getActiveSubscribers(): Promise<Newsletter[]> {
    return this.newsletter.filter(n => n.isActive);
  }

  // Admin Methods
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find(a => a.username === username);
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find(a => a.email === email);
  }

  async createAdmin(data: InsertAdminUser): Promise<AdminUser> {
    const newAdmin: AdminUser = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.adminUsers.push(newAdmin);
    return newAdmin;
  }

  async updateAdmin(id: number, data: Partial<InsertAdminUser>): Promise<AdminUser> {
    const index = this.adminUsers.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Admin not found');
    
    const updated = { ...this.adminUsers[index], ...data, updatedAt: new Date() };
    this.adminUsers[index] = updated;
    return updated;
  }

  // Settings Methods
  async getSetting(key: string): Promise<SiteSettings | undefined> {
    return this.siteSettings.find(s => s.key === key);
  }

  async updateSetting(key: string, value: string): Promise<SiteSettings> {
    const index = this.siteSettings.findIndex(s => s.key === key);
    if (index === -1) {
      const newSetting: SiteSettings = {
        id: this.nextId++,
        key,
        value,
        type: 'text',
        description: null,
        group: 'general',
        updatedAt: new Date()
      };
      this.siteSettings.push(newSetting);
      return newSetting;
    }
    
    const updated = { ...this.siteSettings[index], value, updatedAt: new Date() };
    this.siteSettings[index] = updated;
    return updated;
  }

  async getAllSettings(): Promise<SiteSettings[]> {
    return [...this.siteSettings];
  }

  async getSettingsByGroup(group: string): Promise<SiteSettings[]> {
    return this.siteSettings.filter(s => s.group === group);
  }
}

export const storage = new MemStorage();