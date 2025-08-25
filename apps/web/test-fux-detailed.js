// Detailed test of a specific Fux exercise to see exact violations
import { fuxExercises } from './src/app/counterpoint/fux-exercises/fuxExercisesOptimized.js';
import fetch from 'node-fetch';

// Test Figure 5 in detail
async function testFigure5() {
  const exercise = fuxExercises.twoVoices.find(ex => ex.figure === 5);
  
  if (!exercise) {
    console.log('Figure 5 not found');
    return;
  }

  // Convert to API format
  const cantusFirmusNotes = exercise.cantusFirmus.midiNotes.map((midiNote, index) => ({
    id: `cf-${index + 1}`,
    note: midiNote,
    beat: (exercise.cantusFirmus.measures[index] - 1) * 4,
    duration: 4
  }));

  const solutionNotes = exercise.solution.midiNotes.map((midiNote, index) => ({
    id: `sol-${index + 1}`,
    note: midiNote,
    beat: (exercise.solution.measures[index] - 1) * 4,
    duration: 4
  }));

  console.log('Testing Figure 5 - Species 1 - D Dorian\n');
  console.log('Cantus Firmus (lower voice):');
  exercise.cantusFirmus.pitches.forEach((pitch, i) => {
    console.log(`  Measure ${i+1}: ${pitch}${exercise.cantusFirmus.octaves[i]} (MIDI ${exercise.cantusFirmus.midiNotes[i]})`);
  });
  
  console.log('\nFux Solution (upper voice):');
  exercise.solution.pitches.forEach((pitch, i) => {
    const alter = exercise.solution.alters[i];
    const alteredPitch = alter === 1 ? pitch + '#' : alter === -1 ? pitch + 'b' : pitch;
    console.log(`  Measure ${i+1}: ${alteredPitch}${exercise.solution.octaves[i]} (MIDI ${exercise.solution.midiNotes[i]})`);
  });

  console.log('\nIntervals formed:');
  exercise.cantusFirmus.midiNotes.forEach((cfNote, i) => {
    const solNote = exercise.solution.midiNotes[i];
    const interval = Math.abs(solNote - cfNote) % 12;
    const intervalName = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'][interval];
    console.log(`  Measure ${i+1}: ${intervalName} (${solNote - cfNote} semitones)`);
  });

  // Test validation
  try {
    const response = await fetch('http://localhost:4001/api/validate-counterpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cantusFirmus: cantusFirmusNotes,
        userNotes: solutionNotes,
        speciesType: 1
      })
    });

    const result = await response.json();
    
    console.log('\nValidation Result:');
    console.log(`  Valid: ${result.isValid ? 'Yes' : 'No'}`);
    
    if (result.violations && result.violations.length > 0) {
      console.log('\nViolations:');
      result.violations.forEach(violation => {
        console.log(`  - Rule: ${violation.rule}`);
        if (violation.details) {
          console.log(`    Details: ${violation.details}`);
        }
        if (violation.measure) {
          console.log(`    Measure: ${violation.measure}`);
        }
      });
    }

    // Also check what the actual rules are
    console.log('\nChecking rule definitions...');
    const rulesResponse = await fetch('http://localhost:4001/api/exercises/1');
    const exerciseData = await rulesResponse.json();
    
    if (exerciseData.success && exerciseData.exercise.rules) {
      console.log('\nSpecies 1 Rules:');
      exerciseData.exercise.rules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFigure5().catch(console.error);