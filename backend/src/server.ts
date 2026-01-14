import express, { Application, Request, Response } from 'express';
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

// In production, allow requests from Vercel frontend by default if CORS_ORIGIN not set
const defaultCorsOrigin = NODE_ENV === 'production' 
  ? 'https://community-portal-blue.vercel.app'
  : 'http://localhost:3000';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - supports multiple origins
const corsOrigin = process.env.CORS_ORIGIN || defaultCorsOrigin;
const allowedOrigins = corsOrigin.includes(',') 
  ? corsOrigin.split(',').map(origin => origin.trim())
  : [corsOrigin];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(performanceMonitor); // Performance monitoring
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json({ limit: '10gb' })); // Parse JSON bodies - 10GB limit for general uploads
app.use(express.urlencoded({ extended: true, limit: '10gb' })); // Parse URL-encoded bodies - 10GB limit

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
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
    if (NODE_ENV === 'development') {
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
    } else {
      console.log(`📍 Health check: https://your-backend-url.com/health`);
      console.log(`📍 API endpoint: https://your-backend-url.com/api`);
    }
    console.log(`🔌 WebSocket ready for real-time updates`);
  });
};

startServer().catch(console.error);

export default app;
