/**
 * Core music theory utilities for note manipulation and identification
 * This module provides the fundamental utilities used across all chord recognition levels
 */

// Standard note names in chromatic order
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Alternative note names with enharmonic equivalents
export const noteNamesWithEnharmonics = [
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
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string} Note name with octave (e.g., 'C4', 'A#3')
 */
export const getMidiNoteName = (midiNote) => {
  if (midiNote < 0 || midiNote > 127) return null;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
};

/**
 * Convert a MIDI note to note name with enharmonic equivalents
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string} Note name with enharmonics and octave (e.g., 'C# / Db 4')
 */
export const getMidiNoteNameWithEnharmonics = (midiNote) => {
  if (midiNote < 0 || midiNote > 127) return null;
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNamesWithEnharmonics[midiNote % 12];
  return `${note}${octave}`;
};

/**
 * Check if a MIDI note is a black key on the piano
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {boolean} True if the note is a black key
 */
export const isBlackKey = (midiNote) => {
  const noteInOctave = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
};

/**
 * Get enharmonic equivalent of a note
 * @param {string} note - Note name (e.g., 'C#', 'Db')
 * @returns {string|null} Enharmonic equivalent or null if not applicable
 */
export const getEnharmonicEquivalent = (note) => {
  const enharmonics = {
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
 * @param {string} noteName - Note name with or without octave
 * @returns {string} Normalized note name
 */
export const normalizeNoteName = (noteName) => {
  // Remove octave number if present
  const noteWithoutOctave = noteName.replace(/\d+$/, '');
  
  // Handle flat notation conversion to sharp for consistency
  const flatToSharp = {
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
 * @param {string} note - Note name (e.g., 'C', 'C#', 'Db')
 * @param {number} octave - Octave number (typically -1 to 9)
 * @returns {number} MIDI note number (0-127)
 */
export const getNoteNumber = (note, octave = 4) => {
  const normalizedNote = normalizeNoteName(note);
  const noteIndex = noteNames.indexOf(normalizedNote);
  if (noteIndex === -1) return null;
  
  const midiNumber = (octave + 1) * 12 + noteIndex;
  return midiNumber >= 0 && midiNumber <= 127 ? midiNumber : null;
};

/**
 * Calculate the interval (in semitones) between two notes
 * @param {number} note1 - First MIDI note number
 * @param {number} note2 - Second MIDI note number
 * @returns {number} Interval in semitones
 */
export const getInterval = (note1, note2) => {
  return Math.abs(note2 - note1);
};

/**
 * Get all natural notes (white keys)
 * @returns {string[]} Array of natural note names
 */
export const getNaturalNotes = () => {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
};

/**
 * Check if a note is natural (white key)
 * @param {string} note - Note name
 * @returns {boolean} True if the note is natural
 */
export const isNaturalNote = (note) => {
  const normalized = normalizeNoteName(note);
  return getNaturalNotes().includes(normalized);
};