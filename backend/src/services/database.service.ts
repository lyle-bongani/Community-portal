import fs from 'fs-extra';
import path from 'path';

// Database directory - use environment variable or default to 'data' in project root
// For Render, you can set DATA_DIR to a persistent path or use Render's disk storage
// If DATA_DIR is set to /persistent/data but persistent disk isn't mounted, fallback to project directory
let DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

// For Render persistent disk: Use /opt/render/project/src/backend/data or /persistent/data
// Try multiple paths to find the best persistent location
if (process.env.NODE_ENV === 'production') {
  const possiblePaths = [
    '/persistent/data', // Render persistent disk (if mounted)
    '/opt/render/project/src/backend/data', // Render project directory
    path.join(process.cwd(), 'data'), // Fallback to current directory
  ];
  
  // Check if DATA_DIR was explicitly set
  if (process.env.DATA_DIR) {
    DB_DIR = process.env.DATA_DIR;
  } else {
    // Try to find the best path
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(path.dirname(testPath)) || testPath.includes('persistent')) {
          DB_DIR = testPath;
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }
  }
}

// If using /persistent path but it doesn't exist, try to create it or fallback
if (DB_DIR.startsWith('/persistent')) {
  try {
    if (!fs.existsSync('/persistent')) {
      console.warn('⚠️  Persistent disk not mounted at /persistent, trying alternative path');
      DB_DIR = '/opt/render/project/src/backend/data';
    }
  } catch (error) {
    console.warn('⚠️  Could not access /persistent, using project directory instead');
    DB_DIR = path.join(process.cwd(), 'data');
  }
}
const USERS_FILE = path.join(DB_DIR, 'users.json');
const POSTS_FILE = path.join(DB_DIR, 'posts.json');
const EVENTS_FILE = path.join(DB_DIR, 'events.json');
const COMMENTS_FILE = path.join(DB_DIR, 'comments.json');

// Log database directory on startup with persistence info
console.log('📁 Database directory:', DB_DIR);
console.log('📁 Database directory exists:', fs.existsSync(DB_DIR));
console.log('💾 Data persistence:', DB_DIR.includes('persistent') || DB_DIR.includes('render') ? 'ENABLED (persistent storage)' : 'LOCAL (may be ephemeral)');

// Ensure database directory exists
const ensureDbDir = async () => {
  await fs.ensureDir(DB_DIR);
};

