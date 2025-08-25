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
} from './core/notes.js';

import { 
  chordTypes, 
  seventhChordTypes, 
  extendedChordTypes,
  inversionTypes 
} from './core/constants.js';

/**
 * Generate a chord based on level configuration
 * @param {Object} config - Level configuration object
 * @param {Object} previousChord - Previous chord to avoid repetition
 * @returns {Object} Generated chord object
 */
export const generateChord = (config, previousChord = null) => {
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
function generateBasicTriad(config, previousChord) {
  const { roots, chordTypes: allowedTypes } = config;
  
  // Select random root
  const root = roots[Math.floor(Math.random() * roots.length)];
  
  // Select random chord type
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
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
function generateTriadWithInversions(config, previousChord) {
  const { roots, chordTypes: allowedTypes, maxInversion } = config;
  
  // Convert root names if they use sharp notation
  const rootNameMap = { 'Cs': 'C#', 'Ds': 'D#', 'Fs': 'F#', 'Gs': 'G#', 'As': 'A#' };
  const convertedRoots = roots.map(r => rootNameMap[r] || r);
  
  const root = convertedRoots[Math.floor(Math.random() * convertedRoots.length)];
  const chordType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
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
function generateOpenVoicing(config, previousChord) {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  // Select root and chord type
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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
function generateSeventhChord(config, previousChord) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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
function generateSeventhChordOpen(config, previousChord) {
  const { roots, chordTypes: allowedTypes, voicingSettings } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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
function generateNinthChord(config, previousChord) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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
function generateEleventhChord(config, previousChord) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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
function generateThirteenthChord(config, previousChord) {
  const { roots, chordTypes: allowedTypes, inversions, octaveRange } = config;
  
  const rootNum = roots[Math.floor(Math.random() * roots.length)];
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