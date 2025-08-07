import { Router } from 'express';
import { db } from '../database.js';
import { users, insertUserSchema } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword, generateToken, authenticate, AuthRequest } from '../auth.js';
import { z } from 'zod';

const router = Router();

// Register schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email)
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      timezone: validatedData.timezone || 'UTC'
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt
    });

    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      timezone: z.string().optional(),
      avatar: z.string().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const [updatedUser] = await db.update(users)
      .set({
        ...validatedData,
        updatedAt: new Date().getTime()
      })
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        timezone: users.timezone,
        updatedAt: users.updatedAt
      });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const passwordSchema = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
      confirmPassword: z.string()
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });

    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    // Get current user with password
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date().getTime()
      })
      .where(eq(users.id, req.user.id));

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;