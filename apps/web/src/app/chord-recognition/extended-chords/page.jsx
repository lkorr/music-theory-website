"use client";

import { Link } from "react-router";

export default function ExtendedChordsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl text-white">♪</span>
        </div>
        
        <h1 className="text-4xl font-bold text-black mb-6">Extended Chords</h1>
        <p className="text-xl text-black/70 mb-8">
          This level featuring 7th chords, 9th chords, and more complex harmonies is coming soon!
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            to="/chord-recognition"
            className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            ← Back to Levels
          </Link>
          <Link
            to="/chord-recognition/basic-triads"
            className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors border-2 border-black/10"
          >
            Try Basic Triads
          </Link>
        </div>
      </div>
    </div>
  );
}