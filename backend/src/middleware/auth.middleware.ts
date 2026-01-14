import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
export const generateToken = (user: { id: string; email: string; name: string; isAdmin?: boolean }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin || false },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Verify JWT token
export const verifyToken = (token: string): { id: string; email: string; name: string; isAdmin?: boolean } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; isAdmin?: boolean };
    return decoded;
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
    }

    // Load users to check admin status from database
    const { users } = await import('../controllers/auth.controller');
    const userFromDb = users.find(u => u.id === decoded.id);
    
    // STRICT CHECK: Only the admin emails can have admin privileges
    const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
    const isAdminEmail = adminEmails.includes(decoded.email?.toLowerCase() || '');
    const isAdminInDb = userFromDb?.isAdmin === true;
    const isAdmin = isAdminEmail && isAdminInDb;
    
    // Attach user to request with admin status from database
    req.user = {
      ...decoded,
      isAdmin: isAdmin,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next(); // Continue even if auth fails
  }
};

// Authorization middleware - check if user owns resource
export const authorize = (resourceUserId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user owns the resource or is admin
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

// Admin authorization middleware
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Always check from database to ensure admin status is current
  const { users } = await import('../controllers/auth.controller');
  const userFromDb = users.find(u => u.id === req.user?.id);
  
  // STRICT CHECK: Only the admin emails can access admin routes
  const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
  const isAdminEmail = adminEmails.includes(req.user.email?.toLowerCase() || '');
  const isAdminInDb = userFromDb?.isAdmin === true;
  
  if (!userFromDb || !isAdminEmail || !isAdminInDb) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required. Only authorized administrators can access this resource.',
    });
  }

  // Update req.user with latest admin status
  req.user.isAdmin = true;
  next();
};
