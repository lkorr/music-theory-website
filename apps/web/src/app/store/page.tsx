/**
 * Store Page
 * 
 * Store page with same hero section as other pages, followed by "coming soon" content
 */

import { Link } from "react-router";
import AuthButton from "../../components/auth/AuthButton";
import LiveStreamBanner from "../../components/LiveStreamBanner";
import '../global.css';

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* YouTube Live Stream Banner */}
      <LiveStreamBanner />
      
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ambient mix.png" 
            alt="pailiaq ambient mix artwork"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
        </div>
        
        <div className="absolute top-6 right-6 z-20 flex items-center gap-8">
          <nav className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-lg px-1 py-1 border border-white/10">
            <Link 
              to="/about" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              About
            </Link>
            <span className="text-white/30">•</span>
            <a 
              href="/blog" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Blog
            </a>
            <span className="text-white/30">•</span>
            <Link 
              to="/store" 
              className="text-white font-medium transition-colors px-4 py-2 rounded-md bg-blue-600/40"
            >
              Store
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/dashboard" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Dashboard
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/contact" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Contact
            </Link>
          </nav>
          <AuthButton showRegister={true} />
        </div>
        
        <div className="relative z-10 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <a href="/" className="hover:scale-105 transition-transform duration-300">
                <img 
                  src="/pailiaq-logo-small.png" 
                  alt="pailiaq logo"
                  className="w-32 h-32 rounded-full shadow-2xl border-4 border-white/20 cursor-pointer"
                />
              </a>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
              paili<span className="inline-block scale-x-[-1] -ml-0.5 mr-0.5">a</span>q
            </h1>
            
            <p className="text-2xl text-white/80 mb-8 font-light">
              Electronic Music • Sound Design • Education
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Ambient
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Experimental
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Electronica
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Store Content Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Store
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Merchandise, digital releases, and exclusive content coming soon.
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-16 text-center">
              <div className="text-8xl mb-8">🛍️</div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Store Coming Soon
              </h3>
              <p className="text-white/70 text-xl mb-8 leading-relaxed">
                We're preparing an exciting collection of merchandise, exclusive digital releases, 
                sample packs, and limited edition items. Stay tuned for the launch!
              </p>

              {/* What to Expect */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">👕</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Merch</h4>
                  <p className="text-white/60 text-sm">Apparel and accessories</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎵</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Digital</h4>
                  <p className="text-white/60 text-sm">Sample packs and stems</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Exclusive</h4>
                  <p className="text-white/60 text-sm">Limited edition releases</p>
                </div>
              </div>
              
              {/* Newsletter CTA */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-8 max-w-lg mx-auto">
                <h4 className="text-xl font-semibold text-white mb-3">
                  Be First to Know
                </h4>
                <p className="text-white/70 mb-6">
                  Get notified when the store launches and receive exclusive early access to new releases.
                </p>
                <Link
                  to="/#newsletter"
                  className="inline-flex items-center px-8 py-4 bg-purple-600/80 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-300 border border-purple-500/50 text-lg"
                >
                  Join Newsletter
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            {/* Meantime Links */}
            <div className="mt-12 text-center">
              <h4 className="text-lg font-semibold text-white/90 mb-6">
                In the meantime, check out current releases:
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://pailiaq.bandcamp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white/90 font-medium hover:bg-white/20 transition-all duration-300"
                >
                  🎵 Bandcamp
                  <span className="ml-2">↗</span>
                </a>
                <a
                  href="https://open.spotify.com/artist/202f1kyy3iB15e5ol3b7NG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white/90 font-medium hover:bg-white/20 transition-all duration-300"
                >
                  🎧 Spotify
                  <span className="ml-2">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}