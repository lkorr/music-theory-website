/**
 * Progression Transcription Logic
 * 
 * Generates chord progressions and validates user transcriptions
 * Reuses existing music theory utilities to avoid code duplication
 */

import { noteNames, normalizeNoteName } from "../../../core-training/chord-recognition/shared/theory/core/notes.ts";
import { chordTypes, seventhChordTypes, extendedChordTypes } from "../../../core-training/chord-recognition/shared/theory/core/constants.ts";

// Type definitions
interface ChordInfo {
  degree: number;
  type: string;
  accidental?: number;
  secondary?: boolean;
}

interface ChordMapping {
  [key: string]: ChordInfo;
}

interface RomanNumeralMapping {
  major: ChordMapping;
  minor: ChordMapping;
}

interface ChordTypeInfo {
  name: string;
  intervals: number[];
}

interface ChordData {
  root: string;
  chordType: string;
  inversion: number;
  midiNotes: number[];
  romanNumeral: string;
}

interface Progression {
  key: string;
  pattern: string[];
  chords: ChordData[];
  allMidiNotes: number[];
}

interface ValidationOptions {
  tolerateOctaveErrors?: boolean;
  tolerateMissingNotes?: boolean;
  tolerateExtraNotes?: boolean;
}

interface ValidationResult {
  isCorrect: boolean;
  score: number;
  totalNotes: number;
  correctNotes: number;
  wrongNotes: number;
  missingNotes: number[];
  extraNotes: number[];
  feedback: string;
}

interface AudioConfig {
  tempo: number;
  chordDuration: number;
  pauseBetweenChords: number;
  instrument: string;
  baseOctave: number;
  volume: number;
}

interface AvailableKeys {
  major: string[];
  minor?: string[];
}

interface LevelConfig {
  title: string;
  description: string;
  audio: AudioConfig;
  progressions: string[][];
  availableKeys: AvailableKeys;
  maxAttempts: number;
  showHints: boolean;
  scoring: {
    perfectScore: number;
    timePenalty: number;
    wrongNotePenalty: number;
    hintPenalty: number;
  };
  theme: string;
  showProgressBar: boolean;
}

// Roman numeral to chord type mapping
const ROMAN_NUMERAL_MAPPING: RomanNumeralMapping = {
  // Major key mappings
  major: {
    'I': { degree: 0, type: 'major' },
    'ii': { degree: 1, type: 'minor' },
    'iii': { degree: 2, type: 'minor' },
    'IV': { degree: 3, type: 'major' },
    'V': { degree: 4, type: 'major' },
    'vi': { degree: 5, type: 'minor' },
    'vii°': { degree: 6, type: 'diminished' },
    
    // 7th chords
    'I7': { degree: 0, type: 'major7' },
    'ii7': { degree: 1, type: 'minor7' },
    'iii7': { degree: 2, type: 'minor7' },
    'IV7': { degree: 3, type: 'major7' },
    'V7': { degree: 4, type: 'dominant7' },
    'vi7': { degree: 5, type: 'minor7' },
    'vii7': { degree: 6, type: 'halfDiminished7' },
    
    // Dominant 7th chords (blues style - all dominant 7ths)
    'I7dom': { degree: 0, type: 'dominant7' },  // I as dominant 7th (blues)
    'II7dom': { degree: 1, type: 'dominant7' },  // II as dominant 7th
    'III7dom': { degree: 2, type: 'dominant7' }, // III as dominant 7th  
    'IV7dom': { degree: 3, type: 'dominant7' },  // IV as dominant 7th (blues)
    'V7dom': { degree: 4, type: 'dominant7' },   // V as dominant 7th (same as V7)
    'VI7dom': { degree: 5, type: 'dominant7' },  // VI as dominant 7th
    'VII7dom': { degree: 6, type: 'dominant7' }, // VII as dominant 7th
    
    // Suspended chords
    'Isus2': { degree: 0, type: 'sus2' },
    'Isus4': { degree: 0, type: 'sus4' },
    'V7sus4': { degree: 4, type: 'sus4' },
    'IVsus2': { degree: 3, type: 'sus2' },
    'IVsus4': { degree: 3, type: 'sus4' },
    'IV7dom': { degree: 3, type: 'dominant7' }, // IV as dominant 7th (blues)
    
    // Diminished chords
    'vii°': { degree: 6, type: 'diminished' },
    'ii°': { degree: 1, type: 'diminished' },   // For minor keys
    '#iv°': { degree: 3, type: 'diminished', accidental: 1 }, // Raised iv diminished
    '#ii°': { degree: 1, type: 'diminished', accidental: 1 }, // Raised ii diminished
    
    // Augmented chords  
    'I+': { degree: 0, type: 'augmented' },
    'V+': { degree: 4, type: 'augmented' },
    '#IV+': { degree: 3, type: 'augmented', accidental: 1 }, // Augmented on raised 4th
    
    // Additional borrowed chords
    'biii': { degree: 2, type: 'minor', accidental: -1 }, // Borrowed iii minor
    
    // Borrowed chords (from parallel minor)
    'bII': { degree: 1, type: 'major', accidental: -1 },
    'bIII': { degree: 2, type: 'major', accidental: -1 },
    'bVI': { degree: 5, type: 'major', accidental: -1 },
    'bVII': { degree: 6, type: 'major', accidental: -1 },
    
    // Secondary dominants
    'V/ii': { degree: 1, type: 'major', secondary: true },
    'V/iii': { degree: 2, type: 'major', secondary: true },
    'V/IV': { degree: 3, type: 'major', secondary: true },
    'V/V': { degree: 4, type: 'major', secondary: true },
    'V/vi': { degree: 5, type: 'major', secondary: true },
  },
  
  // Minor key mappings
  minor: {
    'i': { degree: 0, type: 'minor' },
    'ii°': { degree: 1, type: 'diminished' },
    'III': { degree: 2, type: 'major' },
    'iv': { degree: 3, type: 'minor' },
    'V': { degree: 4, type: 'major' },  // Raised 7th degree
    'VI': { degree: 5, type: 'major' },
    'VII': { degree: 6, type: 'major' },
    
    // Natural minor variants
    'v': { degree: 4, type: 'minor' },  // Natural 7th degree
    'vii°': { degree: 6, type: 'diminished' },
    
    // 7th chords
    'i7': { degree: 0, type: 'minor7' },
    'ii7': { degree: 1, type: 'halfDiminished7' },
    'III7': { degree: 2, type: 'major7' },
    'iv7': { degree: 3, type: 'minor7' },
    'V7': { degree: 4, type: 'dominant7' },
    'VI7': { degree: 5, type: 'major7' },
    'VII7': { degree: 6, type: 'dominant7' },
  }
};

