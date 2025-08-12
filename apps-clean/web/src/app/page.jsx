"use client";

import { Link } from "react-router";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-12">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">♪</span>
          </div>
          <h1 className="text-5xl font-bold text-black mb-4">
            MIDI Training App
          </h1>
          <p className="text-xl text-black/70 max-w-2xl mx-auto">
            Master music theory through interactive training exercises
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/counterpoint"
            className="px-8 py-6 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[280px] block"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold mb-2">Counterpoint Trainer</h3>
              <p className="text-gray-300 text-sm">
                Learn species counterpoint with interactive piano roll
              </p>
            </div>
          </Link>

          <Link
            to="/chord-recognition"
            className="px-8 py-6 bg-white text-black font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[280px] border-2 border-black/10 block"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold mb-2">MIDI Chord Recognition</h3>
              <p className="text-gray-600 text-sm">
                Train your ear to recognize chord progressions
              </p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}