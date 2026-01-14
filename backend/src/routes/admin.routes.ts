import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getAllUsers,
  deleteUser,
  getAllPosts,
  deletePost,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Post management
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

// Event management
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
