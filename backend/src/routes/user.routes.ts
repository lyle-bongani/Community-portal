import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { validateUser, validateUserUpdate } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/users - Get all users (public, but optional auth)
router.get('/', optionalAuth, getUsers);

// GET /api/v1/users/:id - Get user by ID (public)
router.get('/:id', optionalAuth, getUserById);

// POST /api/v1/users - Create new user (public - registration)
router.post('/', validateUser, createUser);

// PUT /api/v1/users/:id - Update user (requires authentication + authorization)
router.put('/:id', authenticate, validateUserUpdate, updateUser);

// DELETE /api/v1/users/:id - Delete user (requires authentication + authorization)
router.delete('/:id', authenticate, deleteUser);

export default router;
