import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração otimizada para alta concorrência (100k+ usuários simultâneos)
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de 20 conexões simultâneas
  min: 5,  // Mínimo de 5 conexões sempre ativas
  maxUses: 7500, // Recicla conexões após 7500 usos
  idleTimeout: 1000 * 60 * 5, // 5 minutos de timeout para conexões inativas
  connectionTimeout: 1000 * 10, // 10 segundos para estabelecer conexão
  query_timeout: 1000 * 30, // 30 segundos de timeout para queries
});

export const db = drizzle({ client: pool, schema });