# Community Portal - Backend API

## Introduction

The Community Portal Backend is a RESTful API server built with Express.js and TypeScript. It provides the core functionality for a community platform where users can create posts, interact with content (like, comment, save), register for events, and manage their profiles. The backend includes real-time features via WebSocket connections, authentication and authorization, and admin capabilities for managing users, posts, and events.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Real-time Communication**: Socket.IO
- **Data Persistence**: JSON files (fs-extra)
- **Caching**: node-cache
- **Email Service**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Roles

The application supports two user roles:

### Admin Role
- **Access**: Full access to all features including admin dashboard
- **Capabilities**:
  - View and manage all users
  - Delete users (except other admins)
  - View and delete all posts
  - Create, update, and delete events
  - Access admin-only routes and endpoints
  - View user statistics and activity
- **Navigation**: Uses AdminNavbar with dedicated admin interface
- **Routes**: Access to `/admin` dashboard

### User Role (Regular User)
- **Access**: Standard community features
- **Capabilities**:
  - Create, edit, and delete own posts
  - Like and save posts
  - Comment on posts
  - Register for events
  - Manage own profile
  - Upload profile image
- **Navigation**: Uses regular Navbar
- **Routes**: Access to `/dashboard`, `/events`, `/profile`

### Role Assignment
- New users are automatically assigned the **User** role upon registration
- Admin role is assigned only to specific email addresses configured in the system
- Role is checked on every request to ensure proper access control

## Features

### Authentication & Authorization
- User registration with email and password
- JWT-based authentication
- Role-based access control (Admin/User)
- Password hashing with bcryptjs
- Admin user management (create, delete)
- Protected routes with middleware

### Posts Management
- Create, read, update, and delete posts
- Post images support (base64 encoding)
- Like and save posts functionality
- Comments on posts
- Real-time post updates via WebSocket
- Post caching for performance

### Events Management
- Create, read, update, and delete events
- Event registration system
- Event capacity management (max attendees)
- Real-time event notifications
- Event details (title, description, date, location)

### Comments System
- Create comments on posts
- Delete own comments
- Real-time comment updates
- Comment author information

### Real-time Features
- WebSocket server for live updates
- New post notifications
- New event notifications
- Event registration notifications
- Browser notifications support

### Admin Dashboard
- View all users with statistics
- Delete users (except admins)
- View all posts
- Delete posts
- Full CRUD operations for events
- User activity tracking (login count, last login)

### Data Persistence
- JSON file-based storage
- Automatic data persistence
- User data, posts, events, and comments storage
- Data validation and error handling

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── admin.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── event.controller.ts
│   │   ├── post.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/         # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   ├── performance.middleware.ts
│   │   └── validation.ts
│   ├── models/            # Type definitions
│   │   └── types.ts
│   ├── routes/            # API routes
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── event.routes.ts
│   │   ├── post.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/          # Business logic services
│   │   ├── cache.service.ts
│   │   ├── database.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   └── websocket.service.ts
│   ├── utils/             # Utility functions
│   │   └── password.util.ts
│   └── server.ts          # Main server file
├── data/                  # JSON data storage
│   ├── users.json
│   ├── posts.json
│   ├── events.json
│   └── comments.json
├── package.json
├── tsconfig.json
└── README.md
```

## Installation for Local Usage

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create a `.env` file in the backend directory (you can use `env.template` as a reference):

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Step 4: Build TypeScript (Optional)

If you want to build the project:

```bash
npm run build
```

### Step 5: Run the Server

For development (with hot reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Testing the Server

### 1. Verify Server is Running

Check if the server is running by accessing the health check endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Check API Information

Get API information and available endpoints:

```bash
curl http://localhost:5000/api
```

Expected response:
```json
{
  "message": "Community Portal API",
  "version": "v1",
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "posts": "/api/v1/posts",
    "comments": "/api/v1/comments",
    "events": "/api/v1/events"
  }
}
```

### 3. Test User Registration

Register a new user:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "mobileNumber": "+1234567890"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Test Admin Login

Login as admin:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin123"
  }'
```

### 5. Test Protected Endpoints

Get current user profile (requires authentication):

```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token received from login.

### 6. Test Posts Endpoints

Get all posts:
```bash
curl http://localhost:5000/api/v1/posts
```

Create a post (requires authentication):
```bash
curl -X POST http://localhost:5000/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "imageUrl": ""
  }'
