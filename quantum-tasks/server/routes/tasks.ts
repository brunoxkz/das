import { Router } from 'express';
import { db } from '../database.js';
import { tasks, projects, insertTaskSchema, insertProjectSchema } from '../../shared/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../auth.js';
import { z } from 'zod';

const router = Router();

// ======================
// PROJECTS ROUTES
// ======================

// Get all projects
router.get('/projects', authenticate, async (req: AuthRequest, res) => {
  try {
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, req.user.id),
      orderBy: [asc(projects.position), desc(projects.createdAt)]
    });

    res.json(userProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
router.post('/projects', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = insertProjectSchema.parse({
      ...req.body,
      userId: req.user.id
    });

    const [newProject] = await db.insert(projects)
      .values(validatedData)
      .returning();

    res.status(201).json(newProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/projects/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      position: z.number().optional(),
      isArchived: z.boolean().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const [updatedProject] = await db.update(projects)
      .set({
        ...validatedData,
        updatedAt: new Date().getTime()
      })
      .where(and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user.id)
      ))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if project has tasks
    const projectTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectId, req.params.id)
    });

    if (projectTasks.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete project with existing tasks',
        taskCount: projectTasks.length
      });
    }

    const deletedProject = await db.delete(projects)
      .where(and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user.id)
      ))
      .returning();

    if (deletedProject.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ======================
// TASKS ROUTES
// ======================

// Get all tasks with filters
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { 
      projectId, 
      status, 
      priority, 
      isCompleted, 
      limit = '50', 
      offset = '0',
      search 
    } = req.query;

    let whereConditions = [eq(tasks.userId, req.user.id)];

    if (projectId) {
      whereConditions.push(eq(tasks.projectId, projectId as string));
    }

    if (status) {
      whereConditions.push(eq(tasks.status, status as string));
    }

    if (priority) {
      whereConditions.push(eq(tasks.priority, priority as string));
    }

    if (isCompleted !== undefined) {
      whereConditions.push(eq(tasks.isCompleted, isCompleted === 'true'));
    }

    const userTasks = await db.query.tasks.findMany({
      where: and(...whereConditions),
      orderBy: [asc(tasks.position), desc(tasks.createdAt)],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      with: {
        projectId: true
      }
    });

    // If search is provided, filter by title/description
    let filteredTasks = userTasks;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredTasks = userTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }

    res.json(filteredTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, req.params.id),
        eq(tasks.userId, req.user.id)
      )
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = insertTaskSchema.parse({
      ...req.body,
      userId: req.user.id,
      tags: req.body.tags ? JSON.stringify(req.body.tags) : null,
      aiSuggestions: req.body.aiSuggestions ? JSON.stringify(req.body.aiSuggestions) : null,
      vendzzmLinkedData: req.body.vendzzmLinkedData ? JSON.stringify(req.body.vendzzmLinkedData) : null
    });

    const [newTask] = await db.insert(tasks)
      .values(validatedData)
      .returning();

    res.status(201).json(newTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(['todo', 'doing', 'review', 'done']).optional(),
      priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
      isCompleted: z.boolean().optional(),
      dueDate: z.number().optional(),
      startDate: z.number().optional(),
      estimatedDuration: z.number().optional(),
      actualDuration: z.number().optional(),
      position: z.number().optional(),
      tags: z.array(z.string()).optional(),
      projectId: z.string().optional(),
      listId: z.string().optional(),
      aiSuggestions: z.any().optional(),
      vendzzmLinkedData: z.any().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    // Handle JSON fields
    const updateData: any = { ...validatedData };
    if (validatedData.tags) {
      updateData.tags = JSON.stringify(validatedData.tags);
    }
    if (validatedData.aiSuggestions) {
      updateData.aiSuggestions = JSON.stringify(validatedData.aiSuggestions);
    }
    if (validatedData.vendzzmLinkedData) {
      updateData.vendzzmLinkedData = JSON.stringify(validatedData.vendzzmLinkedData);
    }

    // If marking as completed, set completedAt
    if (validatedData.isCompleted === true) {
      updateData.completedAt = new Date().getTime();
    } else if (validatedData.isCompleted === false) {
      updateData.completedAt = null;
    }

    updateData.updatedAt = new Date().getTime();

    const [updatedTask] = await db.update(tasks)
      .set(updateData)
      .where(and(
        eq(tasks.id, req.params.id),
        eq(tasks.userId, req.user.id)
      ))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const deletedTask = await db.delete(tasks)
      .where(and(
        eq(tasks.id, req.params.id),
        eq(tasks.userId, req.user.id)
      ))
      .returning();

    if (deletedTask.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Bulk update tasks (for Kanban drag & drop)
router.patch('/bulk-update', authenticate, async (req: AuthRequest, res) => {
  try {
    const bulkUpdateSchema = z.object({
      updates: z.array(z.object({
        id: z.string(),
        status: z.enum(['todo', 'doing', 'review', 'done']).optional(),
        position: z.number().optional(),
        projectId: z.string().optional(),
        listId: z.string().optional()
      }))
    });

    const { updates } = bulkUpdateSchema.parse(req.body);

    const results = [];
    
    for (const update of updates) {
      const [updatedTask] = await db.update(tasks)
        .set({
          ...update,
          updatedAt: new Date().getTime()
        })
        .where(and(
          eq(tasks.id, update.id),
          eq(tasks.userId, req.user.id)
        ))
        .returning();
      
      if (updatedTask) {
        results.push(updatedTask);
      }
    }

    res.json({ 
      message: 'Tasks updated successfully',
      updated: results.length,
      tasks: results
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update tasks' });
  }
});

// Get task analytics
router.get('/analytics/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const allTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, req.user.id)
    });

    const analytics = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.isCompleted).length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      doing: allTasks.filter(t => t.status === 'doing').length,
      review: allTasks.filter(t => t.status === 'review').length,
      done: allTasks.filter(t => t.status === 'done').length,
      byPriority: {
        urgent: allTasks.filter(t => t.priority === 'urgent').length,
        high: allTasks.filter(t => t.priority === 'high').length,
        normal: allTasks.filter(t => t.priority === 'normal').length,
        low: allTasks.filter(t => t.priority === 'low').length
      },
      overdue: allTasks.filter(t => 
        t.dueDate && t.dueDate < Date.now() && !t.isCompleted
      ).length,
      completionRate: allTasks.length > 0 
        ? Math.round((allTasks.filter(t => t.isCompleted).length / allTasks.length) * 100) 
        : 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;