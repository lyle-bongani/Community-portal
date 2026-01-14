'use client';

import { useEffect, useState } from 'react';
import { useEvents } from '@/context/EventsContext';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import Navbar from '@/components/common/Navbar';
import EventCard from '@/components/events/EventCard';
import { Event } from '@/lib/types';

// Registration component for modal
function EventRegistrationSection({ event }: { event: Event }) {
  const { user } = useAuth();
  const { registerForEvent } = useEvents();
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const isRegistered = user && event.registeredUsers.includes(user.id);
  const isFull = event.registeredUsers.length >= event.maxAttendees;
  const canRegister = user && !isRegistered && !isFull;

  const handleRegister = async () => {
    if (!user) return;

    setIsRegistering(true);
    setMessage('');

    try {
      await registerForEvent(event.id);
      setMessage('Successfully registered for event! Check your email for confirmation.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-2 rounded ${
          message.includes('Successfully') 
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
      {canRegister && (
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="w-full bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-4 py-3 rounded-lg text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isRegistering ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Registering...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Register for Event</span>
            </>
          )}
        </button>
      )}
      {isRegistered && (
        <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm sm:text-base font-semibold text-center flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You are registered for this event</span>
        </div>
      )}
      {isFull && !isRegistered && (
        <div className="w-full bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm sm:text-base font-semibold text-center flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Event is full</span>
        </div>
      )}
      {!user && (
        <div className="text-xs sm:text-sm text-zinc-500 text-center">
          Please login to register for events
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const { events, isLoading, fetchEvents } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewEvent = () => {
      fetchEvents();
    };

    socket.on('new-event', handleNewEvent);

    return () => {
      socket.off('new-event', handleNewEvent);
    };
  }, [socket, isAuthenticated, fetchEvents]);

  // Filter and search events
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Apply date filter
    if (filter === 'upcoming' && eventDate <= now) return false;
    if (filter === 'past' && eventDate > now) return false;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-3">
              Community Events
            </h1>
            <p className="text-base sm:text-lg text-zinc-600">
              Discover and register for upcoming community events
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-zinc-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search events by title, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-[#7BA09F] text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    filter === 'upcoming'
                      ? 'bg-[#7BA09F] text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    filter === 'past'
                      ? 'bg-[#7BA09F] text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="text-center text-zinc-600 py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F]"></div>
              <p className="mt-4">Loading events...</p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-zinc-200">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-medium text-zinc-900 mb-2">
                {searchQuery ? 'No events found' : 'No events available'}
              </p>
              <p className="text-zinc-600">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new events'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {/* Event Count */}
          {!isLoading && sortedEvents.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center text-zinc-600 text-sm sm:text-base">
              Showing {sortedEvents.length} of {events.length} event{sortedEvents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {new Date(selectedEvent.date) > new Date() && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs sm:text-sm font-semibold rounded-full">
                          Upcoming
                        </span>
                      )}
                      {new Date(selectedEvent.date) <= new Date() && (
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-semibold rounded-full">
                          Past Event
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="ml-4 p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Description</h3>
                  <p className="text-zinc-700 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-[#7BA09F] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-zinc-600">Date & Time</p>
                      <p className="text-base text-zinc-900">
                        {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(selectedEvent.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-[#7BA09F] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-zinc-600">Location</p>
                      <p className="text-base text-zinc-900">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-[#7BA09F] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-600 mb-1">Attendees</p>
                      <p className="text-base text-zinc-900 mb-2">
                        {selectedEvent.registeredUsers.length} / {selectedEvent.maxAttendees} registered
                      </p>
                      <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7BA09F] rounded-full transition-all duration-300"
                          style={{
                            width: `${(selectedEvent.registeredUsers.length / selectedEvent.maxAttendees) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Section */}
                <div className="pt-4 border-t border-zinc-200">
                  <EventRegistrationSection event={selectedEvent} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
