/**
 * Mini Piano Roll Component
 * 
 * Small piano roll display for showing chord examples in start screens
 */

import type { ReactNode } from "react";
import { getMidiNoteName, isBlackKey } from "../theory/core/notes";

interface MiniPianoRollProps {
  midiNotes: number[];
  width?: number;
  noteHeight?: number;
  showRoot?: boolean; // Whether to highlight root note in red
}

export default function MiniPianoRoll({ 
  midiNotes, 
  width = 120, 
  noteHeight = 12,
  showRoot = false // Whether to highlight root note in red
}: MiniPianoRollProps): ReactNode {
  const minNote = Math.min(...midiNotes);
  const maxNote = Math.max(...midiNotes);
  const low = minNote - 1;
  const high = maxNote + 1;
  const totalSemitones = high - low + 1;
  const containerHeight = totalSemitones * noteHeight;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: `${width}px`, height: `${containerHeight}px` }}>
      <div className="flex h-full">
        <div className="w-8 border-r-2 border-gray-300 bg-white">
          {Array.from({ length: totalSemitones }, (_, j) => {
            const midiNote = high - j;
            const noteName = getMidiNoteName(midiNote);
            return (
              <div 
                key={j} 
                className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" 
                style={{ 
                  height: `${noteHeight}px`,
                  backgroundColor: isBlackKey(midiNote) ? '#6b7280' : '#ffffff',
                  color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                }}
              >
                <span style={{ fontSize: '6px' }}>{noteName}</span>
              </div>
            );
          })}
        </div>
        <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 relative">
          {Array.from({ length: totalSemitones }, (_, j) => (
            <div 
              key={j} 
              className="absolute left-0 right-0 border-b border-gray-200" 
              style={{ top: `${j * noteHeight}px` }} 
            />
          ))}
          {midiNotes.map((midiNote, j) => {
            const position = (high - midiNote) * noteHeight;
            const isRoot = showRoot && j === 0; // First note is root
            return (
              <div
                key={j}
                className={`absolute rounded shadow-lg ${isRoot ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{
                  left: '2px',
                  top: `${position + 1}px`,
                  width: `${width - 20}px`,
                  height: `${noteHeight - 2}px`
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}