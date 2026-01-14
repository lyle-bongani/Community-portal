import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join user to their personal room (if authenticated)
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('🚀 WebSocket server initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return io;
};

// Notification helpers
export const notifyNewEvent = (event: any) => {
  if (!io) return;
  
  // Broadcast to all connected clients
  io.emit('new-event', {
    type: 'new-event',
    message: `New event created: ${event.title}`,
    data: event,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`📢 Broadcasted new event: ${event.title}`);
};

export const notifyEventRegistration = (event: any, userId: string) => {
  if (!io) return;
  
  // Notify all clients about the registration
  io.emit('event-registration', {
    type: 'event-registration',
    message: `Someone registered for: ${event.title}`,
    data: {
      eventId: event.id,
      eventTitle: event.title,
      userId,
      registeredCount: event.registeredUsers.length,
    },
    timestamp: new Date().toISOString(),
  });
};

export const notifyNewPost = (post: any) => {
  if (!io) return;
  
  // Broadcast to all connected clients
  io.emit('new-post', {
    type: 'new-post',
    message: `New post: ${post.title}`,
    data: post,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`📢 Broadcasted new post: ${post.title}`);
};
