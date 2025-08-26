/**
 * Chord Progressions Logic - Clean Architecture Version
 * Contains Roman numeral analysis, key signatures, and progression-specific utilities
 * 
 * This is a clean, refactored version that eliminates duplication and follows modern patterns.
 */

import type { ProgressionGeneration } from '../../data/levelConfigs';

// Standard note names in chromatic order
const noteNames: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Type definitions
export type KeyType = 'major' | 'minor';

export interface KeySignature {
  type: KeyType;
  notes: string[];
}

export interface KeySignatures {
  [key: string]: KeySignature;
}

export interface RomanNumerals {
  major: readonly string[];
  minor: readonly string[];
}

export type ChordQuality = 'major' | 'minor' | 'diminished';

export interface ChordProgression {
  key: string;
  chords: number[][];
  progression: string[];
  romanNumerals: string[];
  answer: string;
  expectedAnswer: string;
}

export interface ValidationParams {
  key: string;
}

// Major and minor key signatures with correct scale notes
export const keySignatures: KeySignatures = {
  // Major keys
  'C': { type: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G': { type: 'major', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  'D': { type: 'major', notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  'A': { type: 'major', notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
  'E': { type: 'major', notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
  'B': { type: 'major', notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
  'F#': { type: 'major', notes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'] },
  'C#': { type: 'major', notes: ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'] },
  'F': { type: 'major', notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  'Bb': { type: 'major', notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  'Eb': { type: 'major', notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  'Ab': { type: 'major', notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
  'Db': { type: 'major', notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
  'Gb': { type: 'major', notes: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'] },
  
  // Minor keys
  'Am': { type: 'minor', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  'Em': { type: 'minor', notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  'Bm': { type: 'minor', notes: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
  'F#m': { type: 'minor', notes: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'] },
  'C#m': { type: 'minor', notes: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'] },
  'G#m': { type: 'minor', notes: ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'] },
  'D#m': { type: 'minor', notes: ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'] },
  'A#m': { type: 'minor', notes: ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'] },
  'Dm': { type: 'minor', notes: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
  'Gm': { type: 'minor', notes: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },
  'Cm': { type: 'minor', notes: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  'Fm': { type: 'minor', notes: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'] },
  'Bbm': { type: 'minor', notes: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'] },
  'Ebm': { type: 'minor', notes: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'] }
};

// Roman numeral patterns for major and minor keys
export const romanNumerals: RomanNumerals = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII']
};

// Extended Roman numerals for non-diatonic chords
const extendedRomanNumerals = {
  major: {
    'I': 'I', 'ii': 'ii', 'iii': 'iii', 'IV': 'IV', 'V': 'V', 'vi': 'vi', 'vii°': 'vii°',
    'bII': 'bII', 'bIII': 'bIII', 'bVI': 'bVI', 'bVII': 'bVII', 'III': 'III'
  },
  minor: {
    'i': 'i', 'ii°': 'ii°', 'bIII': 'bIII', 'iv': 'iv', 'v': 'v', 'bVI': 'bVI', 'bVII': 'bVII',
    'V': 'V', 'VII': 'VII', 'VI': 'VI', 'bII': 'bII', 'III': 'III'
  }
};

/**
 * Convert note name to MIDI number
 */
export const noteToMidi = (noteName: string, octave: number = 4): number => {
  let processedNoteName = noteName;
  
  // Handle flat and sharp notes
  let noteIndex: number;
  if (processedNoteName.includes('b')) {
    const baseName = processedNoteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex - 1 + 12) % 12;
  } else if (processedNoteName.includes('#')) {
    const baseName = processedNoteName[0];
    const baseIndex = noteNames.indexOf(baseName);
    noteIndex = (baseIndex + 1) % 12;
  } else {
    noteIndex = noteNames.indexOf(processedNoteName);
  }
  
  return noteIndex + (octave + 1) * 12;
};

/**
 * Generate chord from Roman numeral in a given key
 */
export const generateChordFromRomanNumeral = (
  key: string, 
  romanNumeral: string, 
  octave: number = 4
): number[] => {
  const keySignature = keySignatures[key];
  if (!keySignature) {
    throw new Error(`Invalid key: ${key}`);
  }
  
  // Parse inversion from Roman numeral (e.g., "V6" = first inversion)
  const hasInversion = romanNumeral.includes('6') || romanNumeral.includes('64');
  const baseRomanNumeral = romanNumeral.replace(/6|64/g, '');
  const inversion = romanNumeral.includes('64') ? 2 : romanNumeral.includes('6') ? 1 : 0;
  
  // Get scale degree and chord quality
  const scaleDegree = getRomanNumeralScaleDegree(baseRomanNumeral, keySignature.type);
  const quality = getRomanNumeralQuality(baseRomanNumeral);
  
  // Get root note
  const notes = keySignature.notes;
  const root = notes[scaleDegree];
  const rootMidi = noteToMidi(root, octave);
  
  // Build chord based on quality
  let chord: number[];
  switch (quality) {
    case 'major':
      chord = [rootMidi, rootMidi + 4, rootMidi + 7];
      break;
    case 'minor':
      chord = [rootMidi, rootMidi + 3, rootMidi + 7];
      break;
    case 'diminished':
      chord = [rootMidi, rootMidi + 3, rootMidi + 6];
      break;
    default:
      chord = [rootMidi, rootMidi + 4, rootMidi + 7];
  }
  
  // Apply inversion
  if (inversion === 1) {
    chord = [chord[1], chord[2], chord[0] + 12];
  } else if (inversion === 2) {
    chord = [chord[2], chord[0] + 12, chord[1] + 12];
  }
  
  // Keep chords in reasonable range
  chord = chord.map(note => {
    while (note > 84) note -= 12; // Keep below C6
    while (note < 48) note += 12; // Keep above C3
    return Math.round(note);
  });
  
  return chord;
};

/**
 * Get scale degree from Roman numeral
 */
function getRomanNumeralScaleDegree(romanNumeral: string, keyType: KeyType): number {
  const degreeMap = {
    'I': 0, 'i': 0,
    'II': 1, 'ii': 1, 'ii°': 1, 'bII': 1,
    'III': 2, 'iii': 2, 'bIII': 2,
    'IV': 3, 'iv': 3,
    'V': 4, 'v': 4,
    'VI': 5, 'vi': 5, 'bVI': 5,
    'VII': 6, 'vii': 6, 'vii°': 6, 'bVII': 6
  };
  
  return degreeMap[romanNumeral as keyof typeof degreeMap] ?? 0;
}

/**
 * Get chord quality from Roman numeral
 */
function getRomanNumeralQuality(romanNumeral: string): ChordQuality {
  if (romanNumeral.includes('°')) return 'diminished';
  if (romanNumeral === romanNumeral.toLowerCase()) return 'minor';
  return 'major';
}

/**
 * Generate a random chord progression based on level configuration
 */
export const generateProgression = (config: ProgressionGeneration): ChordProgression => {
  // Select random key
  const key = config.keys[Math.floor(Math.random() * config.keys.length)];
  
  // Select random progression pattern
  const pattern = config.progressionPatterns[
    Math.floor(Math.random() * config.progressionPatterns.length)
  ];
  
  // Generate chords for each Roman numeral in the pattern
  const chords = pattern.map(romanNumeral => 
    generateChordFromRomanNumeral(key, romanNumeral)
  );
  
  // Create answer string
  const answer = pattern.join(' - ');
  
  return {
    key,
    chords,
    progression: pattern,
    romanNumerals: pattern,
    answer,
    expectedAnswer: answer
  };
};

/**
 * Validate a Roman numeral progression answer
 */
export const validateProgressionAnswer = (userAnswer: string, expectedAnswer: string): boolean => {
  // Normalize the answers for comparison
  const normalize = (str: string): string => str
    .toLowerCase()
    .replace(/\s+/g, '')           // Remove all spaces
    .replace(/[–—]/g, '-')         // Handle different dash types  
    .replace(/°/g, 'o')            // Handle diminished symbol variations
    .replace(/dim/g, 'o')          // Handle "dim" as diminished
    .replace(/([iv]+)d\b/g, '$1o') // Handle "d" suffix as diminished (e.g., "iid" -> "iio")
    .replace(/♭/g, 'b')            // Handle flat symbol variations
    .replace(/♯/g, '#')            // Handle sharp symbol variations
    .replace(/-/g, '');            // Remove dashes for comparison
  
  return normalize(userAnswer) === normalize(expectedAnswer);
};

/**
 * Check if a MIDI note is the tonic of the key
 */
export const isTonicNote = (midiNote: number, params: ValidationParams): boolean => {
  const noteNamesWithFlats = [
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
  ];
  const noteName = noteNamesWithFlats[midiNote % 12];
  
  // Get the tonic note from the key
  let tonicNote: string;
  if (params.key.endsWith('m')) {
    tonicNote = params.key.slice(0, -1);
  } else {
    tonicNote = params.key;
  }
  
  // Handle enharmonic equivalents
  const enharmonicMap: Record<string, string[]> = {
    'C#': ['Db'], 'Db': ['C#'],
    'D#': ['Eb'], 'Eb': ['D#'],
    'F#': ['Gb'], 'Gb': ['F#'],
    'G#': ['Ab'], 'Ab': ['G#'],
    'A#': ['Bb'], 'Bb': ['A#']
  };
  
  const equivalents = enharmonicMap[tonicNote] || [];
  return noteName === tonicNote || equivalents.includes(noteName);
};

/**
 * Play a chord progression using Web Audio API
 */
export const playChordProgression = async (
  chords: number[][], 
  tempo: number = 120,
  chordDuration: number = 800
): Promise<void> => {
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    console.warn('Web Audio API not supported');
    return Promise.resolve();
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const beatDuration = chordDuration; // Use chord duration directly
  
  return new Promise<void>((resolve) => {
    let currentBeat = 0;
    
    const playNextChord = (): void => {
      if (currentBeat >= chords.length) {
        resolve();
        return;
      }
      
      const chord = chords[currentBeat];
      
      // Play each note in the chord
      chord.forEach((midiNote: number) => {
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Envelope for natural sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (beatDuration / 1000) * 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + (beatDuration / 1000));
      });
      
      currentBeat++;
      setTimeout(playNextChord, beatDuration);
    };
    
    playNextChord();
  });
};