// Test leap detection and recovery rule specifically

// Let's analyze the Fux Figure 5 solution around measure 6
// Looking at the MIDI notes: [69, 69, 67, 69, 71, 72, 72, 71, 74, 73, 74, 69]
const fuxSolution = [
  { note: 69, beat: 0 },   // M1: A4
  { note: 69, beat: 4 },   // M2: A4 - static
  { note: 67, beat: 8 },   // M3: G4 - step down (2 semitones)
  { note: 69, beat: 12 },  // M4: A4 - step up (2 semitones)  
  { note: 71, beat: 16 },  // M5: B4 - step up (2 semitones)
  { note: 72, beat: 20 },  // M6: C5 - step up (1 semitone) *** LARGE LEAP FROM M5 → M6? ***
  { note: 72, beat: 24 },  // M7: C5 - static
  { note: 71, beat: 28 },  // M8: B4 - step down (1 semitone) *** RECOVERY from M6 → M7 → M8 ***
  { note: 74, beat: 32 },  // M9: D5 - leap up (3 semitones) *** LEAP! ***
  { note: 73, beat: 36 },  // M10: C#5 - step down (1 semitone) *** RECOVERY ***  
  { note: 74, beat: 40 },  // M11: D5 - step up (1 semitone) *** SIMILAR MOTION! Should be contrary ***
  { note: 69, beat: 44 }   // M12: A4 - leap down (5 semitones)
];

console.log('🔍 Leap Analysis of Fux Figure 5 Solution');
console.log('=========================================\n');

function analyzeLeap(note1, note2) {
  const interval = Math.abs(note2 - note1);
  const direction = note2 > note1 ? 'up' : note2 < note1 ? 'down' : 'static';
  const isLeap = interval > 2; // Current rule: >2 semitones = leap
  
  let intervalName;
  switch(interval) {
    case 0: intervalName = 'unison'; break;
    case 1: intervalName = 'minor 2nd'; break;
    case 2: intervalName = 'major 2nd'; break;
    case 3: intervalName = 'minor 3rd'; break;
    case 4: intervalName = 'major 3rd'; break;
    case 5: intervalName = 'perfect 4th'; break;
    case 6: intervalName = 'tritone'; break;
    case 7: intervalName = 'perfect 5th'; break;
    case 8: intervalName = 'minor 6th'; break;
    case 9: intervalName = 'major 6th'; break;
    case 10: intervalName = 'minor 7th'; break;
    case 11: intervalName = 'major 7th'; break;
    case 12: intervalName = 'octave'; break;
    default: intervalName = `${interval} semitones`; break;
  }
  
  return { interval, direction, isLeap, intervalName };
}

console.log('Melodic Movement Analysis:');
for (let i = 1; i < fuxSolution.length; i++) {
  const prev = fuxSolution[i-1];
  const curr = fuxSolution[i];
  const analysis = analyzeLeap(prev.note, curr.note);
  
  const noteNames = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  const prevName = noteNames[prev.note % 12] + Math.floor(prev.note / 12 - 1);
  const currName = noteNames[curr.note % 12] + Math.floor(curr.note / 12 - 1);
  
  console.log(`  M${i} → M${i+1}: ${prevName} → ${currName}`);
  console.log(`    ${analysis.intervalName} ${analysis.direction} (${analysis.interval} semitones)`);
  console.log(`    ${analysis.isLeap ? '🔸 LEAP' : '✅ Step/static'} (rule: >2 semitones = leap)`);
  
  // Check recovery if this is a leap
  if (analysis.isLeap && i < fuxSolution.length - 1) {
    const next = fuxSolution[i+1];
    const recoveryAnalysis = analyzeLeap(curr.note, next.note);
    const leapDirection = curr.note - prev.note;
    const recoveryDirection = next.note - curr.note;
    
    const isContraryRecovery = (leapDirection > 0 && recoveryDirection < 0) || 
                               (leapDirection < 0 && recoveryDirection > 0);
    const isSimilarRecovery = (leapDirection > 0 && recoveryDirection > 0) || 
                              (leapDirection < 0 && recoveryDirection < 0);
    
    console.log(`    🎯 Recovery check: ${isContraryRecovery ? '✅ CONTRARY' : isSimilarRecovery ? '❌ SIMILAR' : '⚪ STATIC/OBLIQUE'}`);
    
    if (isSimilarRecovery) {
      console.log(`    ⚠️  VIOLATION: Leap should be followed by contrary motion!`);
    }
  }
  console.log();
}

console.log('\n📊 Summary of Potential Leap Recovery Violations:');
console.log('================================================');

const violations = [];

for (let i = 2; i < fuxSolution.length; i++) {
  const prev2 = fuxSolution[i-2];
  const prev = fuxSolution[i-1]; 
  const curr = fuxSolution[i];
  
  const leapAnalysis = analyzeLeap(prev2.note, prev.note);
  
  if (leapAnalysis.isLeap) {
    const leapDirection = prev.note - prev2.note;
    const recoveryDirection = curr.note - prev.note;
    const isSimilarRecovery = (leapDirection > 0 && recoveryDirection > 0) || 
                              (leapDirection < 0 && recoveryDirection < 0);
    
    if (isSimilarRecovery) {
      violations.push({
        measureLeap: i-1,
        measureRecovery: i+1,
        leapInterval: leapAnalysis.intervalName,
        issue: 'Similar motion after leap (should be contrary)'
      });
    }
  }
}

if (violations.length > 0) {
  violations.forEach((v, i) => {
    console.log(`  ${i+1}. M${v.measureLeap}→M${v.measureLeap+1}: ${v.leapInterval}`);
    console.log(`     Recovery at M${v.measureRecovery}: ${v.issue}`);
  });
} else {
  console.log('  ✅ No leap recovery violations found with current rule implementation');
}

console.log('\n🤔 Investigation Notes:');
console.log('======================');
console.log('Current rule: isLeap = interval > 2 semitones');
console.log('- Minor 3rd (3 semitones) = LEAP ✓');
console.log('- Major 3rd (4 semitones) = LEAP ✓'); 
console.log('- Perfect 4th (5 semitones) = LEAP ✓');
console.log('- Minor 6th (8 semitones) = LEAP ✓');
console.log('');
console.log('The rule should catch leaps ≥ minor 3rd followed by similar motion.');
console.log('If it\'s not catching something specific, the issue may be in:');
console.log('1. The leap definition (currently >2 semitones)');
console.log('2. The recovery detection logic');  
console.log('3. The timing of when the rule is applied');