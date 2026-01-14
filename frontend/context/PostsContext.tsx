'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Post, PostsState } from '@/lib/types';
import { postsApi } from '@/lib/api';
import { useWebSocket } from './WebSocketContext';

interface PostsContextType extends PostsState {
  fetchPosts: () => Promise<void>;
  createPost: (data: { title: string; content: string; authorId?: string; image?: File }) => Promise<void>;
  updatePost: (id: string, data: { title: string; content: string }) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useWebSocket();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postsApi.getAll();
      if (response.success && response.data) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = async (data: { title: string; content: string; authorId?: string; image?: File }) => {
    setError(null);
    try {
      const response = await postsApi.create(data);
      if (response.success) {
        await fetchPosts(); // Refresh posts list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      throw err;
    }
  };

  const updatePost = async (id: string, data: { title: string; content: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postsApi.update(id, data);
      if (response.success) {
        await fetchPosts(); // Refresh posts list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postsApi.delete(id);
      if (response.success) {
        await fetchPosts(); // Refresh posts list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Listen for real-time post updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (notification: { data: any }) => {
      console.log('📢 Received new post via WebSocket:', notification.data);
      const newPost = notification.data;
      
      // Ensure createdAt is a string (in case it comes as Date object)
      let createdAtString: string;
      if (typeof newPost.createdAt === 'string') {
        createdAtString = newPost.createdAt;
      } else if (newPost.createdAt instanceof Date) {
        createdAtString = newPost.createdAt.toISOString();
      } else {
        createdAtString = new Date().toISOString();
      }
      
      const normalizedPost: Post = {
        ...newPost,
        createdAt: createdAtString,
      };
      
      // Check if post already exists (to avoid duplicates)
      setPosts((prevPosts) => {
        const exists = prevPosts.some(p => p.id === normalizedPost.id);
        if (exists) {
          console.log('Post already exists, skipping duplicate');
          return prevPosts; // Post already exists, don't add again
        }
        // Add new post at the beginning of the list
        console.log('Adding new post to list:', normalizedPost.title);
        return [normalizedPost, ...prevPosts];
      });
    };

    socket.on('new-post', handleNewPost);

    return () => {
      socket.off('new-post', handleNewPost);
    };
  }, [socket]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        error,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
