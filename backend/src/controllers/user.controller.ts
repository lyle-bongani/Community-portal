import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { users, loadUsers, saveUsers } from './auth.controller';
import { cacheService, cacheKeys } from '../services/cache.service';

// Use shared users array from auth controller
// In production, this would be a database

// GET /api/v1/users
export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check cache first
    const cachedUsers = cacheService.get(cacheKeys.users.all);
    if (cachedUsers) {
      return res.status(200).json({
        success: true,
        count: (cachedUsers as any[]).length,
        data: cachedUsers,
        cached: true,
      });
    }

    // Remove passwords before sending
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    // Cache the users
    cacheService.set(cacheKeys.users.all, usersWithoutPasswords, { ttl: 300 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: usersWithoutPasswords,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/users/:id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Reload from database to get latest data
    await loadUsers();
    
    // Check cache first
    const cachedUser = cacheService.get(cacheKeys.users.byId(id));
    if (cachedUser) {
      return res.status(200).json({
        success: true,
        data: cachedUser,
        cached: true,
      });
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    // Remove password before sending, but keep login information
    const { password, ...userWithoutPassword } = user;
    // Ensure login tracking fields are included
    userWithoutPassword.lastLogin = user.lastLogin;
    userWithoutPassword.loginCount = user.loginCount || 0;
    userWithoutPassword.loginHistory = user.loginHistory || [];

    // Cache the user
    cacheService.set(cacheKeys.users.byId(id), userWithoutPassword, { ttl: 300 });

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, mobileNumber } = req.body;
    
    // Check if user already exists by email (email is unique identifier)
    const existingUserByEmail = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists. Each user must have a unique email address.',
      });
    }

    // Check if phone number already exists (phone number is also unique identifier)
    // Multiple users can have the same name, but must have different email AND phone
    if (mobileNumber) {
      const existingUserByPhone = users.find((u) => u.mobileNumber === mobileNumber);
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists. Each user must have a unique email and phone number.',
        });
      }
    }

    // Generate new ID based on highest existing ID
    const maxId = users.length > 0 
      ? Math.max(...users.map(u => parseInt(u.id) || 0))
      : 0;
    
    const newUser = {
      id: String(maxId + 1),
      name,
      email: email.toLowerCase(), // Store email in lowercase for consistency
      password: password || undefined, // In production, hash this password
      mobileNumber: mobileNumber || undefined,
      isAdmin: false, // Explicitly set to false - only admin email can be admin
      createdAt: new Date(),
      loginCount: 0,
      loginHistory: [],
    };

    users.push(newUser);

    // Invalidate cache
    cacheService.del(cacheKeys.users.all);

    // Don't send password in response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, profileImage } = req.body;
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    // Check authorization - only user can update their own profile
    if (req.user && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this user',
      });
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      profileImage: profileImage !== undefined ? profileImage : users[userIndex].profileImage,
      updatedAt: new Date(),
    };

    // Save to database
    await saveUsers();

    // Invalidate cache
    cacheService.del(cacheKeys.users.all);
    cacheService.del(cacheKeys.users.byId(id));

    // Remove password from response
    const { password, ...userResponse } = users[userIndex];

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/v1/users/:id
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    // Check authorization - only user can delete their own account
    if (req.user && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this user',
      });
    }

    users.splice(userIndex, 1);

    // Save to database
    await saveUsers();

    // Invalidate cache
    cacheService.del(cacheKeys.users.all);
    cacheService.del(cacheKeys.users.byId(id));

    res.status(200).json({
      success: true,
      message: `User with id ${id} deleted successfully`,
    });
  } catch (error) {
    return next(error);
  }
};
