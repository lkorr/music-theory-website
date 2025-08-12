import { Link } from "react-router";

export default function MainPage() {
  const apps = [
    {
      id: 'chord-recognition',
      title: 'Chord Recognition',
      description: 'Develop your chord recognition skills through progressive difficulty levels. Train with basic triads, extended chords, jazz harmonies, and chord progressions.',
      icon: '♪',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      path: '/chord-recognition',
      features: ['Basic Triads', 'Extended Chords', 'Jazz Harmonies', 'Chord Progressions']
    },
    {
      id: 'counterpoint',
      title: 'Counterpoint',
      description: 'Master the art of counterpoint composition with interactive exercises. Learn species counterpoint rules and compose beautiful melodic lines.',
      icon: '♫',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      path: '/counterpoint',
      features: ['Species Counterpoint', 'Interactive Piano Roll', 'Rule Validation', 'Composition Practice']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9]">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-2xl font-bold">♪</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            MIDI Training App
          </h1>
          <p className="text-xl text-black/70 max-w-2xl mx-auto">
            Welcome to the comprehensive music theory training platform
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Choose Your Training App
          </h2>
          <p className="text-lg text-black/70 max-w-3xl mx-auto">
            Select from our specialized training applications to improve your music theory knowledge and skills.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {apps.map((app) => (
            <Link
              key={app.id}
              to={app.path}
              className="block group"
            >
              <div className="bg-white/30 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-full ${app.color} flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">{app.icon}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-black/10 text-black">
                      Interactive
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-black mb-3">
                  {app.title}
                </h3>
                
                <p className="text-black/70 mb-6 leading-relaxed">
                  {app.description}
                </p>

                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-semibold text-black/80 mb-2">Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {app.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-black/70">
                        <span className="w-1.5 h-1.5 bg-black/40 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center text-black font-semibold group-hover:text-black/80 transition-colors">
                  Start Training
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-black mb-4">About MIDI Training</h3>
            <p className="text-black/70 leading-relaxed mb-6">
              Our comprehensive music theory training platform combines interactive exercises with 
              real-time feedback to help you master essential musical concepts. Whether you're a 
              beginner or advanced musician, our adaptive training system will help you improve 
              your skills at your own pace.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-black/80">
              <div className="text-center">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">1</span>
                </div>
                <p className="font-medium">Interactive Learning</p>
                <p className="text-xs mt-1">Hands-on exercises with immediate feedback</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">2</span>
                </div>
                <p className="font-medium">Progressive Difficulty</p>
                <p className="text-xs mt-1">Structured learning path from basics to advanced</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">3</span>
                </div>
                <p className="font-medium">Real-time Validation</p>
                <p className="text-xs mt-1">Instant feedback on your musical choices</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}