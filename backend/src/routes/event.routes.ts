import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from '../controllers/event.controller';
import { validateEvent, validateEventUpdate, validateEventRegistration } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/events - Get all events (public)
router.get('/', optionalAuth, getEvents);

// GET /api/v1/events/:id - Get event by ID (public)
router.get('/:id', optionalAuth, getEventById);

// POST /api/v1/events - Create new event (requires authentication)
router.post('/', authenticate, validateEvent, createEvent);

// PUT /api/v1/events/:id - Update event (requires authentication)
router.put('/:id', authenticate, validateEventUpdate, updateEvent);

// DELETE /api/v1/events/:id - Delete event (requires authentication)
router.delete('/:id', authenticate, deleteEvent);

// POST /api/v1/events/:id/register - Register for event (requires authentication)
router.post('/:id/register', authenticate, validateEventRegistration, registerForEvent);

export default router;
