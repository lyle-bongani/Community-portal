'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import { useEvents } from '@/context/EventsContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import AdminNavbar from '@/components/common/AdminNavbar';
import PostCard from '@/components/posts/PostCard';
import EventCard from '@/components/events/EventCard';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import { Post, Event } from '@/lib/types';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { posts, isLoading: postsLoading, error: postsError, fetchPosts } = usePosts();
  const { events, isLoading: eventsLoading, fetchEvents } = useEvents();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'events'>('posts');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPosts();
      fetchEvents();
    }
  }, [isAuthenticated, user, fetchPosts, fetchEvents]);

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-600">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine which navbar to use
  const adminEmails = ['lylechadya72@gmail.com', 'admin@gmail.com'];
  const isAdminUser = user?.isAdmin && adminEmails.includes(user?.email?.toLowerCase() || '');
  const NavbarComponent = isAdminUser ? AdminNavbar : Navbar;

  // Filter user's posts
  const userPosts = posts.filter(post => {
    const matches = post.authorId === user.id;
    if (!matches && post.authorId && user.id) {
      console.log('Post authorId mismatch:', { postId: post.id, postAuthorId: post.authorId, userId: user.id });
    }
    return matches;
  });
  
  // Filter saved posts
  const savedPosts = posts.filter(post => post.savedBy?.includes(user.id));
  
  // Filter registered events
  const registeredEvents = events.filter(event => event.registeredUsers.includes(user.id));

  
  // Calculate statistics
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);

  const handlePostUpdate = (updatedPost: Post) => {
    fetchPosts();
  };

  return (
    <>
      <NavbarComponent />
      <div className={`min-h-screen bg-white ${isAdminUser ? 'pt-20' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#7BA09F] to-[#6a8f8e] rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with Upload */}
              <ProfileImageUpload
                currentImage={user.profileImage}
                userName={user.name}
                onImageUpdate={(imageUrl) => {
                  // Image is updated via AuthContext
                }}
              />

              {/* User Info */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-white/90 mb-4">{user.email}</p>
                {user.mobileNumber && (
                  <p className="text-white/80 text-sm mb-4">{user.mobileNumber}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Member since:</span>{' '}
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {user.lastLogin && (
                    <div>
                      <span className="text-white/70">Last login:</span>{' '}
                      <span className="font-medium">
                        {new Date(user.lastLogin).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
              <p className="text-sm text-[#46979E] font-medium mb-1">Posts</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{userPosts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
              <p className="text-sm text-[#46979E] font-medium mb-1">Likes Received</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{totalLikes}</p>
            </div>
            <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
              <p className="text-sm text-[#46979E] font-medium mb-1">Saved Posts</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{savedPosts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
              <p className="text-sm text-[#46979E] font-medium mb-1">Events</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{registeredEvents.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 mb-6">
            <nav className="flex space-x-4 sm:space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-[#7BA09F] text-[#7BA09F]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                My Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'saved'
                    ? 'border-[#7BA09F] text-[#7BA09F]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                Saved Posts ({savedPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'events'
                    ? 'border-[#7BA09F] text-[#7BA09F]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                Registered Events ({registeredEvents.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'posts' && (
              <div>
                {postsError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="font-medium">Error loading posts: {postsError}</p>
                    <button
                      onClick={() => fetchPosts()}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {postsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
                    <p className="text-[#46979E]">Loading posts...</p>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-[#7BA09F]/5 to-transparent rounded-xl border border-[#7BA09F]/10">
                    <div className="w-16 h-16 bg-[#7BA09F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-[#46979E] mb-2">No posts yet</p>
                    <p className="text-zinc-600">You haven't created any posts. Start sharing with the community!</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        canEdit={false}
                        onUpdate={handlePostUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                {postsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
                    <p className="text-[#46979E]">Loading saved posts...</p>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-[#7BA09F]/5 to-transparent rounded-xl border border-[#7BA09F]/10">
                    <div className="w-16 h-16 bg-[#7BA09F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-[#46979E] mb-2">No saved posts</p>
                    <p className="text-zinc-600">Posts you save will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {savedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        canEdit={post.authorId === user.id}
                        onUpdate={handlePostUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                {eventsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
                    <p className="text-[#46979E]">Loading events...</p>
                  </div>
                ) : registeredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-[#7BA09F]/5 to-transparent rounded-xl border border-[#7BA09F]/10">
                    <div className="w-16 h-16 bg-[#7BA09F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-[#46979E] mb-2">No registered events</p>
                    <p className="text-zinc-600">Events you register for will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registeredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
