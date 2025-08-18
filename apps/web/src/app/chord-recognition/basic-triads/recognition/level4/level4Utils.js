/**
 * Level 4 Specific Utilities
 * 
 * Contains chord generation and validation logic specific to Level 4
 * (Open Voicing Chords with octave doubling and wide spacing)
 */

import { noteNames, chordTypes, getMidiNoteName, validateAnswer, levelConfigs } from '../../shared/chordLogic.js';

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
/**
 * Validate answer for Level 4 using shared validation functions
 * @param {string} answer - User's answer
 * @param {string} expectedAnswer - Expected correct answer
 * @returns {boolean} True if answer is correct
 */
export const validateLevel4Answer = (answer, expectedAnswer) => {
  return validateAnswer(answer, expectedAnswer, levelConfigs.level4);
};

