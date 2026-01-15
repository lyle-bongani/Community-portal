'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#7BA09F] border-b border-[#6a8f8e] shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-12 sm:h-14' : 'h-16 sm:h-18 md:h-20 lg:h-24'
        }`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Image 
                  src="/images/logo.png" 
                  alt="Community Portal Logo" 
                  width={isScrolled ? 60 : 80}
                  height={isScrolled ? 60 : 80}
                  className="object-contain transition-all duration-300 brightness-0 invert w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-20 lg:h-20"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link
              href="#about"
              className="text-white hover:text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              About
            </Link>
            <Link
              href="#features"
              className="text-white hover:text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Features
            </Link>
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
              Get Started
            </Link>
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
            <div className="flex flex-col space-y-3">
              <Link
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/90 px-3 py-2 rounded-lg text-base font-medium hover:bg-white/20 transition-colors"
              >
                About
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/90 px-3 py-2 rounded-lg text-base font-medium hover:bg-white/20 transition-colors"
              >
                Features
              </Link>
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
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
