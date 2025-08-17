// Music theory utilities
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Global configuration for inversion requirements
// Set to false to disable inversion labeling requirements across all levels
export const REQUIRE_INVERSION_LABELING = false;

export const chordTypes = {
  major: { name: '', intervals: [0, 4, 7], symbol: '' },
  minor: { name: 'Minor', intervals: [0, 3, 7], symbol: 'm' },
  diminished: { name: 'Diminished', intervals: [0, 3, 6], symbol: 'dim' },
  augmented: { name: 'Augmented', intervals: [0, 4, 8], symbol: 'aug' },
  // 7th chords
  major7: { name: 'Major 7th', intervals: [0, 4, 7, 11], symbol: 'maj7' },
  minor7: { name: 'Minor 7th', intervals: [0, 3, 7, 10], symbol: 'm7' },
  dominant7: { name: 'Dominant 7th', intervals: [0, 4, 7, 10], symbol: '7' },
  diminished7: { name: 'Diminished 7th', intervals: [0, 3, 6, 9], symbol: 'dim7' },
  halfDiminished7: { name: 'Half Diminished 7th', intervals: [0, 3, 6, 10], symbol: 'm7b5' },
  minor7b5: { name: 'Minor 7th b5', intervals: [0, 3, 6, 10], symbol: 'm7b5' } // Alias for halfDiminished7
};

export const inversionTypes = {
  root: { name: 'Root Position', intervalOrder: [0, 1, 2, 3] },
  first: { name: '1st Inversion', intervalOrder: [1, 2, 3, 0] },
  second: { name: '2nd Inversion', intervalOrder: [2, 3, 0, 1] },
  third: { name: '3rd Inversion', intervalOrder: [3, 0, 1, 2] }
};

// Generate chord based on level configuration
export const generateChord = (levelConfig) => {
  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // Include all chromatic notes
  
  // Add some logging to debug the randomization
  const rootRandom = Math.random();
  const root = roots[Math.floor(rootRandom * roots.length)];
  
  // Select chord type and inversion based on level configuration
  const { chordType, inversion } = levelConfig.selectChordAndInversion();
  
  console.log('Debug generateChord:', { 
    rootRandom, 
    root, 
    chordType, 
    inversion,
    timestamp: Date.now()
  });
  
  // Choose a random octave from 2, 3, or 4 (C2=36, C3=48, C4=60)
  const possibleOctaves = [36, 48, 60]; // C2, C3, C4
  const baseOctave = possibleOctaves[Math.floor(Math.random() * possibleOctaves.length)];
  
  // Build the chord from the chosen root and octave
  const rootNoteNumber = noteNames.indexOf(root);
  const baseRoot = rootNoteNumber + baseOctave;
  const intervals = chordTypes[chordType].intervals;
  
  let notes, expectedAnswer, finalIntervals;
  
  if (inversion === 'root') {
    // Root position
    notes = intervals.map(interval => baseRoot + interval);
    expectedAnswer = root + chordTypes[chordType].symbol;
    finalIntervals = intervals;
  } else {
    // Apply inversion - reorder the intervals according to inversion type
    const inversionOrder = inversionTypes[inversion].intervalOrder;
    // Only use the number of intervals that exist in the chord (3 for triads, 4 for 7ths)
    const actualIntervalOrder = inversionOrder.slice(0, intervals.length);
    const reorderedIntervals = actualIntervalOrder.map(index => intervals[index]);
    finalIntervals = reorderedIntervals;
    
    // Create notes with proper voicing for inversion
    notes = [];
    
    // For inversions, we need to ensure proper octave spacing
    for (let i = 0; i < reorderedIntervals.length; i++) {
      if (i === 0) {
        // First note uses the reordered interval from base root
        notes.push(baseRoot + reorderedIntervals[i]);
      } else {
        // Subsequent notes: add interval and ensure ascending order
        let nextNote = baseRoot + reorderedIntervals[i];
        // If this note would be lower than the previous note, move it up an octave
        while (nextNote <= notes[notes.length - 1]) {
          nextNote += 12;
        }
        notes.push(nextNote);
      }
    }
    
    // Create expected answer based on chord and inversion
    if (chordType === 'augmented' && inversion !== 'root') {
      // Special case for augmented chords - inversions are equivalent to other augmented chords
      if (inversion === 'first') {
        // 1st inversion of augmented chord = augmented chord starting on the 3rd
        const thirdIndex = (noteNames.indexOf(root) + 4) % 12; // Major third up
        const newRoot = noteNames[thirdIndex];
        expectedAnswer = newRoot + chordTypes[chordType].symbol;
      } else if (inversion === 'second') {
        // 2nd inversion of augmented chord = augmented chord starting on the 5th
        const fifthIndex = (noteNames.indexOf(root) + 8) % 12; // Augmented fifth up
        const newRoot = noteNames[fifthIndex];
        expectedAnswer = newRoot + chordTypes[chordType].symbol;
      }
    } else {
      // Normal chord inversion notation for major, minor, diminished, and 7th chords
      expectedAnswer = root + chordTypes[chordType].symbol;
      if (inversion === 'first') {
        expectedAnswer += '/1';
      } else if (inversion === 'second') {
        expectedAnswer += '/2';
      } else if (inversion === 'third') {
        expectedAnswer += '/3';
      }
    }
  }
  
  // Ensure all notes are within C1 (24) to C6 (84) range
  const minNote = 24; // C1
  const maxNote = 84; // C6
  
  // If any note is too high, transpose the entire chord down
  while (Math.max(...notes) > maxNote) {
    notes = notes.map(note => note - 12);
  }
  
  // If any note is too low, transpose the entire chord up
  while (Math.min(...notes) < minNote) {
    notes = notes.map(note => note + 12);
  }
  
  return {
    root,
    chordType,
    inversion,
    notes,
    expectedAnswer,
    intervals: finalIntervals
  };
};

