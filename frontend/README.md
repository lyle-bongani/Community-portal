# Community Portal - Frontend

## Introduction

The Community Portal Frontend is a modern, responsive web application built with Next.js 16 and React 19. It provides a user-friendly interface for a community platform where users can create and interact with posts, register for events, manage their profiles, and administrators can manage the entire platform through a dedicated admin dashboard. The application features real-time updates via WebSocket connections, beautiful UI with Tailwind CSS, and a seamless user experience.

## Tech Stack

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

The application supports two user roles with different access levels and interfaces:

### Admin Role
- **Access Level**: Full administrative access
- **Features**:
  - Access to admin dashboard (`/admin`)
  - View and manage all users
  - Delete users (except other admins)
  - View and delete all posts
  - Full CRUD operations for events (Create, Read, Update, Delete)
  - View user statistics and activity tracking
- **Interface**: 
  - Uses `AdminNavbar` component
  - Separate admin portal branding
  - Admin-specific navigation
- **Redirect**: Automatically redirected to `/admin` after login

### User Role (Regular User)
- **Access Level**: Standard community member access
- **Features**:
  - Create, edit, and delete own posts
  - Like and save posts
  - Comment on posts
  - Register for events
  - Manage own profile
  - Upload and change profile image
  - View saved posts and registered events
- **Interface**:
  - Uses regular `Navbar` component
  - Standard community portal branding
  - User-focused navigation
- **Redirect**: Automatically redirected to `/dashboard` after login

### Role-Based Access Control
- Roles are assigned during user registration (default: User)
- Admin role is assigned only to specific email addresses
- Role is verified on both frontend and backend
- Admin routes are protected and inaccessible to regular users
- Role determines which navigation bar is displayed

## Features

### User Features

#### Authentication
- User registration with email, password, and mobile number
- Secure login with JWT tokens
- Protected routes
- Session management with localStorage
- Automatic redirect based on user role (Admin/User)

#### Dashboard
- View all community posts in a scrollable feed
- View upcoming events
- Welcome section with user initial letter
- Independent scrolling for posts and events sections
- Real-time post updates without page refresh

#### Posts
- Create posts with text and images
- View posts with author information
- Like posts (heart icon)
- Save posts for later
- Comment on posts
- Share posts via social media or copy link
- Full-size image popup on click
- Post author profile pictures
- Post statistics (likes, saves, comments)

#### Events
- Browse all community events
- View event details (date, location, description)
- Register for events
- See registered events count
- Event capacity tracking
- Real-time event notifications

#### Profile
- View personal profile information
- Upload and change profile image
- View own posts
- View saved posts
- View registered events
- Profile statistics (posts count, likes received, saved posts, events)
- Member since and last login information

#### Comments
- View comments on posts
- Add comments to posts
- Delete own comments
- Real-time comment updates

### Admin Features

#### Admin Dashboard
- Separate admin interface with AdminNavbar
- View all users with detailed information
- Delete users (except other admins)
- View all posts
- Delete any post
- Full CRUD operations for events
- User activity tracking
- Admin-only access protection

#### Admin Navigation
- Dedicated admin header
- Admin portal branding
- Separate navigation from regular users
- Profile access for admins

### Real-time Features
- WebSocket integration for live updates
- New post notifications
- New event notifications
- Event registration notifications
- Browser notification support
- Real-time post feed updates

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
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   │   └── page.tsx
│   ├── dashboard/         # User dashboard
│   │   └── page.tsx
│   ├── events/            # Events page
│   │   └── page.tsx
│   ├── login/             # Login page
│   │   └── page.tsx
│   ├── profile/           # User profile
│   │   └── page.tsx
│   ├── register/          # Registration page
│   │   └── page.tsx
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── common/            # Common components
│   │   ├── AdminNavbar.tsx
│   │   ├── Navbar.tsx
│   │   └── NotificationToast.tsx
│   ├── events/            # Event components
│   │   └── EventCard.tsx
│   ├── landing/           # Landing page components
│   │   ├── LandingAbout.tsx
│   │   ├── LandingCTA.tsx
│   │   ├── LandingFeatures.tsx
│   │   ├── LandingFooter.tsx
│   │   ├── LandingHeader.tsx
│   │   └── LandingHero.tsx
│   ├── posts/             # Post components
│   │   ├── CommentSection.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostForm.tsx
│   │   └── ShareModal.tsx
│   └── profile/           # Profile components
│       └── ProfileImageUpload.tsx
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── EventsContext.tsx  # Events state
│   ├── PostsContext.tsx   # Posts state
│   └── WebSocketContext.tsx # WebSocket connection
├── lib/                   # Utilities and helpers
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   ├── test-connection.ts # Connection testing
│   └── utils/
│       └── userType.ts    # User role utilities
├── public/                 # Static assets
│   └── images/            # Images
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Installation for Local Usage

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend server running (see backend README)

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup (Optional)

