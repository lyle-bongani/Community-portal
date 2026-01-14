import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle "Request Entity Too Large" error
  if (err.message && err.message.includes('request entity too large')) {
    return res.status(413).json({
      success: false,
      status: 'error',
      message: 'File size too large. Maximum upload size is 10GB. For images, the limit is 50MB.',
    });
  }

  // Handle JSON payload too large
  if (err.type === 'entity.parse.failed' || err.statusCode === 413) {
    return res.status(413).json({
      success: false,
      status: 'error',
      message: 'Request payload too large. Maximum upload size is 10GB. For images, the limit is 50MB.',
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    success: false,
    status,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
