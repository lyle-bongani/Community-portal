export interface LoginHistory {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  profileImage?: string;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  loginCount?: number;
  loginHistory?: LoginHistory[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  imageUrl?: string;
  likes?: string[];
  savedBy?: string[];
  commentsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  registeredUsers: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

export interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}
