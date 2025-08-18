import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getMidiNoteName, isBlackKey } from "./chordLogic.js";

// Shared ChordPianoDisplay component for basic-triads levels
export default function ChordPianoDisplay({ 
  notes, 
  showLabels, 
  setShowLabels, 
  noteBlockColor = 'bg-blue-500', // Customizable note block color
  noteBorderColor = 'border-blue-600' // Customizable note border color
}) {
  const pianoKeysRef = useRef(null);
  const pianoRollRef = useRef(null);
  const noteHeight = 18;
  // Show full range from C1 to C6 (MIDI 24-84) for scrolling
  const lowestNote = 24;  // C1
  const highestNote = 84; // C6
  const totalNotes = highestNote - lowestNote + 1; // 61 notes total
  const containerHeight = 600; // Fixed container height for scrolling (50% bigger)
  
  // Auto-scroll to center the chord when notes change (with random offset)
  useEffect(() => {
    if (notes.length > 0 && pianoKeysRef.current && pianoRollRef.current) {
      // Find the middle note of the chord
      const sortedNotes = [...notes].sort((a, b) => b - a); // Sort high to low
      const middleNote = sortedNotes[Math.floor(sortedNotes.length / 2)];
      
      // Calculate the position of the middle note
      const notePosition = (highestNote - middleNote) * noteHeight;
      
      // Add random offset (±20% of container height for variety)
      const maxOffset = containerHeight * 0.2;
      const randomOffset = (Math.random() - 0.5) * 2 * maxOffset;
      
      // Calculate scroll position to center the middle note with random offset
      const scrollPosition = notePosition - (containerHeight / 2) + (noteHeight / 2) + randomOffset;
      
      // Clamp scroll position to valid range
      const maxScroll = (totalNotes * noteHeight) - containerHeight;
      const clampedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
      
      // Scroll both containers
      pianoKeysRef.current.scrollTop = clampedScroll;
      pianoRollRef.current.scrollTop = clampedScroll;
    }
  }, [notes, highestNote, noteHeight, containerHeight, totalNotes]);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-black text-center flex-1">Chord Notes</h3>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="w-10 h-10 rounded-lg bg-white/30 hover:bg-white/40 transition-colors flex items-center justify-center"
          title={showLabels ? "Hide note labels" : "Show note labels"}
        >
          {showLabels ? <EyeOff size={20} className="text-black" /> : <Eye size={20} className="text-black" />}
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '550px', height: `${containerHeight}px` }}>
        <div className="flex">
          {/* Piano keys on the left */}
          <div ref={pianoKeysRef} className="w-24 flex-shrink-0 border-r-2 border-gray-300 bg-white overflow-y-hidden" style={{ height: `${containerHeight}px` }}>
            <div style={{ height: `${totalNotes * noteHeight}px` }}>
              {Array.from({ length: totalNotes }, (_, i) => {
                // Display notes from highest to lowest
                const midiNote = highestNote - i;
                const noteName = getMidiNoteName(midiNote);
                return (
                  <div 
                    key={midiNote} 
                    className="border-b border-gray-200 flex items-center justify-end pr-3"
                    style={{ 
                      height: `${noteHeight}px`,
                      backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                    }}
                  >
                    <span className={`text-xs ${
                      isBlackKey(midiNote) ? "text-white" : "text-black"
                    }`}>
                      {showLabels ? noteName : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Note visualization area */}
          <div ref={pianoRollRef} className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 overflow-y-auto" style={{ height: `${containerHeight}px` }} onScroll={(e) => { 
                // Sync scroll with piano keys
                if (pianoKeysRef.current) {
                  pianoKeysRef.current.scrollTop = e.target.scrollTop;
                }
              }}>
            <div className="relative h-full">
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
              
              {/* Note blocks */}
              {notes.map((midiNote, index) => {
                // Calculate position: how many steps down from the highest note
                const yPos = (highestNote - midiNote) * noteHeight;
                
                return (
                  <div
                    key={`note-${index}`}
                    className={`absolute ${noteBlockColor} ${noteBorderColor} rounded-lg shadow-lg`}
                    style={{
                      left: '20px',
                      top: `${yPos + 2}px`,
                      width: '380px',
                      height: `${noteHeight - 4}px`
                    }}
                  >
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}