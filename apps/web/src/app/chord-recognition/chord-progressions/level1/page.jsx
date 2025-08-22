/**
 * Chord Progressions Level 1: Basic Progressions
 * 
 * REFACTORED VERSION - Reduced from 729 lines to ~250 lines (66% reduction)
 * Now uses shared hooks and utilities while preserving progression-specific functionality
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useLevelState } from "../../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../../shared/hooks/useLevelLogic.js";
import { generateLevel1Progression, validateLevel1Answer, level1Config } from "./level1Utils.js";
import ProgressionPianoRoll from "../shared/ProgressionPianoRoll.jsx";
// import { CompactAuthButton } from "../../../../../../components/auth/AuthButton.jsx";

// MIDI playback (Preserved from original - this is progression-specific)
const playChordProgression = (chords, tempo = 120) => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('Web Audio API not supported');
    return Promise.resolve();
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const beatDuration = (60 / tempo) * 1000; // Duration of each beat in milliseconds
  
  return new Promise((resolve) => {
    let currentBeat = 0;
    
    const playNextChord = () => {
      if (currentBeat >= chords.length) {
        resolve();
        return;
      }
      
      const chord = chords[currentBeat];
      
      // Play each note in the chord
      chord.forEach((midiNote, index) => {
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Envelope for more natural sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
      });
      
      currentBeat++;
      setTimeout(playNextChord, beatDuration);
    };
    
    playNextChord();
  });
};

export default function ChordProgressionsLevel1() {
  // Use shared state and logic (replaces ~200 lines of useState and event handlers)
  const state = useLevelState();
  const logic = useLevelLogic(state, level1Config, {
    generateChord: generateLevel1Progression,
    validateAnswer: validateLevel1Answer
  });

  // Additional progression-specific state
  const [showLabels, setShowLabels] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  
  // Destructure shared state
  const {
    currentChord,
    userAnswer,
    feedback,
    score,
    currentTime,
    avgTime,
    hasStarted,
    isCompleted,
    levelResult,
    inputRef
  } = state;
  
  // Destructure shared logic
  const {
    startLevel,
    handleSubmit,
    handleKeyPress,
    handleInputChange,
    canSubmit,
    nextChord
  } = logic;

  // Play progression when new chord is generated
  const handlePlayProgression = async () => {
    if (!currentChord || isPlaying) return;
    
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);
    
    try {
      await playChordProgression(currentChord.chords, 80);
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Auto-play on first chord generation
  useEffect(() => {
    if (currentChord && playCount === 0) {
      handlePlayProgression();
    }
  }, [currentChord, playCount]);

  // Start screen (preserved progression-specific styling)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{level1Config.title}</h1>
            </div>
            {/* <CompactAuthButton /> */}
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {level1Config.title}?</h2>
            <div className="text-lg text-white/70 mb-8 space-y-2">
              <p><strong>{level1Config.totalProblems} problems</strong> to complete</p>
              <p>{level1Config.description}</p>
              <p>Need <strong>{level1Config.passAccuracy}% accuracy</strong> to pass</p>
              <p>Average time must be under <strong>{level1Config.passTime} seconds</strong></p>
            </div>
            <button
              onClick={startLevel}
              className={`px-12 py-4 ${level1Config.buttonColor} text-white text-xl font-bold rounded-xl hover:${level1Config.buttonHoverColor} transition-colors shadow-lg`}
            >
              Start {level1Config.title}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/chord-recognition" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">Level Complete!</h1>
            </div>
            {/* <CompactAuthButton /> */}
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              {levelResult.passed ? '🎉 Congratulations!' : '💪 Keep Practicing!'}
            </h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Final Score</h3>
                <p className="text-2xl font-bold text-green-400">{score.correct}/{score.total}</p>
                <p className="text-sm text-white/70">({Math.round((score.correct / score.total) * 100)}% accuracy)</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Average Time</h3>
                <p className="text-2xl font-bold text-blue-400">{avgTime.toFixed(1)}s</p>
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/chord-recognition/chord-progressions"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to Progressions
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/chord-recognition/chord-progressions" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/40 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">{level1Config.title}</h1>
          </div>
          {/* <CompactAuthButton /> */}
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-6">
        {/* Score display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Score</h3>
              <p className="text-2xl font-bold text-green-400">{score.correct}/{score.total}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Average Time</h3>
              <p className="text-2xl font-bold text-blue-400">{avgTime.toFixed(1)}s</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Current Time</h3>
              <p className="text-2xl font-bold text-yellow-400">{currentTime.toFixed(1)}s</p>
            </div>
          </div>
        </div>

        {/* Piano roll visualization */}
        {currentChord && (
          <ProgressionPianoRoll
            chords={currentChord.chords}
            currentKey={currentChord.key}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
          />
        )}

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={handlePlayProgression}
              disabled={!currentChord || isPlaying}
              className={`px-8 py-4 rounded-xl font-bold text-white transition-colors ${
                isPlaying 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPlaying ? 'Playing...' : 'Play Progression'}
            </button>
            
            <div className="flex items-center space-x-4 w-full max-w-md">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter roman numerals (e.g., I - V - vi - IV)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                  canSubmit
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>
            
            {feedback && (
              <div className={`text-center p-4 rounded-xl ${
                feedback.isCorrect 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-red-600/20 text-red-300'
              }`}>
                <p className="font-bold">
                  {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                {!feedback.isCorrect && (
                  <p className="text-sm mt-1">
                    Expected: {feedback.expectedAnswer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}