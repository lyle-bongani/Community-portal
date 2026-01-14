import { Router } from 'express';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';
import eventRoutes from './event.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Route definitions
router.use(`/${API_VERSION}/auth`, authRoutes);
router.use(`/${API_VERSION}/users`, userRoutes);
router.use(`/${API_VERSION}/posts`, postRoutes);
router.use(`/${API_VERSION}/comments`, commentRoutes);
router.use(`/${API_VERSION}/events`, eventRoutes);
router.use(`/${API_VERSION}/admin`, adminRoutes);

// API info endpoint
router.get('/', (_req: any, res: any) => {
  res.json({
    message: 'Community Portal API',
    version: API_VERSION,
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      users: `/api/${API_VERSION}/users`,
      posts: `/api/${API_VERSION}/posts`,
      comments: `/api/${API_VERSION}/comments`,
      events: `/api/${API_VERSION}/events`,
    },
  });
});

export default router;