// Validate answer with inversion support
export const validateAnswer = (answer, expectedAnswer) => {
  const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
  
  const normalized = normalizeAnswer(answer);
  let expectedNormalized = normalizeAnswer(expectedAnswer);
  
  // If inversion labeling is disabled, strip inversion notation from expected answer
  if (!REQUIRE_INVERSION_LABELING) {
    expectedNormalized = expectedNormalized.replace(/\/[123]/g, ''); // Remove /1, /2, /3
  }
  
  // Extract root note, chord type, and inversion from expected answer
  const parts = expectedAnswer.split('/');
  const chordPart = parts[0]; // e.g., "C", "Cm", "Cdim"
  const inversionPart = parts[1] || null; // e.g., "1", "2", or null for root
  
  const rootNote = chordPart.match(/^[A-G][#b]?/)?.[0] || '';
  const chordTypePart = chordPart.replace(rootNote, '').toLowerCase();
  
  // Generate all acceptable formats for this chord and inversion
  const acceptableAnswers = new Set();
  
  // Add the exact expected answer
  acceptableAnswers.add(expectedNormalized);
  
  // Helper function to calculate bass note for inversions
  const getBassNoteForInversion = (rootNote, chordTypePart, inversionPart) => {
    // Determine chord type from chord part
    let chordType = 'major'; // default
    if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
      chordType = 'minor';
    } else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
      chordType = 'diminished';
    } else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
      chordType = 'augmented';
    } else if (chordTypePart === 'maj7' || chordTypePart === 'major7') {
      chordType = 'major7';
    } else if (chordTypePart === 'm7' || chordTypePart === 'minor7') {
      chordType = 'minor7';
    } else if (chordTypePart === '7' || chordTypePart === 'dom7') {
      chordType = 'dominant7';
    } else if (chordTypePart === 'dim7') {
      chordType = 'diminished7';
    } else if (chordTypePart === 'm7b5' || chordTypePart === 'halfdiminished7') {
      chordType = 'halfDiminished7';
    }
    
    const intervals = chordTypes[chordType]?.intervals || [0, 4, 7];
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
    
    // Only add inversion-specific variations if inversion labeling is required
    if (REQUIRE_INVERSION_LABELING) {
      if (inversionPart === '1') {
        acceptableAnswers.add(normalizeAnswer(baseChord + '/1'));
        acceptableAnswers.add(normalizeAnswer(baseChord + '/first'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' first inversion'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' 1st inversion'));
        
        // Add slash chord notation (e.g., C/E for C major first inversion)
        const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
        acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      } else if (inversionPart === '2') {
        acceptableAnswers.add(normalizeAnswer(baseChord + '/2'));
        acceptableAnswers.add(normalizeAnswer(baseChord + '/second'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' second inversion'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' 2nd inversion'));
        
        // Add slash chord notation (e.g., C/G for C major second inversion)
        const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
        acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      } else if (inversionPart === '3') {
        acceptableAnswers.add(normalizeAnswer(baseChord + '/3'));
        acceptableAnswers.add(normalizeAnswer(baseChord + '/third'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' third inversion'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' 3rd inversion'));
        
        // Add slash chord notation (e.g., Cmaj7/B for C major 7 third inversion)
        const bassNote = getBassNoteForInversion(rootNote, chordTypePart, inversionPart);
        acceptableAnswers.add(normalizeAnswer(baseChord + '/' + bassNote));
      } else {
        // Root position - add root position variations
        acceptableAnswers.add(normalizeAnswer(baseChord + ' root'));
        acceptableAnswers.add(normalizeAnswer(baseChord + ' root position'));
      }
    }
  };
  
  // Major chord variations
  if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
    addInversionVariations(rootNote); // Just "C"
    addInversionVariations(rootNote + 'maj'); // "Cmaj"
    addInversionVariations(rootNote + 'major'); // "Cmajor"
    addInversionVariations(rootNote + 'M'); // "CM"
  }
  
  // Minor chord variations  
  if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
    addInversionVariations(rootNote + 'm'); // "Cm"
    addInversionVariations(rootNote + 'min'); // "Cmin"
    addInversionVariations(rootNote + 'minor'); // "Cminor"
  }
  
  // Diminished chord variations
  if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
    addInversionVariations(rootNote + 'dim'); // "Cdim"
    addInversionVariations(rootNote + 'diminished'); // "Cdiminished"
    addInversionVariations(rootNote + '°'); // "C°"
  }
  
  // Augmented chord variations
  if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
    addInversionVariations(rootNote + 'aug'); // "Caug"
    addInversionVariations(rootNote + 'augmented'); // "Caugmented"
    addInversionVariations(rootNote + '+'); // "C+"
    
    // For augmented chords, also accept enharmonic equivalents
    // Since augmented chords are symmetrical, each inversion = different root aug chord
    if (!inversionPart) {
      // Root position - also accept the other two equivalent augmented chords
      const rootIndex = noteNames.indexOf(rootNote);
      if (rootIndex !== -1) {
        const thirdRoot = noteNames[(rootIndex + 4) % 12]; // Major third up
        const fifthRoot = noteNames[(rootIndex + 8) % 12]; // Augmented fifth up
        
        // Accept these as equivalent
        acceptableAnswers.add(normalizeAnswer(thirdRoot + 'aug'));
        acceptableAnswers.add(normalizeAnswer(thirdRoot + 'augmented'));
        acceptableAnswers.add(normalizeAnswer(thirdRoot + '+'));
        acceptableAnswers.add(normalizeAnswer(fifthRoot + 'aug'));
        acceptableAnswers.add(normalizeAnswer(fifthRoot + 'augmented'));
        acceptableAnswers.add(normalizeAnswer(fifthRoot + '+'));
      }
    }
  }
  
  // Major 7th chord variations
  if (chordTypePart === 'maj7' || chordTypePart === 'major7') {
    addInversionVariations(rootNote + 'maj7'); // "Cmaj7"
    addInversionVariations(rootNote + 'major7'); // "Cmajor7"
    addInversionVariations(rootNote + 'M7'); // "CM7"
  }
  
  // Minor 7th chord variations
  if (chordTypePart === 'm7' || chordTypePart === 'min7' || chordTypePart === 'minor7') {
    addInversionVariations(rootNote + 'm7'); // "Cm7"
    addInversionVariations(rootNote + 'min7'); // "Cmin7"
    addInversionVariations(rootNote + 'minor7'); // "Cminor7"
  }
  
  // Dominant 7th chord variations
  if (chordTypePart === '7' || chordTypePart === 'dom7' || chordTypePart === 'dominant7') {
    addInversionVariations(rootNote + '7'); // "C7"
    addInversionVariations(rootNote + 'dom7'); // "Cdom7"
    addInversionVariations(rootNote + 'dominant7'); // "Cdominant7"
  }
  
  // Diminished 7th chord variations
  if (chordTypePart === 'dim7' || chordTypePart === 'diminished7') {
    addInversionVariations(rootNote + 'dim7'); // "Cdim7"
    addInversionVariations(rootNote + 'diminished7'); // "Cdiminished7"
    addInversionVariations(rootNote + '°7'); // "C°7"
  }
  
  // Half diminished 7th chord variations
  if (chordTypePart === 'm7b5' || chordTypePart === 'halfdiminished7' || chordTypePart === 'ø7') {
    addInversionVariations(rootNote + 'm7b5'); // "Cm7b5"
    addInversionVariations(rootNote + 'halfdiminished7'); // "Chalfdiminished7"
    addInversionVariations(rootNote + 'ø7'); // "Cø7"
    addInversionVariations(rootNote + 'half-dim7'); // "Chalf-dim7"
  }
  
  // Add enharmonic equivalent support for user input
  // If user enters enharmonic equivalent, convert it to match expected
  const enharmonicMap = {
    'c#': 'db', 'db': 'c#',
    'd#': 'eb', 'eb': 'd#', 
    'f#': 'gb', 'gb': 'f#',
    'g#': 'ab', 'ab': 'g#',
    'a#': 'bb', 'bb': 'a#'
  };
  
  // Check if user input has enharmonic equivalent that matches expected
  for (const [enharm1, enharm2] of Object.entries(enharmonicMap)) {
    if (normalized.includes(enharm1)) {
      const enharmonicVersion = normalized.replace(enharm1, enharm2);
      if (acceptableAnswers.has(enharmonicVersion)) {
        return true;
      }
    }
  }
  
  return acceptableAnswers.has(normalized);
};

