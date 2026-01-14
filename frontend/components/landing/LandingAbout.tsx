export default function LandingAbout() {
  return (
    <section id="about" className="bg-zinc-50 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            About Community Portal
          </h2>
          <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto">
            A platform designed to bring communities together through shared experiences, events, and meaningful connections.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-[#7BA09F]/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Community First</h3>
            <p className="text-zinc-600 leading-relaxed">
              We believe in the power of community. Our platform is built to help you connect with neighbors, share ideas, and build lasting relationships with people who matter.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-[#7BA09F]/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Safe & Secure</h3>
            <p className="text-zinc-600 leading-relaxed">
              Your privacy and security are our top priorities. We use industry-standard encryption and security measures to protect your data and ensure a safe environment for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
