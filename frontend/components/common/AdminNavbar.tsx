'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Helper component for user avatar
function AdminUserAvatar({ user, size = 'w-8 h-8' }: { user: any; size?: string }) {
  if (user?.profileImage) {
    return (
      <div className={`${size} rounded-full overflow-hidden`}>
        <img
          src={user.profileImage}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className={`${size} bg-white rounded-full flex items-center justify-center text-[#7BA09F] text-xs font-semibold`}>
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#7BA09F] shadow-lg h-16'
          : 'bg-[#7BA09F] h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Title */}
          <Link href="/admin" className="flex items-center space-x-2 -ml-[10px]">
            <div className={`transition-all duration-300 ${isScrolled ? 'w-16 h-16' : 'w-[110px] h-[110px]'}`}>
              <Image
                src="/images/header%20logo.png"
                alt="Community Portal Logo"
                width={isScrolled ? 64 : 110}
                height={isScrolled ? 64 : 110}
                className="brightness-0 invert object-contain"
                priority
              />
            </div>
            <span
              className={`text-white font-bold transition-all duration-300 ${
                isScrolled
                  ? 'text-lg italic'
                  : 'text-2xl italic'
              }`}
            >
              Admin Portal
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin"
              className="text-white hover:text-zinc-200 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-white hover:text-zinc-200 transition-colors"
              >
                <AdminUserAvatar user={user} size="w-8 h-8" />
                <span className="font-medium">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-zinc-200 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#7BA09F] border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-white hover:text-zinc-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-white hover:text-zinc-200"
            >
              <AdminUserAvatar user={user} size="w-8 h-8" />
              <span className="font-medium">{user.name}</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left text-white hover:text-zinc-200 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
