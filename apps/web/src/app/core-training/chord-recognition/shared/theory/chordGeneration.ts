/**
 * Universal Chord Generation System
 * 
 * This module provides universal chord generation for all chord types and levels
 * based on configuration objects, eliminating the need for separate generation 
 * functions for each level.
 * 
 * Features:
 * - Prevents consecutive duplicate chords
 * - Weighted selection for newly introduced chord types (2x probability)
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
  type ChordType 
} from './core/constants';

// Type definitions for chord generation
export interface ChordConfig {
  roots: string[];
  chordTypes: string[];
  maxInversion?: number;
  type: string;
}

export interface LevelConfig {
  id: string;
  chordGeneration: ChordConfig;
}

export interface GeneratedChord {
  notes: number[];
  name: string;
  expectedAnswer: string;
  root: string;
  chordType: string;
  inversion: string;
}

/**
 * Helper function to check if two chords are the same
 * @param {Object} chord1 - First chord object
 * @param {Object} chord2 - Second chord object
 * @returns {boolean} True if chords are identical
 */
function areChordsEqual(chord1: GeneratedChord | null, chord2: GeneratedChord | null): boolean {
  if (!chord1 || !chord2) return false;
  return chord1.root === chord2.root && 
         chord1.chordType === chord2.chordType && 
         chord1.inversion === chord2.inversion;
}

/**
 * Helper function to get newly introduced chord types for a level
 * Based on progression: basic triads → seventh chords → extended chords
 * @param {string} levelId - Level identifier (e.g., 'seventh-chords-1')
 * @param {string[]} chordTypes - Current level's chord types
 * @returns {string[]} Array of newly introduced chord types
 */
function getNewChordTypes(levelId: string, chordTypes: string[]): string[] {
  // Define what was available in previous categories
  const basicTriadTypes = ['major', 'minor', 'diminished', 'augmented'];
  const availableSeventhChordTypes = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'];
  
  if (levelId.startsWith('basic-triads')) {
    // For basic triads, determine new types within the category
    if (levelId === 'basic-triads-1') {
      return chordTypes; // All are new in first level
    }
    // For other basic triad levels, no new chord types are introduced
    return [];
  }
  
  if (levelId.startsWith('seventh-chords')) {
    // All seventh chord types are new compared to basic triads
    return chordTypes.filter(type => availableSeventhChordTypes.includes(type));
  }
  
  if (levelId.startsWith('extended-chords')) {
    // Extended chords that weren't in previous categories
    const previousTypes = [...basicTriadTypes, ...availableSeventhChordTypes];
    return chordTypes.filter(type => !previousTypes.includes(type));
  }
  
  return [];
}

/**
 * Helper function to select from array with weighted probability
 * @param {Array} items - Array of items to select from
 * @param {Array} weights - Array of weights (same length as items)
 * @returns {*} Selected item
 */
function weightedRandomSelect<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  // Fallback to last item
  return items[items.length - 1];
}

/**
 * Generate a chord based on level configuration
 * @param {Object} config - Level configuration object
 * @param {Object} previousChord - Previous chord to avoid repetition
 * @returns {Object} Generated chord object
 */
export const generateChord = (config, previousChord = null) => {
  const { chordGeneration } = config;
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  let newChord;
  do {
    attempts++;
    
    switch (chordGeneration.type) {
      case 'basic-triads':
        newChord = generateBasicTriad(chordGeneration, previousChord, config.id);
        break;
      case 'triads-with-inversions':
        newChord = generateTriadWithInversions(chordGeneration, previousChord, config.id);
        break;
      case 'open-voicings':
        newChord = generateOpenVoicing(chordGeneration, previousChord, config.id);
        break;
      case 'seventh-chords':
        newChord = generateSeventhChord(chordGeneration, previousChord, config.id);
        break;
      case 'seventh-chords-open':
        newChord = generateSeventhChordOpen(chordGeneration, previousChord, config.id);
        break;
      case 'ninth-chords':
        newChord = generateNinthChord(chordGeneration, previousChord, config.id);
        break;
      case 'eleventh-chords':
        newChord = generateEleventhChord(chordGeneration, previousChord, config.id);
        break;
      case 'thirteenth-chords':
        newChord = generateThirteenthChord(chordGeneration, previousChord, config.id);
        break;
      default:
        throw new Error(`Unknown chord generation type: ${chordGeneration.type}`);
    }
    
    // If we've tried many times and still getting duplicates, accept it
    // This prevents infinite loops when there are very few chord options
    if (attempts >= maxAttempts) {
      break;
    }
    
  } while (previousChord && areChordsEqual(newChord, previousChord));
  
  return newChord;
};

/**
 * Generate basic triad (root position only)
 */
function generateBasicTriad(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes } = config;
  
  // Select random root
  const root = roots[Math.floor(Math.random() * roots.length)];
  
  // Select chord type with weighted probability for newly introduced types
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = chordTypes[chordType];
  
  // Generate MIDI notes in octave 4
  const rootMidi = getNoteNumber(root, 4);
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
function generateTriadWithInversions(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, maxInversion } = config;
  
  // Convert root names if they use sharp notation
  const rootNameMap = { 'Cs': 'C#', 'Ds': 'D#', 'Fs': 'F#', 'Gs': 'G#', 'As': 'A#' };
  const convertedRoots = roots.map(r => rootNameMap[r] || r);
  
  const root = convertedRoots[Math.floor(Math.random() * convertedRoots.length)];
  
  // Select chord type with weighted probability for newly introduced types
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = chordTypes[chordType];
  
  // Select inversion (0 = root, 1 = first, 2 = second)
  const inversionNum = Math.floor(Math.random() * (maxInversion + 1));
  const inversionNames = ['root', 'first', 'second'];
  const inversion = inversionNames[inversionNum];
  
  // Generate notes
  const rootMidi = getNoteNumber(root, 4);
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes;
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
function generateOpenVoicing(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  // Select root and chord type with weighted probability
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
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
function generateSeventhChord(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = seventhChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion
  if (inversion !== 'root') {
    const inversionMap = { first: 1, second: 2, third: 3 };
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
function generateSeventhChordOpen(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
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
function generateNinthChord(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion for ninth chords (more complex)
  if (inversion !== 'root') {
    const inversionMap = { first: 1, second: 2, third: 3, fourth: 4 };
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
function generateEleventhChord(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion
  if (inversion !== 'root') {
    const inversionMap = { first: 1, second: 2 };
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
function generateThirteenthChord(config, previousChord, levelId) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
  const root = noteNames[rootNum];
  
  const newChordTypes = getNewChordTypes(levelId, allowedTypes);
  const weights = allowedTypes.map(type => 
    newChordTypes.includes(type) ? 2 : 1
  );
  const chordType = weightedRandomSelect(allowedTypes, weights);
  const chordData = extendedChordTypes[chordType];
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  const baseOctave = octaveRange[0];
  const rootMidi = (baseOctave + 1) * 12 + rootNum;
  const baseNotes = chordData.intervals.map(interval => rootMidi + interval);
  
  let notes = [...baseNotes];
  
  // Apply inversion (limited for 13th chords)
  if (inversion !== 'root') {
    const inversionMap = { first: 1 };
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