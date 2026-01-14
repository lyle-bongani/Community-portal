import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middleware/validation';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validateRegister, register);

// POST /api/v1/auth/login
router.post('/login', validateLogin, login);

export default router;
