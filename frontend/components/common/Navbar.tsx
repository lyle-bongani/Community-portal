'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Helper component for user avatar
function UserAvatar({ user, size = 'w-6 h-6' }: { user: any; size?: string }) {
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

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
  };

  // Don't show regular navbar for admin users on admin pages
  // Admin users will use AdminNavbar instead
  if (isAuthenticated && user?.isAdmin && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className={`bg-[#7BA09F] backdrop-blur-sm border-b border-[#6a8f8e] sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'shadow-sm' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between transition-all duration-300 ${
          isScrolled ? 'h-14' : 'h-20 sm:h-24'
        }`}>
          <div className="flex items-center -ml-[10px]">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Image 
                  src="/images/header%20logo.png" 
                  alt="Community Portal Logo" 
                  width={110}
                  height={110}
                  className="object-contain transition-all duration-300 brightness-0 invert"
                  priority
                />
              </div>
              <span className={`text-white font-bold italic transition-all duration-300 ${
                isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-4xl'
              }`}>
                Community Portal
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="text-white hover:text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <UserAvatar user={user} />
                  <span className="text-white text-sm hidden lg:inline font-medium">
                    {user?.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#D9191C] hover:bg-[#c01619] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white hover:bg-white/90 text-[#7BA09F] px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/20 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-white/90 px-3 py-2 rounded-lg text-base font-medium hover:bg-white/20 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-white/90 px-3 py-2 rounded-lg text-base font-medium hover:bg-white/20 transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-white/90 hover:bg-white/20 transition-colors"
                >
                  <UserAvatar user={user} size="w-8 h-8" />
                  <span className="text-base font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#D9191C] hover:bg-[#c01619] text-white px-3 py-2 rounded-lg text-base font-medium text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-white/90 px-3 py-2 rounded-lg text-base font-medium hover:bg-white/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-white hover:bg-white/90 text-[#7BA09F] px-3 py-2 rounded-lg text-base font-medium text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
