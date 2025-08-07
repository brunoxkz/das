import { User as DBUser } from '@shared/schema';

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: DBUser;
    }
  }
}

export type AuthenticatedUser = DBUser;