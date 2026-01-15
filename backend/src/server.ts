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
  // Check email configuration (API takes priority over SMTP)
  if (process.env.EMAIL_API_KEY) {
    console.log('📧 Email service: CONFIGURED (API-based - Render-compatible)');
    console.log(`📧 Service: ${process.env.EMAIL_SERVICE || 'resend'}`);
    console.log(`📧 From: ${process.env.SMTP_FROM || 'Community Portal <noreply@communityportal.com>'}`);
    console.log('✅ API-based email service ready (works on Render free tier)');
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Email service: CONFIGURED (SMTP)');
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    console.log(`📧 SMTP Port: ${process.env.SMTP_PORT || '587'}`);
    console.log(`📧 SMTP From: ${process.env.SMTP_FROM || 'Community Portal <noreply@communityportal.com>'}`);
    console.warn('⚠️  Note: SMTP ports are BLOCKED on Render free tier!');
    console.warn('⚠️  Use EMAIL_API_KEY for Render free tier, or upgrade to paid plan');
    
    // Verify SMTP connection (only for local/dev)
    if (process.env.NODE_ENV === 'development') {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
      } catch (error: any) {
        console.error('❌ SMTP connection verification failed:', error.message);
        console.error('❌ Check your SMTP credentials in environment variables');
      }
    }
  } else {
    console.log('📧 Email service: NOT CONFIGURED (emails will be logged only)');
    console.log('💡 To enable email sending:');
    console.log('   - For Render free tier: Set EMAIL_SERVICE and EMAIL_API_KEY');
    console.log('   - For local/paid Render: Set SMTP_HOST, SMTP_USER, and SMTP_PASS');
  }

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
