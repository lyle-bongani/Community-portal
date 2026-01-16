# Community Portal

A full-stack community platform built with Next.js and Express.js, featuring real-time updates, user authentication, posts management, events, and an admin dashboard.

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Roles](#roles)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Admin Credentials](#admin-credentials)
- [Development](#development)

## Introduction

The Community Portal is a complete community platform consisting of:

- **Backend API**: A RESTful API server built with Express.js and TypeScript that provides core functionality for posts, events, user management, and real-time features via WebSocket connections.

- **Frontend Application**: A modern, responsive web application built with Next.js 16 and React 19 that provides a user-friendly interface for community interaction, admin management, and real-time updates.

## Tech Stack

### Backend
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

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Real-time Communication**: Socket.IO Client
- **Icons**: Material-UI Icons
- **Language**: TypeScript
- **State Management**: React Context API
- **HTTP Client**: Fetch API

## Roles

The application supports two user roles with different access levels:

### Admin Role
- **Access**: Full administrative access
- **Backend Capabilities**:
  - View and manage all users
  - Delete users (except other admins)
  - View and delete all posts
  - Create, update, and delete events
  - Access admin-only routes and endpoints
  - View user statistics and activity
- **Frontend Features**:
  - Access to admin dashboard (`/admin`)
  - Uses `AdminNavbar` component
  - Separate admin portal branding
  - Admin-specific navigation
- **Redirect**: Automatically redirected to `/admin` after login

### User Role (Regular User)
- **Access**: Standard community features
- **Backend Capabilities**:
  - Create, edit, and delete own posts
  - Like and save posts
  - Comment on posts
  - Register for events
  - Manage own profile
  - Upload profile image
- **Frontend Features**:
  - Uses regular `Navbar` component
  - Standard community portal branding
  - User-focused navigation
  - Access to `/dashboard`, `/events`, `/profile`
- **Redirect**: Automatically redirected to `/dashboard` after login

### Role Assignment
- New users are automatically assigned the **User** role upon registration
- Admin role is assigned only to specific email addresses configured in the system
- Role is checked on every request (both frontend and backend) to ensure proper access control

## Features

### Authentication & Authorization
- User registration with email, password, and mobile number
- JWT-based authentication
- Role-based access control (Admin/User)
- Password hashing with bcryptjs
- Protected routes with middleware
- Session management with localStorage
- Automatic redirect based on user role

### Posts Management
- Create, read, update, and delete posts
- Post images support (base64 encoding)
- Like and save posts functionality
- Comments on posts
- Share posts via social media or copy link
- Full-size image popup on click
- Real-time post updates via WebSocket
- Post caching for performance
- Post statistics (likes, saves, comments)

### Events Management
- Create, read, update, and delete events
- Event registration system
- Event capacity management (max attendees)
- Real-time event notifications
- Event details (title, description, date, location)
- View registered events

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
- Real-time post feed updates without page refresh

### Admin Dashboard
- View all users with detailed information
- Delete users (except other admins)
- View all posts
- Delete any post
- Full CRUD operations for events
- User activity tracking (login count, last login)
- Admin-only access protection

### Profile Management
- View personal profile information
- Upload and change profile image
- View own posts
- View saved posts
- View registered events
- Profile statistics (posts count, likes received, saved posts, events)
- Member since and last login information

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Modern and clean interface
- Smooth animations with Framer Motion
- Custom scrollbars
- Image modals for full-size viewing
- Share modals with social media links
- Loading states and error handling
- Toast notifications

## Project Structure

```
community-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Custom middleware
│   │   ├── models/            # Type definitions
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main server file
│   ├── data/                  # JSON data storage
│   │   ├── users.json
│   │   ├── posts.json
│   │   ├── events.json
│   │   └── comments.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/
    ├── app/                    # Next.js App Router pages
    │   ├── admin/             # Admin dashboard
    │   ├── dashboard/         # User dashboard
    │   ├── events/            # Events page
    │   ├── login/             # Login page
    │   ├── profile/           # User profile
    │   ├── register/          # Registration page
    │   ├── page.tsx           # Landing page
    │   └── layout.tsx         # Root layout
    ├── components/            # React components
    │   ├── auth/              # Authentication components
    │   ├── common/            # Common components
    │   ├── events/            # Event components
    │   ├── landing/           # Landing page components
    │   ├── posts/             # Post components
    │   └── profile/           # Profile components
    ├── context/               # React Context providers
    ├── lib/                   # Utilities and helpers
    ├── public/                 # Static assets
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Backend Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (use `env.template` as reference):
```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

4. (Optional) Build TypeScript:
```bash
npm run build
```

### Frontend Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env.local` file for local development:
```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# For production (set in Vercel environment variables, or defaults to Render URL)
# NEXT_PUBLIC_API_URL=https://community-portal-9uek.onrender.com/api/v1
# NEXT_PUBLIC_WS_URL=https://community-portal-9uek.onrender.com
```

## Running the Application

### Start Backend Server

For development (with hot reload):
```bash
cd backend
npm run dev
```

For production:
```bash
cd backend
npm start
```

The backend server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Start Frontend Application

For development:
```bash
cd frontend
npm run dev
```

The frontend application will start on `http://localhost:3000`

For production:
```bash
cd frontend
npm run build
npm start
```

### Running Both Together

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Testing

### Testing the Backend Server

#### 1. Verify Server is Running

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

#### 2. Check API Information

```bash
curl http://localhost:5000/api
```

#### 3. Test Admin Login

**Local Testing:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin123"
  }'
```

**Server Testing:**
```bash
curl -X POST https://community-portal-9uek.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin123"
  }'
