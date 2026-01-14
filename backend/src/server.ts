import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { performanceMonitor } from './middleware/performance.middleware';
import { initializeWebSocket } from './services/websocket.service';
import { database } from './services/database.service';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(performanceMonitor); // Performance monitoring
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json({ limit: '10gb' })); // Parse JSON bodies - 10GB limit for general uploads
app.use(express.urlencoded({ extended: true, limit: '10gb' })); // Parse URL-encoded bodies - 10GB limit

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and WebSocket
const startServer = async () => {
  // Initialize database
  await database.init();

  // Initialize WebSocket
  initializeWebSocket(httpServer);

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket ready for real-time updates`);
  });
};

startServer().catch(console.error);

export default app;
