'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types';

interface ProfileImageUploadProps {
  currentImage?: string;
  userName: string;
  onImageUpdate: (imageUrl: string) => void;
}

export default function ProfileImageUpload({ currentImage, userName, onImageUpdate }: ProfileImageUploadProps) {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('Image size must be less than 100MB. Please choose a smaller image.');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await usersApi.updateProfileImage(user.id, file);
      if (response.success && response.data) {
        const updatedUser = response.data as User;
        await updateUser({ profileImage: updatedUser.profileImage });
        if (updatedUser.profileImage) {
          onImageUpdate(updatedUser.profileImage);
        }
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Please try again.');
      // Revert preview on error
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        {preview ? (
          <img
            src={preview}
            alt={userName}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-4xl sm:text-5xl font-bold text-[#7BA09F]">
              {userName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-white text-xs font-medium px-3 py-1.5 bg-[#7BA09F] rounded-lg hover:bg-[#6a8f8e] transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Change'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
