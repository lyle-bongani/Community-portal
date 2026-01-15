import { Request, Response, NextFunction } from 'express';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../middleware/auth.middleware';
import { database } from '../services/database.service';

const NODE_ENV = process.env.NODE_ENV || 'development';

// Load users from database
let users: any[] = [];

// Initialize users from database
const loadUsers = async () => {
  try {
    users = await database.users.read();
    // Convert date strings back to Date objects if needed
    users = users.map(user => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      loginHistory: user.loginHistory || [],
    }));
    
    // Set up admin users
    const adminUsers = [
      { email: 'lylechadya72@gmail.com', password: 'lyle142007', name: 'Admin' },
      { email: 'admin@gmail.com', password: 'admin123', name: 'Admin' },
    ];
    
    const adminEmails = adminUsers.map(au => au.email.toLowerCase());
    let needsSave = false;
    
    for (const adminConfig of adminUsers) {
      const adminUser = users.find(u => u.email.toLowerCase() === adminConfig.email.toLowerCase());
      
      if (adminUser) {
        // Update admin user if exists
        if (!adminUser.isAdmin) {
          adminUser.isAdmin = true;
          needsSave = true;
        }
        // Update password if needed (hash it)
        if (!adminUser.password || !adminUser.password.startsWith('$2a$')) {
          adminUser.password = await hashPassword(adminConfig.password);
          needsSave = true;
        }
      } else {
        // Create admin user if doesn't exist
        const maxId = users.length > 0 
          ? Math.max(...users.map(u => parseInt(u.id) || 0))
          : 0;
        
        const hashedPassword = await hashPassword(adminConfig.password);
        const newAdminUser = {
          id: String(maxId + 1),
          name: adminConfig.name,
          email: adminConfig.email.toLowerCase(),
          password: hashedPassword,
          mobileNumber: '',
          isAdmin: true,
          createdAt: new Date(),
          loginCount: 0,
          loginHistory: [],
        };
        
        users.push(newAdminUser);
        needsSave = true;
      }
    }
    
    // CRITICAL: Remove admin status from all users who are NOT in the admin emails list
    for (const user of users) {
      const userEmail = user.email?.toLowerCase() || '';
      if (!adminEmails.includes(userEmail) && user.isAdmin === true) {
        user.isAdmin = false;
        needsSave = true;
      }
    }
    
    if (needsSave) {
      await saveUsers();
    }
    
    // Hash default user password if needed
    if (users.length > 0 && users[0].password && users[0].password.startsWith('$2a$')) {
      // Password already hashed
    } else if (users.length > 0 && !users[0].isAdmin) {
      // Hash password for default user (if not admin)
      const hashed = await hashPassword('password123');
      users[0].password = hashed;
      await saveUsers();
    }
  } catch (error) {
    console.error('Error loading users:', error);
    users = [];
  }
};

// Save users to database
const saveUsers = async () => {
  try {
    await database.users.write(users);
    console.log(`✅ Users saved successfully. Total users: ${users.length}`);
  } catch (error: any) {
    console.error('❌ Error saving users:', error);
    console.error('❌ Error details:', error.message);
    throw error; // Re-throw to let callers know save failed
  }
};

// Load users on startup
loadUsers();

// Export users array so it can be shared with user controller
export { users, loadUsers, saveUsers };

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, confirmPassword, mobileNumber } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

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
    const existingUserByPhone = users.find((u) => u.mobileNumber === mobileNumber);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists. Each user must have a unique email and phone number.',
      });
    }

    // Generate new ID based on highest existing ID
    const maxId = users.length > 0 
      ? Math.max(...users.map(u => parseInt(u.id) || 0))
      : 0;
    
    // Hash password
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: String(maxId + 1),
      name,
      email: email.toLowerCase(), // Store email in lowercase for consistency
      password: hashedPassword,
      mobileNumber,
      isAdmin: false, // Explicitly set to false for all new users
      createdAt: new Date(),
      loginCount: 0,
      loginHistory: [],
    };

    users.push(newUser);

    // Save to database
    try {
      await saveUsers();
      console.log(`✅ New user registered: ${newUser.email} (ID: ${newUser.id})`);
    } catch (error: any) {
      console.error(`❌ Failed to save user ${newUser.email} to database:`, error);
      // Remove user from memory if save failed
      users.pop();
      return res.status(500).json({
        success: false,
        message: 'Failed to save user. Please try again or contact support.',
        error: NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    // Don't send password in response
    const { password: _, ...userResponse } = newUser;

    // Ensure only the admin emails can have admin privileges (even if somehow set)
    const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
    const isAdminUser = adminEmails.includes(newUser.email.toLowerCase()) && newUser.isAdmin === true;
    userResponse.isAdmin = isAdminUser;

    // Generate JWT token
    const token = generateToken({
      id: userResponse.id,
      email: userResponse.email,
      name: userResponse.name,
      isAdmin: isAdminUser,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token, // Include token in response
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user by email (case-insensitive)
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password with hash
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Track login information
    const now = new Date();
    const clientIp = req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Update login tracking
    user.lastLogin = now;
    user.loginCount = (user.loginCount || 0) + 1;
    
    // Add to login history (keep last 10 logins)
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      timestamp: now,
      ipAddress: Array.isArray(clientIp) ? clientIp[0] : String(clientIp),
      userAgent: userAgent,
    });
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    user.updatedAt = now;

    // Save to database
    await saveUsers();

    // Don't send password in response
    const { password: _, ...userResponse } = user;

    // Ensure only the admin emails have admin privileges
    const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
    const isAdminUser = adminEmails.includes(user.email.toLowerCase()) && user.isAdmin === true;
    userResponse.isAdmin = isAdminUser;

    // Generate JWT token
    const token = generateToken({
      id: userResponse.id,
      email: userResponse.email,
      name: userResponse.name,
      isAdmin: isAdminUser,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token, // Include token in response
    });
  } catch (error) {
    return next(error);
  }
};
