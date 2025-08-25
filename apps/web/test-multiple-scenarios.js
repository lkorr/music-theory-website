// Test multiple counterpoint scenarios
import fetch from 'node-fetch';

// Test 1: Simple valid exercise (C major, perfect ending)
const simpleValid = {
  cantusFirmus: [
    { id: 'cf-1', note: 60, beat: 0, duration: 4 },  // C4
    { id: 'cf-2', note: 62, beat: 4, duration: 4 },  // D4  
    { id: 'cf-3', note: 64, beat: 8, duration: 4 },  // E4
    { id: 'cf-4', note: 62, beat: 12, duration: 4 }, // D4
    { id: 'cf-5', note: 60, beat: 16, duration: 4 }  // C4
  ],
  userNotes: [
    { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
    { id: 'sol-2', note: 65, beat: 4, duration: 4 },  // F4 - Minor 3rd  
    { id: 'sol-3', note: 67, beat: 8, duration: 4 },  // G4 - Minor 3rd
    { id: 'sol-4', note: 69, beat: 12, duration: 4 }, // A4 - Perfect 5th
    { id: 'sol-5', note: 67, beat: 16, duration: 4 }  // G4 - Perfect 5th
  ]
};

// Test 2: Invalid exercise with dissonance
const withDissonance = {
  cantusFirmus: [
    { id: 'cf-1', note: 60, beat: 0, duration: 4 },  // C4
    { id: 'cf-2', note: 62, beat: 4, duration: 4 },  // D4  
    { id: 'cf-3', note: 64, beat: 8, duration: 4 },  // E4
    { id: 'cf-4', note: 60, beat: 12, duration: 4 }  // C4
  ],
  userNotes: [
    { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
    { id: 'sol-2', note: 63, beat: 4, duration: 4 },  // Eb4 - Minor 2nd (DISSONANT!)
    { id: 'sol-3', note: 65, beat: 8, duration: 4 },  // F4 - Minor 2nd (DISSONANT!)
    { id: 'sol-4', note: 67, beat: 12, duration: 4 }  // G4 - Perfect 5th
  ]
};

// Test 3: Parallel fifths violation
const parallelFifths = {
  cantusFirmus: [
    { id: 'cf-1', note: 60, beat: 0, duration: 4 },  // C4
    { id: 'cf-2', note: 62, beat: 4, duration: 4 },  // D4  
    { id: 'cf-3', note: 64, beat: 8, duration: 4 },  // E4
    { id: 'cf-4', note: 60, beat: 12, duration: 4 }  // C4
  ],
  userNotes: [
    { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
    { id: 'sol-2', note: 69, beat: 4, duration: 4 },  // A4 - Perfect 5th (PARALLEL!)
    { id: 'sol-3', note: 71, beat: 8, duration: 4 },  // B4 - Perfect 5th (PARALLEL!)
    { id: 'sol-4', note: 67, beat: 12, duration: 4 }  // G4 - Perfect 5th
  ]
};

async function testScenario(name, data, description) {
  console.log(`\n🎵 ${name}`);
  console.log('='.repeat(name.length + 4));
  console.log(description);
  
  // Show the intervals
  console.log('\nIntervals:');
  data.cantusFirmus.forEach((cfNote, i) => {
    if (data.userNotes[i]) {
      const solNote = data.userNotes[i];
      const interval = Math.abs(solNote.note - cfNote.note) % 12;
      const intervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];
      const intervalName = intervalNames[interval];
      const isConsonant = [0, 3, 4, 7, 8, 9].includes(interval);
      const consonantMark = isConsonant ? '✅' : '❌';
      console.log(`  Measure ${i+1}: ${intervalName} ${consonantMark}`);
    }
  });

  try {
    const response = await fetch('http://localhost:4002/api/validate-counterpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cantusFirmus: data.cantusFirmus,
        userNotes: data.userNotes,
        speciesType: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    console.log('\nResult:');
    console.log(`  Valid: ${result.isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`  Violations: ${result.violations?.length || 0}`);
    
    if (result.violations && result.violations.length > 0) {
      console.log('\nViolations:');
      result.violations.forEach((v, i) => {
        console.log(`  ${i+1}. ${v.message || `Rule ${v.rule}`}`);
      });
    }

    if (result.feedback && result.feedback.length > 0) {
      console.log('\nFeedback:');
      result.feedback.forEach((f, i) => {
        console.log(`  ${i+1}. ${f.message}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Testing Species 1 Solution Checker');
  console.log('=====================================');
  
  await testScenario(
    'Test 1: Simple Valid Exercise', 
    simpleValid,
    'A basic C major exercise that should pass all rules'
  );
  
  await testScenario(
    'Test 2: Dissonant Intervals', 
    withDissonance,
    'Contains minor 2nds which should be flagged as dissonant'
  );
  
  await testScenario(
    'Test 3: Parallel Perfect Fifths', 
    parallelFifths,
    'Three consecutive perfect 5ths which should violate parallel rules'
  );
  
  console.log('\n🏁 Testing Complete!\n');
}

runAllTests().catch(console.error);