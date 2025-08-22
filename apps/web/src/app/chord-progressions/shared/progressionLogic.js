/**
 * Chord Progressions Logic - Standalone Version
 * Contains Roman numeral analysis, key signatures, and progression-specific utilities
 * Self-contained version that doesn't rely on external imports
 */

// Standard note names in chromatic order
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major and minor key signatures with correct scale notes
export const keySignatures = {
  // Major keys - each key contains the 7 notes of its major scale
  'C': { type: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G': { type: 'major', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F# / Gb'] },
  'D': { type: 'major', notes: ['D', 'E', 'F# / Gb', 'G', 'A', 'B', 'C# / Db'] },
  'A': { type: 'major', notes: ['A', 'B', 'C# / Db', 'D', 'E', 'F# / Gb', 'G# / Ab'] },
  'E': { type: 'major', notes: ['E', 'F# / Gb', 'G# / Ab', 'A', 'B', 'C# / Db', 'D# / Eb'] },
  'B': { type: 'major', notes: ['B', 'C# / Db', 'D# / Eb', 'E', 'F# / Gb', 'G# / Ab', 'A# / Bb'] },
  'F#': { type: 'major', notes: ['F# / Gb', 'G# / Ab', 'A# / Bb', 'B', 'C# / Db', 'D# / Eb', 'E# / F'] },
  'C#': { type: 'major', notes: ['C# / Db', 'D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B# / C'] },
  'F': { type: 'major', notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  'Bb': { type: 'major', notes: ['A# / Bb', 'C', 'D', 'D# / Eb', 'F', 'G', 'A'] },
  'Eb': { type: 'major', notes: ['D# / Eb', 'F', 'G', 'G# / Ab', 'A# / Bb', 'C', 'D'] },
  'Ab': { type: 'major', notes: ['G# / Ab', 'A# / Bb', 'C', 'C# / Db', 'D# / Eb', 'F', 'G'] },
  'Db': { type: 'major', notes: ['C# / Db', 'D# / Eb', 'F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'C'] },
  'Gb': { type: 'major', notes: ['F# / Gb', 'G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db', 'D# / Eb', 'F'] },
  'Cb': { type: 'major', notes: ['B / Cb', 'C# / Db', 'D# / Eb', 'E / Fb', 'F# / Gb', 'G# / Ab', 'A# / Bb'] },
  
  // Minor keys - each key contains the 7 notes of its natural minor scale
  'Am': { type: 'minor', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  'Em': { type: 'minor', notes: ['E', 'F# / Gb', 'G', 'A', 'B', 'C', 'D'] },
  'Bm': { type: 'minor', notes: ['B', 'C# / Db', 'D', 'E', 'F# / Gb', 'G', 'A'] },
  'F#m': { type: 'minor', notes: ['F# / Gb', 'G# / Ab', 'A', 'B', 'C# / Db', 'D', 'E'] },
  'C#m': { type: 'minor', notes: ['C# / Db', 'D# / Eb', 'E', 'F# / Gb', 'G# / Ab', 'A', 'B'] },
  'G#m': { type: 'minor', notes: ['G# / Ab', 'A# / Bb', 'B', 'C# / Db', 'D# / Eb', 'E', 'F# / Gb'] },
  'D#m': { type: 'minor', notes: ['D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B', 'C# / Db'] },
  'A#m': { type: 'minor', notes: ['A# / Bb', 'B# / C', 'C# / Db', 'D# / Eb', 'E# / F', 'F# / Gb', 'G# / Ab'] },
  'Dm': { type: 'minor', notes: ['D', 'E', 'F', 'G', 'A', 'A# / Bb', 'C'] },
  'Gm': { type: 'minor', notes: ['G', 'A', 'A# / Bb', 'C', 'D', 'D# / Eb', 'F'] },
  'Cm': { type: 'minor', notes: ['C', 'D', 'D# / Eb', 'F', 'G', 'G# / Ab', 'A# / Bb'] },
  'Fm': { type: 'minor', notes: ['F', 'G', 'G# / Ab', 'A# / Bb', 'C', 'C# / Db', 'D# / Eb'] },
  'Bbm': { type: 'minor', notes: ['A# / Bb', 'C', 'C# / Db', 'D# / Eb', 'F', 'F# / Gb', 'G# / Ab'] },
  'Ebm': { type: 'minor', notes: ['D# / Eb', 'F', 'F# / Gb', 'G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db'] },
  'Abm': { type: 'minor', notes: ['G# / Ab', 'A# / Bb', 'B / Cb', 'C# / Db', 'D# / Eb', 'E / Fb', 'F# / Gb'] }
};

// Roman numeral patterns for major and minor keys
export const romanNumerals = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII']
};

// Common chord progressions (indices correspond to scale degrees)
// Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°
export const commonProgressions = [
  [0, 4, 5, 0], // I-V-vi-I or i-v-VI-i
  [0, 5, 3, 4], // I-vi-IV-V or i-VI-iv-v
  [0, 3, 4, 0], // I-IV-V-I or i-iv-v-i
  [0, 1, 4, 0], // I-ii-V-I or i-ii°-v-i
  [0, 4, 1, 4], // I-V-ii-V or i-v-ii°-v
  [5, 3, 0, 4], // vi-IV-I-V or VI-iv-i-v
  [0, 6, 3, 4], // I-vii°-IV-V or i-VII-iv-v
  [0, 3, 5, 4], // I-IV-vi-V or i-iv-VI-v
  [0, 2, 3, 0], // I-iii-IV-I or i-III-iv-i
  [2, 5, 3, 4], // iii-vi-IV-V or III-VI-iv-v
  [0, 2, 5, 4], // I-iii-vi-V or i-III-VI-v
  [1, 4, 0, 3], // ii-V-I-IV or ii°-v-i-iv
  [6, 0, 3, 4], // vii°-I-IV-V or VII-i-iv-v
  [0, 6, 1, 4], // I-vii°-ii-V or i-VII-ii°-v
  [2, 6, 0, 4], // iii-vii°-I-V or III-VII-i-v
  [0, 1, 2, 4]  // I-ii-iii-V or i-ii°-III-v
];

/**
 * Convert note name to MIDI number (handles flats, sharps, and enharmonic equivalents)
 * @param {string} noteName - Note name (e.g., 'C', 'C#', 'Db', 'F# / Gb')
 * @param {number} octave - Octave number (default 4)
 * @returns {number} MIDI note number
 */
export const noteToMidi = (noteName, octave = 4) => {
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  if (noteName.includes(' / ')) {
    noteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Handle flat and sharp notes
  let noteIndex;
  if (noteName.includes('b')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex - 1 + 12) % 12; // Flat = one semitone down
  } else if (noteName.includes('#')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex + 1) % 12; // Sharp = one semitone up
  } else {
    noteIndex = noteNames.indexOf(noteName);
  }
  
  return noteIndex + (octave + 1) * 12;
};

/**
 * Generate chord from scale degree in a given key with correct chord qualities
 * @param {object} keySignature - Key signature object from keySignatures
 * @param {number} scaleDegree - Scale degree (0-6)
 * @param {number} octave - Base octave for the chord
 * @returns {number[]} Array of MIDI note numbers forming the chord
 */
export const generateChordFromScaleDegree = (keySignature, scaleDegree, octave = 4) => {
  const notes = keySignature.notes;
  const keyType = keySignature.type;
  
  // Get the root note
  const root = notes[scaleDegree];
  const rootMidi = noteToMidi(root, octave);
  
  // Define chord qualities for each scale degree
  const chordQualities = {
    major: [
      'major',     // I
      'minor',     // ii
      'minor',     // iii
      'major',     // IV
      'major',     // V
      'minor',     // vi
      'diminished' // vii°
    ],
    minor: [
      'minor',     // i
      'diminished',// ii°
      'major',     // bIII
      'minor',     // iv
      'minor',     // v (can be major in harmonic minor, but using natural minor)
      'major',     // bVI
      'major'      // bVII
    ]
  };
  
  const quality = chordQualities[keyType][scaleDegree];
  
  // Build chord based on quality
  let thirdMidi, fifthMidi;
  
  switch (quality) {
    case 'major':
      thirdMidi = rootMidi + 4; // Major third
      fifthMidi = rootMidi + 7; // Perfect fifth
      break;
    case 'minor':
      thirdMidi = rootMidi + 3; // Minor third
      fifthMidi = rootMidi + 7; // Perfect fifth
      break;
    case 'diminished':
      thirdMidi = rootMidi + 3; // Minor third
      fifthMidi = rootMidi + 6; // Diminished fifth
      break;
    default:
      thirdMidi = rootMidi + 4; // Default to major
      fifthMidi = rootMidi + 7;
  }
  
  // Keep chords in a reasonable range
  if (rootMidi > 72) { // If too high, move down an octave
    return [rootMidi - 12, thirdMidi - 12, fifthMidi - 12];
  }
  
  return [rootMidi, thirdMidi, fifthMidi];
};

/**
 * Check if a MIDI note is the tonic of the key
 * @param {number} midiNote - MIDI note number
 * @param {object} params - Object containing key signature info
 * @returns {boolean} True if the note is the tonic
 */
export const isTonicNote = (midiNote, params) => {
  const noteNamesWithEnharmonics = [
    "C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"
  ];
  const noteName = noteNamesWithEnharmonics[midiNote % 12];
  
  // Get the tonic note from the key
  let tonicNote;
  if (params.key.endsWith('m')) {
    // Minor key - remove 'm' suffix
    tonicNote = params.key.slice(0, -1);
  } else {
    // Major key
    tonicNote = params.key;
  }
  
  // Handle enharmonic equivalents
  if (noteName.includes(' / ')) {
    const [sharp, flat] = noteName.split(' / ');
    return sharp === tonicNote || flat === tonicNote || 
           sharp === tonicNote + '#' || flat === tonicNote + 'b';
  }
  
  return noteName === tonicNote || 
         noteName === tonicNote + '#' || 
         noteName === tonicNote + 'b';
};

/**
 * Get the display name for a Roman numeral in a progression
 * @param {string} key - Key signature name
 * @param {number} scaleDegree - Scale degree (0-6)
 * @returns {string} Roman numeral representation
 */
export const getRomanNumeral = (key, scaleDegree) => {
  const keyType = keySignatures[key]?.type || 'major';
  return romanNumerals[keyType][scaleDegree];
};

/**
 * Generate a random chord progression
 * @param {string} key - Key signature name
 * @returns {object} Progression data with chords and answer
 */
export const generateProgression = (key) => {
  const keySignature = keySignatures[key];
  if (!keySignature) {
    throw new Error(`Invalid key: ${key}`);
  }
  
  // Select a random progression pattern
  const progressionIndex = Math.floor(Math.random() * commonProgressions.length);
  const progression = commonProgressions[progressionIndex];
  
  // Generate the chords
  const chords = progression.map(degree => 
    generateChordFromScaleDegree(keySignature, degree)
  );
  
  // Generate the answer (Roman numerals)
  const romanNumeralProgression = progression.map(degree => 
    getRomanNumeral(key, degree)
  );
  
  return {
    key,
    chords,
    progression,
    answer: romanNumeralProgression.join(' - '),
    romanNumerals: romanNumeralProgression
  };
};

/**
 * Validate a Roman numeral progression answer
 * @param {string} userAnswer - User's answer
 * @param {string} expectedAnswer - Expected answer
 * @returns {boolean} True if the answer is correct
 */
export const validateProgressionAnswer = (userAnswer, expectedAnswer) => {
  // Normalize the answers for comparison
  const normalize = (str) => str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[–—]/g, '-') // Handle different dash types
    .replace(/°/g, 'o')    // Handle diminished symbol variations
    .replace(/♭/g, 'b')    // Handle flat symbol variations
    .replace(/♯/g, '#');   // Handle sharp symbol variations
  
  return normalize(userAnswer) === normalize(expectedAnswer);
};

// REQUIRE_INVERSION_LABELING constant
export const REQUIRE_INVERSION_LABELING = false;