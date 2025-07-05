import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { setupJWTAuth, verifyJWT as verifyJWTPostgres } from "./auth";
import { setupSQLiteAuth, verifyJWT as verifyJWTSQLite } from "./auth-sqlite";

// Detecta automaticamente qual sistema de auth usar baseado no ambiente
const detectAuthSystem = () => {
  // Forçar SQLite para desenvolvimento local independente
  return 'sqlite';
};

export const authSystem = detectAuthSystem();

// Wrapper que usa o sistema correto automaticamente
export const verifyJWT: RequestHandler = async (req: any, res, next) => {
  if (authSystem === 'sqlite') {
    return verifyJWTSQLite(req, res, next);
  } else {
    return verifyJWTPostgres(req, res, next);
  }
};

export function setupHybridAuth(app: Express) {
  console.log(`🔐 Configurando sistema de autenticação: ${authSystem.toUpperCase()}`);
  
  if (authSystem === 'sqlite') {
    setupSQLiteAuth(app);
  } else {
    setupJWTAuth(app);
  }
  
  // Endpoint para detectar qual sistema está sendo usado
  app.get('/api/auth/system', (req, res) => {
    res.json({ system: authSystem });
  });
}