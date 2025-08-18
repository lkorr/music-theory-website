/**
 * Level 4 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 4
 * (Open Voicing Chords with octave doubling and wide spacing)
 */

import { noteNames, chordTypes, getMidiNoteName } from '../../shared/chordLogic.js';

/**
 * Generate open voicing chord with octave doubling and wide spacing for Level 4
 * @param {Object} previousChord - Previous chord to avoid duplicates
 * @returns {Object} Chord object with notes, name, and expected answer
 */
export const generateLevel4Chord = (previousChord = null) => {
  const rootNotes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // All 12 notes
  const chordTypeKeys = ['major', 'minor', 'diminished', 'augmented'];
  
  let rootNote, chordTypeKey, attempt = 0;
  
  // Prevent exact same chord appearing twice in a row
  do {
    rootNote = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    chordTypeKey = chordTypeKeys[Math.floor(Math.random() * chordTypeKeys.length)];
    attempt++;
    
    // If we've tried many times, just accept any different combination
    if (attempt > 20) break;
    
  } while (previousChord && 
           previousChord.rootNote === rootNote && 
           previousChord.chordTypeKey === chordTypeKey);
  
  const chordType = chordTypes[chordTypeKey];
  
  // Generate base notes in middle register
  const baseOctave = 4;
  const baseNotes = chordType.intervals.map(interval => 
    (rootNote + interval) % 12 + (baseOctave * 12)
  );
  
  // Create open voicing with octave doubling and wide spacing
  const openVoicingNotes = [];
  
  // Strategy 1: Wide spacing (30% chance)
  if (Math.random() < 0.3) {
    // Spread notes across 2-3 octaves with gaps
    const lowOctave = 3;
    const midOctave = 4;
    const highOctave = 5;
    
    // Root in bass
    openVoicingNotes.push((rootNote % 12) + (lowOctave * 12));
    
    // Some chord tones in middle register
    const midNotes = chordType.intervals.slice(1).map(interval => 
      (rootNote + interval) % 12 + (midOctave * 12)
    );
    openVoicingNotes.push(...midNotes);
    
    // Possible octave doubling in higher register
    if (Math.random() < 0.5) {
      openVoicingNotes.push((rootNote % 12) + (highOctave * 12));
    }
  }
  // Strategy 2: Octave doubling (40% chance)
  else if (Math.random() < 0.4) {
    // Standard voicing with octave doubling
    openVoicingNotes.push(...baseNotes);
    
    // Add octave doubling of root or fifth
    const doublingTarget = Math.random() < 0.7 ? 0 : 2; // Root or fifth
    const doublingInterval = chordType.intervals[doublingTarget];
    const octaveDoubling = (rootNote + doublingInterval) % 12 + ((baseOctave + 1) * 12);
    openVoicingNotes.push(octaveDoubling);
  }
  // Strategy 3: Mixed open voicing (30% chance)
  else {
    // Lower notes
    const lowOctave = 3;
    openVoicingNotes.push((rootNote % 12) + (lowOctave * 12));
    
    // Middle notes - include all chord tones but spread them out
    chordType.intervals.slice(1).forEach(interval => {
      openVoicingNotes.push((rootNote + interval) % 12 + (baseOctave * 12));
    });
    
    // High register - add octave doubling of root or another chord tone
    const doublingInterval = chordType.intervals[Math.floor(Math.random() * chordType.intervals.length)];
    const highNote = (rootNote + doublingInterval) % 12 + ((baseOctave + 1) * 12);
    openVoicingNotes.push(highNote);
  }
  
  // Remove exact duplicates and sort, but ensure all chord tones are represented
  const uniqueNotes = [...new Set(openVoicingNotes)].sort((a, b) => a - b);
  
  // Verify all chord tones are present (check interval classes)
  const presentIntervalClasses = new Set(uniqueNotes.map(note => note % 12));
  const requiredIntervalClasses = new Set(chordType.intervals.map(interval => (rootNote + interval) % 12));
  
  // If any chord tone is missing, add it in a suitable octave
  for (const requiredInterval of chordType.intervals) {
    const requiredNote = (rootNote + requiredInterval) % 12;
    if (!presentIntervalClasses.has(requiredNote)) {
      // Add the missing note in the middle octave
      const missingNote = requiredNote + (baseOctave * 12);
      uniqueNotes.push(missingNote);
    }
  }
  
  // Sort again after potentially adding missing notes
  uniqueNotes.sort((a, b) => a - b);
  
  const expectedAnswer = noteNames[rootNote] + chordType.symbol;
  
  // Debug logging to verify all chord tones are present
  const finalIntervalClasses = uniqueNotes.map(note => note % 12);
  const expectedIntervalClasses = chordType.intervals.map(interval => (rootNote + interval) % 12);
  console.log('Open voicing debug:', {
    chord: expectedAnswer,
    expectedIntervals: expectedIntervalClasses,
    presentIntervals: finalIntervalClasses,
    allTonesPresent: expectedIntervalClasses.every(interval => finalIntervalClasses.includes(interval)),
    notes: uniqueNotes.map(note => getMidiNoteName(note))
  });
  
  return {
    notes: uniqueNotes,
    expectedAnswer: expectedAnswer,
    name: expectedAnswer, // Alias for compatibility
    explanation: `${noteNames[rootNote]} ${chordType.name || 'Major'} (Open Voicing)`,
    rootNote: rootNote,
    chordTypeKey: chordTypeKey
  };
};