// Major scale intervals (semitones from root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]; // Natural minor

/**
 * Parse Roman numeral with inversion notation
 * Examples: 'I', 'V/3', 'vi/5', 'IV/3'
 */
function parseRomanNumeral(romanNumeral: string): { chord: string; inversion: number } {
  const parts = romanNumeral.split('/');
  const chord = parts[0];
  const inversion = parts[1] ? parseInt(parts[1]) === 3 ? 1 : 
                              parseInt(parts[1]) === 5 ? 2 : 0 : 0;
  
  return { chord, inversion };
}

/**
 * Generate chord notes from Roman numeral in a given key
 */
function generateChordFromRomanNumeral(romanNumeral: string, key: string, baseOctave: number = 60): ChordData {
  console.log(`Generating chord: ${romanNumeral} in key ${key}`);
  const { chord, inversion } = parseRomanNumeral(romanNumeral);
  console.log(`Parsed: chord=${chord}, inversion=${inversion}`);
  
  // Determine if key is major or minor
  const isMinor = key.endsWith('m');
  const keyRoot = isMinor ? key.slice(0, -1) : key;
  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const mapping = isMinor ? ROMAN_NUMERAL_MAPPING.minor : ROMAN_NUMERAL_MAPPING.major;
  
  console.log(`Key analysis: isMinor=${isMinor}, keyRoot=${keyRoot}`);
  console.log(`Available chords in mapping:`, Object.keys(mapping));
  
  if (!mapping[chord]) {
    console.error(`Roman numeral ${chord} not found in ${isMinor ? 'minor' : 'major'} mapping`);
    throw new Error(`Unknown Roman numeral: ${chord} in ${isMinor ? 'minor' : 'major'} key`);
  }
  
  const chordInfo = mapping[chord];
  
  // Get root note index (normalize flat keys to sharp)
  const normalizedKeyRoot = normalizeNoteName(keyRoot);
  const keyRootIndex = noteNames.indexOf(normalizedKeyRoot as any);
  if (keyRootIndex === -1) {
    console.error(`Key root "${keyRoot}" (normalized: "${normalizedKeyRoot}") not found in noteNames array`);
    throw new Error(`Invalid key: ${key}`);
  }
  
  // Calculate chord root note
  let chordRootIndex: number;
  if (chordInfo.secondary) {
    // For secondary dominants, calculate the target chord's root first
    chordRootIndex = (keyRootIndex + scale[chordInfo.degree]) % 12;
    // Then go up a fifth (7 semitones) for the V chord
    chordRootIndex = (chordRootIndex + 7) % 12;
  } else {
    // Regular diatonic chord
    let scaleStep = scale[chordInfo.degree];
    if (chordInfo.accidental) {
      scaleStep += chordInfo.accidental;
    }
    chordRootIndex = (keyRootIndex + scaleStep) % 12;
  }
  
  const chordRoot = noteNames[chordRootIndex];
  
  // Generate chord using existing chord types
  const chordTypeInfo: ChordTypeInfo | undefined = 
    (chordTypes as any)[chordInfo.type] || 
    (seventhChordTypes as any)[chordInfo.type] || 
    (extendedChordTypes as any)[chordInfo.type];
  
  if (!chordTypeInfo) {
    throw new Error(`Unknown chord type: ${chordInfo.type}`);
  }
  
  // Calculate MIDI notes
  let chordNotes = chordTypeInfo.intervals.map(interval => 
    baseOctave + (chordRootIndex < noteNames.indexOf('C') ? 12 : 0) + chordRootIndex + interval
  );
  
  // Apply inversion
  if (inversion > 0 && inversion < chordNotes.length) {
    const notesToMove = chordNotes.slice(0, inversion);
    const remainingNotes = chordNotes.slice(inversion);
    const invertedNotes = notesToMove.map(note => note + 12);
    chordNotes = [...remainingNotes, ...invertedNotes];
  }
  
  // Ensure reasonable octave range (C3 to C6)
  const minNote = 48; // C3
  const maxNote = 84; // C6
  
  // Transpose to fit in range if needed
  while (Math.max(...chordNotes) > maxNote) {
    chordNotes = chordNotes.map(note => note - 12);
  }
  while (Math.min(...chordNotes) < minNote) {
    chordNotes = chordNotes.map(note => note + 12);
  }
  
  const finalChordNotes = chordNotes.sort((a, b) => a - b);
  
  // Validate the final chord
  if (!finalChordNotes || finalChordNotes.length === 0) {
    throw new Error(`Generated chord ${romanNumeral} in key ${key} has no notes`);
  }
  
  if (finalChordNotes.some(note => isNaN(note) || note < 21 || note > 108)) {
    throw new Error(`Generated chord ${romanNumeral} in key ${key} has invalid MIDI notes: ${finalChordNotes}`);
  }
  
  console.log(`Successfully generated chord ${romanNumeral}: ${finalChordNotes}`);
  
  return {
    root: chordRoot,
    chordType: chordInfo.type,
    inversion,
    midiNotes: finalChordNotes,
    romanNumeral: chord
  };
}

