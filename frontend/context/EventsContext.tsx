'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Event, EventsState } from '@/lib/types';
import { eventsApi } from '@/lib/api';

interface EventsContextType extends EventsState {
  fetchEvents: () => Promise<void>;
  createEvent: (data: {
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number;
  }) => Promise<void>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, userId?: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getAll();
      if (response.success && response.data) {
        setEvents(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = async (data: {
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsApi.create(data);
      if (response.success) {
        await fetchEvents(); // Refresh events list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id: string, data: Partial<Event>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsApi.update(id, data);
      if (response.success) {
        await fetchEvents(); // Refresh events list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsApi.delete(id);
      if (response.success) {
        await fetchEvents(); // Refresh events list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerForEvent = async (eventId: string, userId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsApi.register(eventId, userId || '');
      if (response.success) {
        await fetchEvents(); // Refresh events list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register for event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        error,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
