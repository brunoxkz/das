import { RequestHandler } from "express";

// Define roles hierarchy
export const ROLES = {
  USER: 'user',
  EDITOR: 'editor', 
  ADMIN: 'admin'
} as const;

// Define plans and their limits
export const PLANS = {
  FREE: {
    name: 'free',
    maxQuizzes: 3,
    maxResponses: 100,
    canExport: false,
    canUseTemplates: false,
    canUseAdvancedElements: false
  },
  PREMIUM: {
    name: 'premium',
    maxQuizzes: 25,
    maxResponses: 2500,
    canExport: true,
    canUseTemplates: true,
    canUseAdvancedElements: true
  },
  ENTERPRISE: {
    name: 'enterprise',
    maxQuizzes: -1, // unlimited
    maxResponses: -1, // unlimited
    canExport: true,
    canUseTemplates: true,
    canUseAdvancedElements: true
  }
} as const;

// Role hierarchy levels
const ROLE_LEVELS = {
  [ROLES.USER]: 1,
  [ROLES.EDITOR]: 2,
  [ROLES.ADMIN]: 3
};

// Check if user has required role
export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS] || 999;
  return userLevel >= requiredLevel;
}

// Get plan limits
export function getPlanLimits(planName: string) {
  switch (planName) {
    case 'premium':
      return PLANS.PREMIUM;
    case 'enterprise':
      return PLANS.ENTERPRISE;
    default:
      return PLANS.FREE;
  }
}

// Middleware to require minimum role
export function requireRole(minRole: string): RequestHandler {
  return (req: any, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!hasRole(req.user.role, minRole)) {
      return res.status(403).json({ 
        message: 'Permissão insuficiente',
        required: minRole,
        current: req.user.role
      });
    }

    next();
  };
}

// Middleware to check plan limits
export function requirePlan(feature: keyof typeof PLANS.FREE): RequestHandler {
  return (req: any, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const limits = getPlanLimits(req.user.plan);
    
    if (!limits[feature]) {
      return res.status(403).json({ 
        message: 'Recurso não disponível no seu plano',
        feature,
        currentPlan: req.user.plan,
        requiredPlan: 'premium'
      });
    }

    next();
  };
}

// Check if user can create more quizzes
export async function canCreateQuiz(userId: string, currentCount: number, userPlan: string): Promise<boolean> {
  const limits = getPlanLimits(userPlan);
  
  if (limits.maxQuizzes === -1) return true; // unlimited
  return currentCount < limits.maxQuizzes;
}

// Check if user can receive more responses
export async function canReceiveResponse(userId: string, currentCount: number, userPlan: string): Promise<boolean> {
  const limits = getPlanLimits(userPlan);
  
  if (limits.maxResponses === -1) return true; // unlimited
  return currentCount < limits.maxResponses;
}

// Admin-only endpoints
export const requireAdmin = requireRole(ROLES.ADMIN);

// Editor or higher
export const requireEditor = requireRole(ROLES.EDITOR);

// Any authenticated user
export const requireUser = requireRole(ROLES.USER);

// Premium features
export const requireExport = requirePlan('canExport');
export const requireTemplates = requirePlan('canUseTemplates');
export const requireAdvancedElements = requirePlan('canUseAdvancedElements');