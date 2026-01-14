'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  type: 'new-event' | 'event-registration' | 'new-post';
  message: string;
  data: any;
  timestamp: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === 'undefined') return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Listen for new events
    newSocket.on('new-event', (notification: Notification) => {
      console.log('📢 New event notification:', notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep last 10
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Event!', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    // Listen for event registrations
    newSocket.on('event-registration', (notification: Notification) => {
      console.log('📢 Event registration notification:', notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    });

    // Listen for new posts
    newSocket.on('new-post', (notification: Notification) => {
      console.log('📢 New post notification:', notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        clearNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
