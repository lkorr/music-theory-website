/**
 * Core music theory utilities for note manipulation and identification
 * This module provides the fundamental utilities used across all chord recognition levels
 */

// Type definitions
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type NoteNameWithEnharmonics = 'C' | 'C# / Db' | 'D' | 'D# / Eb' | 'E' | 'F' | 'F# / Gb' | 'G' | 'G# / Ab' | 'A' | 'A# / Bb' | 'B';
export type NaturalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

// Standard note names in chromatic order
export const noteNames: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Alternative note names with enharmonic equivalents
export const noteNamesWithEnharmonics: NoteNameWithEnharmonics[] = [
  'C',
  'C# / Db',
  'D',
  'D# / Eb',
  'E',
  'F',
  'F# / Gb',
  'G',
  'G# / Ab',
  'A',
  'A# / Bb',
  'B'
];

/**
 * Convert a MIDI note number to its note name with octave
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name with octave (e.g., 'C4', 'A#3') or null if invalid
 */
export const getMidiNoteName = (midiNote: number): string | null => {
  if (midiNote < 0 || midiNote > 127) return null;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
};

/**
 * Convert a MIDI note to note name with enharmonic equivalents
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name with enharmonics and octave (e.g., 'C# / Db 4') or null if invalid
 */
export const getMidiNoteNameWithEnharmonics = (midiNote: number): string | null => {
  if (midiNote < 0 || midiNote > 127) return null;
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNamesWithEnharmonics[midiNote % 12];
  return `${note}${octave}`;
};

/**
 * Check if a MIDI note is a black key on the piano
 * @param midiNote - MIDI note number (0-127)
 * @returns True if the note is a black key
 */
export const isBlackKey = (midiNote: number): boolean => {
  const noteInOctave = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
};

/**
 * Get enharmonic equivalent of a note
 * @param note - Note name (e.g., 'C#', 'Db')
 * @returns Enharmonic equivalent or null if not applicable
 */
export const getEnharmonicEquivalent = (note: string): string | null => {
  const enharmonics: Record<string, string> = {
    'C#': 'Db',
    'Db': 'C#',
    'D#': 'Eb',
    'Eb': 'D#',
    'F#': 'Gb',
    'Gb': 'F#',
    'G#': 'Ab',
    'Ab': 'G#',
    'A#': 'Bb',
    'Bb': 'A#'
  };
  return enharmonics[note] || null;
};

/**
 * Normalize a note name to remove octave number and handle enharmonics
 * @param noteName - Note name with or without octave
 * @returns Normalized note name
 */
export const normalizeNoteName = (noteName: string): string => {
  // Remove octave number if present
  const noteWithoutOctave = noteName.replace(/\d+$/, '');
  
  // Handle flat notation conversion to sharp for consistency
  const flatToSharp: Record<string, string> = {
    'Cb': 'B',
    'Db': 'C#',
    'Eb': 'D#',
    'Fb': 'E',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#'
  };
  
  return flatToSharp[noteWithoutOctave] || noteWithoutOctave;
};

/**
 * Get the MIDI note number for a given note name and octave
 * @param note - Note name (e.g., 'C', 'C#', 'Db')
 * @param octave - Octave number (typically -1 to 9)
 * @returns MIDI note number (0-127) or null if invalid
 */
export const getNoteNumber = (note: string, octave: number = 4): number | null => {
  const normalizedNote = normalizeNoteName(note);
  const noteIndex = noteNames.indexOf(normalizedNote as any);
  if (noteIndex === -1) return null;
  
  const midiNumber = (octave + 1) * 12 + noteIndex;
  return midiNumber >= 0 && midiNumber <= 127 ? midiNumber : null;
};

/**
 * Calculate the interval (in semitones) between two notes
 * @param note1 - First MIDI note number
 * @param note2 - Second MIDI note number
 * @returns Interval in semitones
 */
export const getInterval = (note1: number, note2: number): number => {
  return Math.abs(note2 - note1);
};

/**
 * Get all natural notes (white keys)
 * @returns Array of natural note names
 */
export const getNaturalNotes = (): NaturalNote[] => {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
};

/**
 * Check if a note is natural (white key)
 * @param note - Note name
 * @returns True if the note is natural
 */
export const isNaturalNote = (note: string): boolean => {
  const normalized = normalizeNoteName(note);
  return getNaturalNotes().includes(normalized);
};