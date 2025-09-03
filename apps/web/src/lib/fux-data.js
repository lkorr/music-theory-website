/**
 * Fux Exercise Data Utilities
 * 
 * Utilities for loading and working with Fux Gradus ad Parnassum exercises and solutions.
 * Data source: http://fourscoreandmore.org/species/
 */

import fuxSolutions from '../data/fux-exercises/fux-solutions.json';
import fuxExercisesComplete from '../data/fux-exercises/fux-exercises-complete.json';

/**
 * Get all Fux solutions
 * @returns {Object} Complete Fux solutions data
 */
export function getFuxSolutions() {
  return fuxSolutions;
}

/**
 * Get complete Fux exercises
 * @returns {Object} Complete Fux exercises data
 */
export function getFuxExercisesComplete() {
  return fuxExercisesComplete;
}

/**
 * Get Fux solution by ID
 * @param {string} id - Solution ID
 * @returns {Object|null} Solution data or null if not found
 */
export function getFuxSolutionById(id) {
  const allSolutions = [...fuxSolutions.twoVoices, ...fuxSolutions.threeVoices];
  return allSolutions.find(solution => solution.id === id) || null;
}

/**
 * Get Fux solutions by species
 * @param {number} species - Species number (1-5)
 * @returns {Array} Array of solutions for the specified species
 */
export function getFuxSolutionsBySpecies(species) {
  const allSolutions = [...fuxSolutions.twoVoices, ...fuxSolutions.threeVoices];
  return allSolutions.filter(solution => solution.species === species);
}

/**
 * Get Fux exercises by figure number
 * @param {number} figure - Figure number
 * @returns {Array} Array of exercises for the specified figure
 */
export function getFuxExercisesByFigure(figure) {
  return fuxExercisesComplete.filter(exercise => exercise.figure === figure);
}

// Export data objects for backward compatibility
export { fuxSolutions, fuxExercisesComplete };