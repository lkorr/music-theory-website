// Test the specific fix: large leap should only be flagged AFTER placing recovery note
import fetch from 'node-fetch';

const cantusFirmus = [
  { id: 'cf-1', note: 60, beat: 0, duration: 4 },  // C4
  { id: 'cf-2', note: 62, beat: 4, duration: 4 },  // D4
  { id: 'cf-3', note: 64, beat: 8, duration: 4 },  // E4
];

// Test 1: Just the leap (should NOT be flagged immediately)
const justTheLeap = [
  { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
  { id: 'sol-2', note: 76, beat: 4, duration: 4 },  // E5 - LARGE LEAP (9 semitones = minor 6th)
];

// Test 2: Leap + bad recovery (should be flagged)
const leapWithBadRecovery = [
  { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
  { id: 'sol-2', note: 76, beat: 4, duration: 4 },  // E5 - LARGE LEAP (9 semitones)
  { id: 'sol-3', note: 79, beat: 8, duration: 4 },  // G5 - SIMILAR MOTION UP (bad recovery!)
];

// Test 3: Leap + good recovery (should NOT be flagged)
const leapWithGoodRecovery = [
  { id: 'sol-1', note: 67, beat: 0, duration: 4 },  // G4 - Perfect 5th
  { id: 'sol-2', note: 76, beat: 4, duration: 4 },  // E5 - LARGE LEAP (9 semitones)
  { id: 'sol-3', note: 72, beat: 8, duration: 4 },  // C5 - CONTRARY MOTION DOWN (good recovery!)
];

async function testLeapScenario(name, userNotes, shouldHaveLeapViolation) {
  console.log(`\n🧪 Test: ${name}`);
  console.log('='.repeat(name.length + 8));
  
  try {
    const response = await fetch('http://localhost:4005/api/validate-counterpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cantusFirmus: cantusFirmus.slice(0, userNotes.length), // Match length
        userNotes: userNotes,
        speciesType: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Look for leap-related violations
    const leapViolations = result.violations?.filter(v => 
      v.message && (
        v.message.includes('leap') || 
        v.message.includes('Leap')
      )
    ) || [];
    
    console.log(`  Notes placed: ${userNotes.length}`);
    console.log(`  Leap violations: ${leapViolations.length}`);
    
    if (leapViolations.length > 0) {
      leapViolations.forEach(v => {
        console.log(`    - ${v.message}`);
      });
    }
    
    if (shouldHaveLeapViolation) {
      console.log(`  Expected: Should have leap violation`);
      console.log(`  Result: ${leapViolations.length > 0 ? '✅ CORRECTLY flagged' : '❌ MISSED violation'}`);
    } else {
      console.log(`  Expected: Should NOT have leap violation`);
      console.log(`  Result: ${leapViolations.length === 0 ? '✅ CORRECTLY clean' : '❌ FALSELY flagged'}`);
    }

  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function runFixTest() {
  console.log('🔧 Testing Leap Recovery Rule Fix');
  console.log('=================================');
  console.log('Before fix: Large leaps were flagged immediately when placed');
  console.log('After fix: Large leaps should only be flagged after recovery note is placed\n');
  
  await testLeapScenario(
    'Just the leap (2 notes)', 
    justTheLeap,
    false  // Should NOT be flagged yet
  );
  
  await testLeapScenario(
    'Leap + similar motion recovery (3 notes)', 
    leapWithBadRecovery,
    true   // Should be flagged now
  );
  
  await testLeapScenario(
    'Leap + contrary motion recovery (3 notes)', 
    leapWithGoodRecovery,
    false  // Should NOT be flagged
  );
  
  console.log('\n✅ Fix Summary:');
  console.log('- Removed premature leap flagging from Rule 3');
  console.log('- Enhanced Rule 6 to properly check leap recovery');
  console.log('- Now only flags when recovery is actually problematic');
}

runFixTest().catch(console.error);