import Link from 'next/link';
import Image from 'next/image';

export default function LandingFooter() {
  return (
    <footer className="bg-zinc-900 text-white py-10 sm:py-12 md:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center mb-3 sm:mb-4">
              <Image 
                src="/images/logo.png" 
                alt="Community Portal Logo" 
                width={40}
                height={40}
                className="object-contain brightness-0 invert mr-2 sm:mr-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
              <span className="text-lg sm:text-xl font-bold">Community Portal</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 mb-4 max-w-md">
              Bringing communities together through shared experiences, events, and meaningful connections.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-sm sm:text-base text-zinc-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm sm:text-base text-zinc-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm sm:text-base text-zinc-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm sm:text-base text-zinc-400 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm sm:text-base text-zinc-400">
                <a href="mailto:support@communityportal.com" className="hover:text-white transition-colors break-all">
                  support@communityportal.com
                </a>
              </li>
              <li className="text-sm sm:text-base text-zinc-400">
                Community Portal
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-zinc-400">
            © {new Date().getFullYear()} Community Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
