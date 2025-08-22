"use client";

// UNIVERSAL CONTROLLER IMPLEMENTATION - Level 3 Seventh Chords
import { UniversalChordConstructor } from "../../shared/UniversalChordConstructor.jsx";
import { LEVEL_CONFIGS } from "../../data/levelConfigs.js";

// Feature flag for Universal Controller (set to true to enable)
const USE_UNIVERSAL_CONTROLLER = true; // Change to false to use original implementation

// Original implementation kept for fallback
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { noteNames, getMidiNoteName, isBlackKey } from "../../../chord-recognition/seventh-chords/shared/chordLogic.js";

// Original fallback implementation (simplified)
function OriginalLevel3Construction() {
  const [hasStarted, setHasStarted] = useState(false);
  
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Original Seventh Chords Level 3</h2>
            <p className="text-white/80 mb-6">This is the fallback to the original implementation.</p>
            <button
              onClick={() => setHasStarted(true)}
              className="px-12 py-4 bg-cyan-500 text-white text-xl font-bold rounded-xl hover:bg-cyan-600 transition-colors shadow-lg"
            >
              Start Original Level
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Original Implementation Active</h2>
          <p className="text-white/80">This would be the original seventh-chords level 3 implementation.</p>
          <Link 
            to="/chord-construction"
            className="inline-block mt-4 px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
          >
            Back to Levels
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT - USES FEATURE FLAG =====
export default function SeventhChordsLevel3Construction() {
  if (USE_UNIVERSAL_CONTROLLER) {
    // Use the new Universal Controller - SINGLE SOURCE OF TRUTH FOR UI
    return (
      <UniversalChordConstructor 
        levelConfig={LEVEL_CONFIGS["seventh-chords-level3"]} 
      />
    );
  } else {
    // Fallback to original implementation
    return <OriginalLevel3Construction />;
  }
}