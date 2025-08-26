import { Link } from "react-router";
import AuthButton from "../components/auth/AuthButton";

interface Platform {
  name: string;
  icon: string;
  url: string;
  description: string;
  isInternal?: boolean;
}

export default function PailiaqHomePage() {
  const musicPlatforms: Platform[] = [
    {
      name: 'Bandcamp',
      icon: '🎵',
      url: 'https://pailiaq.bandcamp.com',
      description: 'Support directly & get high-quality downloads'
    },
    {
      name: 'Spotify',
      icon: '🎧',
      url: 'https://open.spotify.com/artist/202f1kyy3iB15e5ol3b7NG',
      description: 'Stream on Spotify'
    },
    {
      name: 'Apple Music',
      icon: '🍎',
      url: 'https://music.apple.com/us/artist/pailiaq/1474305623',
      description: 'Stream on Apple Music'
    },
    {
      name: 'SoundCloud',
      icon: '☁️',
      url: 'https://soundcloud.com/pailiaq',
      description: 'Latest tracks & works in progress'
    },
    {
      name: 'Tidal',
      icon: '🌊',
      url: 'https://tidal.com/artist/16403977',
      description: 'High-fidelity streaming'
    }
  ];

  const otherLinks: Platform[] = [
    {
      name: 'YouTube Tutorials',
      icon: '📹',
      url: 'https://youtube.com/@pailiaq',
      description: 'Music production tutorials & behind the scenes'
    },
    {
      name: 'Patreon',
      icon: '💜',
      url: 'https://patreon.com/pailiaq',
      description: 'Support my work & get exclusive content'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ambient mix.png" 
            alt="pailiaq ambient mix artwork"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
        </div>
        
        <div className="absolute top-6 right-6 z-20">
          <AuthButton showRegister={true} />
        </div>
        
        <div className="relative z-10 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/pailiaq-logo-small.png" 
                alt="pailiaq logo"
                className="w-32 h-32 rounded-full shadow-2xl border-4 border-white/20"
              />
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
              pailiaq
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
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Listen
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {musicPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{platform.icon}</div>
                    <h3 className="text-xl font-bold text-white">
                      {platform.name}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <a 
            href="https://song.link/us/i/1822937061"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative rounded-3xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
              <img 
                src="/floppy ears artwork.png" 
                alt="Floppy Ears artwork"
                className="w-full h-64 object-cover opacity-80 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 to-transparent flex items-center">
                <div className="p-8 max-w-2xl">
                  <h3 className="text-4xl font-bold text-white mb-2">
                    Floppy Ears
                  </h3>
                  <div className="inline-flex items-center text-white/90 font-medium">
                    Listen Now
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">↗</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </section>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              More Content & Tools
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Tutorials, exclusive content, and interactive music tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherLinks.map((link, index) => (
              <div key={index}>
                {link.isInternal ? (
                  <Link
                    to={link.url}
                    className="block group"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20 h-full">
                      <div className="text-center">
                        <div className="text-5xl mb-4">{link.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {link.name}
                        </h3>
                        <p className="text-white/70">
                          {link.description}
                        </p>
                        <div className="mt-4 inline-flex items-center text-white font-medium">
                          Explore Tools
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20 h-full">
                      <div className="text-center">
                        <div className="text-5xl mb-4">{link.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {link.name}
                        </h3>
                        <p className="text-white/70">
                          {link.description}
                        </p>
                        <div className="mt-4 inline-flex items-center text-white font-medium">
                          Visit
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">↗</span>
                        </div>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="mt-20 bg-black/30 backdrop-blur-md border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            © 2024 pailiaq. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}