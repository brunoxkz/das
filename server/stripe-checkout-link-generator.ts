import { nanoid } from 'nanoid';
import { storage } from './storage-sqlite';

export interface CheckoutLinkConfig {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  userId: string;
  expiresInHours?: number;
}

export interface CheckoutLink {
  id: string;
  userId: string;
  config: CheckoutLinkConfig;
  accessToken: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
  used: boolean;
}

export class StripeCheckoutLinkGenerator {
  
  /**
   * CRIAR LINK DIRETO PARA STRIPE ELEMENTS CHECKOUT
   * Permite acesso sem autenticação por tempo limitado
   */
  async createCheckoutLink(config: CheckoutLinkConfig): Promise<{
    linkId: string;
    checkoutUrl: string;
    accessToken: string;
    expiresAt: Date;
  }> {
    const linkId = nanoid(12);
    const accessToken = nanoid(32);
    const expiresInHours = config.expiresInHours || 24; // 24 horas por padrão
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const checkoutLink: CheckoutLink = {
      id: linkId,
      userId: config.userId,
      config,
      accessToken,
      expiresAt,
      createdAt: new Date(),
      used: false,
    };

    // Salvar no banco (usando sistema de armazenamento existente)
    await this.saveCheckoutLink(checkoutLink);

    const checkoutUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/stripe-elements-checkout?linkId=${linkId}&token=${accessToken}`;

    console.log('✅ LINK DE CHECKOUT CRIADO:', {
      linkId,
      checkoutUrl,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      linkId,
      checkoutUrl,
      accessToken,
      expiresAt,
    };
  }

  /**
   * VALIDAR LINK DE CHECKOUT
   */
  async validateCheckoutLink(linkId: string, accessToken: string): Promise<{
    valid: boolean;
    config?: CheckoutLinkConfig;
    error?: string;
  }> {
    try {
      const checkoutLink = await this.getCheckoutLink(linkId);

      if (!checkoutLink) {
        return { valid: false, error: 'Link não encontrado' };
      }

      if (checkoutLink.used) {
        return { valid: false, error: 'Link já foi utilizado' };
      }

      if (new Date() > checkoutLink.expiresAt) {
        return { valid: false, error: 'Link expirou' };
      }

      if (checkoutLink.accessToken !== accessToken) {
        return { valid: false, error: 'Token inválido' };
      }

      return { valid: true, config: checkoutLink.config };
    } catch (error) {
      console.error('❌ ERRO AO VALIDAR LINK:', error);
      return { valid: false, error: 'Erro interno' };
    }
  }

  /**
   * MARCAR LINK COMO USADO
   */
  async markLinkAsUsed(linkId: string): Promise<void> {
    try {
      const checkoutLink = await this.getCheckoutLink(linkId);
      if (checkoutLink) {
        checkoutLink.used = true;
        checkoutLink.usedAt = new Date();
        await this.updateCheckoutLink(checkoutLink);
      }
    } catch (error) {
      console.error('❌ ERRO AO MARCAR LINK COMO USADO:', error);
    }
  }

  /**
   * LISTAR LINKS DE CHECKOUT DO USUÁRIO
   */
  async getUserCheckoutLinks(userId: string): Promise<CheckoutLink[]> {
    try {
      return await this.getCheckoutLinksByUser(userId);
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR LINKS DO USUÁRIO:', error);
      return [];
    }
  }

  /**
   * SALVAR LINK NO BANCO DE DADOS
   */
  private async saveCheckoutLink(checkoutLink: CheckoutLink): Promise<void> {
    try {
      // Usar sistema de storage existente ou criar tabela específica
      const linkData = {
        id: checkoutLink.id,
        userId: checkoutLink.userId,
        config: JSON.stringify(checkoutLink.config),
        accessToken: checkoutLink.accessToken,
        expiresAt: checkoutLink.expiresAt.toISOString(),
        createdAt: checkoutLink.createdAt.toISOString(),
        used: checkoutLink.used ? 1 : 0,
        usedAt: checkoutLink.usedAt?.toISOString() || null,
      };

      // Usar SQLite do db-sqlite diretamente
      const Database = await import('better-sqlite3');
      const db = new Database.default('./vendzz-database.db');
      
      // Preparar statement
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO checkout_links (
          id, userId, config, accessToken, expiresAt, createdAt, used, usedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        linkData.id,
        linkData.userId,
        linkData.config,
        linkData.accessToken,
        linkData.expiresAt,
        linkData.createdAt,
        linkData.used,
        linkData.usedAt
      );
      
      db.close();
    } catch (error) {
      console.error('❌ ERRO AO SALVAR LINK:', error);
      throw error;
    }
  }

  /**
   * BUSCAR LINK POR ID
   */
  private async getCheckoutLink(linkId: string): Promise<CheckoutLink | null> {
    try {
      const Database = await import('better-sqlite3');
      const db = new Database.default('./vendzz-database.db');
      
      const stmt = db.prepare('SELECT * FROM checkout_links WHERE id = ?');
      const row = stmt.get(linkId);
      
      db.close();

      if (!row) return null;

      return {
        id: row.id,
        userId: row.userId,
        config: JSON.parse(row.config),
        accessToken: row.accessToken,
        expiresAt: new Date(row.expiresAt),
        createdAt: new Date(row.createdAt),
        usedAt: row.usedAt ? new Date(row.usedAt) : undefined,
        used: row.used === 1,
      };
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR LINK:', error);
      return null;
    }
  }

  /**
   * ATUALIZAR LINK
   */
  private async updateCheckoutLink(checkoutLink: CheckoutLink): Promise<void> {
    try {
      const Database = await import('better-sqlite3');
      const db = new Database.default('./vendzz-database.db');
      
      const stmt = db.prepare(`
        UPDATE checkout_links 
        SET used = ?, usedAt = ?
        WHERE id = ?
      `);
      
      stmt.run(
        checkoutLink.used ? 1 : 0,
        checkoutLink.usedAt?.toISOString() || null,
        checkoutLink.id
      );
      
      db.close();
    } catch (error) {
      console.error('❌ ERRO AO ATUALIZAR LINK:', error);
      throw error;
    }
  }

  /**
   * BUSCAR LINKS POR USUÁRIO
   */
  private async getCheckoutLinksByUser(userId: string): Promise<CheckoutLink[]> {
    try {
      const Database = await import('better-sqlite3');
      const db = new Database.default('./vendzz-database.db');
      
      const stmt = db.prepare(
        'SELECT * FROM checkout_links WHERE userId = ? ORDER BY createdAt DESC'
      );
      const rows = stmt.all(userId);
      
      db.close();

      return rows.map(row => ({
        id: row.id,
        userId: row.userId,
        config: JSON.parse(row.config),
        accessToken: row.accessToken,
        expiresAt: new Date(row.expiresAt),
        createdAt: new Date(row.createdAt),
        usedAt: row.usedAt ? new Date(row.usedAt) : undefined,
        used: row.used === 1,
      }));
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR LINKS DO USUÁRIO:', error);
      return [];
    }
  }
}

/**
 * INICIALIZAR TABELA DE CHECKOUT LINKS
 */
export async function initCheckoutLinksTable(): Promise<void> {
  try {
    const Database = await import('better-sqlite3');
    const db = new Database.default('./vendzz-database.db');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS checkout_links (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        config TEXT NOT NULL,
        accessToken TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        usedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    
    db.close();
    console.log('✅ Tabela checkout_links inicializada');
  } catch (error) {
    console.error('❌ ERRO AO INICIALIZAR TABELA CHECKOUT LINKS:', error);
  }
}