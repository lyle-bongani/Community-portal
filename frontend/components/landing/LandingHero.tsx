import Link from 'next/link';
import Image from 'next/image';

export default function LandingHero() {
  return (
    <section className="relative w-full">
      {/* Full Width Hero Image - Full viewport height on mobile */}
      <div className="relative w-full h-screen min-h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
        <Image
          src="/images/hero%20image.jpg"
          alt="Community Portal Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full text-center">
            {/* Logo */}
            <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Community Portal Logo"
                width={200}
                height={200}
                className="object-contain brightness-0 invert drop-shadow-2xl w-48 h-48 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 md:mb-5 leading-tight drop-shadow-lg px-2">
              Your Community,{' '}
              <span className="text-white block sm:inline">
                Your Platform
              </span>
            </h1>
            <p className="text-xs sm:text-base md:text-lg lg:text-xl text-white/90 mb-5 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-2">
              Discover local events, share your thoughts, and connect with neighbors. A vibrant space where communities come together to grow, learn, and thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-semibold text-[#7BA09F] bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-white/95 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Sign Up</span>
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
