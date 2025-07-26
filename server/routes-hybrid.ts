import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { registerSQLiteRoutes } from "./routes-sqlite";

// Detecta automaticamente qual sistema usar
const detectRouteSystem = () => {
  // Forçar SQLite para desenvolvimento local independente
  return 'sqlite';
};

export function registerHybridRoutes(app: Express): Server {
  const routeSystem = detectRouteSystem();
  
  console.log(`🛣️ Configurando sistema de rotas: ${routeSystem.toUpperCase()}`);
  
  if (routeSystem === 'sqlite') {
    return registerSQLiteRoutes(app);
  } else {
    return registerRoutes(app);
  }
}