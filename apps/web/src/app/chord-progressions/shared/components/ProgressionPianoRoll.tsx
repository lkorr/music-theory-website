/**
 * Progression Piano Roll Component
 * Visual representation of chord progressions with piano roll display
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getMidiNoteNameWithEnharmonics, isBlackKey } from '../theory/core/notes.js';
import { isTonicNote } from '../utils/progressionLogic';

interface ProgressionPianoRollProps {
  chords: number[][];
  currentKey: string;
  showLabels: boolean;
  onToggleLabels: () => void;
}

interface DisplayDimensions {
  lowestNote: number;
  highestNote: number;
  totalNotes: number;
  tonicNotes: Set<number>;
}

export default function ProgressionPianoRoll({ 
  chords, 
  currentKey, 
  showLabels, 
  onToggleLabels 
}: ProgressionPianoRollProps) {
  const pianoRollRef = useRef<HTMLDivElement>(null);
  const pianoKeysRef = useRef<HTMLDivElement>(null);
  
  // Calculate display dimensions
  const noteHeight = 18; // Match reference component
  const beatWidth = 120; // Width for each chord
  const containerHeight = 600; // Match reference component size
  
  // Use fixed MIDI range like the reference component and identify the tonic note
  const { lowestNote, highestNote, totalNotes, tonicNotes }: DisplayDimensions = useMemo(() => {
    // Fixed range like reference component
    const lowestMidi = 24; // C1
    const highestMidi = 84; // C6
    
    // Calculate tonic notes (all instances of the key's tonic across octaves)
    const tonics = new Set<number>();
    let tonicName = '';
    
    if (currentKey) {
      // Get the tonic note name from the key
      if (currentKey.endsWith('m')) {
        // Minor key - remove 'm' suffix  
        tonicName = currentKey.slice(0, -1);
      } else {
        // Major key
        tonicName = currentKey;
      }
      
      // Find all instances of this note across the MIDI range
      for (let midi = lowestMidi; midi <= highestMidi; midi++) {
        const noteNameWithOctave = getMidiNoteNameWithEnharmonics(midi);
        if (!noteNameWithOctave) continue;
        
        // Remove octave number to get just the note name
        const noteName = noteNameWithOctave.replace(/\d+$/, '');
        
        // Handle enharmonic equivalents
        if (noteName.includes(' / ')) {
          const [sharp, flat] = noteName.split(' / ');
          if (sharp === tonicName || flat === tonicName) {
            tonics.add(midi);
          }
        } else if (noteName === tonicName) {
          tonics.add(midi);
        }
      }
    }
    
    return {
      lowestNote: lowestMidi,
      highestNote: highestMidi,
      totalNotes: highestMidi - lowestMidi + 1,
      tonicNotes: tonics
    };
  }, [currentKey]);
  
  // Scroll to center the chord notes on mount
  useEffect(() => {
    if (pianoRollRef.current && chords.length > 0) {
      const allNotes = chords.flat();
      const avgNote = Math.round(allNotes.reduce((a, b) => a + b, 0) / allNotes.length);
      const centerOffset = (highestNote - avgNote) * noteHeight - containerHeight / 2;
      
      pianoRollRef.current.scrollTop = Math.max(0, centerOffset);
      if (pianoKeysRef.current) {
        pianoKeysRef.current.scrollTop = Math.max(0, centerOffset);
      }
    }
  }, [chords, highestNote, noteHeight, containerHeight, totalNotes]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (pianoKeysRef.current) {
      pianoKeysRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    }
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-white text-center flex-1">
          Chord Progression in {currentKey}
        </h3>
        <button
          onClick={onToggleLabels}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
        </button>
      </div>
      <p className="text-sm text-white/70 mb-6 text-center">
        Listen to the four chords and identify the roman numeral progression
      </p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '620px', height: `${containerHeight}px` }}>
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
                const isRootNote = tonicNotes.has(midiNote);
                
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isRootNote 
                        ? 'rgba(34, 197, 94, 0.5)' // Green for the main root note with 50% opacity
                        : isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                      color: isRootNote || isBlackKey(midiNote) ? '#ffffff' : '#000000'
                    }}
                  >
                    <span className={`${
                      isRootNote || isBlackKey(midiNote) 
                        ? "text-xs text-white font-semibold" 
                        : "text-xs text-gray-600"
                    }`}>
                      {showLabels ? (noteName || '') : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note visualization area with beat divisions */}
          <div 
            ref={pianoRollRef} 
            className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto" 
            style={{ height: `${containerHeight}px`, width: `${beatWidth * 4}px` }}
            onScroll={handleScroll}
          >
            <div className="relative" style={{ width: `${beatWidth * 4}px`, height: `${totalNotes * noteHeight}px` }}>
              {/* Beat dividers */}
              {[1, 2, 3].map(beat => (
                <div 
                  key={`beat-${beat}`}
                  className="absolute border-l-2 border-gray-400 z-10"
                  style={{ 
                    left: `${beat * beatWidth}px`,
                    top: 0,
                    height: `${totalNotes * noteHeight}px`
                  }}
                />
              ))}
              
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
                      top: `${i * noteHeight}px`,
                      height: `${noteHeight}px`
                    }} 
                  />
                );
              })}
              
              {/* Chord blocks for each beat */}
              {chords.map((chord, chordIndex) => (
                chord.map((midiNote, noteIndex) => {
                  // Ensure MIDI note is an integer and calculate exact pixel position
                  const roundedMidiNote = Math.round(midiNote);
                  const gridIndex = highestNote - roundedMidiNote;
                  const yPos = gridIndex * noteHeight;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                  
                  return (
                    <div
                      key={`chord-${chordIndex}-note-${noteIndex}-${roundedMidiNote}`}
                      className={`absolute ${colors[chordIndex]} border-2 border-opacity-80 rounded-lg shadow-lg`}
                      style={{
                        left: `${chordIndex * beatWidth + 10}px`,
                        top: `${yPos}px`,
                        width: `${beatWidth - 20}px`,
                        height: `${noteHeight}px`
                      }}
                    />
                  );
                })
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}