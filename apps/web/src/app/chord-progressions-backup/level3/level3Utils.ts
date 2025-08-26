/**
 * Chord Progressions Level 3: Non-Diatonic Progressions  
 * Level-specific logic and configuration for borrowed chords, Neapolitan, etc.
 */

import { generateProgression, validateProgressionAnswer, keySignatures, romanNumerals, REQUIRE_INVERSION_LABELING } from '../shared/progressionLogic';

// Type definitions
export interface ChordInfo {
  degree: number | null;
  inversion: 'root' | 'first' | 'second';
  nonDiatonic: boolean;
  symbol?: string;
}

export interface NonDiatonicChord {
  symbol: string;
  rootOffset: number;
  quality: 'major' | 'minor' | 'augmented' | 'diminished' | 'half-diminished';
  description: string;
  alternatives: string[];
}

export interface KeySignature {
  type: 'major' | 'minor';
  notes: string[];
}

export interface LevelConfig {
  title: string;
  description: string;
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  buttonColor: string;
  buttonHoverColor: string;
}

export interface ChordProgression {
  key: string;
  chords: number[][];
  progression: ChordInfo[];
  answer: string;
  romanNumerals: string[];
}

export interface AlternativeRule {
  from: RegExp;
  to: string;
}

// Level 3 configuration
export const level3Config: LevelConfig = {
  title: "Chord Progressions Level 3: Non-Diatonic Chords",
  description: "Identify progressions with borrowed chords, Neapolitan, augmented, and other non-diatonic chords",
  totalProblems: 20,
  passAccuracy: 80,
  passTime: 15,
  buttonColor: "bg-purple-600",
  buttonHoverColor: "bg-purple-700"
};

// Non-diatonic chord definitions
const nonDiatonicChords: Record<'major' | 'minor', NonDiatonicChord[]> = {
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
const level3Progressions: ChordInfo[][] = [
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
 * Convert note name to MIDI number (handles enharmonic equivalents)
 */
const noteToMidi = (noteName: string, octave: number = 4): number => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle enharmonic equivalents (e.g., "F# / Gb")
  if (noteName.includes(' / ')) {
    noteName = noteName.split(' / ')[0]; // Use the first note name (sharp version)
  }
  
  let noteIndex: number;
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
const generateNonDiatonicChord = (key: string, chordInfo: ChordInfo, octave: number = 4): number[] => {
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
  let chordNotes: number[];
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
const generateChordFromScaleDegree = (keySignature: KeySignature, chordInfo: ChordInfo, octave: number = 4): number[] => {
  const { degree, inversion } = chordInfo;
  const keyType = keySignature.type;
  
  if (degree === null) {
    throw new Error('Degree cannot be null for diatonic chords');
  }
  
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
  let thirdMidi: number, fifthMidi: number;
  
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
const getRomanNumeralWithInversion = (key: string, chordInfo: ChordInfo): string => {
  let symbol: string;
  
  if (chordInfo.nonDiatonic) {
    symbol = chordInfo.symbol || '';
  } else {
    const keyType = keySignatures[key]?.type || 'major';
    symbol = romanNumerals[keyType][chordInfo.degree!];
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
export const generateLevel3Progression = (): ChordProgression => {
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
export const validateLevel3Answer = (userAnswer: string, expectedAnswer: string): boolean => {
  // Handle alternative notation for non-diatonic chords
  let normalizedExpected = expectedAnswer;
  let normalizedUser = userAnswer;
  
  // Common alternatives - normalize both to the same format
  const alternatives: AlternativeRule[] = [
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
  
  if (!REQUIRE_INVERSION_LABELING) {
    // Strip inversion markings
    normalizedExpected = normalizedExpected
      .replace(/6/g, '')
      .replace(/64/g, '')
      .replace(/°6/g, '°')
      .replace(/°64/g, '°');
    
    normalizedUser = normalizedUser
      .replace(/6/g, '')
      .replace(/64/g, '')
      .replace(/°6/g, '°')
      .replace(/°64/g, '°');
  }
  
  return validateProgressionAnswer(normalizedUser, normalizedExpected);
};