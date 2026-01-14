'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  onUpdate?: (updatedPost: Post) => void;
}

export default function PostCard({ post, onEdit, onDelete, canEdit, onUpdate }: PostCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const likes = localPost.likes || [];
  const savedBy = localPost.savedBy || [];
  const isLiked = user ? likes.includes(user.id) : false;
  const isSaved = user ? savedBy.includes(user.id) : false;
  const likesCount = likes.length;

  const handleLike = async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLiking(true);
    try {
      const response = await postsApi.like(localPost.id);
      if (response.success && response.data) {
        setLocalPost(response.data as Post);
        if (onUpdate) {
          onUpdate(response.data as Post);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) return;
    
    setIsSaving(true);
    try {
      const response = await postsApi.save(localPost.id);
      if (response.success && response.data) {
        setLocalPost(response.data as Post);
        if (onUpdate) {
          onUpdate(response.data as Post);
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };
  return (
    <div id={`post-${localPost.id}`} className="bg-white group">
      {/* Header with Profile Picture */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {localPost.author?.profileImage ? (
                <img
                  src={localPost.author.profileImage}
                  alt={localPost.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#7BA09F] to-[#6a8f8e] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {localPost.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            {/* Author Name and Date */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-zinc-900">
                  {localPost.author ? localPost.author.name : 'Unknown User'}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-xs text-zinc-500">
                  {new Date(localPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          {/* Edit/Delete Buttons */}
          {canEdit && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="p-1.5 text-zinc-600 hover:text-[#7BA09F] transition-colors"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="p-1.5 text-zinc-600 hover:text-[#D9191C] transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        {/* Post Title */}
        <h3 className="text-base font-semibold text-zinc-900 mb-2">
          {post.title}
        </h3>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div 
          className="w-full overflow-hidden max-h-80 cursor-pointer"
          onClick={() => setShowImageModal(true)}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 pt-2.5">
        <p className="text-sm text-zinc-700 mb-2.5 leading-relaxed line-clamp-5">
          {post.content}
        </p>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center space-x-1.5 transition-all duration-200 ${
                isLiked
                  ? 'text-red-500'
                  : 'text-zinc-900'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <svg
                className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`}
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {likesCount > 0 && (
                <span className="text-sm font-medium">{likesCount}</span>
              )}
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center transition-all duration-200 ${
                showComments
                  ? 'text-[#7BA09F]'
                  : 'text-zinc-900'
              } hover:opacity-70`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center text-zinc-900 hover:opacity-70 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z"
                />
              </svg>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!isAuthenticated || isSaving}
            className={`transition-all duration-200 ${
              isSaved
                ? 'text-[#7BA09F]'
                : 'text-zinc-900'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'}`}
          >
            <svg
              className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`}
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && <CommentSection postId={localPost.id} />}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal post={localPost} onClose={() => setShowShareModal(false)} />
      )}

      {/* Image Modal */}
      {showImageModal && post.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full Size Image */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-w-full max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
