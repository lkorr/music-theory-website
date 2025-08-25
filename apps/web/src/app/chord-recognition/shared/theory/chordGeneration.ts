/**
 * Universal Chord Generation System
 * 
 * This module provides universal chord generation for all chord types and levels
 * based on configuration objects, eliminating the need for separate generation 
 * functions for each level.
 */

import { 
  noteNames, 
  getMidiNoteName, 
  isBlackKey,
  normalizeNoteName,
  getNoteNumber 
} from './core/notes';

import { 
  chordTypes, 
  seventhChordTypes, 
  extendedChordTypes,
  inversionTypes,
  type ChordData 
} from './core/constants';

// Type definitions
export interface ChordResult {
  notes: number[];
  name: string;
  expectedAnswer: string;
  root: string;
  chordType: string;
  inversion: string;
}

export interface ChordGenerationConfig {
  type: string;
  roots: string[] | number[];
  chordTypes: string[];
  inversionSupport?: boolean;
  maxInversion?: number;
  inversions?: string[];
  octaveRange?: number[];
  isOpenVoicing?: boolean;
  voicingSettings?: {
    minSpread: number;
    maxSpread: number;
    doubleRoot?: boolean;
    allowWideSpacing?: boolean;
  };
}

export interface LevelConfig {
  chordGeneration: ChordGenerationConfig;
}

/**
 * Generate a chord based on level configuration
 * @param config - Level configuration object
 * @param previousChord - Previous chord to avoid repetition
 * @returns Generated chord object
 */
export const generateChord = (config: LevelConfig, previousChord: ChordResult | null = null): ChordResult => {
  const { chordGeneration } = config;
  
  switch (chordGeneration.type) {
    case 'basic-triads':
      return generateBasicTriad(chordGeneration, previousChord);
    case 'triads-with-inversions':
      return generateTriadWithInversions(chordGeneration, previousChord);
    case 'open-voicings':
      return generateOpenVoicing(chordGeneration, previousChord);
    case 'seventh-chords':
      return generateSeventhChord(chordGeneration, previousChord);
    case 'seventh-chords-open':
      return generateSeventhChordOpen(chordGeneration, previousChord);
    case 'ninth-chords':
      return generateNinthChord(chordGeneration, previousChord);
    case 'eleventh-chords':
      return generateEleventhChord(chordGeneration, previousChord);
    case 'thirteenth-chords':
      return generateThirteenthChord(chordGeneration, previousChord);
    default:
      throw new Error(`Unknown chord generation type: ${chordGeneration.type}`);
  }
};

/**
 * Generate basic triad (root position only)
 */
function generateBasicTriad(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes } = config;
  
  // Select random root
  const root = (roots as string[])[Math.floor(Math.random() * roots.length)];
  
  // Select random chord type
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = chordTypes[chordType];
  
  // Generate MIDI notes in octave 4
  const rootMidi = getNoteNumber(root, 4);
  if (rootMidi === null) {
    throw new Error(`Invalid root note: ${root}`);
  }
  const notes = chordData.intervals.map(interval => rootMidi + interval);
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}`,
    expectedAnswer,
    root,
    chordType,
    inversion: 'root'
  };
}

/**
 * Generate triad with inversions
 */
function generateTriadWithInversions(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, maxInversion = 0 } = config;
  
  // Convert root names if they use sharp notation
  const rootNameMap: Record<string, string> = { 'Cs': 'C#', 'Ds': 'D#', 'Fs': 'F#', 'Gs': 'G#', 'As': 'A#' };
  const convertedRoots = (roots as string[]).map(r => rootNameMap[r] || r);
  
  const root = convertedRoots[Math.floor(Math.random() * convertedRoots.length)];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = chordTypes[chordType];
  
  // Select inversion (0 = root, 1 = first, 2 = second)
  const inversionNum = Math.floor(Math.random() * (maxInversion + 1));
  const inversionNames = ['root', 'first', 'second'];
  const inversion = inversionNames[inversionNum];
  
  // Generate notes
  const rootMidi = getNoteNumber(root, 4);
  if (rootMidi === null) {
    throw new Error(`Invalid root note: ${root}`);
  }
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes: number[];
  if (inversionNum === 0) {
    notes = baseNotes;
  } else {
    // Apply inversion by moving bottom notes up an octave
    notes = [...baseNotes];
    for (let i = 0; i < inversionNum; i++) {
      notes[i] += 12; // Move up an octave
    }
    notes.sort((a, b) => a - b); // Sort ascending
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}${inversion !== 'root' ? ` (${inversionTypes[inversion].name})` : ''}`,
    expectedAnswer,
    root,
    chordType,
    inversion
  };
}

