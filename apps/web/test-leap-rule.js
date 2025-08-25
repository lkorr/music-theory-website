// Test leap recovery rule with intentional violations
import fetch from 'node-fetch';

// Create test case with large leap followed by SIMILAR motion (should be flagged)
const cantusFirmus = [
  { id: 'cf-1', note: 60, beat: 0, duration: 4 },  // C4
  { id: 'cf-2', note: 62, beat: 4, duration: 4 },  // D4
  { id: 'cf-3', note: 64, beat: 8, duration: 4 },  // E4
  { id: 'cf-4', note: 60, beat: 12, duration: 4 }  // C4
];

const violatingUserNotes = [
  { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
  { id: 'sol-2', note: 74, beat: 4, duration: 4 },  // D5 - LEAP UP (7 semitones = perfect 5th)
  { id: 'sol-3', note: 76, beat: 8, duration: 4 },  // E5 - SIMILAR MOTION UP (should be flagged!)
  { id: 'sol-4', note: 67, beat: 12, duration: 4 }  // G4 - Perfect 5th
];

const goodUserNotes = [
  { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
  { id: 'sol-2', note: 74, beat: 4, duration: 4 },  // D5 - LEAP UP (7 semitones)
  { id: 'sol-3', note: 72, beat: 8, duration: 4 },  // C5 - CONTRARY MOTION DOWN (good recovery!)
  { id: 'sol-4', note: 67, beat: 12, duration: 4 }  // G4 - Perfect 5th
];

async function testLeapRule(name, userNotes, shouldHaveViolation) {
  console.log(`\n🎵 Testing: ${name}`);
  console.log('='.repeat(name.length + 12));
  
  // Show the leap analysis
  console.log('\nMelodic Analysis:');
  for (let i = 1; i < userNotes.length; i++) {
    const prev = userNotes[i-1];
    const curr = userNotes[i];
    const interval = Math.abs(curr.note - prev.note);
    const direction = curr.note > prev.note ? 'up' : curr.note < prev.note ? 'down' : 'static';
    const isLeap = interval > 2;
    
    const noteNames = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
    const prevName = noteNames[prev.note % 12] + Math.floor(prev.note / 12 - 1);
    const currName = noteNames[curr.note % 12] + Math.floor(curr.note / 12 - 1);
    
    console.log(`  M${i} → M${i+1}: ${prevName} → ${currName} (${interval} semitones ${direction}) ${isLeap ? '🔸 LEAP' : '✅ step'}`);
    
    // Check recovery
    if (isLeap && i < userNotes.length - 1) {
      const next = userNotes[i+1];
      const leapDirection = curr.note - prev.note;
      const recoveryDirection = next.note - curr.note;
      const isSimilar = (leapDirection > 0 && recoveryDirection > 0) || (leapDirection < 0 && recoveryDirection < 0);
      
      console.log(`    Recovery: ${isSimilar ? '❌ SIMILAR (should be flagged)' : '✅ CONTRARY (good)'}`);
    }
  }

  console.log('\n🔍 Testing Validation...');

  try {
    const response = await fetch('http://localhost:4004/api/validate-counterpoint', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cantusFirmus: cantusFirmus,
        userNotes: userNotes,
        speciesType: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Look for leap recovery violations
    const leapViolations = result.violations?.filter(v => 
      v.message && v.message.includes('leap') && v.message.includes('contrary')
    ) || [];
    
    console.log(`\nResult: ${leapViolations.length} leap recovery violation(s) found`);
    
    if (shouldHaveViolation) {
      if (leapViolations.length > 0) {
        console.log('✅ CORRECT: Rule properly caught the violation');
        leapViolations.forEach(v => {
          console.log(`  - ${v.message} (at beat ${v.beat})`);
        });
      } else {
        console.log('❌ PROBLEM: Rule should have caught this violation but didn\'t!');
        console.log('All violations found:');
        result.violations?.forEach(v => {
          console.log(`  - ${v.message}`);
        });
      }
    } else {
      if (leapViolations.length === 0) {
        console.log('✅ CORRECT: No leap recovery violations (as expected)');
      } else {
        console.log('❌ PROBLEM: Rule incorrectly flagged good counterpoint');
        leapViolations.forEach(v => {
          console.log(`  - ${v.message} (at beat ${v.beat})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runLeapTests() {
  console.log('🧪 Testing Leap Recovery Rule Implementation');
  console.log('==========================================');
  
  console.log('Current rule: After a leap (>2 semitones), prefer contrary motion');
  console.log('Testing with intentional violations and good examples...\n');
  
  await testLeapRule(
    'BAD: Large leap followed by similar motion',
    violatingUserNotes,
    true  // Should have violation
  );
  
  await testLeapRule(
    'GOOD: Large leap followed by contrary motion', 
    goodUserNotes,
    false // Should NOT have violation
  );
  
  console.log('\n🏁 Testing Complete!');
}

// Check if server is running first
console.log('🚀 Starting leap recovery rule test...');
console.log('Make sure dev server is running on http://localhost:4003\n');

runLeapTests().catch(console.error);