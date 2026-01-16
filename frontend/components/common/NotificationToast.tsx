'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export default function NotificationToast() {
  const { notifications, clearNotifications } = useWebSocket();
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      setVisibleNotifications((prev) => [latest, ...prev].slice(0, 3));

      // Auto-remove after 5 seconds
      const timer = setTimeout(() => {
        setVisibleNotifications((prev) => prev.slice(1));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={`${notification.timestamp}-${index}`}
          className="bg-white border-2 border-[#7BA09F] rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px] animate-slide-in"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'new-event' && (
                <div className="w-10 h-10 bg-[#7BA09F] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {notification.type === 'new-post' && (
                <div className="w-10 h-10 bg-[#7BA09F] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              {notification.type === 'event-registration' && (
                <div className="w-10 h-10 bg-[#7BA09F] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900">{notification.message}</p>
              {notification.type === 'new-event' && notification.data && (
                <p className="text-xs text-zinc-600 mt-1">
                  {notification.data.location} • {new Date(notification.data.date).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => setVisibleNotifications((prev) => prev.filter((_, i) => i !== index))}
              className="flex-shrink-0 text-zinc-400 hover:text-zinc-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
