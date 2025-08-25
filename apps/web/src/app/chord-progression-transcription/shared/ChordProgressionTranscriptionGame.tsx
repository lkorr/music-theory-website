"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, Play, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { noteNames, getMidiNoteName, isBlackKey } from "../../chord-recognition/shared/theory/core/notes";
import { audioManager } from "../../transcription/shared/audioManager";
import { generateRandomProgression, validateTranscription } from "./progressionTranscriptionLogic";
import { CompactAuthButton } from "../../../components/auth/AuthButton";

// Type definitions
interface PlacedNote {
  midiNote: number;
  beat: number;
}

interface ChordData {
  root: string;
  chordType: string;
  inversion: number;
  midiNotes: number[];
  romanNumeral: string;
}

interface Progression {
  key: string;
  pattern: string[];
  chords: ChordData[];
  allMidiNotes: number[];
}

interface ValidationResult {
  isCorrect: boolean;
  score: number;
  totalNotes: number;
  correctNotes: number;
  wrongNotes: number;
  missingNotes: number[];
  extraNotes: number[];
  feedback: string;
}

interface AudioConfig {
  tempo: number;
  chordDuration: number;
  pauseBetweenChords: number;
  instrument: string;
  baseOctave: number;
  volume: number;
}

interface ScoringConfig {
  perfectScore: number;
  timePenalty: number;
  wrongNotePenalty: number;
  hintPenalty: number;
}

interface AvailableKeys {
  major: string[];
  minor?: string[];
}

interface LevelConfig {
  title: string;
  description: string;
  audio: AudioConfig;
  progressions: string[][];
  availableKeys: AvailableKeys;
  maxAttempts: number;
  showHints: boolean;
  scoring: ScoringConfig;
  theme: string;
  showProgressBar: boolean;
}

interface ThemeStyle {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  pianoRoll: {
    placedNotes: string;
    correctNotes: string;
    incorrectNotes: string;
    playButton: string;
  };
  progressBar: string;
  buttons: {
    primary: string;
    secondary: string;
  };
}

interface ThemeConfig {
  [key: string]: ThemeStyle;
}

interface ErrorState {
  title: string;
  message: string;
  suggestion: string;
}

