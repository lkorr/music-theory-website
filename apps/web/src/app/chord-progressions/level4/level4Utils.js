/**
 * Chord Progressions Level 4: Non-Diatonic Progressions with Inversions
 * Level-specific logic and configuration for borrowed chords, Neapolitan, etc. with inversions
 */

import { generateProgression, validateProgressionAnswer, keySignatures, romanNumerals } from '../shared/progressionLogic.js';

// Level 4 configuration - require inversion labeling
export const level4Config = {
  title: "Chord Progressions Level 4: Non-Diatonic Chords with Inversions",
  description: "Identify progressions with borrowed chords, Neapolitan, augmented, and other non-diatonic chords including inversions",
  totalProblems: 25,
  passAccuracy: 75,
  passTime: 18,
  buttonColor: "bg-indigo-600",
  buttonHoverColor: "bg-indigo-700"
};

// For Level 4, we require inversion labeling
const REQUIRE_INVERSION_LABELING = true;

// Non-diatonic chord definitions
const nonDiatonicChords = {
  major: [
    { symbol: 'bII', rootOffset: 1, quality: 'major', description: 'Neapolitan', alternatives: ['N', 'N6'] },
    { symbol: 'bIII', rootOffset: 3, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'bVI', rootOffset: 8, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'bVII', rootOffset: 10, quality: 'major', description: 'Borrowed from parallel minor', alternatives: [] },
    { symbol: 'I+', rootOffset: 0, quality: 'augmented', description: 'Augmented tonic', alternatives: ['Iaug'] },
    { symbol: 'V+', rootOffset: 7, quality: 'augmented', description: 'Augmented dominant', alternatives: ['Vaug'] },
    { symbol: '#iv°', rootOffset: 6, quality: 'diminished', description: 'Augmented fourth diminished', alternatives: ['#ivdim'] },
    { symbol: 'ii/♭5', rootOffset: 2, quality: 'half-diminished', description: 'Half-diminished supertonic', alternatives: ['iid', 'iidim', 'ii°'] }
  ],
  minor: [
    { symbol: 'bII', rootOffset: 1, quality: 'major', description: 'Neapolitan', alternatives: ['N', 'N6'] },
    { symbol: 'III', rootOffset: 4, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'VI', rootOffset: 9, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'VII', rootOffset: 11, quality: 'major', description: 'Borrowed from parallel major', alternatives: [] },
    { symbol: 'i+', rootOffset: 0, quality: 'augmented', description: 'Augmented tonic', alternatives: ['iaug'] },
    { symbol: 'V+', rootOffset: 7, quality: 'augmented', description: 'Augmented dominant', alternatives: ['Vaug'] },
    { symbol: '#ii°', rootOffset: 3, quality: 'diminished', description: 'Augmented second diminished', alternatives: ['#iidim'] },
    { symbol: 'iv/♭5', rootOffset: 5, quality: 'half-diminished', description: 'Half-diminished subdominant', alternatives: ['ivd', 'ivdim', 'iv°'] }
  ]
};

// Inversion symbols
const inversionSymbols = {
  first: '6',
  second: '64'
};

// Level 4 progressions with non-diatonic chords and inversions
// Each progression has at least 2 inversions (including non-diatonic chord inversions)
const level4Progressions = [
  // Common progressions with borrowed chords and inversions
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bVI' }, // bVI6 (borrowed in first inversion)
    { degree: 3, inversion: 'first', nonDiatonic: false },     // IV6
    { degree: 4, inversion: 'root', nonDiatonic: false }      // V
  ],
  [
    { degree: 0, inversion: 'first', nonDiatonic: false },     // I6
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bVII' }, // bVII6 (borrowed in first inversion)
    { degree: 3, inversion: 'first', nonDiatonic: false },     // IV6
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ],
  [
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bII' }, // N6 (Neapolitan sixth)
    { degree: 4, inversion: 'second', nonDiatonic: false },     // V64
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: 5, inversion: 'first', nonDiatonic: false }      // vi6
  ],
  [
    { degree: 0, inversion: 'first', nonDiatonic: false },     // I6
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'I+' }, // I+6 (augmented in first inversion)
    { degree: 5, inversion: 'root', nonDiatonic: false },     // vi
    { degree: 4, inversion: 'root', nonDiatonic: false }      // V
  ],
  [
    { degree: 5, inversion: 'first', nonDiatonic: false },     // vi6
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bIII' }, // bIII6 (borrowed in first inversion)
    { degree: 4, inversion: 'second', nonDiatonic: false },     // V64
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ],
  [
    { degree: 0, inversion: 'second', nonDiatonic: false },     // I64
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'V+' }, // V+6 (augmented dominant in first inversion)
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: 5, inversion: 'first', nonDiatonic: false }      // vi6
  ],
  [
    { degree: 1, inversion: 'first', nonDiatonic: false },     // ii6
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bVI' }, // bVI6 (borrowed in first inversion)
    { degree: 4, inversion: 'second', nonDiatonic: false },     // V64
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ],
  [
    { degree: 3, inversion: 'first', nonDiatonic: false },     // IV6
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bII' }, // N6 (Neapolitan sixth)
    { degree: 4, inversion: 'second', nonDiatonic: false },     // V64
    { degree: 0, inversion: 'first', nonDiatonic: false }      // I6
  ],
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'second', nonDiatonic: true, symbol: 'bVI' }, // bVI64 (borrowed in second inversion)
    { degree: 1, inversion: 'first', nonDiatonic: false },     // ii6
    { degree: 4, inversion: 'root', nonDiatonic: false }      // V
  ],
  [
    { degree: 5, inversion: 'first', nonDiatonic: false },     // vi6
    { degree: 3, inversion: 'second', nonDiatonic: false },     // IV64
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bVII' }, // bVII6 (borrowed)
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ]
];

