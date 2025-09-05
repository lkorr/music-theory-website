"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, Play, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { noteNames, getMidiNoteName, isBlackKey } from "../../../core-training/chord-recognition/shared/theory/core/notes.ts";
import { audioManager } from "../../transcription/shared/audioManager";
import { generateRandomProgression, validateTranscription } from "./progressionTranscriptionLogic";
import { CompactAuthButton } from "../../../../components/auth/AuthButton.tsx";
import { useAuth } from "../../../../components/auth/ProtectedRoute";
import { useStatistics } from "./hooks/useStatistics";
import LeaderboardComponent from "./components/LeaderboardComponent";

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
  currentBPM: number;
  onBPMChange: (bpm: number) => void;
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
  onVolumeChange,
  currentBPM,
  onBPMChange
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
          {/* BPM Control - Top Left */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-semibold">BPM {currentBPM}</span>
            <input
              type="range"
              min="40"
              max="200"
              value={currentBPM}
              onChange={(e) => onBPMChange(parseInt(e.target.value))}
              className="w-20 h-2 bg-white/20 rounded-lg appearance-none slider"
              disabled={isPlaying}
              title={`Current BPM: ${currentBPM}`}
            />
          </div>
          
          {/* Right side controls */}
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
  level: string;
}

export function ChordProgressionTranscriptionGame({ levelConfig, level }: GameProps): JSX.Element {
  // Auth state
  const authState = useAuth();
  const user = authState.user;

  // Statistics integration
  const statistics = useStatistics();
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [sessionToken] = useState<string>(() => statistics.generateSessionToken());

  // Game state
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [feedback, setFeedback] = useState<ValidationResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [score, setScore] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // BPM control state
  const [currentBPM, setCurrentBPM] = useState(levelConfig?.audio.tempo || 80);
  
  // Sync BPM with level config changes
  useEffect(() => {
    if (levelConfig?.audio?.tempo) {
      setCurrentBPM(levelConfig.audio.tempo);
    }
  }, [levelConfig?.audio?.tempo]);
  
  // Progression timing
  const [progressionStartTime, setProgressionStartTime] = useState<number | null>(null);
  const [progressionTimes, setProgressionTimes] = useState<number[]>([]);
  
  // Constants
  const TOTAL_PROGRESSIONS_REQUIRED = 10;
  
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
      
      // Start timing this progression
      setProgressionStartTime(Date.now());
      
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

  // Start level function
  const startLevel = async () => {
    try {
      await audioManager.initialize();
      setHasStarted(true);
      setSessionStartTime(new Date().toISOString());
      generateNewProgression();
    } catch (error) {
      console.error('Failed to start level:', error);
      alert('Failed to initialize audio. Please check your browser settings and try again.');
    }
  };

  // Initialize only when game has started
  useEffect(() => {
    if (hasStarted) {
      audioManager.setVolume(volume);
    }
  }, [hasStarted, volume]);

  // Update volume
  useEffect(() => {
    audioManager.setVolume(volume);
  }, [volume]);

  // Auto-play when new progression is generated
  useEffect(() => {
    if (currentProgression && !isPlaying) {
      const timer = setTimeout(() => {
        handlePlayProgression();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentProgression?.key, currentProgression?.chords?.length]);

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

  // Calculate chord duration based on BPM (quarter note duration in ms)
  const calculateChordDuration = (bpm: number): number => {
    return Math.round((60 / bpm) * 1000); // Convert to milliseconds
  };

  // Play progression
  const handlePlayProgression = async () => {
    if (!currentProgression || !currentProgression.chords || isPlaying) return;

    try {
      setIsPlaying(true);
      const dynamicChordDuration = calculateChordDuration(currentBPM);
      const chordDurationSec = dynamicChordDuration / 1000;
      
      for (let i = 0; i < currentProgression.chords.length; i++) {
        const chord = currentProgression.chords[i];
        await audioManager.playChordFromNotes(chord.midiNotes, {
          duration: chordDurationSec,
          instrument: levelConfig.audio.instrument
        });
        
        // Wait for chord duration plus small pause
        if (i < currentProgression.chords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, dynamicChordDuration + 200));
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
    if (!currentProgression || !currentProgression.chords || !progressionStartTime) return;

    const userNotes = placedNotes.map(note => note.midiNote);
    const result = validateTranscription(userNotes, currentProgression, {
      tolerateOctaveErrors: true
    });

    setFeedback(result);
    setShowSolution(true);
    
    if (result.isCorrect) {
      // Calculate time for this progression
      const progressionTime = (Date.now() - progressionStartTime) / 1000; // seconds
      setProgressionTimes(prev => [...prev, progressionTime]);
      
      setScore(prev => prev + result.score);
      setQuestionsCompleted(prev => {
        const newCount = prev + 1;
        
        // Check if level is completed (10 progressions)
        if (newCount >= TOTAL_PROGRESSIONS_REQUIRED) {
          const allTimes = [...progressionTimes, progressionTime];
          const avgTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
          const totalSessionTime = sessionStartTime ? (Date.now() - new Date(sessionStartTime).getTime()) / 1000 : 0;
          const finalAccuracy = 100; // Since all completed progressions are correct
          const passed = true;
          
          setTimeout(() => {
            setIsCompleted(true);
            
            // Save statistics to server when level is completed
            if (sessionStartTime) {
              const sessionData = {
                moduleType: 'chord-progression-transcription',
                category: 'progression-transcription',
                level: level,
                accuracy: finalAccuracy,
                avgTime: Math.round(avgTime * 100) / 100, // Round to 2 decimal places
                totalTime: Math.round(totalSessionTime),
                problemsSolved: TOTAL_PROGRESSIONS_REQUIRED,
                correctAnswers: newCount,
                bestStreak: newCount,
                completed: true,
                passed,
                startTime: sessionStartTime,
                endTime: new Date().toISOString(),
                sessionToken: sessionToken
              };
              
              // Save session asynchronously (don't block UI)
              statistics.saveSession(sessionData).catch(error => {
                console.error('Failed to save session statistics:', error);
              });
            }
          }, 2000);
        }
        
        return newCount;
      });
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

  // Start screen
  if (!hasStarted) {
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        {/* Logo in absolute top-left corner */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>

        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/ear-training/chord-progression-transcription" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
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
          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {levelConfig?.title}
                  </h2>
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    {levelConfig?.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Tempo</div>
                      <div className="text-white font-semibold">{currentBPM} BPM</div>
                      <div className="text-xs text-white/50 mt-1">Adjustable in-game</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Duration</div>
                      <div className="text-white font-semibold">{(calculateChordDuration(currentBPM) / 1000).toFixed(1)}s</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Max Attempts</div>
                      <div className="text-white font-semibold">{levelConfig?.maxAttempts}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Hints</div>
                      <div className="text-white font-semibold">{levelConfig?.showHints ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <button
                    onClick={startLevel}
                    className={`px-8 py-4 ${theme.buttons.primary} text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105`}
                  >
                    🎵 Start Level
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <LeaderboardComponent
                  moduleType="chord-progression-transcription"
                  category="progression-transcription"
                  level={level}
                  compact={true}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Sign in Required</h2>
              <p className="text-white/70 mb-6">Please sign in to play chord progression transcription levels and track your progress.</p>
              <CompactAuthButton />
            </div>
          )}
        </main>
      </div>
    );
  }

  // Completion screen
  if (isCompleted && sessionStartTime) {
    const sessionDuration = Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
    
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        {/* Logo in absolute top-left corner */}
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>

        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to="/ear-training/chord-progression-transcription" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Level Complete!
              </h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Congratulations!
            </h2>
            <p className="text-white/80 mb-8">
              You've completed {levelConfig?.title}!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-300">{score}</div>
                <div className="text-white/60">Final Score</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-300">{questionsCompleted}</div>
                <div className="text-white/60">Completed</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-300">{sessionDuration}s</div>
                <div className="text-white/60">Time</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">
                  {questionsCompleted > 0 ? Math.round((score / questionsCompleted) * 100) / 100 : 0}
                </div>
                <div className="text-white/60">Avg Score</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setHasStarted(false);
                  setIsCompleted(false);
                  setScore(0);
                  setQuestionsCompleted(0);
                  setSessionStartTime(null);
                  setFeedback(null);
                  setPlacedNotes([]);
                  setShowSolution(false);
                  setProgressionStartTime(null);
                  setProgressionTimes([]);
                }}
                className={`px-6 py-3 ${theme.buttons.primary} text-white font-semibold rounded-xl transition-colors`}
              >
                🔄 Play Again
              </button>
              <Link
                to="/ear-training/chord-progression-transcription"
                className={`px-6 py-3 ${theme.buttons.secondary} text-white font-semibold rounded-xl transition-colors text-center`}
              >
                🏠 Back to Hub
              </Link>
              <Link
                to={`/leaderboard?module=chord-progression-transcription&category=progression-transcription&level=${level}`}
                className={`px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-colors text-center`}
              >
                🏆 View Leaderboard
              </Link>
            </div>
          </div>
        </main>
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
            <Link to="/ear-training/chord-progression-transcription" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig?.title || 'Loading...'} - Progression {questionsCompleted + 1}/{TOTAL_PROGRESSIONS_REQUIRED}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {score}
            </div>
            <div className="text-white font-semibold">
              Progress: {questionsCompleted}/{TOTAL_PROGRESSIONS_REQUIRED}
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
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(questionsCompleted / TOTAL_PROGRESSIONS_REQUIRED) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Transcribe this chord progression
              </h2>
              
              {/* Current Progression Info */}
              {currentProgression && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-center">
                  <div className="text-white/70 text-sm">Playing in key of</div>
                  <div className="text-xl font-semibold text-white">{currentProgression.key}</div>
                  <div className="text-white/70 text-sm">Pattern: {currentProgression.pattern.join(' - ')}</div>
                </div>
              )}
              
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
                currentBPM={currentBPM}
                onBPMChange={setCurrentBPM}
              />

              {/* Feedback */}
              {feedback && (
                <div className={`mt-6 p-6 rounded-lg ${feedback?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="font-semibold">
                    {feedback?.isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                  </p>
                  <p className="mt-2">{feedback?.feedback || 'No feedback available'}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>Total Notes: {feedback?.totalNotes || 0}</div>
                    <div>Correct: {feedback?.correctNotes || 0}</div>
                    <div>Missing: {feedback?.missingNotes?.length || 0}</div>
                    <div>Wrong: {feedback?.wrongNotes || 0}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handleReset}
                  className={`px-6 py-3 ${theme.buttons.secondary} text-white font-semibold rounded-lg transition-colors flex items-center space-x-2`}
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={placedNotes.length === 0}
                  className={`px-6 py-3 ${theme.buttons.primary} text-white font-semibold rounded-lg transition-colors disabled:opacity-50`}
                >
                  Submit
                </button>
                
                <button
                  onClick={generateNewProgression}
                  className={`px-6 py-3 ${theme.buttons.primary} text-white font-semibold rounded-lg transition-colors`}
                >
                  New Progression
                </button>
              </div>
            </div>
          </div>
          
          {/* Statistics sidebar */}
          <div className="xl:w-80">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Accuracy:</span>
                  <span className="font-semibold text-white">
                    {questionsCompleted > 0 ? 100 : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg Time:</span>
                  <span className="font-semibold text-white">
                    {progressionTimes.length > 0 ? 
                      (progressionTimes.reduce((sum, time) => sum + time, 0) / progressionTimes.length).toFixed(2) : 0.00}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Progress:</span>
                  <span className="font-semibold text-white">
                    {questionsCompleted}/{TOTAL_PROGRESSIONS_REQUIRED}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Score:</span>
                  <span className="font-semibold text-white">{score}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Instructions:</h4>
                <div className="text-sm text-white/70 space-y-2">
                  <p>• Listen to the chord progression</p>
                  <p>• Click on the piano roll to place notes</p>
                  <p>• Match all the notes in the progression</p>
                  <p>• Complete {TOTAL_PROGRESSIONS_REQUIRED} progressions to finish</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-2">Tips:</h4>
                <div className="text-sm text-white/70 space-y-2">
                  <p>• Use the Play button to replay the progression</p>
                  <p>• Toggle labels to see note names</p>
                  <p>• Listen for chord progressions and patterns</p>
                  <p>• Reset if you need to start over</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChordProgressionTranscriptionGame;