/**
 * Extended Chords Logic
 * 
 * Contains 7th chord definitions and utilities for extended chord recognition
 */

// Re-export basic utilities from triads
export { noteNames, getMidiNoteName, isBlackKey } from '../../basic-triads/shared/chordLogic.js';

// 7th chord types with intervals (semitones from root)
export const seventhChordTypes = {
  major7: {
    name: 'Major 7th',
    symbol: 'maj7',
    intervals: [0, 4, 7, 11] // Root, Major 3rd, Perfect 5th, Major 7th
  },
  minor7: {
    name: 'Minor 7th', 
    symbol: 'm7',
    intervals: [0, 3, 7, 10] // Root, Minor 3rd, Perfect 5th, Minor 7th
  },
  dominant7: {
    name: 'Dominant 7th',
    symbol: '7',
    intervals: [0, 4, 7, 10] // Root, Major 3rd, Perfect 5th, Minor 7th
  },
  diminished7: {
    name: 'Diminished 7th',
    symbol: 'dim7',
    intervals: [0, 3, 6, 9] // Root, Minor 3rd, Diminished 5th, Diminished 7th
  },
  halfDiminished7: {
    name: 'Half Diminished 7th',
    symbol: 'm7♭5',
    intervals: [0, 3, 6, 10] // Root, Minor 3rd, Diminished 5th, Minor 7th
  }
};

// 7th chord inversion types
export const seventhInversionTypes = {
  root: {
    name: 'Root Position',
    symbol: '',
    intervalOrder: [0, 1, 2, 3] // Root, 3rd, 5th, 7th
  },
  first: {
    name: '1st Inversion',
    symbol: '/1',
    intervalOrder: [1, 2, 3, 0] // 3rd, 5th, 7th, Root
  },
  second: {
    name: '2nd Inversion', 
    symbol: '/2',
    intervalOrder: [2, 3, 0, 1] // 5th, 7th, Root, 3rd
  },
  third: {
    name: '3rd Inversion',
    symbol: '/3', 
    intervalOrder: [3, 0, 1, 2] // 7th, Root, 3rd, 5th
  }
};

// Extended chord level configurations
export const extendedLevelConfigs = {
  level1: {
    name: 'Level 1: 7th Chords',
    description: 'Identify 7th chords in root position only',
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    buttonColor: 'bg-green-500',
    buttonHoverColor: 'bg-green-600',
    progressColor: 'bg-green-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
    inversions: ['root'], // Root position only
    requireInversionLabeling: false,
    octaveRange: [3, 4] // C3 to C4 range
  },
  level2: {
    name: 'Level 2: 7th Chords with First Inversions',
    description: 'Identify 7th chords including first inversions',
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    buttonColor: 'bg-blue-500',
    buttonHoverColor: 'bg-blue-600', 
    progressColor: 'bg-blue-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
    inversions: ['root', 'first'], // Root and first inversion
    requireInversionLabeling: false,
    octaveRange: [3, 4] // C3 to C4 range
  },
  level3: {
    name: 'Level 3: 7th Chords with All Inversions',
    description: 'Identify 7th chords including first and second inversions',
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    buttonColor: 'bg-purple-500',
    buttonHoverColor: 'bg-purple-600',
    progressColor: 'bg-purple-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
    inversions: ['root', 'first', 'second'], // Root, first, and second inversions
    requireInversionLabeling: false,
    octaveRange: [3, 4] // C3 to C4 range
  },
  level4: {
    name: 'Level 4: 7th Chords with All Inversions',
    description: 'Identify 7th chords including all inversions',
    totalProblems: 30,
    passAccuracy: 90,
    passTime: 5,
    buttonColor: 'bg-orange-500',
    buttonHoverColor: 'bg-orange-600',
    progressColor: 'bg-orange-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
    inversions: ['root', 'first', 'second', 'third'], // All inversions
    requireInversionLabeling: false,
    octaveRange: [3, 4] // C3 to C4 range
  },
  level5: {
    name: 'Level 5: Open Voicing 7th Chords',
    description: 'Identify 7th chords in open voicings with octave spacing',
    totalProblems: 30,
    passAccuracy: 75, // Easier than closed voicings
    passTime: 12, // More time needed for open voicings
    buttonColor: 'bg-red-500',
    buttonHoverColor: 'bg-red-600',
    progressColor: 'bg-red-500',
    roots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All chromatic notes
    chordTypes: ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'],
    inversions: ['root'], // Open voicings don't use traditional inversions
    requireInversionLabeling: false,
    octaveRange: [2, 3, 4, 5, 6], // Wide range for open voicings
    isOpenVoicing: true,
    voicingSettings: {
      minSpread: 12, // Minimum octave spread
      maxSpread: 36, // Maximum spread
      doubleRoot: true, // Allow root doubling
      allowWideSpacing: true
    }
  }
};

