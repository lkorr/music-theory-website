"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, Play, Volume2, VolumeX } from "lucide-react";
import { noteNames, chordTypes, extendedChordTypes, getMidiNoteName, isBlackKey } from "../../chord-recognition/basic-triads/shared/chordLogic.js";
import { audioManager } from "./audioManager.js";
import { CompactAuthButton } from "../../../components/auth/AuthButton.jsx";

// Universal Theme Configuration (matches chord construction)
const THEMES = {
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

// Universal Piano Roll Component for Transcription
function TranscriptionPianoRoll({ 
  placedNotes, 
  onNoteToggle, 
  currentTask, 
  showSolution, 
  feedback, 
  showLabels, 
  setShowLabels,
  theme,
  onPlayChord,
  isPlaying,
  volume,
  onVolumeChange
}) {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 20;
  const lowestNote = 36;  // C2
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600;
  
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
  const handlePianoKeysScroll = (e) => {
    if (pianoRollRef.current) {
      pianoRollRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handlePianoRollScroll = (e) => {
    if (pianoKeysRef.current) {
      pianoKeysRef.current.scrollTop = e.target.scrollTop;
    }
  };
  
  const handleNoteClick = (midiNote) => {
    onNoteToggle(midiNote);
  };

  const handlePianoLabelClick = async (midiNote) => {
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
  
  // Helper function to check if a note belongs to the current chord (any octave)
  const isNoteInChord = (midiNote) => {
    if (!currentTask) return false;
    const semitone = midiNote % 12;
    const rootSemitone = noteNames.indexOf(currentTask.root);
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9'].includes(currentTask.chordType);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    
    const expectedSemitones = chordTypesObj[currentTask.chordType].intervals.map(interval => 
      (rootSemitone + interval) % 12
    );
    return expectedSemitones.includes(semitone);
  };
  
  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white text-center flex-1">Transcription Piano Roll</h3>
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
          
          {/* Play Chord Button */}
          <button
            onClick={onPlayChord}
            disabled={!currentTask || isPlaying}
            className={`flex items-center space-x-2 px-4 py-2 ${theme.pianoRoll.playButton} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Play the chord to transcribe"
          >
            <Play size={16} className={isPlaying ? "animate-pulse" : ""} />
            <span>{isPlaying ? "Playing..." : "Play Chord"}</span>
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
        Click the "Play Chord" button to hear the chord, then place the notes on the piano roll
      </p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '600px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div 
            ref={pianoKeysRef} 
            className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-auto scrollbar-hide" 
            style={{ 
              height: `${containerHeight}px`,
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* Internet Explorer 10+ */
            }}
            onScroll={handlePianoKeysScroll}
          >
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const noteName = getMidiNoteName(midiNote);
                const isBlack = isBlackKey(midiNote);
                
                return (
                  <div 
                    key={midiNote} 
                    className={`border-b border-gray-200 flex items-center justify-end pr-2 cursor-pointer ${
                      isBlack ? "bg-gray-800 text-white" : "bg-white text-black hover:bg-gray-100"
                    }`}
                    style={{ height: `${noteHeight}px` }}
                    onClick={() => handlePianoLabelClick(midiNote)}
                  >
                    <span className={`text-xs font-mono ${showLabels ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                      {noteName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Interactive piano roll area */}
          <div 
            ref={pianoRollRef} 
            className="flex-1 relative bg-gray-50 overflow-y-auto cursor-pointer scrollbar-hide" 
            style={{ 
              height: `${containerHeight}px`,
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* Internet Explorer 10+ */
            }} 
            onScroll={handlePianoRollScroll}
            onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top + pianoRollRef.current.scrollTop;
            const noteIndex = Math.floor(y / noteHeight);
            const midiNote = highestNote - noteIndex;
            if (midiNote >= lowestNote && midiNote <= highestNote) {
              handleNoteClick(midiNote);
            }
          }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {/* Grid lines */}
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                return (
                  <div 
                    key={`line-${i}`} 
                    className={`absolute left-0 right-0 ${
                      isBlackKey(midiNote) ? "border-b border-gray-300" : "border-b border-gray-200"
                    }`}
                    style={{ top: `${i * noteHeight}px` }} 
                  />
                );
              })}
              
              {/* Placed notes */}
              {placedNotes.map((midiNote, index) => {
                const yPos = (highestNote - midiNote) * noteHeight;
                let noteColor = theme.pianoRoll.placedNotes;
                
                if (showSolution && currentTask) {
                  const isCorrect = currentTask.expectedNotes.includes(midiNote);
                  noteColor = isCorrect ? theme.pianoRoll.correctNotes : theme.pianoRoll.incorrectNotes;
                }
                
                return (
                  <div
                    key={`note-${midiNote}-${index}`}
                    className={`absolute ${noteColor} rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition-opacity`}
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '380px',
                      height: `${noteHeight - 4}px`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNoteClick(midiNote);
                    }}
                  />
                );
              })}
              
              {/* Expected notes overlay (when showing solution) */}
              {showSolution && currentTask && currentTask.expectedNotes.map((midiNote, index) => {
                if (placedNotes.includes(midiNote)) return null; // Don't show if already placed
                
                const yPos = (highestNote - midiNote) * noteHeight;
                
                return (
                  <div
                    key={`expected-${midiNote}-${index}`}
                    className="absolute bg-yellow-400/50 border-2 border-yellow-500 rounded-lg"
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '380px',
                      height: `${noteHeight - 4}px`,
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback message */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
          feedback.isCorrect 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {feedback.message}
        </div>
      )}
      </div>
    </>
  );
}

// Score Display Component - Updated to match chord recognition styling
function ScoreDisplay({ correct, total, streak, currentTime, avgTime, isAnswered, totalProblems, theme }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/70">Accuracy:</span>
          <span className="font-semibold text-white">{accuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Avg Time:</span>
          <span className="font-semibold text-white">{avgTime.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Progress:</span>
          <span className="font-semibold text-white">{total}/{totalProblems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Streak:</span>
          <span className="font-semibold text-white">{streak}</span>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="font-semibold text-white mb-2">Instructions:</h4>
        <div className="text-sm text-white/70 space-y-1">
          <p>• Listen to the chord using "Play Chord"</p>
          <p>• Place the notes you hear on the piano roll</p>
          <p>• Click "Check Answer" when ready</p>
          <p>• Get the answer right to progress</p>
        </div>
      </div>
    </div>
  );
}

// Main Universal Transcription Game Component
export function UniversalTranscriptionGame({ levelConfig }) {
  // Get theme configuration
  const theme = THEMES[levelConfig.theme] || THEMES.emerald;
  
  // Game state
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [placedNotes, setPlacedNotes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  
  // Progress tracking
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  
  // Initialize audio manager
  useEffect(() => {
    audioManager.setVolume(volume);
  }, [volume]);

  const generateTranscriptionTask = (previousTask = null) => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Cs', 'Ds', 'Fs', 'Gs', 'As'];
    const { chordTypes: levelChordTypes, inversionRules } = levelConfig;
    
    // Piano roll bounds (matching the visible range)
    const PIANO_ROLL_MIN = 36; // C2
    const PIANO_ROLL_MAX = 84; // C6
    
    let root, chordTypeKey, inversion = 0, baseOctave, attempt = 0;
    let validChord = false;
    
    // Keep trying until we get a valid chord within piano roll range
    do {
      // Generate chord parameters
      root = roots[Math.floor(Math.random() * roots.length)];
      chordTypeKey = levelChordTypes[Math.floor(Math.random() * levelChordTypes.length)];
      inversion = 0;
      
      // Handle inversions
      if (inversionRules.allowInversions) {
        if (inversionRules.requireSpecificInversion === "first") {
          inversion = 1;
        } else if (inversionRules.requireSpecificInversion === "second") {
          inversion = 2;
        } else if (Array.isArray(inversionRules.requireSpecificInversion)) {
          // Choose randomly from allowed inversions
          const allowedInversions = inversionRules.requireSpecificInversion;
          inversion = allowedInversions[Math.floor(Math.random() * allowedInversions.length)];
        } else if (inversionRules.requireSpecificInversion === null) {
          // Random inversion
          const maxInversions = chordTypeKey.includes('7') || chordTypeKey.includes('9') || chordTypeKey.includes('11') || chordTypeKey.includes('13') ? 3 : 2;
          inversion = Math.floor(Math.random() * (maxInversions + 1));
        }
      }
      
      // Try different octaves until we find one that fits
      const possibleOctaves = [48, 60]; // C3, C4 (avoiding C5=72 which often goes too high)
      let octaveFound = false;
      
      for (const testOctave of possibleOctaves) {
        try {
          const testNotes = audioManager.generateChordNotes(root, chordTypeKey, inversion, testOctave, PIANO_ROLL_MIN, PIANO_ROLL_MAX);
          
          // Check if all notes are within piano roll range and we have the full chord
          const originalChordSize = chordTypeKey.includes('13') ? 7 : 
                                   chordTypeKey.includes('11') ? 6 :
                                   chordTypeKey.includes('9') ? 5 :
                                   chordTypeKey.includes('7') ? 4 : 3;
          
          if (testNotes.length >= Math.min(4, originalChordSize) && // Allow some note dropping for complex chords
              testNotes.every(note => note >= PIANO_ROLL_MIN && note <= PIANO_ROLL_MAX)) {
            baseOctave = testOctave;
            octaveFound = true;
            validChord = true;
            break;
          }
        } catch (error) {
          // Try next octave
          continue;
        }
      }
      
      // If no octave worked, try a different chord
      if (!octaveFound) {
        attempt++;
        if (attempt > 50) {
          // Fallback to guaranteed safe chord
          root = 'C';
          chordTypeKey = 'major';
          inversion = 0;
          baseOctave = 60;
          validChord = true;
          break;
        }
        continue;
      }
      
      // Check against previous task to avoid repetition
      if (previousTask && 
          previousTask.root === root && 
          previousTask.chordType === chordTypeKey &&
          previousTask.inversion === inversion) {
        validChord = false;
        attempt++;
      }
      
    } while (!validChord && attempt < 50);
    
    try {
      const expectedNotes = audioManager.generateChordNotes(root, chordTypeKey, inversion, baseOctave, PIANO_ROLL_MIN, PIANO_ROLL_MAX);
      
      return {
        root,
        chordType: chordTypeKey,
        inversion,
        chordName: `${root}${chordTypeKey}${inversion > 0 ? `/${inversion}` : ''}`,
        description: `${root} ${chordTypeKey}${inversion > 0 ? ` (${inversion === 1 ? 'first' : inversion === 2 ? 'second' : 'third'} inversion)` : ''}`,
        expectedNotes,
        baseOctave
      };
    } catch (error) {
      console.error('Error generating transcription task:', error);
      // Fallback to guaranteed safe chord
      return {
        root: 'C',
        chordType: 'major',
        inversion: 0,
        chordName: 'C major',
        description: 'C major',
        expectedNotes: [60, 64, 67], // C4 major triad - guaranteed to be in range
        baseOctave: 60
      };
    }
  };

  const startLevel = async () => {
    try {
      await audioManager.initialize();
      setHasStarted(true);
      generateNewTask();
    } catch (error) {
      console.error('Failed to start level:', error);
      alert('Failed to initialize audio. Please check your browser settings and try again.');
    }
  };

  const generateNewTask = async () => {
    const newTask = generateTranscriptionTask(currentTask);
    setCurrentTask(newTask);
    setPlacedNotes([]);
    setFeedback(null);
    setShowSolution(false);
    setIsAnswered(false);
    setStartTime(Date.now());
    console.log('New task generated:', newTask);
    
    // Auto-play the chord when a new task loads
    setTimeout(async () => {
      try {
        await audioManager.playChordFromConfig(newTask, levelConfig);
      } catch (error) {
        console.error('Failed to auto-play chord:', error);
      }
    }, 500); // Small delay to let UI settle
  };

  const handlePlayChord = async () => {
    if (!currentTask || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await audioManager.playChordFromConfig(currentTask, levelConfig);
      
      // Reset playing state after duration
      setTimeout(() => {
        setIsPlaying(false);
      }, (levelConfig.audio?.noteDuration || 2000) + 500);
      
    } catch (error) {
      console.error('Error playing chord:', error);
      setIsPlaying(false);
    }
  };

  const handleNoteToggle = async (midiNote) => {
    if (isAnswered) return;
    
    // Play the note sound when clicked
    try {
      await audioManager.playNote(midiNote, {
        duration: 0.5,
        instrument: levelConfig.audio?.instrument || 'piano'
      });
    } catch (error) {
      console.error('Failed to play note:', error);
    }
    
    setPlacedNotes(prevNotes => {
      if (prevNotes.includes(midiNote)) {
        return prevNotes.filter(note => note !== midiNote);
      } else {
        return [...prevNotes, midiNote].sort((a, b) => a - b);
      }
    });
  };

  const handleSubmit = async () => {
    if (!currentTask || isAnswered || placedNotes.length === 0) return;
    
    const timeSpent = (Date.now() - startTime) / 1000;
    setCurrentTime(timeSpent);
    
    // First, play the user's chord
    try {
      await audioManager.playChordFromNotes(placedNotes, {
        duration: 1.5,
        instrument: levelConfig.audio?.instrument || 'piano'
      });
    } catch (error) {
      console.error('Failed to play user chord:', error);
    }
    
    // Wait a moment for the audio, then check answer
    setTimeout(() => {
      // Check answer
      const expectedNotes = [...currentTask.expectedNotes].sort((a, b) => a - b);
      const userNotes = [...placedNotes].sort((a, b) => a - b);
      
      const isCorrect = expectedNotes.length === userNotes.length && 
                        expectedNotes.every((note, index) => note === userNotes[index]);
      
      setIsAnswered(true);
      
      const feedbackMessage = isCorrect 
        ? `Correct! The chord was: ${currentTask.description}` 
        : `Incorrect. Listen again and try a different combination.`;
      
      setFeedback({
        isCorrect,
        message: feedbackMessage
      });

      if (isCorrect) {
        // Only update stats and progress when answer is correct
        const newTotal = total + 1;
        const newCorrect = correct + 1;
        const newStreak = streak + 1;
        const newAvgTime = ((avgTime * total) + timeSpent) / newTotal;
        
        setTotal(newTotal);
        setCorrect(newCorrect);
        setStreak(newStreak);
        setAvgTime(newAvgTime);
        setShowSolution(true);
        
        // Check if level is completed
        if (newTotal >= levelConfig.totalProblems) {
          const finalAccuracy = Math.round((newCorrect / newTotal) * 100);
          const passed = finalAccuracy >= levelConfig.passRequirements.accuracy && 
                         newAvgTime <= levelConfig.passRequirements.time;
          
          setTimeout(() => {
            setLevelResult({
              passed,
              accuracy: finalAccuracy,
              avgTime: newAvgTime,
              required: levelConfig.passRequirements
            });
            setIsCompleted(true);
          }, 2000);
        } else {
          // Generate new task after a short delay for correct answers
          setTimeout(() => {
            generateNewTask();
          }, 2500);
        }
      } else {
        // For incorrect answers, show red flash and reset after delay
        setTimeout(() => {
          setFeedback(null);
          setIsAnswered(false);
          // Don't show solution for incorrect - user must try again
        }, 2000);
      }
    }, 1000); // Wait for user's chord to play
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  const canSubmit = placedNotes.length > 0 && !isAnswered;

  // Start screen
  if (!hasStarted) {
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-16">
              <Link to={levelConfig.backPath} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-white text-sm font-bold">←</span>
              </Link>
              <h1 className="text-xl font-bold text-white">{levelConfig.title}</h1>
            </div>
            <CompactAuthButton />
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start {levelConfig.title}?</h2>
            <div className="text-lg text-white/70 mb-8 space-y-2">
              <p><strong>{levelConfig.totalProblems} problems</strong> to complete</p>
              <p>{levelConfig.description}</p>
              <p>Need <strong>{levelConfig.passRequirements.accuracy}% accuracy</strong> to pass</p>
              <p>Average time must be under <strong>{levelConfig.passRequirements.time} seconds</strong></p>
              <p className="text-yellow-300 font-semibold">🎧 Make sure your audio is enabled!</p>
            </div>
            <button
              onClick={startLevel}
              className={`px-12 py-4 ${theme.buttons.primary} text-white text-xl font-bold rounded-xl transition-colors shadow-lg`}
            >
              Start {levelConfig.title}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <div className={`min-h-screen ${theme.background} relative`}>
        <Link to="/" className="absolute top-2 left-2 z-50">
          <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
        </Link>
        
        <main className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className={`text-4xl font-bold mb-6 ${levelResult?.passed ? 'text-green-300' : 'text-red-300'}`}>
              {levelResult?.passed ? '🎉 Congratulations!' : '😔 Not Quite There'}
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{levelResult?.accuracy}%</div>
                <div className="text-white/70">Your Accuracy</div>
                <div className="text-sm text-white/50">Required: {levelResult?.required.accuracy}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{levelResult?.avgTime.toFixed(1)}s</div>
                <div className="text-white/70">Average Time</div>
                <div className="text-sm text-white/50">Required: {levelResult?.required.time}s</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={levelConfig.backPath}
                className={`px-8 py-3 ${theme.buttons.secondary} text-white font-semibold rounded-xl transition-colors`}
              >
                Back to Levels
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className={`px-8 py-3 ${theme.buttons.primary} text-white font-semibold rounded-xl transition-colors`}
              >
                Try Again
              </button>
              
              {levelResult?.passed && levelConfig.nextLevelPath && (
                <Link
                  to={levelConfig.nextLevelPath}
                  className={`px-8 py-3 ${theme.buttons.primary} text-white font-semibold rounded-xl transition-colors`}
                >
                  Next Level
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main game screen
  return (
    <div className={`min-h-screen ${theme.background} relative`}>
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to={levelConfig.backPath} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {levelConfig.title} - Problem {total}/{levelConfig.totalProblems}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-white font-semibold">
              Score: {correct}/{total}
            </div>
            <div className="text-white font-semibold">
              Time: {currentTime.toFixed(1)}s
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
              className={`${theme.progressBar} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${(total / levelConfig.totalProblems) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Main content */}
          <div className="flex-1">
            <TranscriptionPianoRoll
          placedNotes={placedNotes}
          onNoteToggle={handleNoteToggle}
          currentTask={currentTask}
          showSolution={showSolution}
          feedback={feedback}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          theme={theme}
          onPlayChord={handlePlayChord}
          isPlaying={isPlaying}
          volume={volume}
          onVolumeChange={handleVolumeChange}
            />

            <div className="text-center mt-8">
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`px-8 py-3 ${theme.buttons.primary} text-white text-lg font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    canSubmit ? 'hover:scale-105' : ''
                  }`}
                >
                  {isAnswered ? 'Answered' : 'Check Answer'}
                </button>
              </div>
              
              {currentTask && !isAnswered && (
                <p className="mt-2 text-white/70">
                  Place the notes you hear on the piano roll, then click "Check Answer"
                </p>
              )}
              
              {isAnswered && !feedback?.isCorrect && (
                <p className="mt-2 text-red-300">
                  Try again! Clear incorrect notes and place the correct ones.
                </p>
              )}
            </div>
          </div>
          
          {/* Stats sidebar */}
          <div className="xl:w-80">
            <ScoreDisplay
              correct={correct}
              total={total}
              streak={streak}
              currentTime={currentTime}
              avgTime={avgTime}
              isAnswered={isAnswered}
              totalProblems={levelConfig.totalProblems}
              theme={theme}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default UniversalTranscriptionGame;