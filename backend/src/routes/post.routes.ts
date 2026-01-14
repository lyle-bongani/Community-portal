import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
} from '../controllers/post.controller';
import { validatePost, validatePostUpdate } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/posts - Get all posts (public, but optional auth for personalized content)
router.get('/', optionalAuth, getPosts);

// GET /api/v1/posts/:id - Get post by ID (public)
router.get('/:id', optionalAuth, getPostById);

// POST /api/v1/posts - Create new post (requires authentication)
router.post('/', authenticate, validatePost, createPost);

// PUT /api/v1/posts/:id - Update post (requires authentication + authorization)
router.put('/:id', authenticate, validatePostUpdate, updatePost);

// DELETE /api/v1/posts/:id - Delete post (requires authentication + authorization)
router.delete('/:id', authenticate, deletePost);

// POST /api/v1/posts/:id/like - Like or unlike a post (requires authentication)
router.post('/:id/like', authenticate, toggleLike);

// POST /api/v1/posts/:id/save - Save or unsave a post (requires authentication)
router.post('/:id/save', authenticate, toggleSave);

export default router;