/**
 * Generate a 7th chord with specified configuration
 * @param {Object} config - Level configuration
 * @returns {Object} Generated chord object
 */
export const generateSeventhChord = (config) => {
  const { roots, chordTypes, inversions, octaveRange, isOpenVoicing, voicingSettings } = config;
  
  // Select random root
  let root;
  if (typeof roots[0] === 'string') {
    // Natural note names
    root = roots[Math.floor(Math.random() * roots.length)];
  } else {
    // MIDI note numbers (chromatic)
    const rootNumber = roots[Math.floor(Math.random() * roots.length)];
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    root = noteNames[rootNumber];
  }
  
  // Select random chord type
  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
  
  // Select random inversion
  const inversion = inversions[Math.floor(Math.random() * inversions.length)];
  
  // Get chord and inversion data
  const chordData = seventhChordTypes[chordType];
  
  // Get root note number
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootNoteNumber = noteNames.indexOf(root);
  
  let notes = [];
  let expectedAnswer = root + chordData.symbol;
  
  // Handle open voicings (Level 5)
  if (isOpenVoicing && voicingSettings) {
    const { minSpread, maxSpread, doubleRoot } = voicingSettings;
    
    // Calculate base octave (lower for open voicings)
    const baseOctaves = octaveRange.slice(0, 2).map(octave => octave * 12); // Use lower octaves for bass
    const baseOctave = baseOctaves[Math.floor(Math.random() * baseOctaves.length)];
    const baseRoot = rootNoteNumber + baseOctave;
    
    // Start with bass note (root)
    notes.push(baseRoot);
    
    // Add chord tones with wide spacing
    const intervals = chordData.intervals.slice(1); // Skip root for now
    const availableOctaves = octaveRange.map(oct => oct * 12);
    
    for (let interval of intervals) {
      // Choose a higher octave for spread
      const targetOctave = availableOctaves[Math.floor(Math.random() * (availableOctaves.length - 1)) + 1];
      let note = rootNoteNumber + interval + targetOctave;
      
      // Ensure minimum spread from bass note
      while (note < baseRoot + minSpread) {
        note += 12;
      }
      
      // Ensure maximum spread
      while (note > baseRoot + maxSpread) {
        note -= 12;
      }
      
      notes.push(note);
    }
    
    // Optionally double the root in higher octave
    if (doubleRoot && Math.random() < 0.5) {
      let highRoot = baseRoot + 24; // Two octaves up
      // Ensure it fits in the range
      if (highRoot <= baseRoot + maxSpread) {
        notes.push(highRoot);
      }
    }
    
    // Sort notes in ascending order
    notes.sort((a, b) => a - b);
    
    // Open voicings don't use inversion notation
    expectedAnswer = root + chordData.symbol;
    
  } else {
    // Handle closed voicings (Levels 1-4)
    const inversionData = seventhInversionTypes[inversion];
    
    // Calculate base octave
    const baseOctaves = octaveRange.map(octave => octave * 12);
    const baseOctave = baseOctaves[Math.floor(Math.random() * baseOctaves.length)];
    const baseRoot = rootNoteNumber + baseOctave;
    
    // Apply inversion
    const reorderedIntervals = inversionData.intervalOrder.map(index => chordData.intervals[index]);
    
    // Create notes with proper voicing for inversion
    for (let i = 0; i < reorderedIntervals.length; i++) {
      if (i === 0) {
        notes.push(baseRoot + reorderedIntervals[i]);
      } else {
        let nextNote = baseRoot + reorderedIntervals[i];
        // Ensure ascending order by moving to next octave if needed
        while (nextNote <= notes[notes.length - 1]) {
          nextNote += 12;
        }
        notes.push(nextNote);
      }
    }
    
    // Create expected answer with inversion notation if needed
    if (inversion !== 'root' && config.requireInversionLabeling) {
      expectedAnswer += inversionData.symbol;
    }
  }
  
  // Ensure notes are within reasonable range (C2 to C7)
  const minNote = 36; // C2
  const maxNote = 96; // C7
  
  // Transpose if needed
  while (Math.max(...notes) > maxNote) {
    notes = notes.map(note => note - 12);
  }
  while (Math.min(...notes) < minNote) {
    notes = notes.map(note => note + 12);
  }
  
  return {
    root,
    chordType,
    inversion: isOpenVoicing ? 'root' : inversion,
    notes,
    expectedAnswer,
    name: expectedAnswer, // Alias for compatibility
    intervals: isOpenVoicing ? chordData.intervals : 
               seventhInversionTypes[inversion].intervalOrder.map(index => chordData.intervals[index]),
    isOpenVoicing: isOpenVoicing || false
  };
};

