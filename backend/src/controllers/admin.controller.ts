import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { users, loadUsers, saveUsers } from './auth.controller';
import { database } from '../services/database.service';
import { cacheService, cacheKeys } from '../services/cache.service';

// Load posts from database
let posts: any[] = [];
let events: any[] = [];

const loadPosts = async () => {
  try {
    posts = await database.posts.read();
  } catch (error) {
    console.error('Error loading posts:', error);
    posts = [];
  }
};

const loadEvents = async () => {
  try {
    events = await database.events.read();
  } catch (error) {
    console.error('Error loading events:', error);
    events = [];
  }
};

// Initialize on startup
loadPosts();
loadEvents();

// GET /api/v1/admin/users
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await loadUsers();
    
    // Remove passwords before sending
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.status(200).json({
      success: true,
      count: users.length,
      data: usersWithoutPasswords,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await loadUsers();
    
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow deleting admin users
    if (users[userIndex].isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    users.splice(userIndex, 1);
    await saveUsers();

    // Invalidate cache
    cacheService.del(cacheKeys.users.all);
    cacheService.del(cacheKeys.users.byId(id));

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/posts
export const getAllPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await loadPosts();
    
    // Enrich posts with author information
    const postsWithAuthors = posts.map(post => {
      const author = users.find((u) => u.id === post.authorId);
      return {
        ...post,
        author: author
          ? {
              id: author.id,
              name: author.name,
              email: author.email,
              profileImage: author.profileImage,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: postsWithAuthors,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/admin/posts/:id
export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await loadPosts();
    
    const postIndex = posts.findIndex((p) => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    posts.splice(postIndex, 1);
    await database.posts.write(posts);

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byId(id));

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/events
export const getAllEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await loadEvents();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/events
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, location, maxAttendees } = req.body;

    if (!title || !description || !date || !location || !maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    await loadEvents();

    // Generate new ID
    const maxId = events.length > 0 
      ? Math.max(...events.map(e => parseInt(e.id) || 0))
      : 0;

    const newEvent = {
      id: String(maxId + 1),
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      maxAttendees: parseInt(maxAttendees),
      registeredUsers: [],
      createdAt: new Date().toISOString(),
    };

    events.push(newEvent);
    await database.events.write(events);

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/admin/events/:id
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, maxAttendees } = req.body;

    await loadEvents();

    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Update event
    events[eventIndex] = {
      ...events[eventIndex],
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date: new Date(date).toISOString() }),
      ...(location && { location }),
      ...(maxAttendees && { maxAttendees: parseInt(maxAttendees) }),
      updatedAt: new Date().toISOString(),
    };

    await database.events.write(events);

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: events[eventIndex],
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/admin/events/:id
export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await loadEvents();
    
    const eventIndex = events.findIndex((e) => e.id === id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    events.splice(eventIndex, 1);
    await database.events.write(events);

    // Invalidate cache
    cacheService.del(cacheKeys.events.all);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
