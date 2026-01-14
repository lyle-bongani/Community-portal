import { User, Post, Event, Comment } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage for authenticated requests
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      
      // Try to parse JSON, but handle non-JSON responses
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, create error object
        const text = await response.text();
        throw new Error(text || 'An error occurred');
      }

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(errorMessages || data.message || 'Validation failed');
        }
        throw new Error(data.message || `Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      // Handle fetch errors (network issues, CORS, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const errorMessage = `Failed to connect to server at ${url}. Please ensure the backend server is running on port 5000.`;
        console.error(errorMessage, error);
        throw new Error(errorMessage);
      }
      // Re-throw with better error message
      if (error.message) {
        throw error;
      }
      throw new Error('Network error: Could not connect to server');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // FormData for file uploads
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobileNumber: string;
  }) => apiClient.post<User>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<User>('/auth/login', data),
};

// Users API
export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: any) => apiClient.post<User>('/users', data),
  update: (id: string, data: any) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/users/${id}`),
  updateProfileImage: async (id: string, image: File) => {
    // Convert image to base64
    const reader = new FileReader();
    const imageUrl = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
    return apiClient.put<User>(`/users/${id}`, { profileImage: imageUrl });
  },
};

// Posts API
export const postsApi = {
  getAll: () => apiClient.get<Post[]>('/posts'),
  getById: (id: string) => apiClient.get<Post>(`/posts/${id}`),
  create: async (data: { title: string; content: string; authorId?: string; image?: File }) => {
    // For now, we'll convert image to base64 or use a placeholder
    // In production, you'd upload to a service like S3 or Cloudinary
    let imageUrl = null;
    if (data.image) {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.image!);
      });
    }
    return apiClient.post<Post>('/posts', {
      title: data.title,
      content: data.content,
      ...(data.authorId && { authorId: data.authorId }),
      imageUrl,
    });
  },
  update: (id: string, data: any) => apiClient.put<Post>(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/posts/${id}`),
  like: (id: string) => apiClient.post<Post>(`/posts/${id}/like`),
  save: (id: string) => apiClient.post<Post>(`/posts/${id}/save`),
};

// Events API
export const eventsApi = {
  getAll: () => apiClient.get<Event[]>('/events'),
  getById: (id: string) => apiClient.get<Event>(`/events/${id}`),
  create: (data: any) => apiClient.post<Event>('/events', data),
  update: (id: string, data: any) => apiClient.put<Event>(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/events/${id}`),
  register: (eventId: string, userId: string) =>
    apiClient.post<Event>(`/events/${eventId}/register`, { userId }),
};

// Comments API
export const commentsApi = {
  getAll: (postId?: string) => {
    const query = postId ? `?postId=${postId}` : '';
    return apiClient.get<Comment[]>(`/comments${query}`);
  },
  getById: (id: string) => apiClient.get<Comment>(`/comments/${id}`),
  create: (data: { content: string; postId: string }) => apiClient.post<Comment>('/comments', data),
  update: (id: string, data: { content: string }) => apiClient.put<Comment>(`/comments/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/comments/${id}`),
};

// Admin API
export const adminApi = {
  // Users
  getUsers: () => apiClient.get<User[]>('/admin/users'),
  deleteUser: (id: string) => apiClient.delete<void>(`/admin/users/${id}`),
  
  // Posts
  getPosts: () => apiClient.get<Post[]>('/admin/posts'),
  deletePost: (id: string) => apiClient.delete<void>(`/admin/posts/${id}`),
  
  // Events
  getEvents: () => apiClient.get<Event[]>('/admin/events'),
  createEvent: (data: { title: string; description: string; date: string; location: string; maxAttendees: number }) => 
    apiClient.post<Event>('/admin/events', data),
  updateEvent: (id: string, data: { title?: string; description?: string; date?: string; location?: string; maxAttendees?: number }) => 
    apiClient.put<Event>(`/admin/events/${id}`, data),
  deleteEvent: (id: string) => apiClient.delete<void>(`/admin/events/${id}`),
};
