import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNews, insertEvents, insertSolutions, insertInsights, insertNewsletter } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // B2T EXCHANGE ROUTES - Site HTML estático para GoDaddy
  console.log('🚀 REGISTRANDO ROTAS B2T EXCHANGE');
  
  // B2T Site Principal - HTML estático
  app.get('/b2t-exchange', (req, res) => {
    console.log('🎯 SERVINDO B2T EXCHANGE HOMEPAGE');
    res.sendFile('b2t-exchange.html', { root: 'public' });
  });
  
  // B2T Admin Panel - Sistema completo de edição
  app.get('/b2t-admin', (req, res) => {
    console.log('⚙️ SERVINDO B2T ADMIN PANEL');
    res.sendFile('b2t-exchange-admin.html', { root: 'public' });
  });
  
  // B2T Test Page - Verificação rápida
  app.get('/b2t-test', (req, res) => {
    console.log('🔍 SERVINDO B2T TEST PAGE');
    res.sendFile('b2t-exchange-test.html', { root: 'public' });
  });

  // B2C2 FIXED - Removido duplicação (já está em server/index.ts)

  // B2C2 ADMIN COMPLETO - Sistema categorizado de edição
  app.get('/b2c2-admin', (req, res) => {
    console.log('🔥 SERVINDO B2C2-ADMIN COMPLETO');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../public/b2c2-admin-complete.html');
    
    fs.readFile(filePath, 'utf8', (err: any, data: string) => {
      if (err) {
        console.error('Erro ao ler arquivo:', err);
        res.status(404).send('Arquivo não encontrado');
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(data);
    });
  });

  // B2C2 site route - serve without JWT authentication
  app.get('/b2c2', (req, res) => {
    res.sendFile('b2c2.html', { root: 'public' });
  });

  // CORS middleware
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

  // ===== SITE CONTENT MANAGEMENT =====
  
  // Get site content by section
  app.get('/api/content/:section', async (req, res) => {
    try {
      const { section } = req.params;
      const content = await storage.getSiteContent(section);
      res.json(content);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  // Update site content
  app.put('/api/content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedContent = await storage.updateSiteContent(parseInt(id), req.body);
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Failed to update content' });
    }
  });

  // Create site content
  app.post('/api/content', async (req, res) => {
    try {
      const newContent = await storage.createSiteContent(req.body);
      res.json(newContent);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: 'Failed to create content' });
    }
  });

  // Delete site content
  app.delete('/api/content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSiteContent(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Failed to delete content' });
    }
  });

  // ===== NEWS MANAGEMENT =====
  
  // Get all news (admin)
  app.get('/api/admin/news', async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Get published news (public)
  app.get('/api/news', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const news = await storage.getPublishedNews(limit);
      res.json(news);
    } catch (error) {
      console.error('Error fetching published news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Get news by ID
  app.get('/api/news/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const news = await storage.getNewsById(parseInt(id));
      if (!news) {
        return res.status(404).json({ error: 'News not found' });
      }
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Get news by slug
  app.get('/api/news/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const news = await storage.getNewsBySlug(slug);
      if (!news) {
        return res.status(404).json({ error: 'News not found' });
      }
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Create news
  app.post('/api/admin/news', async (req, res) => {
    try {
      const newsData = insertNews.parse(req.body);
      const news = await storage.createNews(newsData);
      res.json(news);
    } catch (error) {
      console.error('Error creating news:', error);
      res.status(500).json({ error: 'Failed to create news' });
    }
  });

  // Update news
  app.put('/api/admin/news/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const news = await storage.updateNews(parseInt(id), req.body);
      res.json(news);
    } catch (error) {
      console.error('Error updating news:', error);
      res.status(500).json({ error: 'Failed to update news' });
    }
  });

  // Delete news
  app.delete('/api/admin/news/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNews(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting news:', error);
      res.status(500).json({ error: 'Failed to delete news' });
    }
  });

  // ===== EVENTS MANAGEMENT =====
  
  // Get all events (admin)
  app.get('/api/admin/events', async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get active events (public)
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get upcoming events
  app.get('/api/events/upcoming', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Create event
  app.post('/api/admin/events', async (req, res) => {
    try {
      const eventData = insertEvents.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Update event
  app.put('/api/admin/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.updateEvent(parseInt(id), req.body);
      res.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  // Delete event
  app.delete('/api/admin/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // ===== SOLUTIONS MANAGEMENT =====
  
  // Get all solutions (admin)
  app.get('/api/admin/solutions', async (req, res) => {
    try {
      const solutions = await storage.getAllSolutions();
      res.json(solutions);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      res.status(500).json({ error: 'Failed to fetch solutions' });
    }
  });

  // Get active solutions (public)
  app.get('/api/solutions', async (req, res) => {
    try {
      const solutions = await storage.getActiveSolutions();
      res.json(solutions);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      res.status(500).json({ error: 'Failed to fetch solutions' });
    }
  });

  // Create solution
  app.post('/api/admin/solutions', async (req, res) => {
    try {
      const solutionData = insertSolutions.parse(req.body);
      const solution = await storage.createSolution(solutionData);
      res.json(solution);
    } catch (error) {
      console.error('Error creating solution:', error);
      res.status(500).json({ error: 'Failed to create solution' });
    }
  });

  // Update solution
  app.put('/api/admin/solutions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const solution = await storage.updateSolution(parseInt(id), req.body);
      res.json(solution);
    } catch (error) {
      console.error('Error updating solution:', error);
      res.status(500).json({ error: 'Failed to update solution' });
    }
  });

  // Delete solution
  app.delete('/api/admin/solutions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSolution(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting solution:', error);
      res.status(500).json({ error: 'Failed to delete solution' });
    }
  });

  // ===== INSIGHTS MANAGEMENT =====
  
  // Get all insights (admin)
  app.get('/api/admin/insights', async (req, res) => {
    try {
      const insights = await storage.getAllInsights();
      res.json(insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  });

  // Get published insights (public)
  app.get('/api/insights', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const insights = await storage.getPublishedInsights(limit);
      res.json(insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  });

  // Get insight by ID
  app.get('/api/insights/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const insight = await storage.getInsightById(parseInt(id));
      if (!insight) {
        return res.status(404).json({ error: 'Insight not found' });
      }
      res.json(insight);
    } catch (error) {
      console.error('Error fetching insight:', error);
      res.status(500).json({ error: 'Failed to fetch insight' });
    }
  });

  // Get insight by slug
  app.get('/api/insights/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const insight = await storage.getInsightBySlug(slug);
      if (!insight) {
        return res.status(404).json({ error: 'Insight not found' });
      }
      res.json(insight);
    } catch (error) {
      console.error('Error fetching insight:', error);
      res.status(500).json({ error: 'Failed to fetch insight' });
    }
  });

  // Create insight
  app.post('/api/admin/insights', async (req, res) => {
    try {
      const insightData = insertInsights.parse(req.body);
      const insight = await storage.createInsight(insightData);
      res.json(insight);
    } catch (error) {
      console.error('Error creating insight:', error);
      res.status(500).json({ error: 'Failed to create insight' });
    }
  });

  // Update insight
  app.put('/api/admin/insights/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const insight = await storage.updateInsight(parseInt(id), req.body);
      res.json(insight);
    } catch (error) {
      console.error('Error updating insight:', error);
      res.status(500).json({ error: 'Failed to update insight' });
    }
  });

  // Delete insight
  app.delete('/api/admin/insights/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInsight(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting insight:', error);
      res.status(500).json({ error: 'Failed to delete insight' });
    }
  });

  // ===== NEWSLETTER MANAGEMENT =====
  
  // Subscribe to newsletter (public)
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email address is required' });
      }

      const subscription = await storage.subscribeToNewsletter(email, source);
      res.json({ success: true, message: 'Successfully subscribed to newsletter', subscription });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      if ((error as Error).message === 'Email already subscribed') {
        return res.status(409).json({ error: 'Email is already subscribed' });
      }
      res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  });

  // Unsubscribe from newsletter (public)
  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      await storage.unsubscribeFromNewsletter(email);
      res.json({ success: true, message: 'Successfully unsubscribed from newsletter' });
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
    }
  });

  // Get all subscribers (admin)
  app.get('/api/admin/newsletter/subscribers', async (req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  });

  // Get active subscribers (admin)
  app.get('/api/admin/newsletter/subscribers/active', async (req, res) => {
    try {
      const subscribers = await storage.getActiveSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error('Error fetching active subscribers:', error);
      res.status(500).json({ error: 'Failed to fetch active subscribers' });
    }
  });

  // ===== SETTINGS MANAGEMENT =====
  
  // Get all settings (admin)
  app.get('/api/admin/settings', async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Get settings by group (admin)
  app.get('/api/admin/settings/:group', async (req, res) => {
    try {
      const { group } = req.params;
      const settings = await storage.getSettingsByGroup(group);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update setting (admin)
  app.put('/api/admin/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  // Get public setting
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json(setting);
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}