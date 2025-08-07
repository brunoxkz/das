import express, { Router } from 'express';
import { userService } from '../services/userService';
import { insertUserSchema } from '../schemas';
import { z } from 'zod';

const router = Router();

// Middleware for input validation
const validateInput = (schema: z.ZodSchema) => {
  return (req: express.Request & { validatedBody?: any }, res: express.Response, next: express.NextFunction) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

// ============ USER ROUTES ============

// GET /api/users - List all users
router.get('/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const query = req.query.search as string;

    let users;
    if (query) {
      users = await userService.search(query, limit);
    } else {
      users = await userService.getAll(limit, offset);
    }

    res.json({
      success: true,
      data: users,
      meta: {
        limit,
        offset,
        search: query || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

// POST /api/users - Create new user
router.post('/users', validateInput(insertUserSchema), async (req, res) => {
  try {
    const user = await userService.create(req.validatedBody);
    res.status(201).json({
      success: true,
      data: user,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/users/:id', validateInput(insertUserSchema.partial()), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    const user = await userService.update(id, req.validatedBody);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID deve ser um número válido'
      });
    }

    const deleted = await userService.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

// GET /api/stats - Get basic statistics
router.get('/stats', async (req, res) => {
  try {
    const activeUsers = await userService.getActiveCount();
    
    res.json({
      success: true,
      data: {
        activeUsers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

export default router;