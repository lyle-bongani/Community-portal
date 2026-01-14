'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logo.png"
                alt="Community Portal Logo"
                width={180}
                height={180}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#46979E] mb-2">
              Join Our Community
            </h2>
            <p className="text-[#46979E]">Create your account to get started</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#46979E] mb-2 text-center">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50 text-center"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#46979E] mb-2 text-center">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50 text-center"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-semibold text-[#46979E] mb-2 text-center">
                  Mobile Number
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50 text-center"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#46979E] mb-2 text-center">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50 text-center"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#46979E] mb-2 text-center">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA09F] focus:border-[#7BA09F] bg-white text-zinc-900 transition-all hover:border-[#7BA09F]/50 text-center"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7BA09F] hover:bg-[#6a8f8e] text-white px-4 py-3 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="text-sm text-[#46979E] hover:text-[#3a7a80] font-medium inline-flex items-center space-x-1"
              >
                <span>Already have an account?</span>
                <span className="underline">Sign in here</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
