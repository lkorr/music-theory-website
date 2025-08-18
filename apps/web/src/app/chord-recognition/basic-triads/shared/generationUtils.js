/**
 * Shared generation utilities for chord recognition
 * 
 * Contains common chord generation logic extracted from level-specific files
 * to eliminate code duplication across all levels.
 */

/**
 * Clamp notes to a specific MIDI range by transposing entire chord
 * @param {number[]} notes - Array of MIDI note numbers
 * @param {number} minNote - Minimum MIDI note (default: C1 = 24)
 * @param {number} maxNote - Maximum MIDI note (default: C6 = 84)
 * @returns {number[]} Clamped notes within range
 */
export const clampNotesToRange = (notes, minNote = 24, maxNote = 84) => {
  let clampedNotes = [...notes];
  
  // If any note is too high, transpose the entire chord down
  while (Math.max(...clampedNotes) > maxNote) {
    clampedNotes = clampedNotes.map(note => note - 12);
  }
  
  // If any note is too low, transpose the entire chord up
  while (Math.min(...clampedNotes) < minNote) {
    clampedNotes = clampedNotes.map(note => note + 12);
  }
  
  return clampedNotes;
};

/**
 * Generate notes for chord inversions with proper octave spacing
 * @param {number} baseRoot - Root note MIDI number
 * @param {number[]} intervals - Chord intervals (e.g., [0, 4, 7])
 * @param {string} inversion - Inversion type ("root", "first", "second", "third")
 * @returns {number[]} Array of MIDI notes with proper spacing
 */
export const generateInversionNotes = (baseRoot, intervals, inversion) => {
  if (inversion === 'root') {
    // Root position - simple interval mapping
    return intervals.map(interval => baseRoot + interval);
  }
  
  // Define inversion mappings for triads and 7th chords
  const triadInversions = {
    first: [1, 2, 0],   // First inversion: 3rd, 5th, root
    second: [2, 0, 1]   // Second inversion: 5th, root, 3rd
  };
  
  const seventhInversions = {
    first: [1, 2, 3, 0],   // First inversion: 3rd, 5th, 7th, root
    second: [2, 3, 0, 1],  // Second inversion: 5th, 7th, root, 3rd
    third: [3, 0, 1, 2]    // Third inversion: 7th, root, 3rd, 5th
  };
  
  // Select appropriate inversion mapping based on chord size
  const inversionMap = intervals.length === 4 ? seventhInversions : triadInversions;
  const inversionOrder = inversionMap[inversion];
  
  if (!inversionOrder) {
    // Fall back to root position if inversion not supported
    return intervals.map(interval => baseRoot + interval);
  }
  
  // Only use the number of intervals that exist in the chord
  const actualIntervalOrder = inversionOrder.slice(0, intervals.length);
  const reorderedIntervals = actualIntervalOrder.map(index => intervals[index]);
  
  // Create notes with proper voicing for inversion
  const notes = [];
  
  // For inversions, ensure proper octave spacing (ascending order)
  for (let i = 0; i < reorderedIntervals.length; i++) {
    if (i === 0) {
      // First note uses the reordered interval from base root
      notes.push(baseRoot + reorderedIntervals[i]);
    } else {
      // Subsequent notes: add interval and ensure ascending order
      let nextNote = baseRoot + reorderedIntervals[i];
      // If this note would be lower than the previous note, move it up an octave
      while (nextNote <= notes[notes.length - 1]) {
        nextNote += 12;
      }
      notes.push(nextNote);
    }
  }
  
  return notes;
};

/**
 * Select random octave from common piano ranges
 * @param {string[]} availableOctaves - Array of octave choices (default: ["C2", "C3", "C4"])
 * @returns {number} MIDI note number for the selected octave C
 */
export const selectRandomOctave = (availableOctaves = [36, 48, 60]) => {
  return availableOctaves[Math.floor(Math.random() * availableOctaves.length)];
};

/**
 * Prevent duplicate chord generation by checking against previous chord
 * @param {Object} newChord - New chord object with root and chordType
 * @param {Object} previousChord - Previous chord to compare against
 * @param {number} maxAttempts - Maximum attempts to find different chord (default: 20)
 * @returns {boolean} True if chord is sufficiently different or max attempts reached
 */
export const isDifferentFromPrevious = (newChord, previousChord, maxAttempts = 20) => {
  if (!previousChord) {
    return true; // First chord, always acceptable
  }
  
  // Check if this chord is the same as the previous one
  return !(newChord.root === previousChord.root && newChord.chordType === previousChord.chordType);
};

/**
 * Generate chord with duplicate prevention loop
 * @param {Function} generateFunction - Function that generates a single chord attempt
 * @param {Object} previousChord - Previous chord to avoid duplicating
 * @param {number} maxAttempts - Maximum attempts before giving up (default: 20)
 * @returns {Object} Generated chord object
 */
export const generateChordWithDuplicatePrevention = (generateFunction, previousChord = null, maxAttempts = 20) => {
  let attempt = 0;
  let chord;
  
  do {
    chord = generateFunction();
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > maxAttempts) break;
    
  } while (!isDifferentFromPrevious(chord, previousChord));
  
  return chord;
};

/**
 * Convert chord type string to intervals array
 * @param {string} chordType - Chord type key (e.g., "major", "minor", "diminished")
 * @param {Object} chordTypesObj - Chord types object to lookup from
 * @returns {number[]} Array of intervals for the chord type
 */
export const getIntervalsForChordType = (chordType, chordTypesObj) => {
  return chordTypesObj[chordType]?.intervals || [0, 4, 7]; // Default to major triad
};

/**
 * Get symbol for chord type (e.g., "m" for minor, "dim" for diminished)
 * @param {string} chordType - Chord type key
 * @param {Object} chordTypesObj - Chord types object to lookup from  
 * @returns {string} Symbol for the chord type
 */
export const getSymbolForChordType = (chordType, chordTypesObj) => {
  return chordTypesObj[chordType]?.symbol || '';
};