/**
 * Validate answer for Level 4 (open voicing chords - no inversions)
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel4Answer = (answer, expectedAnswer) => {
  const normalizeAnswer = (str) => str.toLowerCase().replace(/\s+/g, '');
  
  const normalized = normalizeAnswer(answer);
  const expectedNormalized = normalizeAnswer(expectedAnswer);
  
  // Extract root note and chord type from expected answer
  const rootNote = expectedAnswer.match(/^[A-G][#b]?/)?.[0] || '';
  const chordTypePart = expectedAnswer.replace(rootNote, '').toLowerCase();
  
  // Generate all acceptable formats for this chord
  const acceptableAnswers = new Set();
  
  // Add the exact expected answer
  acceptableAnswers.add(expectedNormalized);
  
  // Major chord variations
  if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
    acceptableAnswers.add(normalizeAnswer(rootNote)); // Just "C"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'maj')); // "Cmaj"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'major')); // "Cmajor"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'M')); // "CM"
  }
  
  // Minor chord variations  
  else if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'm')); // "Cm"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'min')); // "Cmin"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'minor')); // "Cminor"
    acceptableAnswers.add(normalizeAnswer(rootNote + '-')); // "C-"
  }
  
  // Diminished chord variations
  else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'dim')); // "Cdim"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'diminished')); // "Cdiminished"
    acceptableAnswers.add(normalizeAnswer(rootNote + '°')); // "C°"
    acceptableAnswers.add(normalizeAnswer(rootNote + 'º')); // "Cº"
  }
  
  // Augmented chord variations
  else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
    acceptableAnswers.add(normalizeAnswer(rootNote + 'aug'));
    acceptableAnswers.add(normalizeAnswer(rootNote + 'augmented'));
    acceptableAnswers.add(normalizeAnswer(rootNote + '+'));
  }
  
  // Handle sharp/flat enharmonic equivalents
  const enharmonicEquivalents = {
    'c#': 'db', 'db': 'c#',
    'd#': 'eb', 'eb': 'd#', 
    'f#': 'gb', 'gb': 'f#',
    'g#': 'ab', 'ab': 'g#',
    'a#': 'bb', 'bb': 'a#'
  };
  
  // If the root note has an enharmonic equivalent, add those variations too
  const rootLower = rootNote.toLowerCase();
  if (enharmonicEquivalents[rootLower]) {
    const enharmonicRoot = enharmonicEquivalents[rootLower];
    const capitalizedEnharmonic = enharmonicRoot.charAt(0).toUpperCase() + enharmonicRoot.slice(1);
    
    // Add all the same variations for the enharmonic equivalent
    if (chordTypePart === '' || chordTypePart === 'maj' || chordTypePart === 'major') {
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'maj'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'major'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'M'));
    } else if (chordTypePart === 'm' || chordTypePart === 'min' || chordTypePart === 'minor') {
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'm'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'min'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'minor'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + '-'));
    } else if (chordTypePart === 'dim' || chordTypePart === 'diminished') {
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'dim'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'diminished'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + '°'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'º'));
    } else if (chordTypePart === 'aug' || chordTypePart === 'augmented') {
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'aug'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + 'augmented'));
      acceptableAnswers.add(normalizeAnswer(capitalizedEnharmonic + '+'));
    }
  }
  
  return acceptableAnswers.has(normalized);
};