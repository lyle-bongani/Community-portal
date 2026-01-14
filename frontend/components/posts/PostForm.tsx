'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Post } from '@/lib/types';

interface PostFormProps {
  post?: Post;
  onSubmit: (data: { title: string; content: string; image?: File }) => Promise<void>;
  onCancel: () => void;
}

export default function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxImageSize = 50 * 1024 * 1024; // 50MB in bytes for images
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check image size (50MB limit for images)
      if (file.size > maxImageSize) {
        setError('Image size must be less than 50MB. Please choose a smaller image or compress it.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setImage(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        title,
        content,
        image: image || undefined,
      });
      // Reset form
      setTitle('');
      setContent('');
      setImage(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 text-sm sm:text-base border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50"
          placeholder="Post title"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700 mb-2">
          Description
        </label>
        <textarea
          id="content"
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 resize-y transition-all"
          placeholder="Post description"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-zinc-700 mb-2">
          Image (Optional)
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#7BA09F]/10 file:text-[#7BA09F] hover:file:bg-[#7BA09F]/20"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-4 py-3 rounded-lg text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{post ? 'Update Post' : 'Create Post'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 px-4 py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 shadow-sm hover:shadow"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
