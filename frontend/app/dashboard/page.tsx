'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import { useEvents } from '@/context/EventsContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/posts/PostForm';
import EventCard from '@/components/events/EventCard';
import { Post } from '@/lib/types';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { posts, isLoading: postsLoading, createPost, updatePost, deletePost, fetchPosts } = usePosts();
  const { events, isLoading: eventsLoading, fetchEvents } = useEvents();
  const { socket } = useWebSocket();
  const router = useRouter();
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Listen for real-time event updates
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

  // Note: Posts are now handled automatically by PostsContext via WebSocket

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

  if (!isAuthenticated) {
    return null;
  }

  const handleCreatePost = async (data: { title: string; content: string; image?: File }) => {
    if (!user) return;
    await createPost({
      ...data,
      authorId: user.id,
    });
    setShowPostForm(false);
  };

  const handleUpdatePost = async (data: { title: string; content: string; image?: File }) => {
    if (!editingPost) return;
    await updatePost(editingPost.id, {
      title: data.title,
      content: data.content,
    });
    setEditingPost(null);
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(id);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    // Update the post in the posts list
    // This is handled by PostsContext, but we can trigger a refresh if needed
    fetchPosts();
  };

  const upcomingEvents = events.filter((event) => new Date(event.date) > new Date());

  const userPosts = posts.filter(post => post.authorId === user?.id);
  const registeredEvents = events.filter(event => user && event.registeredUsers.includes(user.id));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Enhanced Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7BA09F] to-[#6a8f8e] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-sm sm:text-base text-[#46979E] mt-1">
                    Manage your posts and discover upcoming events
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#46979E] font-medium mb-1">Your Posts</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{userPosts.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#7BA09F]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#46979E] font-medium mb-1">Upcoming Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{upcomingEvents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#7BA09F]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#7BA09F]/10 to-[#7BA09F]/5 rounded-xl p-4 sm:p-5 border border-[#7BA09F]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#46979E] font-medium mb-1">Registered Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#46979E]">{registeredEvents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#7BA09F]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Posts Section */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="space-y-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#7BA09F]/5 to-transparent p-4 rounded-xl border border-[#7BA09F]/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#7BA09F] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#46979E]">
                      Community Posts
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600">Share your thoughts with the community</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setShowPostForm(true);
                  }}
                  className="group w-full sm:w-auto bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Post</span>
                </button>
              </div>

              {showPostForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-[#7BA09F]/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#7BA09F] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#46979E]">
                        {editingPost ? 'Edit Post' : 'Create New Post'}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowPostForm(false);
                        setEditingPost(null);
                      }}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <PostForm
                    post={editingPost || undefined}
                    onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
                    onCancel={() => {
                      setShowPostForm(false);
                      setEditingPost(null);
                    }}
                  />
                </div>
              )}

              {postsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
                  <p className="text-[#46979E]">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-[#7BA09F]/5 to-transparent rounded-xl border border-[#7BA09F]/10">
                  <div className="w-16 h-16 bg-[#7BA09F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-[#46979E] mb-2">No posts yet</p>
                  <p className="text-zinc-600 mb-4">Be the first to share something with the community!</p>
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setShowPostForm(true);
                    }}
                    className="inline-flex items-center space-x-2 text-[#7BA09F] hover:text-[#6a8f8e] font-medium"
                  >
                    <span>Create your first post</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto pr-2 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={post.authorId === user?.id ? handleEditPost : undefined}
                        onDelete={post.authorId === user?.id ? handleDeletePost : undefined}
                        canEdit={post.authorId === user?.id}
                        onUpdate={handlePostUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Events Section */}
            <div className="flex flex-col">
              <div className="space-y-6 flex-shrink-0">
                <div className="bg-gradient-to-r from-[#7BA09F]/5 to-transparent p-4 rounded-xl border border-[#7BA09F]/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#7BA09F] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#46979E]">
                        Upcoming Events
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-600">Discover and join events</p>
                    </div>
                  </div>
                </div>

                {eventsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7BA09F] mb-4"></div>
                    <p className="text-[#46979E]">Loading events...</p>
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-[#7BA09F]/5 to-transparent rounded-xl border border-[#7BA09F]/10">
                    <div className="w-16 h-16 bg-[#7BA09F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-[#46979E] mb-2">No upcoming events</p>
                    <p className="text-zinc-600">Check back later for new events!</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto pr-2 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                    <div className="space-y-5">
                      {upcomingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