// Level configurations
export const levelConfigs = {
  level1: {
    name: "Level 1: Basic Triads",
    selectChordAndInversion: () => {
      // Level 1: Only root position
      const chordTypeKeys = Object.keys(chordTypes);
      const chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      return { chordType, inversion: 'root' };
    }
  },
  
  level2: {
    name: "Level 2: First Inversions",
    selectChordAndInversion: () => {
      // Level 2: Root position and first inversion (no augmented inversions)
      if (Math.random() < 0.5) {
        // 50% chance of root position (any chord type)
        const chordTypeKeys = Object.keys(chordTypes);
        const chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
        return { chordType, inversion: 'root' };
      } else {
        // 50% chance of first inversion (exclude augmented)
        const nonAugmentedChords = ['major', 'minor', 'diminished'];
        const chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
        return { chordType, inversion: 'first' };
      }
    }
  },
  
  level3: {
    name: "Level 3: All Inversions",
    selectChordAndInversion: () => {
      // Level 3: Root position, first inversion, and second inversion (no augmented inversions)
      const inversionChoice = Math.random();
      if (inversionChoice < 0.33) {
        // 33% chance of root position (any chord type)
        const chordTypeKeys = Object.keys(chordTypes);
        const chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
        return { chordType, inversion: 'root' };
      } else if (inversionChoice < 0.67) {
        // 33% chance of first inversion (exclude augmented)
        const nonAugmentedChords = ['major', 'minor', 'diminished'];
        const chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
        return { chordType, inversion: 'first' };
      } else {
        // 33% chance of second inversion (exclude augmented)
        const nonAugmentedChords = ['major', 'minor', 'diminished'];
        const chordType = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
        return { chordType, inversion: 'second' };
      }
    }
  },
  
  level4: {
    name: "Level 4: Open Voicings",
    selectChordAndInversion: () => {
      // Level 4: Basic triads for open voicings (handled by level4's own generator)
      // This is just a placeholder since Level 4 uses its own chord generation
      const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
      const chordType = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
      return { chordType, inversion: 'root' };
    }
  },
  
  level5: {
    name: "Level 5: 7th Chords",
    selectChordAndInversion: () => {
      // Level 5: Only 7th chords in root position
      const seventhChords = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'];
      const chordType = seventhChords[Math.floor(Math.random() * seventhChords.length)];
      return { chordType, inversion: 'root' };
    }
  },
  
  level6: {
    name: "Level 6: 7th Chords with Inversions", 
    selectChordAndInversion: () => {
      // Level 6: 7th chords with all inversions (root, 1st, 2nd, 3rd)
      const seventhChords = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7'];
      const inversions = ['root', 'first', 'second', 'third'];
      
      const chordTypeRandom = Math.random();
      const inversionRandom = Math.random();
      
      const chordType = seventhChords[Math.floor(chordTypeRandom * seventhChords.length)];
      const inversion = inversions[Math.floor(inversionRandom * inversions.length)];
      
      console.log('Level6 selection:', { 
        chordTypeRandom, 
        inversionRandom, 
        chordType, 
        inversion,
        timestamp: Date.now()
      });
      
      return { chordType, inversion };
    }
  }
};