/**
 * Convert note name to MIDI number (handles enharmonic equivalents)
 */
const noteToMidi = (noteName, octave = 4) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  if (noteName.includes(' / ')) {
    noteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  let noteIndex;
  if (noteName.includes('b')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex - 1 + 12) % 12;
  } else if (noteName.includes('#')) {
    const baseName = noteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex + 1) % 12;
  } else {
    noteIndex = noteNames.indexOf(noteName);
  }
  
  return Math.round(noteIndex + (octave + 1) * 12);
};

/**
 * Generate non-diatonic chord
 */
const generateNonDiatonicChord = (key, chordInfo, octave = 4) => {
  const keyType = keySignatures[key]?.type || 'major';
  const nonDiatonic = nonDiatonicChords[keyType].find(chord => chord.symbol === chordInfo.symbol);
  
  if (!nonDiatonic) {
    throw new Error(`Non-diatonic chord ${chordInfo.symbol} not found for ${keyType} keys`);
  }
  
  // Get tonic note and handle enharmonic equivalents
  let tonicNote = key.endsWith('m') ? key.slice(0, -1) : key;
  if (tonicNote.includes(' / ')) {
    tonicNote = tonicNote.split(' / ')[0]; // Use the first note name (sharp version)
  }
  const tonicMidi = noteToMidi(tonicNote, octave);
  
  // Calculate root note based on offset
  const rootMidi = tonicMidi + nonDiatonic.rootOffset;
  
  // Generate chord based on quality
  let chordNotes;
  switch (nonDiatonic.quality) {
    case 'major':
      chordNotes = [rootMidi, rootMidi + 4, rootMidi + 7]; // Major triad
      break;
    case 'minor':
      chordNotes = [rootMidi, rootMidi + 3, rootMidi + 7]; // Minor triad
      break;
    case 'augmented':
      chordNotes = [rootMidi, rootMidi + 4, rootMidi + 8]; // Augmented triad
      break;
    case 'diminished':
      chordNotes = [rootMidi, rootMidi + 3, rootMidi + 6]; // Diminished triad
      break;
    case 'half-diminished':
      chordNotes = [rootMidi, rootMidi + 3, rootMidi + 6, rootMidi + 10]; // Half-diminished seventh
      break;
    default:
      chordNotes = [rootMidi, rootMidi + 4, rootMidi + 7]; // Default to major
  }
  
  // Apply inversion
  if (chordInfo.inversion === 'first') {
    chordNotes = [chordNotes[1], chordNotes[2], chordNotes[0] + 12];
  } else if (chordInfo.inversion === 'second') {
    chordNotes = [chordNotes[2], chordNotes[0] + 12, chordNotes[1] + 12];
  }
  
  // Ensure reasonable range
  const minNote = Math.min(...chordNotes);
  const maxNote = Math.max(...chordNotes);
  
  if (minNote > 72) {
    chordNotes = chordNotes.map(note => Math.round(note - 12));
  } else if (maxNote < 60) {
    chordNotes = chordNotes.map(note => Math.round(note + 12));
  }
  
  // Ensure all notes are integers
  return chordNotes.map(note => Math.round(note));
};

/**
 * Generate diatonic chord from scale degree using proper music theory intervals
 */