/**
 * Generate open voicing chord
 */
function generateOpenVoicing(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  if (!voicingSettings) {
    throw new Error('Voicing settings required for open voicings');
  }
  
  // Select root and chord type
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = chordTypes[chordType];
  
  // Generate wide-spaced voicing
  const { minSpread, maxSpread } = voicingSettings;
  const spread = minSpread + Math.random() * (maxSpread - minSpread);
  
  const baseOctave = 3;
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  
  // Create spread-out notes
  const notes = [];
  notes.push(rootMidi); // Bass note
  
  for (let i = 1; i < chordData.intervals.length; i++) {
    const interval = chordData.intervals[i];
    const noteSpread = (spread / chordData.intervals.length) * i;
    notes.push(rootMidi + interval + Math.floor(noteSpread));
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name} (Open Voicing)`,
    expectedAnswer,
    root,
    chordType,
    inversion: 'root'
  };
}

/**
 * Generate seventh chord
 */
function generateSeventhChord(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, inversions = ['root'], octaveRange = [3, 4] } = config;
  
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = seventhChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion
  if (inversion !== 'root') {
    const inversionMap: Record<string, number> = { first: 1, second: 2, third: 3 };
    const invNum = inversionMap[inversion];
    
    for (let i = 0; i < invNum; i++) {
      notes[i] += 12;
    }
    notes.sort((a, b) => a - b);
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}${inversion !== 'root' ? ` (${inversionTypes[inversion].name})` : ''}`,
    expectedAnswer,
    root,
    chordType,
    inversion
  };
}

/**
 * Generate open voicing seventh chord
 */
function generateSeventhChordOpen(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  if (!voicingSettings) {
    throw new Error('Voicing settings required for open voicings');
  }
  
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = seventhChordTypes[chordType];
  
  const { minSpread, maxSpread } = voicingSettings;
  const spread = minSpread + Math.random() * (maxSpread - minSpread);
  
  const baseOctave = 3;
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  
  const notes = [];
  notes.push(rootMidi); // Bass note
  
  for (let i = 1; i < chordData.intervals.length; i++) {
    const interval = chordData.intervals[i];
    const noteSpread = (spread / chordData.intervals.length) * i;
    notes.push(rootMidi + interval + Math.floor(noteSpread));
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name} (Open Voicing)`,
    expectedAnswer,
    root,
    chordType,
    inversion: 'root'
  };
}

/**
 * Generate ninth chord
 */
function generateNinthChord(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, inversions = ['root'], octaveRange = [3, 4] } = config;
  
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion for ninth chords (more complex)
  if (inversion !== 'root') {
    const inversionMap: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };
    const invNum = inversionMap[inversion];
    
    for (let i = 0; i < invNum; i++) {
      notes[i] += 12;
    }
    notes.sort((a, b) => a - b);
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}${inversion !== 'root' ? ` (${inversionTypes[inversion].name})` : ''}`,
    expectedAnswer,
    root,
    chordType,
    inversion
  };
}

/**
 * Generate eleventh chord
 */
function generateEleventhChord(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, inversions = ['root'], octaveRange = [3, 4] } = config;
  
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion
  if (inversion !== 'root') {
    const inversionMap: Record<string, number> = { first: 1, second: 2 };
    const invNum = inversionMap[inversion];
    
    for (let i = 0; i < invNum; i++) {
      notes[i] += 12;
    }
    notes.sort((a, b) => a - b);
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}${inversion !== 'root' ? ` (${inversionTypes[inversion].name})` : ''}`,
    expectedAnswer,
    root,
    chordType,
    inversion
  };
}

/**
 * Generate thirteenth chord
 */
function generateThirteenthChord(config: ChordGenerationConfig, previousChord: ChordResult | null): ChordResult {
  const { roots, chordTypes: allowedTypes, inversions = ['root'], octaveRange = [3, 4] } = config;
  
  const rootNum = (roots as number[])[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion (limited for 13th chords)
  if (inversion !== 'root') {
    const inversionMap: Record<string, number> = { first: 1 };
    const invNum = inversionMap[inversion];
    
    for (let i = 0; i < invNum; i++) {
      notes[i] += 12;
    }
    notes.sort((a, b) => a - b);
  }
  
  const expectedAnswer = root + chordData.symbol;
  
  return {
    notes,
    name: `${root} ${chordData.name}${inversion !== 'root' ? ` (${inversionTypes[inversion].name})` : ''}`,
    expectedAnswer,
    root,
    chordType,
    inversion
  };
}