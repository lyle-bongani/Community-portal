export default function LandingAbout() {
  return (
    <section id="about" className="bg-zinc-50 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-3 sm:mb-4 px-2">
            About Community Portal
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto px-2">
            A platform designed to bring communities together through shared experiences, events, and meaningful connections.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          <div className="bg-white rounded-xl p-6 sm:p-7 md:p-8 shadow-lg">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#7BA09F]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4">Community First</h3>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              We believe in the power of community. Our platform is built to help you connect with neighbors, share ideas, and build lasting relationships with people who matter.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 sm:p-7 md:p-8 shadow-lg">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#7BA09F]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4">Safe & Secure</h3>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Your privacy and security are our top priorities. We use industry-standard encryption and security measures to protect your data and ensure a safe environment for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
