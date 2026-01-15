import fs from 'fs-extra';
import path from 'path';

// Database directory - use environment variable or default to 'data' in project root
// For Render, you can set DATA_DIR to a persistent path or use Render's disk storage
// If DATA_DIR is set to /persistent/data but persistent disk isn't mounted, fallback to project directory
let DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

// If using /persistent path but it doesn't exist, fallback to project directory
if (DB_DIR.startsWith('/persistent') && !fs.existsSync('/persistent')) {
  console.warn('⚠️  Persistent disk not mounted at /persistent, using project directory instead');
  DB_DIR = path.join(process.cwd(), 'data');
}
const USERS_FILE = path.join(DB_DIR, 'users.json');
const POSTS_FILE = path.join(DB_DIR, 'posts.json');
const EVENTS_FILE = path.join(DB_DIR, 'events.json');
const COMMENTS_FILE = path.join(DB_DIR, 'comments.json');

// Log database directory on startup
console.log('📁 Database directory:', DB_DIR);
console.log('📁 Database directory exists:', fs.existsSync(DB_DIR));

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

  // Initialize events file
  if (!(await fs.pathExists(EVENTS_FILE))) {
    const defaultEvents = [
      {
        id: '1',
        title: 'Community Meetup',
        description: 'Join us for our monthly community meetup',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Community Center',
        maxAttendees: 50,
        registeredUsers: ['1'],
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.writeJSON(EVENTS_FILE, defaultEvents, { spaces: 2 });
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
        await fs.writeJSON(USERS_FILE, data, { spaces: 2 });
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
        await fs.writeJSON(POSTS_FILE, data, { spaces: 2 });
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
        await fs.writeJSON(EVENTS_FILE, data, { spaces: 2 });
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
        await fs.writeJSON(COMMENTS_FILE, data, { spaces: 2 });
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
