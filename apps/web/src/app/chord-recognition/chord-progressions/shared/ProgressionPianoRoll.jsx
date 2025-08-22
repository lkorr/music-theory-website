/**
 * Progression Piano Roll Component
 * Visual representation of chord progressions with piano roll display
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getMidiNoteNameWithEnharmonics, isBlackKey } from '../../shared/theory/core/notes.js';
import { isTonicNote } from '../../shared/theory/progressions/progressionLogic.js';

export default function ProgressionPianoRoll({ chords, currentKey, showLabels, onToggleLabels }) {
  const pianoRollRef = useRef(null);
  const pianoKeysRef = useRef(null);
  
  // Calculate display dimensions
  const noteHeight = 24;
  const beatWidth = 120; // Width for each chord
  const containerHeight = 400;
  
  // Find the range of notes to display
  const { lowestNote, highestNote, totalNotes } = useMemo(() => {
    if (!chords || chords.length === 0) return { lowestNote: 60, highestNote: 72, totalNotes: 13 };
    
    const allNotes = chords.flat();
    const min = Math.min(...allNotes);
    const max = Math.max(...allNotes);
    
    // Add padding above and below
    const paddedMin = min - 4;
    const paddedMax = max + 4;
    
    return {
      lowestNote: paddedMin,
      highestNote: paddedMax,
      totalNotes: paddedMax - paddedMin + 1
    };
  }, [chords]);
  
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
          <div ref={pianoKeysRef} className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" style={{ height: `${containerHeight}px` }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                const midiNote = highestNote - i;
                const noteName = getMidiNoteNameWithEnharmonics(midiNote);
                const isTonic = isTonicNote(midiNote, { key: currentKey });
                
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isTonic 
                        ? '#22c55e' // Green for tonic notes
                        : isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                      color: isTonic || isBlackKey(midiNote) ? '#ffffff' : '#000000'
                    }}
                  >
                    <span className={`${
                      isTonic || isBlackKey(midiNote) 
                        ? "text-xs text-white font-semibold" 
                        : "text-xs text-gray-600"
                    }`}>
                      {showLabels ? noteName : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note visualization area with beat divisions */}
          <div ref={pianoRollRef} className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto" 
               style={{ height: `${containerHeight}px`, width: `${beatWidth * 4}px` }}
               onScroll={(e) => { 
                 if (pianoKeysRef.current) {
                   pianoKeysRef.current.scrollTop = e.target.scrollTop;
                 }
               }}>
            <div className="relative h-full" style={{ width: `${beatWidth * 4}px` }}>
              {/* Beat dividers */}
              {[1, 2, 3].map(beat => (
                <div 
                  key={`beat-${beat}`}
                  className="absolute top-0 bottom-0 border-l-2 border-gray-400"
                  style={{ left: `${beat * beatWidth}px` }}
                />
              ))}
              
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
              
              {/* Chord blocks for each beat */}
              {chords.map((chord, chordIndex) => (
                chord.map((midiNote, noteIndex) => {
                  const yPos = (highestNote - midiNote) * noteHeight;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                  
                  return (
                    <div
                      key={`chord-${chordIndex}-note-${noteIndex}`}
                      className={`absolute ${colors[chordIndex]} border-2 border-opacity-80 rounded-lg shadow-lg`}
                      style={{
                        left: `${chordIndex * beatWidth + 10}px`,
                        top: `${yPos + 2}px`,
                        width: `${beatWidth - 20}px`,
                        height: `${noteHeight - 4}px`
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