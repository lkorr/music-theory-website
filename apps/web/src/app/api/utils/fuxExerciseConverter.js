// Convert Fux exercises to API format
import { getFuxExercisesComplete, getFuxSolutions } from '../../../lib/fux-data.js';

// Get data using utility functions
const fuxExercisesComplete = getFuxExercisesComplete();
const fuxSolutions = getFuxSolutions();

// Convert Fux exercise data to the format expected by the API
export function convertFuxExerciseToApiFormat(fuxExercise, solutionData = null) {
  const { 
    id, 
    figure, 
    species, 
    modalFinal, 
    cantusFirmusPosition,
    measureCount,
    description,
    cantusFirmus
  } = fuxExercise;

  // Convert cantus firmus to API format
  const cantusFirmusNotes = cantusFirmus.midiNotes.map((midiNote, index) => ({
    id: `cf-${index + 1}`,
    note: midiNote,
    beat: (cantusFirmus.measures[index] - 1) * 4, // Convert measure to beat (0-indexed)
    duration: 4 // Whole notes for Species 1
  }));

  // Convert solution to API format if provided
  let solutionNotes = null;
  if (solutionData && solutionData.midiNotes) {
    solutionNotes = solutionData.midiNotes.map((midiNote, index) => ({
      id: `sol-${index + 1}`,
      note: midiNote,
      beat: (solutionData.measures[index] - 1) * 4, // Convert measure to beat (0-indexed)
      duration: 4 // Whole notes for Species 1
    }));
  }

  return {
    species_type: species,
    difficulty_level: 'intermediate',
    title: `Fux Figure ${figure} - Species ${species}`,
    description: description || `${modalFinal.toUpperCase()} ${cantusFirmusPosition === 'lower' ? 'above' : 'below'} cantus firmus`,
    cantus_firmus: JSON.stringify(cantusFirmusNotes),
    solution: solutionNotes ? JSON.stringify(solutionNotes) : null,
    cantus_firmus_position: cantusFirmusPosition,
    measure_count: measureCount,
    modal_final: modalFinal
  };
}

// Get all Fux exercises converted to API format  
export function getAllFuxExercisesForApi() {
  const allExercises = [];
  let idCounter = 1;
  
  // Process two-voice exercises from the complete exercises file
  if (fuxExercisesComplete.twoVoices) {
    fuxExercisesComplete.twoVoices.forEach(exercise => {
      // Find matching solution
      const matchingSolution = fuxSolutions.twoVoices?.find(sol => sol.id === exercise.id);
      
      if (matchingSolution) {
        const converted = convertFuxExerciseToApiFormat(exercise, matchingSolution.solution);
        converted.id = idCounter++;
        allExercises.push(converted);
      } else {
        // Exercise without solution
        const converted = convertFuxExerciseToApiFormat(exercise);
        converted.id = idCounter++;
        allExercises.push(converted);
      }
    });
  }

  // Process three-voice exercises if they exist
  if (fuxExercisesComplete.threeVoices) {
    fuxExercisesComplete.threeVoices.forEach(exercise => {
      const matchingSolution = fuxSolutions.threeVoices?.find(sol => sol.id === exercise.id);
      
      if (matchingSolution) {
        const converted = convertFuxExerciseToApiFormat(exercise, matchingSolution.solution);
        converted.id = idCounter++;
        allExercises.push(converted);
      } else {
        const converted = convertFuxExerciseToApiFormat(exercise);
        converted.id = idCounter++;
        allExercises.push(converted);
      }
    });
  }

  return allExercises;
}