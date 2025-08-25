import { fuxExercisesComplete as fuxExercises } from '../../fux-exercises/original-mxl/fuxExercisesComplete.js';

// Figure 5 data - the missing first exercise (same cantus firmus as Figure 6, but in lower voice)
const FIGURE_5 = {
  "id": "fux-2v-5",
  "figure": 5,
  "species": 1,
  "modalFinal": "d",
  "cantusFirmusPosition": "lower",
  "measureCount": 11,
  "description": "Fux Figure 5 - Species 1 - D Dorian",
  "cantusFirmus": {
    "length": 11,
    "pitches": ["D", "F", "E", "D", "G", "F", "A", "G", "F", "E", "D"],
    "octaves": [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "alters": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "midiNotes": [62, 65, 64, 62, 67, 65, 69, 67, 65, 64, 62],
    "measures": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "durations": ["whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole"]
  }
};

// Voice category mapping for cleaner URLs and display
const VOICE_CATEGORIES = {
  'two-voice': 'twoVoices',
  'three-voice': 'threeVoices', 
  'four-voice': 'fourVoices'
};

const VOICE_DISPLAY_NAMES = {
  'twoVoices': '2-Voice',
  'threeVoices': '3-Voice',
  'fourVoices': '4-Voice'
};

/**
 * Get all exercises organized by species and voice category
 * @returns {Object} Organized exercise data
 */
export function getExercisesBySpeciesAndVoice() {
  const organized = {};
  
  Object.entries(fuxExercises).forEach(([voiceKey, exercises]) => {
    exercises.forEach(exercise => {
      const species = exercise.species;
      
      if (!organized[species]) {
        organized[species] = {};
      }
      
      if (!organized[species][voiceKey]) {
        organized[species][voiceKey] = [];
      }
      
      organized[species][voiceKey].push(exercise);
    });
  });
  
  return organized;
}

/**
 * Get available species numbers
 * @returns {Array} Array of species numbers
 */
export function getAvailableSpecies() {
  const species = new Set();
  
  Object.values(fuxExercises).forEach(exercises => {
    exercises.forEach(exercise => {
      species.add(exercise.species);
    });
  });
  
  return Array.from(species).sort((a, b) => a - b);
}

/**
 * Get available voice categories for a specific species
 * @param {number} speciesNumber - The species number
 * @returns {Array} Array of available voice categories
 */
export function getVoiceCategoriesForSpecies(speciesNumber) {
  const voiceCategories = [];
  
  Object.entries(fuxExercises).forEach(([voiceKey, exercises]) => {
    const hasSpecies = exercises.some(exercise => exercise.species === speciesNumber);
    if (hasSpecies) {
      voiceCategories.push(voiceKey);
    }
  });
  
  return voiceCategories;
}

/**
 * Get exercises for a specific species and voice category
 * @param {number} speciesNumber - The species number
 * @param {string} voiceCategory - The voice category (URL format)
 * @returns {Array} Array of exercises
 */
export function getExercisesForSpeciesAndVoice(speciesNumber, voiceCategory) {
  const voiceKey = VOICE_CATEGORIES[voiceCategory];
  if (!voiceKey || !fuxExercises[voiceKey]) {
    return [];
  }
  
  const exercises = fuxExercises[voiceKey]
    .filter(exercise => exercise.species === speciesNumber)
    .sort((a, b) => a.figure - b.figure);
  
  // Add Figure 5 as the first exercise for Species 1 two-voice
  if (speciesNumber === 1 && voiceCategory === 'two-voice') {
    return [FIGURE_5, ...exercises];
  }
  
  return exercises;
}

/**
 * Get a specific exercise by species, voice, and level (1-based index)
 * @param {number} speciesNumber - The species number
 * @param {string} voiceCategory - The voice category (URL format)
 * @param {number} level - The level number (1-based index)
 * @returns {Object|null} The exercise object or null if not found
 */
export function getExerciseBySpeciesVoiceLevel(speciesNumber, voiceCategory, level) {
  const exercises = getExercisesForSpeciesAndVoice(speciesNumber, voiceCategory);
  const exerciseIndex = level - 1; // Convert 1-based to 0-based
  return exercises[exerciseIndex] || null;
}

/**
 * Convert voice category from URL format to display format
 * @param {string} voiceCategory - URL format (e.g., 'two-voice')
 * @returns {string} Display format (e.g., '2-Voice')
 */
export function getVoiceDisplayName(voiceCategory) {
  const voiceKey = VOICE_CATEGORIES[voiceCategory];
  return VOICE_DISPLAY_NAMES[voiceKey] || voiceCategory;
}

/**
 * Convert voice key from data format to URL format
 * @param {string} voiceKey - Data format (e.g., 'twoVoices')
 * @returns {string} URL format (e.g., 'two-voice')
 */
export function getVoiceUrlFormat(voiceKey) {
  const reverseMapping = Object.entries(VOICE_CATEGORIES)
    .reduce((acc, [url, key]) => ({ ...acc, [key]: url }), {});
  return reverseMapping[voiceKey] || voiceKey;
}

/**
 * Get exercise statistics for dashboard display
 * @returns {Object} Statistics object
 */
export function getExerciseStatistics() {
  const organized = getExercisesBySpeciesAndVoice();
  const stats = {
    totalExercises: 0,
    speciesCount: {},
    voiceCount: {}
  };
  
  Object.entries(organized).forEach(([species, voiceData]) => {
    stats.speciesCount[species] = 0;
    
    Object.entries(voiceData).forEach(([voiceKey, exercises]) => {
      const count = exercises.length;
      stats.totalExercises += count;
      stats.speciesCount[species] += count;
      
      if (!stats.voiceCount[voiceKey]) {
        stats.voiceCount[voiceKey] = 0;
      }
      stats.voiceCount[voiceKey] += count;
    });
  });
  
  return stats;
}