/**
 * Generate a complete chord progression
 */
export function generateProgression(progressionPattern: string[], key: string, baseOctave: number = 60): Progression {
  const progression: Progression = {
    key,
    pattern: progressionPattern,
    chords: [],
    allMidiNotes: [] // Flattened array of ALL notes (including repeats) for validation
  };
  
  try {
    for (const romanNumeral of progressionPattern) {
      const chord = generateChordFromRomanNumeral(romanNumeral, key, baseOctave);
      progression.chords.push(chord);
      progression.allMidiNotes.push(...chord.midiNotes);
    }
    
    // DO NOT remove duplicates - progression validation needs to account for repeated notes
    // across different chords in the progression
    
    return progression;
    
  } catch (error) {
    console.error('Error generating progression:', error);
    throw error;
  }
}

/**
 * Validate user's transcription against the correct progression
 */
export function validateTranscription(userNotes: number[], correctProgression: Progression, options: ValidationOptions = {}): ValidationResult {
  const {
    tolerateOctaveErrors = true,
    tolerateMissingNotes = false,
    tolerateExtraNotes = false
  } = options;
  
  // Safeguard against invalid progression
  if (!correctProgression || !correctProgression.allMidiNotes) {
    console.error('Invalid progression passed to validateTranscription:', correctProgression);
    return {
      isCorrect: false,
      score: 0,
      totalNotes: 0,
      correctNotes: 0,
      wrongNotes: 0,
      missingNotes: [],
      extraNotes: [],
      feedback: 'Invalid progression data. Please generate a new progression.'
    };
  }
  
  const result: ValidationResult = {
    isCorrect: false,
    score: 0,
    totalNotes: correctProgression.allMidiNotes.length,
    correctNotes: 0,
    wrongNotes: 0,
    missingNotes: [],
    extraNotes: [],
    feedback: ''
  };
  
  // For chord progression validation, we need to compare multisets (arrays with repetitions)
  // not sets, because notes can repeat across different chords
  let correctNotes = [...correctProgression.allMidiNotes];
  let userNotesArray = [...userNotes];
  
  // If tolerating octave errors, normalize to one octave
  if (tolerateOctaveErrors) {
    correctNotes = correctNotes.map(note => note % 12);
    userNotesArray = userNotesArray.map(note => note % 12);
  }
  
  // Sort both arrays for easier comparison
  correctNotes.sort((a, b) => a - b);
  userNotesArray.sort((a, b) => a - b);
  
  // Count occurrences of each note in both arrays
  const countNotes = (notes: number[]): Record<number, number> => {
    const counts: Record<number, number> = {};
    notes.forEach(note => counts[note] = (counts[note] || 0) + 1);
    return counts;
  };
  
  const correctCounts = countNotes(correctNotes);
  const userCounts = countNotes(userNotesArray);
  
  // Find correct matches, missing notes, and extra notes
  let correctMatches = 0;
  const missingNotes: number[] = [];
  const extraNotes: number[] = [];
  
  // Check each note type in the correct progression
  for (const [noteStr, correctCount] of Object.entries(correctCounts)) {
    const note = parseInt(noteStr);
    const userCount = userCounts[note] || 0;
    const matchCount = Math.min(correctCount, userCount);
    correctMatches += matchCount;
    
    // Add missing notes (if user has fewer than required)
    if (userCount < correctCount) {
      for (let i = 0; i < correctCount - userCount; i++) {
        missingNotes.push(note);
      }
    }
  }
  
  // Check for extra notes (notes user added that aren't in correct progression)
  for (const [noteStr, userCount] of Object.entries(userCounts)) {
    const note = parseInt(noteStr);
    const correctCount = correctCounts[note] || 0;
    if (userCount > correctCount) {
      for (let i = 0; i < userCount - correctCount; i++) {
        extraNotes.push(note);
      }
    }
  }
  
  result.correctNotes = correctMatches;
  result.wrongNotes = extraNotes.length;
  result.missingNotes = tolerateOctaveErrors ? 
    missingNotes.map(note => correctProgression.allMidiNotes.find(n => n % 12 === note) || note) :
    missingNotes;
  result.extraNotes = tolerateOctaveErrors ?
    extraNotes.map(note => userNotes.find(n => n % 12 === note) || note) :
    extraNotes;
  
  // Calculate score (0-100)
  const accuracy = result.correctNotes / result.totalNotes;
  const penalty = (result.wrongNotes + result.missingNotes.length) * 10;
  result.score = Math.max(0, Math.round(accuracy * 100 - penalty));
  
  // Determine if correct
  const hasAllNotes = result.missingNotes.length === 0 || tolerateMissingNotes;
  const hasNoExtraShortNotes = result.extraNotes.length === 0 || tolerateExtraNotes;
  result.isCorrect = hasAllNotes && hasNoExtraShortNotes && result.correctNotes >= result.totalNotes * 0.8;
  
  // Generate feedback
  if (result.isCorrect) {
    result.feedback = result.score === 100 ? 
      'Perfect transcription!' : 
      `Great job! Score: ${result.score}/100`;
  } else {
    const issues: string[] = [];
    if (result.missingNotes.length > 0) {
      issues.push(`Missing ${result.missingNotes.length} note(s)`);
    }
    if (result.wrongNotes > 0) {
      issues.push(`${result.wrongNotes} incorrect note(s)`);
    }
    result.feedback = `Not quite right. ${issues.join(', ')}. Score: ${result.score}/100`;
  }
  
  return result;
}

