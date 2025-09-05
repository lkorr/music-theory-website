/**
 * About Page
 * 
 * About/Biography page with same hero section as other pages, followed by biographical content
 */

import { Link } from "react-router";
import AuthButton from "../../components/auth/AuthButton";
import LiveStreamBanner from "../../components/LiveStreamBanner";
import '../global.css';

export default function AboutPage() {
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
              className="text-white font-medium transition-colors px-4 py-2 rounded-md bg-blue-600/40"
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
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
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

      <main className="max-w-4xl mx-auto p-6">
        {/* About Content Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              About
            </h2>
            <p className="text-xl text-white/70 leading-relaxed">
              Electronic music producer, educator, and technology enthusiast exploring the intersection of sound, code, and creativity.
            </p>
          </div>

          {/* Biography Content */}
          <div className="space-y-12">
            {/* Main Bio */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-4">🎵</span>
                Musical Journey
              </h3>
              <div className="text-white/80 leading-relaxed space-y-4">
                <p>
                  Pailiaq began as an exploration into the depths of ambient and experimental electronic music, 
                  drawing inspiration from the vastness of space, the intricacies of sound design, and the 
                  endless possibilities of digital audio manipulation.
                </p>
                <p>
                  The project combines traditional musical composition with cutting-edge technology, creating 
                  immersive soundscapes that blur the line between organic and synthetic, familiar and alien, 
                  structure and improvisation.
                </p>
                <p>
                  Each release represents a different facet of electronic music exploration—from minimal ambient 
                  textures to complex rhythmic patterns, always with an emphasis on atmosphere, emotion, and 
                  sonic experimentation.
                </p>
              </div>
            </div>

            {/* Philosophy & Approach */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-4">💭</span>
                Philosophy & Approach
              </h3>
              <div className="text-white/80 leading-relaxed space-y-4">
                <p>
                  Music, at its core, is mathematics made audible—patterns, frequencies, and relationships 
                  that resonate with our deepest human experiences. Electronic music allows us to explore 
                  these relationships in ways that acoustic instruments cannot.
                </p>
                <p>
                  Through careful sound design, strategic use of space and silence, and an understanding 
                  of psychoacoustics, each track aims to create an emotional journey that transcends 
                  traditional song structures.
                </p>
                <blockquote className="border-l-4 border-blue-400 pl-6 italic text-white/70">
                  "The goal isn't to make music that sounds electronic, but to use electronic tools 
                  to make music that sounds impossible."
                </blockquote>
              </div>
            </div>

            {/* Education & Technology */}
            <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 backdrop-blur-md border border-green-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-4">🎓</span>
                Education & Technology
              </h3>
              <div className="text-white/80 leading-relaxed space-y-4">
                <p>
                  Beyond music production, there's a deep passion for music education and technology. 
                  This includes developing interactive learning tools, exploring generative music systems, 
                  and creating resources that help others understand the technical and theoretical aspects 
                  of electronic music.
                </p>
                <p>
                  The intersection of code and composition offers endless possibilities—from algorithmic 
                  composition tools to real-time audio processing, from interactive web applications to 
                  educational platforms that make music theory accessible and engaging.
                </p>
                <p>
                  Every project, whether musical or educational, is an opportunity to push boundaries 
                  and explore new ways of understanding and creating sound.
                </p>
              </div>
            </div>

            {/* Current Projects */}
            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-4">🚀</span>
                Current Projects
              </h3>
              <div className="text-white/80 leading-relaxed space-y-4">
                <ul className="space-y-3 list-none">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">▸</span>
                    <div>
                      <strong>New Album:</strong> Working on a full-length ambient album exploring themes 
                      of space exploration and cosmic phenomena.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">▸</span>
                    <div>
                      <strong>Music Education Platform:</strong> Developing interactive tools for learning 
                      music theory, ear training, and composition.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">▸</span>
                    <div>
                      <strong>Live Performances:</strong> Experimenting with real-time generative music 
                      systems and immersive audio experiences.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">▸</span>
                    <div>
                      <strong>Collaborations:</strong> Open to working with other artists, developers, 
                      and educators on innovative music and technology projects.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Connect */}
            <div className="text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Connect
              </h3>
              <p className="text-white/70 mb-6">
                Interested in collaboration, have questions about the music, or want to discuss technology and education?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 border border-blue-500/50"
                >
                  Get In Touch
                  <span className="ml-2">→</span>
                </Link>
                <Link
                  to="/#newsletter"
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300 border border-white/20"
                >
                  Newsletter
                  <span className="ml-2">📧</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}