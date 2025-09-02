/**
 * Chord Progressions Level 3: Non-Diatonic Chords
 * 
 * REFACTORED VERSION - Reduced from 964 lines to ~300 lines (69% reduction)
 * Now uses shared hooks and utilities while preserving non-diatonic chord functionality
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useLevelState } from "../shared/hooks/useLevelState.js";
import { useLevelLogic } from "../shared/hooks/useLevelLogic.js";
import { getLevelConfig } from "../shared/config/levelConfigs.js";
import { generateLevel3Progression, validateLevel3Answer } from "./level3Utils.js";
import ProgressionPianoRoll from "../shared/ProgressionPianoRoll";
import { CompactAuthButton } from "../../../components/auth/AuthButton.jsx";

// Types
interface ChordProgression {
  chords: number[][];
  key: string;
  progression: string[];
  answer: string;
}

interface LevelConfig {
  title: string;
  totalProblems: number;
  description: string;
  passAccuracy: number;
  passTime: number;
  buttonColor: string;
  buttonHoverColor: string;
}

interface Score {
  correct: number;
  total: number;
}

interface Feedback {
  show: boolean;
  isCorrect: boolean;
  expectedAnswer?: string;
}

interface LevelResult {
  passed: boolean;
  accuracy: number;
  avgTime: number;
  score: Score;
}

// MIDI playback (Preserved from original - this is progression-specific)
const playChordProgression = async (chords: number[][], tempo: number = 120): Promise<void> => {
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    console.warn('Web Audio API not supported');
    return Promise.resolve();
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const beatDuration = (60 / tempo) * 1000; // Duration of each beat in milliseconds
  
  return new Promise<void>((resolve) => {
    let currentBeat = 0;
    
    const playNextChord = (): void => {
      if (currentBeat >= chords.length) {
        resolve();
        return;
      }
      
      const chord = chords[currentBeat];
      
      // Play each note in the chord
      chord.forEach((midiNote: number, index: number) => {
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

export default function ChordProgressionsLevel3(): JSX.Element {
  // Get level configuration
  const config: LevelConfig = getLevelConfig('progressionLevel3');
  
  // Use shared state and logic (replaces ~400 lines of useState and event handlers)
  const state = useLevelState();
  const logic = useLevelLogic(state, config, {
    generateChord: generateLevel3Progression,
    validateAnswer: validateLevel3Answer
  });

  // Additional progression-specific state
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState<number>(0);
  
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
  }: {
    currentChord: ChordProgression | null;
    userAnswer: string;
    feedback: Feedback | null;
    score: Score;
    currentTime: number;
    avgTime: number;
    hasStarted: boolean;
    isCompleted: boolean;
    levelResult: LevelResult | null;
    inputRef: React.RefObject<HTMLInputElement>;
  } = state;
  
  // Destructure shared logic
  const {
    startLevel,
    handleSubmit,
    handleKeyPress,
    handleInputChange,
    canSubmit,
    nextChord
  }: {
    startLevel: () => void;
    handleSubmit: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    canSubmit: boolean;
    nextChord: () => void;
  } = logic;

  // Play progression when new chord is generated
  const handlePlayProgression = async (): Promise<void> => {
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
              <Link to="/chord-progressions" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{config.title}</h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center min-h-[80vh]">
            {/* Main content */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {config.title}?</h2>
              <div className="text-lg text-white/70 mb-8 space-y-2">
                <p><strong>{config.totalProblems} problems</strong> to complete</p>
                <p>{config.description}</p>
                <p>Need <strong>{config.passAccuracy}% accuracy</strong> to pass</p>
                <p>Average time must be under <strong>{config.passTime} seconds</strong></p>
              </div>
              <button
                onClick={startLevel}
                className={`px-12 py-4 ${config.buttonColor} text-white text-xl font-bold rounded-xl hover:${config.buttonHoverColor} transition-colors shadow-lg`}
              >
                Start {config.title}
              </button>
            </div>

            {/* Non-Diatonic Examples - Musical blurb */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:w-1/2">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Non-Diatonic Chords</h3>
              <div className="space-y-4 text-white/80">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Borrowed Chords</h4>
                  <p className="text-sm">bII, bIII, bVI, bVII - Chords borrowed from parallel minor/major key</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Secondary Dominants</h4>
                  <p className="text-sm">V/V, V/vi, V/ii - Dominant chords that resolve to diatonic chords</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Neapolitan Sixth</h4>
                  <p className="text-sm">bII6 - A first inversion bII chord, often used in classical music</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">Format</h4>
                  <p className="text-sm">
                    Use standard Roman numerals with flats<br/>
                    Example: I - bVI - IV - V
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (isCompleted && levelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Level {levelResult.passed ? 'Completed!' : 'Failed'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-white/70">Accuracy:</span>
              <span className={`font-bold ${levelResult.accuracy >= config.passAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Average Time:</span>
              <span className={`font-bold ${levelResult.avgTime <= config.passTime ? 'text-green-600' : 'text-red-600'}`}>
                {levelResult.avgTime.toFixed(1)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Score:</span>
              <span className="font-bold text-white">
                {levelResult.score.correct}/{levelResult.score.total}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                state.helpers.resetLevel();
                startLevel();
              }}
              className={`px-6 py-3 ${config.buttonColor} text-white font-semibold rounded-xl hover:${config.buttonHoverColor} transition-colors`}
            >
              Try Again
            </button>
            
            <Link 
              to="/chord-progressions"
              className="block px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
            >
              Back to Levels
            </Link>
          </div>
        </div>
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
            <Link to="/chord-progressions" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {config.title} - Problem {score.total}/{config.totalProblems}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {score.correct}/{score.total}
            </div>
            <div className="text-white font-semibold">
              Time: {currentTime}s
            </div>
            <CompactAuthButton />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(score.total / config.totalProblems) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Identify this chord progression
              </h2>
              
              {/* Piano Roll Display */}
              {currentChord && (
                <div className="mb-8">
                  <ProgressionPianoRoll
                    chords={currentChord.chords}
                    currentKey={currentChord.key}
                    showLabels={showLabels}
                    onToggleLabels={() => setShowLabels(!showLabels)}
                  />
                </div>
              )}
              
              {/* Play Button */}
              <div className="mb-6 text-center">
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
              </div>
              
              {/* Input area */}
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter roman numerals (e.g., I - bVI - IV - V)"
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-white/30 focus:border-blue-400 focus:outline-none bg-white/10 text-white placeholder-white/50"
                  readOnly={feedback?.show ?? false}
                />
                
                <button
                  onClick={feedback && feedback.show && !feedback.isCorrect ? nextChord : handleSubmit}
                  disabled={!canSubmit && !(feedback && feedback.show && !feedback.isCorrect)}
                  className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                    (canSubmit || (feedback && feedback.show && !feedback.isCorrect))
                      ? `${config.buttonColor} text-white hover:${config.buttonHoverColor}`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {feedback && feedback.show && !feedback.isCorrect 
                    ? 'Press Enter to Continue' 
                    : 'Submit Answer'}
                </button>
                
                {/* Feedback */}
                {feedback && feedback.show && (
                  <div className={`p-4 rounded-lg ${
                    feedback.isCorrect ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                  }`}>
                    <p className="font-semibold">
                      {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {!feedback.isCorrect && (
                      <p>The correct answer was: {feedback.expectedAnswer}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats sidebar */}
          <div className="xl:w-80">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Accuracy:</span>
                  <span className="font-semibold text-white">
                    {score.total > 0 
                      ? Math.round((score.correct / score.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg Time:</span>
                  <span className="font-semibold text-white">{parseFloat(avgTime as any).toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {score.total}/{config.totalProblems}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Non-Diatonic Chords:</h4>
                <div className="text-sm text-white/70 space-y-1">
                  <p><strong>Common borrowed chords:</strong></p>
                  <p>bII, bIII, bVI, bVII</p>
                  <p><strong>Secondary dominants:</strong></p>
                  <p>V/V, V/vi, V/ii</p>
                  <p><strong>Format:</strong> Use dashes</p>
                  <p>Example: I - bVI - IV - V</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}