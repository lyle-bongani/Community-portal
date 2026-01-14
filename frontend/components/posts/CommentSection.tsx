'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/lib/types';
import { commentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await commentsApi.getAll(postId);
      if (response.success && response.data) {
        setComments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user) return;

    setIsSubmitting(true);
    try {
      const response = await commentsApi.create({
        content: newComment.trim(),
        postId,
      });
      if (response.success && response.data) {
        // Add the new comment to the list
        setComments([response.data as Comment, ...comments]);
        setNewComment('');
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      alert(error.message || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await commentsApi.delete(commentId);
      if (response.success) {
        setComments(comments.filter(c => c.id !== commentId));
        // Refresh to get updated comment count
        await fetchComments();
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(error.message || 'Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-200 pt-4">
      <div className="space-y-4">
          {/* Comment Form */}
          {isAuthenticated && user ? (
            <form onSubmit={handleSubmitComment} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-[#7BA09F] hover:bg-[#6a8f8e] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </form>
          ) : (
            <div className="bg-zinc-50 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-600">
                <a href="/login" className="text-[#7BA09F] hover:underline font-medium">Sign in</a> to leave a comment
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4 text-zinc-500 text-sm">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-zinc-500 text-sm">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-zinc-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm text-zinc-900">
                          {comment.author?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700">{comment.content}</p>
                    </div>
                    {user && comment.authorId === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
