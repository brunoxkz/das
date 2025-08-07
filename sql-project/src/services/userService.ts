import { eq, like, desc, asc } from 'drizzle-orm';
import { db } from '../config/database';
import { users, type User, type InsertUser } from '../schemas';

export class UserService {
  // Create new user
  async create(userData: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(userData).returning();
      return newUser;
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error}`);
    }
  }

  // Get user by ID
  async getById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error}`);
    }
  }

  // Get user by email
  async getByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error}`);
    }
  }

  // Get all users with pagination
  async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      return await db.select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error}`);
    }
  }

  // Search users by name or email
  async search(query: string, limit: number = 50): Promise<User[]> {
    try {
      return await db.select()
        .from(users)
        .where(like(users.name, `%${query}%`))
        .orderBy(asc(users.name))
        .limit(limit);
    } catch (error) {
      throw new Error(`Erro ao pesquisar usuários: ${error}`);
    }
  }

  // Update user
  async update(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error}`);
    }
  }

  // Delete user (soft delete by status)
  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.update(users)
        .set({ status: 'deleted', updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error}`);
    }
  }

  // Get active users count
  async getActiveCount(): Promise<number> {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.status, 'active'));
      return result.length;
    } catch (error) {
      throw new Error(`Erro ao contar usuários ativos: ${error}`);
    }
  }

  // Bulk create users
  async createMany(usersData: InsertUser[]): Promise<User[]> {
    try {
      return await db.insert(users).values(usersData).returning();
    } catch (error) {
      throw new Error(`Erro ao criar usuários em lote: ${error}`);
    }
  }
}

export const userService = new UserService();