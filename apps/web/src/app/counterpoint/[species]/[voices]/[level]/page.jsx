"use client";

import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { 
  getExerciseBySpeciesVoiceLevel,
  getVoiceDisplayName,
  getExercisesForSpeciesAndVoice
} from "../../../shared/utils/exerciseUtils.js";

export default function CounterpointExercisePage() {
  const params = useParams();
  const [exercise, setExercise] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse URL parameters
  const speciesNumber = parseInt(params.species?.replace('species-', '') || '1');
  const voiceCategory = params.voices;
  const level = parseInt(params.level?.replace('level-', '') || '1');

  useEffect(() => {
    const loadExercise = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the specific exercise
        const exerciseData = getExerciseBySpeciesVoiceLevel(speciesNumber, voiceCategory, level);
        
        if (!exerciseData) {
          setError(`Exercise not found: Species ${speciesNumber}, ${getVoiceDisplayName(voiceCategory)}, Level ${level}`);
          return;
        }

        // Get all exercises for navigation
        const allExerciseData = getExercisesForSpeciesAndVoice(speciesNumber, voiceCategory);

        setExercise(exerciseData);
        setAllExercises(allExerciseData);
      } catch (err) {
        setError(`Error loading exercise: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [speciesNumber, voiceCategory, level]);

  const getSpeciesColor = (species) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-blue-500', 
      3: 'bg-purple-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[species] || 'bg-gray-500';
  };

  const getCurrentExerciseIndex = () => {
    return allExercises.findIndex(ex => ex.id === exercise?.id);
  };

  const getPreviousExercise = () => {
    const currentIndex = getCurrentExerciseIndex();
    return currentIndex > 0 ? allExercises[currentIndex - 1] : null;
  };

  const getNextExercise = () => {
    const currentIndex = getCurrentExerciseIndex();
    return currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white font-medium">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Exercise Not Found</h2>
            <p className="text-red-300/80">{error}</p>
          </div>
          <Link
            to="/counterpoint"
            className="inline-block bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300"
          >
            ← Back to Counterpoint
          </Link>
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
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/counterpoint" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">
                Species {speciesNumber} • {getVoiceDisplayName(voiceCategory)}
              </h1>
              <p className="text-white/60 text-sm">
                Level {level} of {allExercises.length} • Figure {exercise?.figure}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getCurrentExerciseIndex() > 0 && (
              <Link
                to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${getCurrentExerciseIndex()}`}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-sm">‹</span>
              </Link>
            )}
            {getCurrentExerciseIndex() < allExercises.length - 1 && (
              <Link
                to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${getCurrentExerciseIndex() + 2}`}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-sm">›</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Species Rules Overview */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-full ${getSpeciesColor(speciesNumber)} flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{speciesNumber}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Species {speciesNumber} Counterpoint Rules</h2>
              <p className="text-white/70 text-sm">Learn the fundamental rules before practicing</p>
            </div>
          </div>

          {speciesNumber === 1 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2 text-base">Note-Against-Note (1:1)</h3>
                    <div className="text-white/80 text-sm space-y-2">
                      <p><strong>Basic Principle:</strong> Write one whole note against each note of the cantus firmus.</p>
                      <p><strong>Note Duration:</strong> Each counterpoint note lasts exactly one measure.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2 text-base">Interval Rules</h3>
                    <div className="text-white/80 text-sm space-y-2">
                      <p><strong>Beginning & Ending:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Begin with perfect consonance (unison, 5th, or octave)</li>
                        <li>End with perfect consonance (unison or octave preferred)</li>
                      </ul>
                      <p><strong>Interior Intervals:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Use consonant intervals: unison, 3rd, 5th, 6th, octave</li>
                        <li>Avoid dissonant intervals: 2nd, 4th, 7th, tritone</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2 text-base">Motion & Voice Leading</h3>
                    <div className="text-white/80 text-sm space-y-2">
                      <p><strong>Forbidden Motions:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>No parallel perfect consonances (5ths, octaves, unisons)</li>
                        <li>No direct motion to perfect consonances</li>
                        <li>Avoid large melodic leaps</li>
                      </ul>
                      <p><strong>Preferred Motions:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Contrary motion (voices move in opposite directions)</li>
                        <li>Oblique motion (one voice moves, other stays)</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2 text-base">Melodic Guidelines</h3>
                    <div className="text-white/80 text-sm">
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Create a smooth, singable melodic line</li>
                        <li>Prefer stepwise motion and small intervals</li>
                        <li>If you leap, change direction afterward</li>
                        <li>Avoid melodic tritones and augmented intervals</li>
                        <li>Create a clear melodic peak only once</li>
                        <li>End with stepwise motion to the final</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {speciesNumber === 2 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <h3 className="text-white font-semibold mb-2 text-base">Two-Against-One (2:1)</h3>
                  <div className="text-white/80 text-sm space-y-2">
                    <p><strong>Basic Principle:</strong> Write two half notes against each whole note of the cantus firmus.</p>
                    <p><strong>Strong vs Weak Beats:</strong> First half note (downbeat) must be consonant. Second half note may be dissonant if approached and left by step.</p>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="text-white font-semibold mb-2 text-base">Additional Rules</h3>
                  <div className="text-white/80 text-sm">
                    <p className="mb-2">All Species 1 rules apply, plus:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Passing tones allowed on weak beats</li>
                      <li>Dissonant intervals on weak beats must be approached and left by step</li>
                      <li>No parallel motion on consecutive strong beats</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {speciesNumber >= 3 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 text-lg">Species {speciesNumber} Rules</h3>
              <div className="text-white/80 text-sm">
                <p>Advanced species counterpoint rules will be detailed here as you progress through the curriculum.</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-8">
          <Link
            to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${level}/practice`}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
          >
            <span>🎹</span>
            <span>Start</span>
          </Link>
        </div>

        {/* Exercise Navigation */}
        {allExercises.length > 1 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Other {getVoiceDisplayName(voiceCategory)} Exercises in Species {speciesNumber}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allExercises.map((ex, index) => (
                <Link
                  key={ex.id}
                  to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${index + 1}`}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    ex.id === exercise?.id
                      ? `${getSpeciesColor(speciesNumber)} text-white shadow-lg`
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                  }`}
                >
                  <div className="font-semibold">Level {index + 1}</div>
                  <div className="text-xs opacity-80">Fig. {ex.figure}</div>
                  <div className="text-xs opacity-80">{ex.modalFinal?.toUpperCase()}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}