// Theme configuration (matches transcription themes)
const THEMES: ThemeConfig = {
  emerald: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-emerald-500",
    secondary: "bg-emerald-600", 
    accent: "border-emerald-300",
    text: "text-emerald-100",
    pianoRoll: {
      placedNotes: "bg-emerald-500 border-emerald-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      playButton: "bg-emerald-600 hover:bg-emerald-700"
    },
    progressBar: "bg-emerald-500",
    buttons: {
      primary: "bg-emerald-500 hover:bg-emerald-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  teal: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-teal-500",
    secondary: "bg-teal-600", 
    accent: "border-teal-300",
    text: "text-teal-100",
    pianoRoll: {
      placedNotes: "bg-teal-500 border-teal-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      playButton: "bg-teal-600 hover:bg-teal-700"
    },
    progressBar: "bg-teal-500",
    buttons: {
      primary: "bg-teal-500 hover:bg-teal-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  cyan: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-cyan-500",
    secondary: "bg-cyan-600", 
    accent: "border-cyan-300",
    text: "text-cyan-100",
    pianoRoll: {
      placedNotes: "bg-cyan-500 border-cyan-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      playButton: "bg-cyan-600 hover:bg-cyan-700"
    },
    progressBar: "bg-cyan-500",
    buttons: {
      primary: "bg-cyan-500 hover:bg-cyan-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  },
  purple: {
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-purple-500",
    secondary: "bg-purple-600", 
    accent: "border-purple-300",
    text: "text-purple-100",
    pianoRoll: {
      placedNotes: "bg-purple-500 border-purple-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      playButton: "bg-purple-600 hover:bg-purple-700"
    },
    progressBar: "bg-purple-500",
    buttons: {
      primary: "bg-purple-500 hover:bg-purple-600",
      secondary: "bg-gray-500 hover:bg-gray-600"
    }
  }
};

// Piano Roll Component for Progression Transcription
interface PianoRollProps {
  placedNotes: PlacedNote[];
  onNoteToggle: (midiNote: number, beatIndex: number) => void;
  currentProgression: Progression | null;
  showSolution: boolean;
  feedback: ValidationResult | null;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
  theme: ThemeStyle;
  onPlayProgression: () => void;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

function ProgressionTranscriptionPianoRoll({ 
  placedNotes, 
  onNoteToggle, 
  currentProgression, 
  showSolution, 
  feedback, 
  showLabels, 
  setShowLabels,
  theme,
  onPlayProgression,
  isPlaying,
  volume,
  onVolumeChange
}: PianoRollProps): JSX.Element {
  const pianoKeysRef = useRef<HTMLDivElement>(null);
  const pianoRollRef = useRef<HTMLDivElement>(null);
  const noteHeight = 20;
  const lowestNote = 36;  // C2
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600;
  const beatWidth = 120; // Width for each chord in the progression
  
  // Calculate tonic notes (all instances of the key's tonic across octaves)
  const tonicNotes = new Set<number>();
  if (currentProgression?.key) {
    let tonicName = '';
    if (currentProgression.key.endsWith('m')) {
      // Minor key - remove 'm' suffix  
      tonicName = currentProgression.key.slice(0, -1);
    } else {
      // Major key
      tonicName = currentProgression.key;
    }
    
    // Find all instances of this note across the MIDI range
    for (let midi = lowestNote; midi <= highestNote; midi++) {
      const noteIndex = midi % 12;
      const noteName = noteNames[noteIndex];
      
      // Handle enharmonic equivalents  
      if (noteName === tonicName) {
        tonicNotes.add(midi);
      }
    }
  }
  
  // Auto-scroll to center around middle C
  useEffect(() => {
    if (pianoKeysRef.current && pianoRollRef.current) {
      const middleC = 60; // C4
      const notePosition = (highestNote - middleC) * noteHeight;
      const scrollPosition = notePosition - (containerHeight / 2);
      const clampedScroll = Math.max(0, Math.min(scrollPosition, (totalNotes * noteHeight) - containerHeight));
      
      pianoKeysRef.current.scrollTop = clampedScroll;
      pianoRollRef.current.scrollTop = clampedScroll;
    }
  }, []);

  // Synchronize scrolling between piano keys and piano roll
  const handlePianoKeysScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (pianoRollRef.current) {
      pianoRollRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    }
  };

  const handlePianoRollScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (pianoKeysRef.current) {
      pianoKeysRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    }
  };
  
  const handleNoteClick = (midiNote: number, beatIndex: number) => {
    onNoteToggle(midiNote, beatIndex);
  };

  const handlePianoLabelClick = async (midiNote: number) => {
    // Play the note sound without adding it to the piano roll
    try {
      await audioManager.playNote(midiNote, {
        duration: 0.5,
        instrument: 'piano'
      });
    } catch (error) {
      console.error('Failed to play piano label note:', error);
    }
  };

  // Get note status for visual feedback
  const getNoteStatus = (midiNote: number, beatIndex: number): 'none' | 'correct' | 'incorrect' | 'missing' => {
    if (!showSolution || !currentProgression || !feedback) return 'none';
    
    const beatNotes = currentProgression.chords[beatIndex]?.midiNotes || [];
    const userNotesAtBeat = placedNotes.filter(note => note.beat === beatIndex).map(note => note.midiNote);
    
    const isCorrectNote = beatNotes.includes(midiNote);
    const isUserNote = userNotesAtBeat.includes(midiNote);
    
    if (isUserNote && isCorrectNote) return 'correct';
    if (isUserNote && !isCorrectNote) return 'incorrect';
    if (!isUserNote && isCorrectNote) return 'missing';
    return 'none';
  };
  
  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white text-center flex-1">Progression Transcription Piano Roll</h3>
          <div className="flex items-center space-x-2">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVolumeChange(volume > 0 ? 0 : 0.3)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                title={volume > 0 ? "Mute" : "Unmute"}
              >
                {volume > 0 ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-2 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>
            
            {/* Play Progression Button */}
            <button
              onClick={onPlayProgression}
              disabled={!currentProgression || isPlaying}
              className={`flex items-center space-x-2 px-4 py-2 ${theme.pianoRoll.playButton} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Play the progression to transcribe"
            >
              <Play size={16} className={isPlaying ? "animate-pulse" : ""} />
              <span>{isPlaying ? "Playing..." : "Play Progression"}</span>
            </button>
            
            {/* Label Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/40 transition-colors flex items-center justify-center"
              title={showLabels ? "Hide note labels" : "Show note labels"}
            >
              {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
            </button>
          </div>
        </div>
        
        <p className="text-center text-white/70 mb-4">
          Click "Play Progression" to hear the 4-chord progression, then place notes for each chord on the piano roll
        </p>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '720px', height: `${containerHeight}px` }}>
          <div className="flex">
            {/* Piano keys on the left */}
            <div 
              ref={pianoKeysRef} 
              className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-auto scrollbar-hide" 
              style={{ 
                height: `${containerHeight}px`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onScroll={handlePianoKeysScroll}
            >
              <div style={{ height: `${totalNotes * noteHeight + 32}px` }}>
                {/* Header space to align with beat labels */}
                <div className="h-8 bg-gray-100 border-b border-gray-300"></div>
                
                {Array.from({ length: totalNotes }, (_, i) => {
                  const midiNote = highestNote - i;
                  const noteName = getMidiNoteName(midiNote);
                  const isBlack = isBlackKey(midiNote);
                  const isTonic = tonicNotes.has(midiNote);
                  
                  return (
                    <div 
                      key={midiNote} 
                      className="border-b border-gray-200 flex items-center justify-end pr-3 cursor-pointer"
                      style={{ 
                        height: `${noteHeight}px`,
                        backgroundColor: isTonic 
                          ? 'rgba(34, 197, 94, 0.5)' // Green for tonic notes with 50% opacity
                          : isBlack ? '#6b7280' : '#ffffff', // Grey for black keys, white for white keys
                        color: isTonic || isBlack ? '#ffffff' : '#000000'
                      }}
                      onClick={() => handlePianoLabelClick(midiNote)}
                    >
                      <span className={`${
                        isTonic || isBlack 
                          ? "text-xs text-white font-semibold" 
                          : "text-xs text-gray-600"
                      } ${showLabels ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                        {noteName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Interactive piano roll area with beats */}
            <div 
              ref={pianoRollRef} 
              className="flex-1 relative bg-gray-50 overflow-y-auto scrollbar-hide" 
              style={{ 
                height: `${containerHeight}px`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }} 
              onScroll={handlePianoRollScroll}
            >
              <div style={{ height: `${totalNotes * noteHeight + 32}px`, width: `${4 * beatWidth}px` }}>
                {/* Beat separators */}
                {[1, 2, 3].map(beatIndex => (
                  <div 
                    key={`separator-${beatIndex}`}
                    className="absolute border-l-2 border-gray-400"
                    style={{ 
                      left: `${beatIndex * beatWidth}px`,
                      top: 0,
                      height: `${totalNotes * noteHeight + 32}px`
                    }}
                  />
                ))}
                
                {/* Beat labels */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 border-b border-gray-300 flex">
                  {[1, 2, 3, 4].map(beatNum => (
                    <div 
                      key={`beat-label-${beatNum}`}
                      className="flex items-center justify-center font-semibold text-gray-700"
                      style={{ width: `${beatWidth}px` }}
                    >
                      Chord {beatNum}
                    </div>
                  ))}
                </div>
                
                {/* Grid lines with background colors matching piano keys */}
                {Array.from({ length: totalNotes }, (_, i) => {
                  const midiNote = highestNote - i;
                  const isBlack = isBlackKey(midiNote);
                  return (
                    <div 
                      key={`line-${i}`} 
                      className={`absolute left-0 right-0 border-b ${
                        isBlack ? "border-gray-400 bg-gray-200" : "border-gray-200 bg-white"
                      }`}
                      style={{ 
                        top: `${(i * noteHeight) + 32}px`,
                        height: `${noteHeight}px`
                      }} 
                    />
                  );
                })}
                
                {/* Clickable areas for each beat */}
                {[0, 1, 2, 3].map(beatIndex => (
                  <div
                    key={`beat-${beatIndex}`}
                    className="absolute bg-transparent cursor-pointer"
                    style={{
                      left: `${beatIndex * beatWidth}px`,
                      top: '32px',
                      width: `${beatWidth}px`,
                      height: `${totalNotes * noteHeight}px`
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const noteIndex = Math.floor(y / noteHeight);
                      const midiNote = highestNote - noteIndex;
                      if (midiNote >= lowestNote && midiNote <= highestNote) {
                        handleNoteClick(midiNote, beatIndex);
                      }
                    }}
                  />
                ))}
                
                {/* Placed notes */}
                {placedNotes.map((noteData, index) => {
                  const { midiNote, beat } = noteData;
                  const yPos = (highestNote - midiNote) * noteHeight + 32;
                  const status = getNoteStatus(midiNote, beat);
                  
                  let noteClass = theme.pianoRoll.placedNotes;
                  if (showSolution && status === 'correct') {
                    noteClass = theme.pianoRoll.correctNotes;
                  } else if (showSolution && status === 'incorrect') {
                    noteClass = theme.pianoRoll.incorrectNotes;
                  }
                  
                  return (
                    <div
                      key={`${midiNote}-${beat}-${index}`}
                      className={`absolute rounded-lg shadow-lg ${noteClass} cursor-pointer hover:opacity-80 transition-opacity`}
                      style={{
                        left: `${beat * beatWidth + 4}px`,
                        top: `${yPos + 2}px`,
                        width: `${beatWidth - 8}px`,
                        height: `${noteHeight - 4}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNoteClick(midiNote, beat);
                      }}
                    />
                  );
                })}
                
                {/* Show missing notes when solution is revealed */}
                {showSolution && currentProgression && currentProgression.chords && currentProgression.chords.map((chord, beatIndex) => 
                  chord.midiNotes.map(midiNote => {
                    const userNotesAtBeat = placedNotes.filter(note => note.beat === beatIndex).map(note => note.midiNote);
                    if (!userNotesAtBeat.includes(midiNote)) {
                      const yPos = (highestNote - midiNote) * noteHeight + 32;
                      return (
                        <div
                          key={`missing-${midiNote}-${beatIndex}`}
                          className="absolute rounded-lg border-2 border-dashed border-green-500 bg-green-500/20"
                          style={{
                            left: `${beatIndex * beatWidth + 4}px`,
                            top: `${yPos + 2}px`,
                            width: `${beatWidth - 8}px`,
                            height: `${noteHeight - 4}px`
                          }}
                        />
                      );
                    }
                    return null;
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main Game Component
interface GameProps {
  levelConfig: LevelConfig;
}

export function ChordProgressionTranscriptionGame({ levelConfig }: GameProps): JSX.Element {
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [feedback, setFeedback] = useState<ValidationResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [score, setScore] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const theme = THEMES[levelConfig?.theme] || THEMES.teal;

  // Generate new progression
  const generateNewProgression = () => {
    if (!levelConfig || !levelConfig.progressions || !levelConfig.availableKeys || !levelConfig.audio) {
      console.warn('Level config not fully loaded yet, skipping progression generation');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Generating progression with config:', {
        progressions: levelConfig.progressions,
        availableKeys: levelConfig.availableKeys,
        audioConfig: levelConfig.audio
      });
      
      const newProgression = generateRandomProgression(levelConfig);
      console.log('Generated progression:', newProgression);
      
      // Validate the generated progression has required properties
      if (!newProgression || !newProgression.chords || !newProgression.allMidiNotes) {
        throw new Error('Generated progression is missing required properties');
      }
      
      setCurrentProgression(newProgression);
      setPlacedNotes([]);
      setFeedback(null);
      setShowSolution(false);
    } catch (error) {
      console.error('Error generating progression:', error);
      console.error('Error details:', (error as Error).message, (error as Error).stack);
      setFeedback({ 
        isCorrect: false, 
        feedback: `Error generating progression: ${(error as Error).message}. Please try again.`,
        totalNotes: 0,
        correctNotes: 0,
        wrongNotes: 0,
        missingNotes: [],
        extraNotes: [],
        score: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    generateNewProgression();
    audioManager.setVolume(volume);
  }, [levelConfig]);

  // Update volume
  useEffect(() => {
    audioManager.setVolume(volume);
  }, [volume]);

  // Toggle note on piano roll
  const handleNoteToggle = async (midiNote: number, beat: number) => {
    // Play the note sound when clicked
    try {
      await audioManager.playNote(midiNote, {
        duration: 0.5,
        instrument: levelConfig?.audio?.instrument || 'piano'
      });
    } catch (error) {
      console.error('Failed to play note:', error);
    }
    
    setPlacedNotes(prev => {
      const existingIndex = prev.findIndex(note => note.midiNote === midiNote && note.beat === beat);
      if (existingIndex >= 0) {
        // Remove note
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add note
        return [...prev, { midiNote, beat }];
      }
    });
  };

  // Play progression
  const handlePlayProgression = async () => {
    if (!currentProgression || !currentProgression.chords || isPlaying) return;

    try {
      setIsPlaying(true);
      const { tempo, chordDuration } = levelConfig.audio;
      const chordDurationSec = chordDuration / 1000;
      
      for (let i = 0; i < currentProgression.chords.length; i++) {
        const chord = currentProgression.chords[i];
        await audioManager.playChordFromNotes(chord.midiNotes, {
          duration: chordDurationSec,
          instrument: levelConfig.audio.instrument
        });
        
        // Wait for chord duration plus small pause
        if (i < currentProgression.chords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, chordDuration + 200));
        }
      }
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Submit answer
  const handleSubmit = () => {
    if (!currentProgression || !currentProgression.chords) return;

    const userNotes = placedNotes.map(note => note.midiNote);
    const result = validateTranscription(userNotes, currentProgression, {
      tolerateOctaveErrors: true
    });

    setFeedback(result);
    setShowSolution(true);
    
    if (result.isCorrect) {
      setScore(prev => prev + result.score);
      setQuestionsCompleted(prev => prev + 1);
    }
  };

  // Reset current progression
  const handleReset = () => {
    setPlacedNotes([]);
    setFeedback(null);
    setShowSolution(false);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center`}>
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} relative`}>
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/chord-progression-transcription" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig?.title || 'Loading...'}
            </h1>
          </div>
          <CompactAuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Progress Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="text-lg font-semibold">Score: {score}</span>
              <span className="mx-4 text-white/70">|</span>
              <span>Completed: {questionsCompleted}</span>
            </div>
            <div className="text-white/70">
              Key: {currentProgression ? currentProgression.key : '--'} | 
              Pattern: {currentProgression ? currentProgression.pattern.join(' - ') : '--'}
            </div>
          </div>
        </div>

        {/* Piano Roll */}
        <ProgressionTranscriptionPianoRoll
          placedNotes={placedNotes}
          onNoteToggle={handleNoteToggle}
          currentProgression={currentProgression}
          showSolution={showSolution}
          feedback={feedback}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          theme={theme}
          onPlayProgression={handlePlayProgression}
          isPlaying={isPlaying}
          volume={volume}
          onVolumeChange={setVolume}
        />

        {/* Feedback */}
        {feedback && (
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 ${feedback?.isCorrect ? 'border border-green-500/50' : 'border border-red-500/50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${feedback?.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              {feedback?.isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h3>
            <p className="text-white/80 mb-4">{feedback?.feedback || 'No feedback available'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70">
              <div>Total Notes: {feedback?.totalNotes || 0}</div>
              <div>Correct: {feedback?.correctNotes || 0}</div>
              <div>Missing: {feedback?.missingNotes?.length || 0}</div>
              <div>Wrong: {feedback?.wrongNotes || 0}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleReset}
            className={`px-6 py-3 ${theme.buttons.secondary} text-white font-semibold rounded-xl transition-colors flex items-center space-x-2`}
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={placedNotes.length === 0}
            className={`px-6 py-3 ${theme.buttons.primary} text-white font-semibold rounded-xl transition-colors disabled:opacity-50`}
          >
            Submit Transcription
          </button>
          
          <button
            onClick={generateNewProgression}
            className={`px-6 py-3 ${theme.buttons.primary} text-white font-semibold rounded-xl transition-colors`}
          >
            New Progression
          </button>
        </div>
      </main>
    </div>
  );
}

export default ChordProgressionTranscriptionGame;