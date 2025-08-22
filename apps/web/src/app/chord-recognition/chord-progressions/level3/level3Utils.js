/**
 * Chord Progressions Level 3: Non-Diatonic Progressions  
 * Level-specific logic and configuration for borrowed chords, Neapolitan, etc.
 */

import { generateProgression, validateProgressionAnswer, keySignatures, romanNumerals } from '../../shared/theory/progressions/progressionLogic.js';
import { REQUIRE_INVERSION_LABELING } from '../../shared/theory/core/constants.js';

// Level 3 configuration
export const level3Config = {
  title: "Chord Progressions Level 3: Non-Diatonic Chords",
  description: "Identify progressions with borrowed chords, Neapolitan, augmented, and other non-diatonic chords",
  totalProblems: 20,
  passAccuracy: 80,
  passTime: 15,
  buttonColor: "bg-purple-600",
  buttonHoverColor: "bg-purple-700"
};

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

// Level 3 progressions with non-diatonic chords
const level3Progressions = [
  // Common progressions with borrowed chords
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'root', nonDiatonic: true, symbol: 'bVI' }, // bVI (borrowed)
    { degree: 3, inversion: 'root', nonDiatonic: false },     // IV
    { degree: 4, inversion: 'root', nonDiatonic: false }      // V
  ],
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'root', nonDiatonic: true, symbol: 'bVII' }, // bVII (borrowed)
    { degree: 3, inversion: 'root', nonDiatonic: false },     // IV
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ],
  [
    { degree: null, inversion: 'first', nonDiatonic: true, symbol: 'bII' }, // N6 (Neapolitan sixth)
    { degree: 4, inversion: 'root', nonDiatonic: false },     // V
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: 5, inversion: 'root', nonDiatonic: false }      // vi
  ],
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'root', nonDiatonic: true, symbol: 'I+' }, // I+ (augmented)
    { degree: 5, inversion: 'root', nonDiatonic: false },     // vi
    { degree: 4, inversion: 'root', nonDiatonic: false }      // V
  ],
  [
    { degree: 5, inversion: 'root', nonDiatonic: false },     // vi
    { degree: null, inversion: 'root', nonDiatonic: true, symbol: 'bIII' }, // bIII (borrowed)
    { degree: 4, inversion: 'root', nonDiatonic: false },     // V
    { degree: 0, inversion: 'root', nonDiatonic: false }      // I
  ],
  [
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: null, inversion: 'root', nonDiatonic: true, symbol: 'V+' }, // V+ (augmented dominant)
    { degree: 0, inversion: 'root', nonDiatonic: false },     // I
    { degree: 5, inversion: 'root', nonDiatonic: false }      // vi
  ]
];

/**
 * Convert note name to MIDI number
 */
const noteToMidi = (noteName, octave = 4) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
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
  
  return noteIndex + (octave + 1) * 12;
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
  
  // Get tonic note
  const tonicNote = key.endsWith('m') ? key.slice(0, -1) : key;
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
  if (minNote > 72) {
    chordNotes = chordNotes.map(note => note - 12);
  }
  
  return chordNotes;
};

/**
 * Generate diatonic chord from scale degree
 */
const generateChordFromScaleDegree = (keySignature, chordInfo, octave = 4) => {
  const notes = keySignature.notes;
  const { degree, inversion } = chordInfo;
  
  const root = notes[degree];
  const third = notes[(degree + 2) % 7];
  const fifth = notes[(degree + 4) % 7];
  
  let rootMidi = noteToMidi(root, octave);
  let thirdMidi = noteToMidi(third, octave);
  let fifthMidi = noteToMidi(fifth, octave);
  
  while (thirdMidi <= rootMidi) thirdMidi += 12;
  while (fifthMidi <= thirdMidi) fifthMidi += 12;
  
  let chordNotes = [rootMidi, thirdMidi, fifthMidi];
  
  if (inversion === 'first') {
    chordNotes = [thirdMidi, fifthMidi, rootMidi + 12];
  } else if (inversion === 'second') {
    chordNotes = [fifthMidi, rootMidi + 12, thirdMidi + 12];
  }
  
  const minNote = Math.min(...chordNotes);
  if (minNote > 72) {
    chordNotes = chordNotes.map(note => note - 12);
  }
  
  return chordNotes;
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
  
  if (chordInfo.inversion === 'first') {
    return `${symbol}${inversionSymbols.first}`;
  } else if (chordInfo.inversion === 'second') {
    return `${symbol}${inversionSymbols.second}`;
  }
  
  return symbol;
};

/**
 * Generate a Level 3 progression with non-diatonic chords
 */
export const generateLevel3Progression = () => {
  const keys = Object.keys(keySignatures);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const keySignature = keySignatures[randomKey];
  
  const progressionIndex = Math.floor(Math.random() * level3Progressions.length);
  const progression = level3Progressions[progressionIndex];
  
  // Generate the chords
  const chords = progression.map(chordInfo => {
    if (chordInfo.nonDiatonic) {
      return generateNonDiatonicChord(randomKey, chordInfo);
    } else {
      return generateChordFromScaleDegree(keySignature, chordInfo);
    }
  });
  
  // Generate the answer (Roman numerals)
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
 * Validate a Level 3 progression answer (with non-diatonic chord alternatives)
 */
export const validateLevel3Answer = (userAnswer, expectedAnswer) => {
  // Handle alternative notation for non-diatonic chords
  let normalizedExpected = expectedAnswer;
  let normalizedUser = userAnswer;
  
  // Common alternatives
  const alternatives = [
    { from: 'bII6', to: 'N6' },
    { from: 'bII', to: 'N' },
    { from: 'I+', to: 'Iaug' },
    { from: 'V+', to: 'Vaug' },
    { from: 'i+', to: 'iaug' },
    { from: '#iv°', to: '#ivdim' },
    { from: '#ii°', to: '#iidim' },
    { from: 'ii/♭5', to: 'ii°' },
    { from: 'iv/♭5', to: 'iv°' }
  ];
  
  // Apply alternatives to both user and expected answers
  alternatives.forEach(alt => {
    normalizedExpected = normalizedExpected.replace(new RegExp(alt.from, 'g'), alt.to);
    normalizedUser = normalizedUser.replace(new RegExp(alt.from, 'g'), alt.to);
    normalizedUser = normalizedUser.replace(new RegExp(alt.to, 'g'), alt.from); // Bidirectional
  });
  
  if (!REQUIRE_INVERSION_LABELING) {
    // Strip inversion markings
    normalizedExpected = normalizedExpected
      .replace(/6/g, '')
      .replace(/64/g, '')
      .replace(/°6/g, '°')
      .replace(/°64/g, '°');
  }
  
  return validateProgressionAnswer(normalizedUser, normalizedExpected);
};