```

#### 4. Test Protected Endpoints

**Local Testing:**
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Server Testing:**
```bash
curl -X GET https://community-portal-9uek.onrender.com/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Test WebSocket Connection

```javascript
// In browser console or WebSocket client
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('new-post', (data) => {
  console.log('New post received:', data);
});
```

### Testing the Frontend

1. Open `http://localhost:3000` in your browser
2. Register a new user or login with existing credentials
3. Test creating posts, liking, commenting
4. Test event registration
5. Login as admin to test admin features

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

## API URLs

### Local Development
- **API URL**: `http://localhost:5000/api/v1`
- **WebSocket URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

### Production Server
- **API URL**: `https://community-portal-9uek.onrender.com/api/v1`
- **WebSocket URL**: `https://community-portal-9uek.onrender.com`
- **Health Check**: `https://community-portal-9uek.onrender.com/health`

## WebSocket Events

The server emits the following WebSocket events:

- `new-post` - When a new post is created
- `new-event` - When a new event is created
- `event-registration` - When a user registers for an event

## Data Storage

Data is stored in JSON files in the `backend/data/` directory:
- `users.json` - User accounts and profiles
- `posts.json` - All posts
- `events.json` - All events (includes 3 default events on initialization)
- `comments.json` - All comments

### Data Persistence

The application includes robust data persistence features:
- **Local Development**: Data is stored in `backend/data/` directory
- **Production (Render)**: Supports persistent disk storage at `/persistent/data` or `/opt/render/project/src/backend/data`
- **Automatic Fallback**: If persistent disk is not available, falls back to project directory
- **Atomic Writes**: All data writes are atomic to prevent corruption
- **Default Events**: System initializes with 3 default events if none exist:
  1. Community Meetup
  2. Tech Workshop: Web Development Basics
  3. Annual Community Festival

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS enabled for frontend communication
- Helmet.js for security headers
- Input validation with express-validator
- Role-based access control (RBAC)
- Admin-only routes protection

## Development

### Backend Development
- TypeScript for type safety
- Hot reload with `tsx watch`
- ESLint for code quality
- Error handling middleware
- Performance monitoring middleware

### Frontend Development
- Uses Next.js App Router (not Pages Router)
- Server and Client components separation
- TypeScript for type safety
- ESLint for code quality
- Hot module replacement in development

## Notes

### Backend
- The backend uses JSON file storage for simplicity. For production, consider migrating to a database (MongoDB, PostgreSQL, etc.)
- Profile images are stored as base64 strings. For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- WebSocket connections are managed via Socket.IO for real-time features

### Frontend
- **Local Development**: The frontend expects the backend to be running on `http://localhost:5000` by default
- **Production**: 
  - Frontend URL: `https://www.communityportal.online`
  - Backend URL: `https://community-portal-9uek.onrender.com`
  - Default API URL: `https://community-portal-9uek.onrender.com/api/v1`
  - Default WebSocket URL: `https://community-portal-9uek.onrender.com`
  - Can be overridden by setting `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` in Vercel environment variables
- Profile images are stored as base64 strings (consider cloud storage for production)
- WebSocket connection is established automatically on app load
- LocalStorage is used for session management (consider more secure options for production)

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Build TypeScript: `npm run build`
3. Start server: `npm start`
4. Configure proper CORS settings
5. Use environment variables for sensitive data

### Frontend
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Ensure backend API is accessible
4. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend-url.com/api/v1`)
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket server URL (e.g., `https://your-backend-url.com`)
5. Set up proper CORS on backend to allow your frontend domain (e.g., `https://www.communityportal.online`)

## License

ISC
