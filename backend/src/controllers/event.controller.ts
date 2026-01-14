import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEventRegistrationEmail } from '../services/email.service';
import { users, loadUsers } from './auth.controller';
import { cacheService, cacheKeys } from '../services/cache.service';
import { database } from '../services/database.service';
import { notifyNewEvent, notifyEventRegistration } from '../services/websocket.service';

// Load events from database
let events: any[] = [];

// Initialize events from database
const loadEvents = async () => {
  try {
    events = await database.events.read();
    // Convert date strings back to Date objects if needed
    events = events.map(event => ({
      ...event,
      date: event.date,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
    }));
  } catch (error) {
    console.error('Error loading events:', error);
    events = [];
  }
};

// Save events to database
const saveEvents = async () => {
  try {
    await database.events.write(events);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

// Load events on startup
loadEvents();

// GET /api/v1/events
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Reload from database to get latest data
    await loadEvents();

    // Clear cache to ensure fresh data
    cacheService.del(cacheKeys.events.all);

    // Cache the fresh events
    cacheService.set(cacheKeys.events.all, events, { ttl: 300 }); // 5 minutes

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/events/:id
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Reload from database to get latest data
    await loadEvents();
    
    // Check cache first
    const cachedEvent = cacheService.get(cacheKeys.events.byId(id));
    if (cachedEvent) {
      return res.status(200).json({
        success: true,
        data: cachedEvent,
        cached: true,
      });
    }

    const event = events.find((e) => e.id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with id ${id} not found`,
      });
    }

    // Cache the event
    cacheService.set(cacheKeys.events.byId(id), event, { ttl: 300 });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/events
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, location, maxAttendees } = req.body;
    
    // Generate new ID
    const maxId = events.length > 0 
      ? Math.max(...events.map(e => parseInt(e.id) || 0))
      : 0;
    
    const newEvent = {
      id: String(maxId + 1),
      title,
      description,
      date,
      location,
      maxAttendees: maxAttendees || 100,
      registeredUsers: [],
      createdAt: new Date(),
    };

    events.push(newEvent);

    // Save to database
    await saveEvents();

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);
    cacheService.del(cacheKeys.events.upcoming);

    // Notify all clients about new event
    notifyNewEvent(newEvent);

    res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/events/:id
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, maxAttendees } = req.body;
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Event with id ${id} not found`,
      });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      title: title || events[eventIndex].title,
      description: description || events[eventIndex].description,
      date: date || events[eventIndex].date,
      location: location || events[eventIndex].location,
      maxAttendees: maxAttendees || events[eventIndex].maxAttendees,
      updatedAt: new Date(),
    };

    // Save to database
    await saveEvents();

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);
    cacheService.del(cacheKeys.events.byId(id));
    cacheService.del(cacheKeys.events.upcoming);

    res.status(200).json({
      success: true,
      data: events[eventIndex],
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/events/:id
export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Event with id ${id} not found`,
      });
    }

    events.splice(eventIndex, 1);

    // Save to database
    await saveEvents();

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);
    cacheService.del(cacheKeys.events.byId(id));
    cacheService.del(cacheKeys.events.upcoming);

    res.status(200).json({
      success: true,
      message: `Event with id ${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/events/:id/register
export const registerForEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Get userId from authenticated user instead of body
    const userId = req.user?.id || req.body.userId;
    
    // Reload events from database to get latest data
    await loadEvents();
    
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Event with id ${id} not found`,
      });
    }

    const event = events[eventIndex];

    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered for this event',
      });
    }

    if (event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    // Reload users from database to get latest data
    await loadUsers();

    // Find user for notifications
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if this is the user's first event registration
    // Count how many events the user is already registered for (excluding current event)
    const userEventRegistrations = events.filter(e => 
      e.id !== id && e.registeredUsers.includes(userId)
    ).length;
    const isFirstTimeRegistration = userEventRegistrations === 0;

    // Register user for event
    event.registeredUsers.push(userId);

    // Save to database
    await saveEvents();

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);
    cacheService.del(cacheKeys.events.byId(id));
    cacheService.del(cacheKeys.events.upcoming);

    // Notify all clients about event registration
    notifyEventRegistration(event, userId);

    // Send email notification asynchronously (don't wait for it)
    console.log('📧 Starting email notification...');
    console.log('📧 User email:', user.email);
    console.log('📧 Is first-time registration:', isFirstTimeRegistration);
    
    // Send email confirmation (with special message for first-time registrations)
    sendEventRegistrationEmail(
      user.email,
      user.name,
      event.title,
      event.date,
      event.location,
      isFirstTimeRegistration
    ).then((result) => {
      console.log('📧 Email notification result:', result ? 'Success' : 'Failed');
      if (isFirstTimeRegistration) {
        console.log('🎉 First-time registration email sent!');
      }
    }).catch((error) => {
      console.error('📧 Email notification error:', error);
      // Don't fail the request if email fails (notifications are optional)
    });

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event. Confirmation email sent.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