If your backend is running on a different URL, create a `.env.local` file:

```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# For production (set in Vercel environment variables, or defaults to Render URL)
# Frontend URL: https://www.communityportal.online
# Backend URL: https://community-portal-9uek.onrender.com
# NEXT_PUBLIC_API_URL=https://community-portal-9uek.onrender.com/api/v1
# NEXT_PUBLIC_WS_URL=https://community-portal-9uek.onrender.com
```

### Step 4: Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Step 5: Build for Production (Optional)

```bash
npm run build
npm start
```

## Key Components

### Context Providers

#### AuthContext
- Manages user authentication state
- Handles login, registration, logout
- Stores user session
- Provides user information to all components

#### PostsContext
- Manages posts state
- Handles fetching, creating, updating posts
- Integrates with WebSocket for real-time updates
- Provides posts data to components

#### EventsContext
- Manages events state
- Handles fetching events
- Manages event registration
- Provides events data to components

#### WebSocketContext
- Manages WebSocket connection
- Handles real-time notifications
- Listens for new posts and events
- Shows browser notifications

### API Client

The `lib/api.ts` file provides a centralized API client with:
- Authentication endpoints
- Posts endpoints (CRUD, like, save)
- Comments endpoints
- Events endpoints
- User endpoints
- Admin endpoints

### Pages

#### Landing Page (`/`)
- Hero section
- Features showcase
- About section
- Call-to-action
- Footer

#### Dashboard (`/dashboard`)
- Posts feed
- Events list
- Welcome section
- Real-time updates

#### Events (`/events`)
- All events display
- Event registration
- Event details

#### Profile (`/profile`)
- User information
- Profile image upload
- User posts
- Saved posts
- Registered events
- Statistics

#### Admin Dashboard (`/admin`)
- Users management
- Posts management
- Events management (CRUD)
- Admin-only access

## Styling

The application uses Tailwind CSS for styling:
- Custom color scheme: `#7BA09F` (primary), `#46979E` (secondary)
- Responsive design with mobile-first approach
- Custom scrollbars
- Smooth transitions and animations
- Modern UI components

## Real-time Updates

The frontend connects to the backend WebSocket server to receive:
- New post notifications
- New event notifications
- Event registration updates

These updates appear in real-time without requiring page refresh.

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in API requests
5. Admin users redirected to `/admin`
6. Regular users redirected to `/dashboard`

## Admin Access

Admin users have:
- Separate admin dashboard
- AdminNavbar instead of regular Navbar
- Access to admin routes
- Ability to manage users, posts, and events

### Admin Login Credentials

Default admin account for testing:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`


> **Note**: Admin role is assigned to specific email addresses. Only users with admin email addresses can access the admin dashboard and admin features.

## API URLs

### Local Development
- **API URL**: `http://localhost:5000/api/v1`
- **WebSocket URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

### Production Server
- **API URL**: `https://community-portal-9uek.onrender.com/api/v1`
- **WebSocket URL**: `https://community-portal-9uek.onrender.com`
- **Health Check**: `https://community-portal-9uek.onrender.com/health`

## Image Handling

- Profile images: Base64 encoded, stored in backend
- Post images: Base64 encoded, displayed in posts
- Image modals: Full-size image popup on click
- Image upload: File validation (type, size up to 100MB)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices
- Touch-friendly interface

## Development Notes

- Uses Next.js App Router (not Pages Router)
- Server and Client components separation
- TypeScript for type safety
- ESLint for code quality
- Hot module replacement in development

## Production Deployment

1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Ensure backend API is accessible
4. Configure environment variables
5. Set up proper CORS on backend

## Notes

- **Local Development**: The frontend expects the backend to be running on `http://localhost:5000` by default
- **Production**: 
  - Frontend URL: `https://www.communityportal.online`
  - Backend URL: `https://community-portal-9uek.onrender.com`
  - Default API URL: `https://community-portal-9uek.onrender.com/api/v1`
  - Default WebSocket URL: `https://community-portal-9uek.onrender.com`
- LocalStorage is used for session management (consider more secure options for production)
- The application is fully responsive and optimized for mobile, tablet, and desktop devices
