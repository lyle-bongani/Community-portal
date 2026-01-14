export default function LandingFeatures() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      title: 'Share Posts',
      description: 'Create and share posts with your community members. Share updates, ideas, and engage in meaningful conversations.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Discover Events',
      description: 'Find and register for upcoming community events. Never miss out on local gatherings, workshops, and social activities.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#7BA09F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Connect',
      description: 'Build meaningful connections with your community. Meet new people, collaborate on projects, and grow together.',
    },
  ];

  return (
    <section id="features" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto">
            Everything you need to stay connected and engaged with your community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 text-left border border-zinc-100">
              <div className="w-12 h-12 bg-[#7BA09F]/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2 text-left">{feature.title}</h3>
              <p className="text-zinc-600 text-left leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
