import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { registerSQLiteRoutes } from "./routes-sqlite";

// Detecta automaticamente qual sistema usar
const detectRouteSystem = () => {
  // Se DATABASE_URL estiver presente, usa PostgreSQL (Railway)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return 'postgresql';
  }
  // Caso contrário, usa SQLite local
  return 'sqlite';
};

export function registerHybridRoutes(app: Express): Server {
  const routeSystem = detectRouteSystem();
  
  console.log(`🛣️ Configurando sistema de rotas: ${routeSystem.toUpperCase()}`);
  
  if (routeSystem === 'postgresql') {
    return registerRoutes(app);
  } else {
    return registerSQLiteRoutes(app);
  }
}