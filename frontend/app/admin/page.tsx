'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/common/AdminNavbar';
import { adminApi } from '@/lib/api';
import { User, Post, Event } from '@/lib/types';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'events'>('posts');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: '',
  });

  useEffect(() => {
    if (!authLoading) {
      // Strict check: Only allow access if user is authenticated AND is admin AND has an admin email
      const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
      const isAdminEmail = adminEmails.includes(user?.email?.toLowerCase() || '');
      if (!isAuthenticated || !user?.isAdmin || !isAdminEmail) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      loadData();
    } else if (isAuthenticated && !user?.isAdmin) {
      console.error('User is not an admin. isAdmin:', user?.isAdmin, 'User:', user);
      alert('You do not have admin privileges. Please log out and log back in with an admin account.');
    }
  }, [isAuthenticated, user, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading admin data for tab:', activeTab, 'User isAdmin:', user?.isAdmin);
      if (activeTab === 'users') {
        const response = await adminApi.getUsers();
        console.log('Users response:', response);
        if (response.success && response.data) {
          setUsers(response.data as User[]);
        } else {
          console.error('Failed to load users:', response.message);
        }
      } else if (activeTab === 'posts') {
        const response = await adminApi.getPosts();
        console.log('Posts response:', response);
        if (response.success && response.data) {
          setPosts(response.data as Post[]);
        } else {
          console.error('Failed to load posts:', response.message);
        }
      } else if (activeTab === 'events') {
        const response = await adminApi.getEvents();
        console.log('Events response:', response);
        if (response.success && response.data) {
          setEvents(response.data as Event[]);
        } else {
          console.error('Failed to load events:', response.message);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert(`Error: ${error.message || 'Failed to load data. Check console for details.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await adminApi.deleteUser(id);
      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await adminApi.deletePost(id);
      if (response.success) {
        await loadData();
        alert('Post deleted successfully');
      } else {
        alert(response.message || 'Failed to delete post');
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post. Check console for details.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await adminApi.deleteEvent(id);
      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    const eventDate = new Date(event.date);
    const localDateTime = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEventForm({
      title: event.title,
      description: event.description,
      date: localDateTime,
      location: event.location,
      maxAttendees: event.maxAttendees.toString(),
    });
    setShowEventForm(true);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowEventForm(false);
    setEventForm({ title: '', description: '', date: '', location: '', maxAttendees: '' });
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Update event
        const response = await adminApi.updateEvent(editingEvent.id, {
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          location: eventForm.location,
          maxAttendees: parseInt(eventForm.maxAttendees),
        });
        if (response.success) {
          handleCancelEdit();
          await loadData();
          alert('Event updated successfully');
        } else {
          alert(response.message || 'Failed to update event');
        }
      } else {
        // Create event
        const response = await adminApi.createEvent({
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          location: eventForm.location,
          maxAttendees: parseInt(eventForm.maxAttendees),
        });
        if (response.success) {
          handleCancelEdit();
          await loadData();
          alert('Event created successfully');
        } else {
          alert(response.message || 'Failed to create event');
        }
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(error.message || 'Failed to save event. Check console for details.');
    }
  };

  if (authLoading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-zinc-600">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-[#46979E]">Manage users, posts, and events</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-zinc-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-[#7BA09F] border-b-2 border-[#7BA09F]'
                  : 'text-zinc-600 hover:text-[#7BA09F]'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'posts'
                  ? 'text-[#7BA09F] border-b-2 border-[#7BA09F]'
                  : 'text-zinc-600 hover:text-[#7BA09F]'
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'events'
                  ? 'text-[#7BA09F] border-b-2 border-[#7BA09F]'
                  : 'text-zinc-600 hover:text-[#7BA09F]'
              }`}
            >
              Events ({events.length})
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
              <p className="text-[#46979E]">Loading...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-4">All Users</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-200">
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Mobile</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Member Since</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Last Login</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Login Count</th>
                          <th className="text-left py-3 px-4 font-semibold text-zinc-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-zinc-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                              <td className="py-3 px-4 font-medium">{u.name}</td>
                              <td className="py-3 px-4">{u.email}</td>
                              <td className="py-3 px-4">{u.mobileNumber || 'N/A'}</td>
                              <td className="py-3 px-4">
                                {u.isAdmin ? (
                                  <span className="px-2 py-1 bg-[#7BA09F]/20 text-[#7BA09F] text-xs font-semibold rounded-full">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-full">
                                    User
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-3 px-4">{u.loginCount || 0}</td>
                              <td className="py-3 px-4">
                                {!u.isAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm px-2 py-1 hover:bg-red-50 rounded"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-4">All Posts</h2>
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">No posts found</div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-zinc-900 text-lg">{post.title}</h3>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="text-sm text-zinc-600 mb-3 line-clamp-3">{post.content}</p>
                          {post.imageUrl && (
                            <div className="mb-3">
                              <img src={post.imageUrl} alt={post.title} className="max-w-xs max-h-32 rounded object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <div>
                              By: <span className="font-medium">{post.author?.name || 'Unknown'}</span> • 
                              Created: {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span>Likes: {post.likes?.length || 0}</span>
                              <span>Saved: {post.savedBy?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-zinc-900">All Events</h2>
                    <button
                      onClick={() => {
                        if (showEventForm) {
                          handleCancelEdit();
                        } else {
                          setShowEventForm(true);
                        }
                      }}
                      className="bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {showEventForm ? 'Cancel' : 'Create Event'}
                    </button>
                  </div>

                  {showEventForm && (
                    <form onSubmit={handleSubmitEvent} className="bg-zinc-50 p-6 rounded-lg mb-4 border border-zinc-200">
                      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                        {editingEvent ? 'Edit Event' : 'Create New Event'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Event Title</label>
                          <input
                            type="text"
                            placeholder="Event Title"
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                          <textarea
                            placeholder="Event Description"
                            value={eventForm.description}
                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F]"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Date & Time</label>
                            <input
                              type="datetime-local"
                              value={eventForm.date}
                              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                            <input
                              type="text"
                              placeholder="Event Location"
                              value={eventForm.location}
                              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F]"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Max Attendees</label>
                          <input
                            type="number"
                            placeholder="Maximum number of attendees"
                            value={eventForm.maxAttendees}
                            onChange={(e) => setEventForm({ ...eventForm, maxAttendees: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F]"
                            min="1"
                            required
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="flex-1 bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            {editingEvent ? 'Update Event' : 'Create Event'}
                          </button>
                          {editingEvent && (
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-semibold hover:bg-zinc-50 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  )}

                  {events.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">No events found</div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-zinc-900 text-lg mb-1">{event.title}</h3>
                              <p className="text-sm text-zinc-600 mb-2">{event.description}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="text-[#7BA09F] hover:text-[#6a8f8e] font-medium text-sm px-3 py-1 hover:bg-[#7BA09F]/10 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-zinc-500">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{event.registeredUsers.length}/{event.maxAttendees} attendees</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