const generateChordFromScaleDegree = (keySignature, chordInfo, octave = 4) => {
  const { degree, inversion } = chordInfo;
  const keyType = keySignature.type;
  
  // Get the root note from the scale
  const rootNote = keySignature.notes[degree];
  
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  let cleanRootNote = rootNote;
  if (rootNote.includes(' / ')) {
    cleanRootNote = rootNote.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  // Convert root to MIDI
  const rootMidi = noteToMidi(cleanRootNote, octave);
  
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
      'minor',     // v
      'major',     // bVI
      'major'      // bVII
    ]
  };
  
  const quality = chordQualities[keyType][degree];
  
  // Build chord based on quality using proper intervals
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
  
  // Apply inversion
  let chordNotes = [rootMidi, thirdMidi, fifthMidi];
  
  if (inversion === 'first') {
    // First inversion: third in bass
    chordNotes = [thirdMidi, fifthMidi, rootMidi + 12];
  } else if (inversion === 'second') {
    // Second inversion: fifth in bass
    chordNotes = [fifthMidi, rootMidi + 12, thirdMidi + 12];
  }
  
  // Keep chords in a reasonable range (C4-C6)
  const minNote = Math.min(...chordNotes);
  const maxNote = Math.max(...chordNotes);
  
  if (minNote > 72) { // If too high, move down an octave
    chordNotes = chordNotes.map(note => Math.round(note - 12));
  } else if (maxNote < 60) { // If too low, move up an octave
    chordNotes = chordNotes.map(note => Math.round(note + 12));
  }
  
  // Ensure all notes are integers
  return chordNotes.map(note => Math.round(note));
};

/**
 * Get Roman numeral with inversion for any chord
 */
const getRomanNumeralWithInversion = (key, chordInfo) => {
  let symbol;
  
  if (chordInfo.nonDiatonic) {
    symbol = chordInfo.symbol;
  } else {
    const keyType = keySignatures[key]?.type || 'major';
    symbol = romanNumerals[keyType][chordInfo.degree];
  }
  
  // Level 4 always includes inversion symbols
  if (chordInfo.inversion === 'first') {
    return `${symbol}${inversionSymbols.first}`;
  } else if (chordInfo.inversion === 'second') {
    return `${symbol}${inversionSymbols.second}`;
  }
  
  return symbol;
};

/**
 * Generate a Level 4 progression with non-diatonic chords and inversions
 */
export const generateLevel4Progression = () => {
  const keys = Object.keys(keySignatures);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const keySignature = keySignatures[randomKey];
  
  const progressionIndex = Math.floor(Math.random() * level4Progressions.length);
  const progression = level4Progressions[progressionIndex];
  
  // Generate the chords
  const chords = progression.map(chordInfo => {
    if (chordInfo.nonDiatonic) {
      return generateNonDiatonicChord(randomKey, chordInfo);
    } else {
      return generateChordFromScaleDegree(keySignature, chordInfo);
    }
  });
  
  // Generate the answer (Roman numerals with inversions)
  const romanNumeralProgression = progression.map(chordInfo => 
    getRomanNumeralWithInversion(randomKey, chordInfo)
  );
  
  return {
    key: randomKey,
    chords,
    progression,
    answer: romanNumeralProgression.join(' - '),
    romanNumerals: romanNumeralProgression
  };
};

/**
 * Validate a Level 4 progression answer (with non-diatonic chord alternatives and inversions)
 */
export const validateLevel4Answer = (userAnswer, expectedAnswer) => {
  // Handle alternative notation for non-diatonic chords
  let normalizedExpected = expectedAnswer;
  let normalizedUser = userAnswer;
  
  // Common alternatives - normalize both to the same format
  const alternatives = [
    { from: /bII6/g, to: 'N6' },
    { from: /N6/g, to: 'N6' },
    { from: /bII/g, to: 'N' },
    { from: /N/g, to: 'N' },
    { from: /I\+/g, to: 'Iaug' },
    { from: /Iaug/g, to: 'Iaug' },
    { from: /V\+/g, to: 'Vaug' },
    { from: /Vaug/g, to: 'Vaug' },
    { from: /i\+/g, to: 'iaug' },
    { from: /iaug/g, to: 'iaug' },
    { from: /#iv°/g, to: '#ivdim' },
    { from: /#ivdim/g, to: '#ivdim' },
    { from: /#ii°/g, to: '#iidim' },
    { from: /#iidim/g, to: '#iidim' },
    { from: /ii\/♭5/g, to: 'ii°' },
    { from: /iv\/♭5/g, to: 'iv°' }
  ];
  
  // Apply alternatives to normalize both answers to the same format
  alternatives.forEach(alt => {
    normalizedExpected = normalizedExpected.replace(alt.from, alt.to);
    normalizedUser = normalizedUser.replace(alt.from, alt.to);
  });
  
  // Level 4 REQUIRES inversion labeling, so no stripping
  
  return validateProgressionAnswer(normalizedUser, normalizedExpected);
};