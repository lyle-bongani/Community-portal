import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.end to measure response time
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime;
    
    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }

    // Add performance header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Call original end
    if (typeof chunk === 'function') {
      return originalEnd(chunk);
    } else if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    } else {
      return originalEnd(chunk, encoding, cb);
    }
  };

  next();
};

// Compression would be added here if using express-compression
// For now, we'll rely on HTTP compression if configured at server level
