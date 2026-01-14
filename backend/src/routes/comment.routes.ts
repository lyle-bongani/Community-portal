import { Router } from 'express';
import {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
import { validateComment, validateCommentUpdate } from '../middleware/validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/comments - Get all comments
router.get('/', getComments);

// GET /api/v1/comments/:id - Get comment by ID
router.get('/:id', getCommentById);

// POST /api/v1/comments - Create new comment (requires authentication)
router.post('/', authenticate, validateComment, createComment);

// PUT /api/v1/comments/:id - Update comment (requires authentication + authorization)
router.put('/:id', authenticate, validateCommentUpdate, updateComment);

// DELETE /api/v1/comments/:id - Delete comment (requires authentication + authorization)
router.delete('/:id', authenticate, deleteComment);

export default router;
