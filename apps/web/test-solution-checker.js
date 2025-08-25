// Test the solution checker with Figure 5
import fetch from 'node-fetch';

// Fux Figure 5 data
const figure5CantusFirmus = [
  { id: 'cf-1', note: 62, beat: 0, duration: 4 },   // D4
  { id: 'cf-2', note: 65, beat: 4, duration: 4 },   // F4  
  { id: 'cf-3', note: 64, beat: 8, duration: 4 },   // E4
  { id: 'cf-4', note: 62, beat: 12, duration: 4 },  // D4
  { id: 'cf-5', note: 67, beat: 16, duration: 4 },  // G4
  { id: 'cf-6', note: 65, beat: 20, duration: 4 },  // F4
  { id: 'cf-7', note: 69, beat: 24, duration: 4 },  // A4
  { id: 'cf-8', note: 67, beat: 28, duration: 4 },  // G4
  { id: 'cf-9', note: 65, beat: 32, duration: 4 },  // F4
  { id: 'cf-10', note: 64, beat: 36, duration: 4 }  // E4
];

const figure5Solution = [
  { id: 'sol-1', note: 69, beat: 0, duration: 4 },   // A4 - Perfect 5th
  { id: 'sol-2', note: 69, beat: 4, duration: 4 },   // A4 - Major 3rd
  { id: 'sol-3', note: 67, beat: 8, duration: 4 },   // G4 - Minor 3rd
  { id: 'sol-4', note: 69, beat: 12, duration: 4 },  // A4 - Perfect 5th
  { id: 'sol-5', note: 71, beat: 16, duration: 4 },  // B4 - Major 3rd
  { id: 'sol-6', note: 72, beat: 20, duration: 4 },  // C5 - Perfect 5th
  { id: 'sol-7', note: 72, beat: 24, duration: 4 },  // C5 - Minor 3rd
  { id: 'sol-8', note: 71, beat: 28, duration: 4 },  // B4 - Major 3rd
  { id: 'sol-9', note: 74, beat: 32, duration: 4 },  // D5 - Major 6th
  { id: 'sol-10', note: 73, beat: 36, duration: 4 }  // C#5 - Major 6th (raised leading tone in Dorian)
];

async function testSolutionChecker() {
  console.log('🎼 Testing Fux Figure 5 Solution Checker');
  console.log('=====================================\n');
  
  console.log('Cantus Firmus (lower voice):');
  figure5CantusFirmus.forEach((note, i) => {
    const noteName = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][note.note % 12];
    const octave = Math.floor(note.note / 12) - 1;
    console.log(`  Measure ${i+1}: ${noteName}${octave} (MIDI ${note.note})`);
  });
  
  console.log('\nFux Solution (upper voice):');
  figure5Solution.forEach((note, i) => {
    const noteName = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][note.note % 12];
    const octave = Math.floor(note.note / 12) - 1;
    console.log(`  Measure ${i+1}: ${noteName}${octave} (MIDI ${note.note})`);
  });
  
  console.log('\nIntervals:');
  figure5CantusFirmus.forEach((cfNote, i) => {
    const solNote = figure5Solution[i];
    const interval = Math.abs(solNote.note - cfNote.note) % 12;
    const intervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];
    const intervalName = intervalNames[interval];
    console.log(`  Measure ${i+1}: ${intervalName} (${solNote.note - cfNote.note >= 0 ? '+' : ''}${solNote.note - cfNote.note} semitones)`);
  });

  console.log('\n🔍 Testing Validation...\n');
  
  try {
    const response = await fetch('http://localhost:4002/api/validate-counterpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cantusFirmus: figure5CantusFirmus,
        userNotes: figure5Solution,
        speciesType: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('Validation Result:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`✅ Valid: ${result.isValid || 'false'}`);
    console.log(`📊 Total Violations: ${result.violations ? result.violations.length : 0}`);
    
    if (result.violations && result.violations.length > 0) {
      console.log('\n❌ Violations Found:');
      result.violations.forEach((violation, i) => {
        console.log(`  ${i+1}. Rule: ${violation.rule || 'Unknown'}`);
        console.log(`     Message: ${violation.message || 'No message'}`);
        if (violation.beat !== undefined) {
          console.log(`     Beat: ${violation.beat} (Measure ${Math.floor(violation.beat / 4) + 1})`);
        }
        if (violation.severity) {
          console.log(`     Severity: ${violation.severity}`);
        }
        console.log('');
      });
    } else {
      console.log('\n✅ No violations found! The solution passes validation.');
    }
    
    // Also show any additional feedback
    if (result.feedback && result.feedback.length > 0) {
      console.log('\n💡 Additional Feedback:');
      result.feedback.forEach((fb, i) => {
        console.log(`  ${i+1}. ${fb.message}`);
        if (fb.severity) {
          console.log(`     Type: ${fb.severity}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error testing validation:', error.message);
  }
}

testSolutionChecker();