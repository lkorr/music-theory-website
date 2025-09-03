/**
 * Interactive Piano Roll Component for Chord Construction
 * 
 * This component provides the main interface for chord construction exercises.
 * Users click on the piano roll to place/remove notes and build chords.
 * 
 * Features:
 * - Visual piano keys on the left
 * - Interactive note placement area
 * - Real-time visual feedback for correct/incorrect notes
 * - Solution display capability
 * - Note label toggle
 * - Theme-based styling
 * - Auto-scroll to center around middle C
 * - Synchronized scrolling between piano keys and grid
 */

import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { noteNames, getMidiNoteName, getMidiNoteNameWithEnharmonics, isBlackKey } from "../../../chord-recognition/shared/theory/core/notes";
import { chordTypes, extendedChordTypes } from "../../../chord-recognition/shared/theory/core/constants";

interface PianoRollTheme {
  placedNotes: string;
  correctNotes: string;
  incorrectNotes: string;
  solutionNotes?: string;
}

interface Theme {
  pianoRoll: PianoRollTheme;
}

interface CurrentTask {
  root: string;
  chordType: string;
  expectedNotes: number[];
}

interface Feedback {
  isCorrect?: boolean;
}

interface PianoRollProps {
  placedNotes: number[];
  onNoteToggle: (midiNote: number) => void;
  currentTask: CurrentTask | null;
  showSolution: boolean;
  feedback: Feedback | null;
  theme: Theme;
}

export default function PianoRoll({ 
  placedNotes, 
  onNoteToggle, 
  currentTask, 
  showSolution, 
  feedback, 
  theme 
}: PianoRollProps): ReactNode {
  const [showLabels, setShowLabels] = useState(true);
  const pianoKeysRef = useRef<HTMLDivElement>(null);
  const pianoRollRef = useRef<HTMLDivElement>(null);
  
  // Piano roll configuration
  const noteHeight = 20;
  const lowestNote = 36;  // C2
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600;
  
  // Auto-scroll to center around middle C on component mount
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
  
  /**
   * Handle note click - toggle note placement
   */
  const handleNoteClick = (midiNote: number) => {
    onNoteToggle(midiNote);
  };
  
  /**
   * Check if a note belongs to the current chord (any octave)
   * Used for visual feedback after submission
   */
  const isNoteInChord = (midiNote: number): boolean => {
    if (!currentTask) return false;
    
    const semitone = midiNote % 12;
    const rootSemitone = noteNames.indexOf(currentTask.root);
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9', 'maj11', 'min11', 'maj13', 'min13'].includes(currentTask.chordType);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    
    const expectedSemitones = chordTypesObj[currentTask.chordType].intervals.map((interval: number) => 
      (rootSemitone + interval) % 12
    );
    return expectedSemitones.includes(semitone);
  };
  
  /**
   * Handle synchronized scrolling between piano keys and note grid
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (pianoKeysRef.current) {
      pianoKeysRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      {/* Header with title and label toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          {currentTask ? (() => {
            // Determine which chord types object to use
            const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9', 'maj11', 'min11', 'maj13', 'min13'].includes(currentTask.chordType);
            const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
            const chordData = chordTypesObj[currentTask.chordType];
            const chordSymbol = `${currentTask.root}${chordData?.symbol || ''}`;
            const chordFullName = `${currentTask.root} ${chordData?.name || currentTask.chordType}`;
            
            return (
              <div>
                <h3 className="text-2xl font-bold text-white">{chordSymbol}</h3>
                <p className="text-sm text-white/70 mt-1">{chordFullName}</p>
              </div>
            );
          })() : <h3 className="text-xl font-semibold text-white">Interactive Piano Roll</h3>}
        </div>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
        </button>
      </div>
      
      {/* Main piano roll interface */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '600px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div 
            ref={pianoKeysRef} 
            className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" 
            style={{ height: `${containerHeight}px` }}
          >
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const noteName = getMidiNoteNameWithEnharmonics(midiNote);
                const isBlack = isBlackKey(midiNote);
                
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isBlack ? '#6b7280' : '#ffffff',
                      color: isBlack ? '#ffffff' : '#000000'
                    }}
                  >
                    <span 
                      className={`${isBlack ? "text-white" : "text-gray-900"} ${showLabels ? 'opacity-100' : 'opacity-0'} transition-opacity`} 
                      style={{ fontSize: '12px' }}
                    >
                      {noteName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note placement area */}
          <div 
            ref={pianoRollRef} 
            className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto cursor-pointer" 
            style={{ height: `${containerHeight}px` }}
            onScroll={handleScroll}
          >
            <div className="relative h-full" style={{ height: `${totalNotes * noteHeight}px` }}>
              {/* Grid lines for note placement */}
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const isBlack = isBlackKey(midiNote);
                
                return (
                  <div 
                    key={`line-${i}`} 
                    className={`absolute left-0 right-0 hover:bg-gray-200 transition-colors ${
                      isBlack ? "bg-gray-200" : "bg-white"
                    }`}
                    style={{ 
                      top: `${i * noteHeight}px`, 
                      height: `${noteHeight}px`,
                      borderBottom: i < totalNotes - 1 ? '1px solid #d1d5db' : 'none'
                    }}
                    onClick={() => handleNoteClick(midiNote)}
                  />
                );
              })}
              
              {/* Placed notes */}
              {placedNotes.map((midiNote) => {
                const yPos = (highestNote - midiNote) * noteHeight;
                const isCorrect = isNoteInChord(midiNote);
                
                // Determine note color based on feedback state and theme
                let noteColorClass: string;
                if (feedback && feedback.isCorrect !== undefined) {
                  // After submission - show feedback colors
                  if (feedback.isCorrect) {
                    // All notes correct - show all as correct
                    noteColorClass = theme.pianoRoll.correctNotes;
                  } else {
                    // Some incorrect - show individual note status
                    noteColorClass = isCorrect 
                      ? theme.pianoRoll.correctNotes
                      : theme.pianoRoll.incorrectNotes;
                  }
                } else {
                  // While placing - use theme color
                  noteColorClass = theme.pianoRoll.placedNotes;
                }
                
                return (
                  <div
                    key={`note-${midiNote}`}
                    className={`absolute rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition-all ${noteColorClass}`}
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '400px',
                      height: `${noteHeight - 4}px`
                    }}
                    onClick={() => handleNoteClick(midiNote)}
                  />
                );
              })}
              
              {/* Solution notes (when showing solution) */}
              {showSolution && currentTask && currentTask.expectedNotes && 
                currentTask.expectedNotes.map((midiNote) => {
                  // Don't show solution notes that are already placed
                  if (placedNotes.includes(midiNote)) return null;
                  
                  const yPos = (highestNote - midiNote) * noteHeight;
                  
                  return (
                    <div
                      key={`solution-${midiNote}`}
                      className="absolute rounded-lg shadow-lg opacity-70"
                      style={{
                        left: '20px',
                        top: `${yPos + 2}px`,
                        width: '400px',
                        height: `${noteHeight - 4}px`,
                        backgroundColor: theme.pianoRoll.solutionNotes ? theme.pianoRoll.solutionNotes.replace('bg-', '').replace('-500', '') : '#fbbf24',
                        border: '2px solid #f59e0b'
                      }}
                    />
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}