```

### 7. Test Events Endpoints

Get all events:
```bash
curl http://localhost:5000/api/v1/events
```

### 8. Test Admin Endpoints

Get all users (admin only):
```bash
curl -X GET http://localhost:5000/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 9. Test WebSocket Connection

You can test WebSocket connections using a WebSocket client or browser console:

```javascript
// In browser console or WebSocket client
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('new-post', (data) => {
  console.log('New post received:', data);
});

socket.on('new-event', (data) => {
  console.log('New event received:', data);
});
```

### 10. Using Postman or Insomnia

For easier testing, you can use API clients like Postman or Insomnia:

1. **Import Collection**: Create a new collection
2. **Set Base URL**: `http://localhost:5000`
3. **Authentication**: 
   - Login first to get a token
   - Add token to request headers: `Authorization: Bearer YOUR_TOKEN`
4. **Test Endpoints**: Create requests for each endpoint

### 11. Common Test Scenarios

#### Scenario 1: Complete User Flow
1. Register a new user
2. Login with credentials
3. Get user profile
4. Create a post
5. Like a post
6. Comment on a post
7. Register for an event

#### Scenario 2: Admin Flow
1. Login as admin (`admin@gmail.com` / `admin123`)
2. Get all users
3. Get all posts
4. Create an event
5. Delete a post (if needed)

#### Scenario 3: Error Handling
1. Try to register with existing email (should fail)
2. Try to login with wrong password (should fail)
3. Try to access protected route without token (should fail)
4. Try to access admin route as regular user (should fail)

### 12. Testing with npm scripts (if available)

If you have test scripts configured:

```bash
npm test
```

### 13. Verify Data Persistence

After testing, check that data is saved in JSON files:

```bash
# Check users
cat data/users.json

# Check posts
cat data/posts.json

# Check events
cat data/events.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### Posts
- `GET /api/v1/posts` - Get all posts
- `POST /api/v1/posts` - Create a new post (authenticated)
- `GET /api/v1/posts/:id` - Get a specific post
- `PUT /api/v1/posts/:id` - Update a post (authenticated, owner only)
- `DELETE /api/v1/posts/:id` - Delete a post (authenticated, owner only)
- `POST /api/v1/posts/:id/like` - Like/unlike a post (authenticated)
- `POST /api/v1/posts/:id/save` - Save/unsave a post (authenticated)

### Comments
- `GET /api/v1/posts/:postId/comments` - Get comments for a post
- `POST /api/v1/posts/:postId/comments` - Create a comment (authenticated)
- `PUT /api/v1/comments/:id` - Update a comment (authenticated, owner only)
- `DELETE /api/v1/comments/:id` - Delete a comment (authenticated, owner only)

### Events
- `GET /api/v1/events` - Get all events
- `POST /api/v1/events/:id/register` - Register for an event (authenticated)
- `GET /api/v1/events/:id` - Get a specific event

### Users
- `GET /api/v1/users/me` - Get current user profile (authenticated)
- `PUT /api/v1/users/me` - Update user profile (authenticated)
- `POST /api/v1/users/profile-image` - Update profile image (authenticated)

### Admin (Admin only)
- `GET /api/v1/admin/users` - Get all users
- `DELETE /api/v1/admin/users/:id` - Delete a user
- `GET /api/v1/admin/posts` - Get all posts
- `DELETE /api/v1/admin/posts/:id` - Delete a post
- `GET /api/v1/admin/events` - Get all events
- `POST /api/v1/admin/events` - Create an event
- `PUT /api/v1/admin/events/:id` - Update an event
- `DELETE /api/v1/admin/events/:id` - Delete an event

## Admin Credentials

Default admin account for testing:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> **Note**: Admin role is assigned to specific email addresses. Only users with admin email addresses can access admin features.

## WebSocket Events

The server emits the following WebSocket events:

- `new-post` - When a new post is created
- `new-event` - When a new event is created
- `event-registration` - When a user registers for an event

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `users.json` - User accounts and profiles
- `posts.json` - All posts
- `events.json` - All events
- `comments.json` - All comments

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS enabled for frontend communication
- Helmet.js for security headers
- Input validation with express-validator
- Role-based access control (RBAC)
- Admin-only routes protection

## Development

- TypeScript for type safety
- Hot reload with `tsx watch`
- ESLint for code quality
- Error handling middleware
- Performance monitoring middleware

## Notes

- The backend uses JSON file storage for simplicity. For production, consider migrating to a database (MongoDB, PostgreSQL, etc.)
- Profile images are stored as base64 strings. For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- WebSocket connections are managed via Socket.IO for real-time features