/**
 * Generate a random progression for a level
 */
export function generateRandomProgression(levelConfig: LevelConfig): Progression {
  console.log('generateRandomProgression called with config:', levelConfig);
  const { progressions, availableKeys } = levelConfig;
  
  console.log('Available progressions:', progressions);
  console.log('Available keys:', availableKeys);
  
  // Pick random progression pattern
  const randomProgression = progressions[Math.floor(Math.random() * progressions.length)];
  console.log('Selected progression pattern:', randomProgression);
  
  // Pick random key
  const keyTypes = Object.keys(availableKeys);
  console.log('Available key types:', keyTypes);
  const randomKeyType = keyTypes[Math.floor(Math.random() * keyTypes.length)] as keyof AvailableKeys;
  console.log('Selected key type:', randomKeyType);
  const keysOfType = availableKeys[randomKeyType];
  console.log('Keys of selected type:', keysOfType);
  
  if (!keysOfType || keysOfType.length === 0) {
    throw new Error(`No keys available for type: ${randomKeyType}`);
  }
  
  const randomKey = keysOfType[Math.floor(Math.random() * keysOfType.length)];
  console.log('Selected key:', randomKey);
  
  // Generate the progression
  console.log('Calling generateProgression with:', {
    pattern: randomProgression,
    key: randomKey,
    baseOctave: levelConfig.audio.baseOctave
  });
  return generateProgression(randomProgression, randomKey, levelConfig.audio.baseOctave);
}