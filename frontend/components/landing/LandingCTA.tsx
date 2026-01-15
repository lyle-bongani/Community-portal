import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section className="bg-[#7BA09F] py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 px-2">
          Ready to Join Your Community?
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
          Start connecting with your community today. It's easy and takes less than a minute to get started.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 items-center px-2">
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[#7BA09F] bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-white/95 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Create Account</span>
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
