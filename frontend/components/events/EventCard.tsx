'use client';

import { Event } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventsContext';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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
      // userId is optional - backend will get it from token
      await registerForEvent(event.id);
      setMessage('Successfully registered for event! Check your email for confirmation.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 sm:p-6 border border-zinc-200 hover:border-[#7BA09F]/30 group">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 flex-1 pr-2 group-hover:text-[#7BA09F] transition-colors">
          {event.title}
        </h3>
        {isUpcoming && (
          <span className="px-3 py-1 bg-[#7BA09F]/20 text-[#7BA09F] text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap shadow-sm">
            Upcoming
          </span>
        )}
      </div>
      <p className="text-sm sm:text-base text-zinc-700 mb-5 leading-relaxed">
        {event.description}
      </p>
      <div className="space-y-3 mb-5">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-600">
          <svg className="w-4 h-4 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span><strong>Date:</strong> {eventDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-600">
          <svg className="w-4 h-4 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span><strong>Location:</strong> {event.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-600">
          <svg className="w-4 h-4 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span><strong>Attendees:</strong> {event.registeredUsers.length} / {event.maxAttendees}</span>
          <div className="flex-1 ml-2 h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(event.registeredUsers.length / event.maxAttendees) * 100}%`, backgroundColor: '#7BA09F' }}
            ></div>
          </div>
        </div>
      </div>
      {message && (
        <div className={`mb-4 px-4 py-2 rounded ${
          message.includes('Successfully') 
            ? 'bg-[#7BA09F]/10 text-[#7BA09F]'
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
        <div className="w-full bg-[#7BA09F]/10 border-2 border-[#7BA09F]/30 text-[#7BA09F] px-4 py-3 rounded-lg text-sm sm:text-base font-semibold text-center flex items-center justify-center space-x-2">
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