/**
 * Validate a 7th chord answer
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer  
 * @param {Object} config - Level configuration
 * @returns {boolean} True if answer is correct
 */
export const validateSeventhChordAnswer = (answer, expectedAnswer, config = {}) => {
  const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
  
  const normalized = normalizeAnswer(answer);
  const expectedNormalized = normalizeAnswer(expectedAnswer);
  
  // Extract root note, chord type, and inversion from expected answer
  const parts = expectedAnswer.split('/');
  const chordPart = parts[0]; // e.g., "Cmaj7", "Dm7", "C7"
  const inversionPart = parts[1] || null; // e.g., "1", "2", "3", or null for root
  
  const rootNote = chordPart.match(/^[A-G][#b]?/)?.[0] || '';
  const chordTypePart = chordPart.replace(rootNote, '').toLowerCase();
  
  // Generate all acceptable formats for this chord and inversion
  const acceptableAnswers = new Set();
  
  // Add the exact expected answer
  acceptableAnswers.add(expectedNormalized);
  
  // Helper function to calculate bass note for inversions
  const getBassNoteForInversion = (rootNote, chordTypePart, inversionPart) => {
    // Determine chord type from chord part
    let chordType = 'major7'; // default
    if (chordTypePart === 'm7' || chordTypePart === 'min7' || chordTypePart === 'minor7') {
      chordType = 'minor7';
    } else if (chordTypePart === '7' || chordTypePart === 'dom7' || chordTypePart === 'dominant7') {
      chordType = 'dominant7';
    } else if (chordTypePart === 'dim7' || chordTypePart === 'diminished7') {
      chordType = 'diminished7';
    } else if (chordTypePart === 'm7b5' || chordTypePart === 'halfdiminished7') {
      chordType = 'halfdiminished7';
    } else if (chordTypePart === 'maj7' || chordTypePart === 'major7') {
      chordType = 'major7';
    }
    
    const intervals = seventhChordTypes[chordType]?.intervals || [0, 4, 7, 11];
    const rootIndex = noteNames.indexOf(rootNote);
    
    if (inversionPart === '1') {
      // First inversion: third in bass
      const bassInterval = intervals[1];
      return noteNames[(rootIndex + bassInterval) % 12];
    } else if (inversionPart === '2') {
      // Second inversion: fifth in bass
      const bassInterval = intervals[2];
      return noteNames[(rootIndex + bassInterval) % 12];
    } else if (inversionPart === '3') {
      // Third inversion: seventh in bass
      const bassInterval = intervals[3];
      return noteNames[(rootIndex + bassInterval) % 12];
    }
    
    return rootNote; // Root position
  };
  
  // Helper function to add inversion variations
  const addInversionVariations = (baseChord) => {
    // Always add the base chord without inversion notation
    acceptableAnswers.add(normalizeAnswer(baseChord));
    
    // Always add slash chord notation
    if (inversionPart === '1') {
      // Add slash chord notation (e.g., Cmaj7/E for C major 7 first inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      
      // Add numbered/descriptive inversion notations
      acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
    } else if (inversionPart === '2') {
      // Add slash chord notation (e.g., Cmaj7/G for C major 7 second inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      
      // Add numbered/descriptive inversion notations
      acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
    } else if (inversionPart === '3') {
      // Add slash chord notation (e.g., Cmaj7/B for C major 7 third inversion)
      const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
      acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      
      // Add numbered/descriptive inversion notations
      acceptableAnswers.add(normalizeAnswer(baseChord + '/3'));
      acceptableAnswers.add(normalizeAnswer(baseChord + '/third'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' third inversion'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' 3rd inversion'));
    } else {
      // Root position - add root position variations
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
      acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
    }
  };
  
  // Major 7th chord variations
  if (chordTypePart === 'maj7' || chordTypePart === 'major7' || chordTypePart === 'm7') {
    addInversionVariations(rootNote + 'maj7');
    addInversionVariations(rootNote + 'major7');
    addInversionVariations(rootNote + 'M7');
    addInversionVariations(rootNote + '△7');
  }
  
  // Minor 7th chord variations  
  else if (chordTypePart === 'm7' || chordTypePart === 'min7' || chordTypePart === 'minor7') {
    addInversionVariations(rootNote + 'm7');
    addInversionVariations(rootNote + 'min7');
    addInversionVariations(rootNote + 'minor7');
    addInversionVariations(rootNote + '-7');
  }
  
  // Dominant 7th chord variations
  else if (chordTypePart === '7' || chordTypePart === 'dom7' || chordTypePart === 'dominant7') {
    addInversionVariations(rootNote + '7');
    addInversionVariations(rootNote + 'dom7');
    addInversionVariations(rootNote + 'dominant7');
  }
  
  // Diminished 7th chord variations
  else if (chordTypePart === 'dim7' || chordTypePart === 'diminished7' || chordTypePart === '°7') {
    addInversionVariations(rootNote + 'dim7');
    addInversionVariations(rootNote + 'diminished7');
    addInversionVariations(rootNote + '°7');
    addInversionVariations(rootNote + 'o7');
  }
  
  // Half diminished 7th chord variations
  else if (chordTypePart === 'm7♭5' || chordTypePart === 'm7b5' || chordTypePart === 'ø7') {
    addInversionVariations(rootNote + 'm7♭5');
    addInversionVariations(rootNote + 'm7b5');
    addInversionVariations(rootNote + 'ø7');
    addInversionVariations(rootNote + 'halfdiminished7');
  }
  
  // Handle enharmonic equivalents
  const enharmonicEquivalents = {
    'c#': 'db', 'db': 'c#',
    'd#': 'eb', 'eb': 'd#',
    'f#': 'gb', 'gb': 'f#', 
    'g#': 'ab', 'ab': 'g#',
    'a#': 'bb', 'bb': 'a#'
  };
  
  const rootLower = rootNote.toLowerCase();
  if (enharmonicEquivalents[rootLower]) {
    const enharmonicRoot = enharmonicEquivalents[rootLower];
    const capitalizedEnharmonic = enharmonicRoot.charAt(0).toUpperCase() + enharmonicRoot.slice(1);
    
    // Add enharmonic variations for each chord type
    if (chordTypePart === 'maj7' || chordTypePart === 'major7') {
      addInversionVariations(capitalizedEnharmonic + 'maj7');
      addInversionVariations(capitalizedEnharmonic + 'major7');
      addInversionVariations(capitalizedEnharmonic + 'M7');
    } else if (chordTypePart === 'm7' || chordTypePart === 'min7' || chordTypePart === 'minor7') {
      addInversionVariations(capitalizedEnharmonic + 'm7');
      addInversionVariations(capitalizedEnharmonic + 'min7');
      addInversionVariations(capitalizedEnharmonic + 'minor7');
    } else if (chordTypePart === '7') {
      addInversionVariations(capitalizedEnharmonic + '7');
    } else if (chordTypePart === 'dim7') {
      addInversionVariations(capitalizedEnharmonic + 'dim7');
      addInversionVariations(capitalizedEnharmonic + '°7');
    } else if (chordTypePart === 'm7♭5' || chordTypePart === 'm7b5') {
      addInversionVariations(capitalizedEnharmonic + 'm7♭5');
      addInversionVariations(capitalizedEnharmonic + 'm7b5');
      addInversionVariations(capitalizedEnharmonic + 'ø7');
    }
  }
  
  return acceptableAnswers.has(normalized);
};

/**
 * Generate a chord with duplicate prevention
 * @param {Function} generateChordFn - Function to generate a chord
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Generated chord object
 */
export const generateChordWithDuplicatePrevention = (generateChordFn, previousChord = null) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const newChord = generateChordFn();
    
    // If no previous chord or different from previous, return it
    if (!previousChord || 
        newChord.root !== previousChord.root || 
        newChord.chordType !== previousChord.chordType || 
        newChord.inversion !== previousChord.inversion) {
      return newChord;
    }
    
    attempts++;
  }
  
  // If we can't find a different chord after max attempts, just return a new one
  return generateChordFn();
};