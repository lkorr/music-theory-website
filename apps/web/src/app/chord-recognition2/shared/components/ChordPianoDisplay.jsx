import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getMidiNoteName, isBlackKey } from "../theory/core/notes.js";

// Shared ChordPianoDisplay component for all chord recognition levels
export default function ChordPianoDisplay({ 
  notes, 
  showLabels, 
  setShowLabels, 
  noteBlockColor = 'bg-blue-500', // Customizable note block color
  noteBorderColor = 'border-blue-600', // Customizable note border color
  title = 'Chord Notes', // Customizable title
  showLabelToggle = true, // Whether to show the label toggle button
  lowestMidi = 24, // Lowest MIDI note (C1)
  highestMidi = 84 // Highest MIDI note (C6)
}) {
  const pianoRollRef = useRef(null);
  const noteHeight = 18;
  // Use parameterized MIDI range
  const lowestNote = lowestMidi;
  const highestNote = highestMidi;
  const totalNotes = highestNote - lowestNote + 1;
  const containerHeight = 600; // Fixed container height for scrolling (50% bigger)
  
  // Auto-scroll to center the chord when notes change (with random offset)
  useEffect(() => {
    if (notes.length > 0 && pianoRollRef.current) {
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
      
      // Scroll the unified container
      pianoRollRef.current.scrollTop = clampedScroll;
    }
  }, [notes, highestNote, noteHeight, containerHeight, totalNotes]);
  
  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white text-center flex-1">{title}</h3>
        {showLabelToggle && (
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            title={showLabels ? "Hide note labels" : "Show note labels"}
          >
            {showLabels ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
          </button>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] rounded-xl shadow-lg overflow-hidden mx-auto" style={{ width: '550px', height: `${containerHeight}px` }}>
        {/* Single unified scrollable container */}
        <div 
          ref={pianoRollRef}
          className="w-full overflow-y-auto bg-gradient-to-r from-gray-50 to-gray-100" 
          style={{ height: `${containerHeight}px` }}
        >
          <div className="flex" style={{ height: `${totalNotes * noteHeight}px` }}>
            {/* Piano keys section - fixed width, part of the scrollable content */}
            <div className="w-24 flex-shrink-0 border-r-2 border-gray-600 bg-gray-800">
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
                      isBlackKey(midiNote) ? "text-white" : "text-gray-900"
                    } ${showLabels ? 'opacity-100' : 'opacity-0'}`}>
                      {noteName}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Note visualization area - flex-1, part of the same scrollable content */}
            <div className="flex-1 relative">
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