// Initialize database files with default data if they don't exist
const initializeDatabase = async () => {
  await ensureDbDir();

  // Initialize users file
  if (!(await fs.pathExists(USERS_FILE))) {
    const defaultHashedPassword = '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq';
    const defaultUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: defaultHashedPassword,
        mobileNumber: '+1234567890',
        createdAt: new Date().toISOString(),
        loginCount: 0,
        loginHistory: [],
      },
    ];
    await fs.writeJSON(USERS_FILE, defaultUsers, { spaces: 2 });
  }

  // Initialize posts file
  if (!(await fs.pathExists(POSTS_FILE))) {
    const defaultPosts = [
      {
        id: '1',
        title: 'Welcome to Community Portal',
        content: 'This is the first post in our community portal!',
        authorId: '1',
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.writeJSON(POSTS_FILE, defaultPosts, { spaces: 2 });
  }

  // Initialize events file with 3 default events
  if (!(await fs.pathExists(EVENTS_FILE))) {
    const now = Date.now();
    const defaultEvents = [
      {
        id: '1',
        title: 'Community Meetup',
        description: 'Join us for our monthly community meetup. Network with fellow community members, share ideas, and enjoy refreshments.',
        date: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        location: 'Community Center, Main Hall',
        maxAttendees: 50,
        registeredUsers: ['1'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Tech Workshop: Web Development Basics',
        description: 'Learn the fundamentals of web development in this hands-on workshop. Perfect for beginners who want to start their coding journey.',
        date: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        location: 'Tech Hub, Room 201',
        maxAttendees: 30,
        registeredUsers: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Annual Community Festival',
        description: 'Celebrate our community with food, music, games, and activities for all ages. A day of fun and connection for the whole family!',
        date: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        location: 'Community Park',
        maxAttendees: 200,
        registeredUsers: [],
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.writeJSON(EVENTS_FILE, defaultEvents, { spaces: 2 });
    console.log(`✅ Initialized ${defaultEvents.length} default events`);
  }

  // Initialize comments file
  if (!(await fs.pathExists(COMMENTS_FILE))) {
    await fs.writeJSON(COMMENTS_FILE, [], { spaces: 2 });
  }
};

// Database service
export const database = {
  // Initialize database on startup
  init: async () => {
    await initializeDatabase();
    console.log('📦 Database initialized');
  },

  // Users operations
  users: {
    async read(): Promise<any[]> {
      await ensureDbDir();
      if (await fs.pathExists(USERS_FILE)) {
        return await fs.readJSON(USERS_FILE);
      }
      return [];
    },

    async write(data: any[]): Promise<void> {
      await ensureDbDir();
      try {
        // Use atomic write (write to temp file then rename) for better reliability
        const tempFile = `${USERS_FILE}.tmp`;
        await fs.writeJSON(tempFile, data, { spaces: 2 });
        await fs.move(tempFile, USERS_FILE, { overwrite: true });
        console.log(`✅ Successfully saved ${data.length} users to ${USERS_FILE}`);
      } catch (error: any) {
        console.error(`❌ Failed to save users to ${USERS_FILE}:`, error.message);
        throw error;
      }
    },
  },

  // Posts operations
  posts: {
    async read(): Promise<any[]> {
      await ensureDbDir();
      if (await fs.pathExists(POSTS_FILE)) {
        return await fs.readJSON(POSTS_FILE);
      }
      return [];
    },

    async write(data: any[]): Promise<void> {
      await ensureDbDir();
      try {
        // Use atomic write for better reliability
        const tempFile = `${POSTS_FILE}.tmp`;
        await fs.writeJSON(tempFile, data, { spaces: 2 });
        await fs.move(tempFile, POSTS_FILE, { overwrite: true });
        console.log(`✅ Successfully saved ${data.length} posts to ${POSTS_FILE}`);
      } catch (error: any) {
        console.error(`❌ Failed to save posts to ${POSTS_FILE}:`, error.message);
        throw error;
      }
    },
  },

  // Events operations
  events: {
    async read(): Promise<any[]> {
      await ensureDbDir();
      if (await fs.pathExists(EVENTS_FILE)) {
        return await fs.readJSON(EVENTS_FILE);
      }
      return [];
    },

    async write(data: any[]): Promise<void> {
      await ensureDbDir();
      try {
        // Use atomic write for better reliability
        const tempFile = `${EVENTS_FILE}.tmp`;
        await fs.writeJSON(tempFile, data, { spaces: 2 });
        await fs.move(tempFile, EVENTS_FILE, { overwrite: true });
        console.log(`✅ Successfully saved ${data.length} events to ${EVENTS_FILE}`);
      } catch (error: any) {
        console.error(`❌ Failed to save events to ${EVENTS_FILE}:`, error.message);
        throw error;
      }
    },
  },

  // Comments operations
  comments: {
    async read(): Promise<any[]> {
      await ensureDbDir();
      if (await fs.pathExists(COMMENTS_FILE)) {
        return await fs.readJSON(COMMENTS_FILE);
      }
      return [];
    },

    async write(data: any[]): Promise<void> {
      await ensureDbDir();
      try {
        // Use atomic write for better reliability
        const tempFile = `${COMMENTS_FILE}.tmp`;
        await fs.writeJSON(tempFile, data, { spaces: 2 });
        await fs.move(tempFile, COMMENTS_FILE, { overwrite: true });
        console.log(`✅ Successfully saved ${data.length} comments to ${COMMENTS_FILE}`);
      } catch (error: any) {
        console.error(`❌ Failed to save comments to ${COMMENTS_FILE}:`, error.message);
        throw error;
      }
    },
  },
};

// Initialize database on module load
database.init().catch(console.error);
