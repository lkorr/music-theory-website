import { fuxExercisesComplete as fuxExercises } from '../../fux-exercises/original-mxl/fuxExercisesComplete.js';

// Type definitions
export interface CantusFirmus {
  length: number;
  pitches: string[];
  octaves: number[];
  alters: number[];
  midiNotes: number[];
  measures: number[];
  durations: string[];
}

export interface FuxExercise {
  id: string;
  figure: number;
  species: number;
  modalFinal: string;
  cantusFirmusPosition: 'upper' | 'lower';
  measureCount: number;
  description: string;
  cantusFirmus: CantusFirmus;
  solution?: {
    midiNotes: number[];
    measures: number[];
  };
}

export interface ExerciseStatistics {
  totalExercises: number;
  speciesCount: Record<string, number>;
  voiceCount: Record<string, number>;
}

export interface VoiceCategories {
  'two-voice': string;
  'three-voice': string;
  'four-voice': string;
}

export interface VoiceDisplayNames {
  twoVoices: string;
  threeVoices: string;
  fourVoices: string;
}

export type VoiceKey = 'twoVoices' | 'threeVoices' | 'fourVoices';
export type VoiceCategory = 'two-voice' | 'three-voice' | 'four-voice';

// Figure 5 data - the missing first exercise (same cantus firmus as Figure 6, but in lower voice)
const FIGURE_5: FuxExercise = {
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
const VOICE_CATEGORIES: VoiceCategories = {
  'two-voice': 'twoVoices',
  'three-voice': 'threeVoices', 
  'four-voice': 'fourVoices'
};

const VOICE_DISPLAY_NAMES: VoiceDisplayNames = {
  'twoVoices': '2-Voice',
  'threeVoices': '3-Voice',
  'fourVoices': '4-Voice'
};

/**
 * Get all exercises organized by species and voice category
 * @returns Organized exercise data
 */
export function getExercisesBySpeciesAndVoice(): Record<string, Record<string, FuxExercise[]>> {
  const organized: Record<string, Record<string, FuxExercise[]>> = {};
  
  Object.entries(fuxExercises).forEach(([voiceKey, exercises]) => {
    exercises.forEach((exercise: FuxExercise) => {
      const species = exercise.species.toString();
      
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
 * @returns Array of species numbers
 */
export function getAvailableSpecies(): number[] {
  const species = new Set<number>();
  
  Object.values(fuxExercises).forEach((exercises: FuxExercise[]) => {
    exercises.forEach((exercise: FuxExercise) => {
      species.add(exercise.species);
    });
  });
  
  return Array.from(species).sort((a, b) => a - b);
}

/**
 * Get available voice categories for a specific species
 * @param speciesNumber - The species number
 * @returns Array of available voice categories
 */
export function getVoiceCategoriesForSpecies(speciesNumber: number): VoiceKey[] {
  const voiceCategories: VoiceKey[] = [];
  
  Object.entries(fuxExercises).forEach(([voiceKey, exercises]) => {
    const hasSpecies = (exercises as FuxExercise[]).some((exercise: FuxExercise) => exercise.species === speciesNumber);
    if (hasSpecies) {
      voiceCategories.push(voiceKey as VoiceKey);
    }
  });
  
  return voiceCategories;
}

/**
 * Get exercises for a specific species and voice category
 * @param speciesNumber - The species number
 * @param voiceCategory - The voice category (URL format)
 * @returns Array of exercises
 */
export function getExercisesForSpeciesAndVoice(speciesNumber: number, voiceCategory: VoiceCategory): FuxExercise[] {
  const voiceKey = VOICE_CATEGORIES[voiceCategory];
  if (!voiceKey || !fuxExercises[voiceKey as keyof typeof fuxExercises]) {
    return [];
  }
  
  const exercises = (fuxExercises[voiceKey as keyof typeof fuxExercises] as FuxExercise[])
    .filter((exercise: FuxExercise) => exercise.species === speciesNumber)
    .sort((a, b) => a.figure - b.figure);
  
  // Add Figure 5 as the first exercise for Species 1 two-voice
  if (speciesNumber === 1 && voiceCategory === 'two-voice') {
    return [FIGURE_5, ...exercises];
  }
  
  return exercises;
}

/**
 * Get a specific exercise by species, voice, and level (1-based index)
 * @param speciesNumber - The species number
 * @param voiceCategory - The voice category (URL format)
 * @param level - The level number (1-based index)
 * @returns The exercise object or null if not found
 */
export function getExerciseBySpeciesVoiceLevel(speciesNumber: number, voiceCategory: VoiceCategory, level: number): FuxExercise | null {
  const exercises = getExercisesForSpeciesAndVoice(speciesNumber, voiceCategory);
  const exerciseIndex = level - 1; // Convert 1-based to 0-based
  return exercises[exerciseIndex] || null;
}

/**
 * Convert voice category from URL format to display format
 * @param voiceCategory - URL format (e.g., 'two-voice')
 * @returns Display format (e.g., '2-Voice')
 */
export function getVoiceDisplayName(voiceCategory: VoiceCategory): string {
  const voiceKey = VOICE_CATEGORIES[voiceCategory];
  return VOICE_DISPLAY_NAMES[voiceKey as keyof VoiceDisplayNames] || voiceCategory;
}

/**
 * Convert voice key from data format to URL format
 * @param voiceKey - Data format (e.g., 'twoVoices')
 * @returns URL format (e.g., 'two-voice')
 */
export function getVoiceUrlFormat(voiceKey: VoiceKey): VoiceCategory {
  const reverseMapping: Record<VoiceKey, VoiceCategory> = Object.entries(VOICE_CATEGORIES)
    .reduce((acc, [url, key]) => ({ ...acc, [key]: url as VoiceCategory }), {} as Record<VoiceKey, VoiceCategory>);
  return reverseMapping[voiceKey] || ('two-voice' as VoiceCategory);
}

/**
 * Get exercise statistics for dashboard display
 * @returns Statistics object
 */
export function getExerciseStatistics(): ExerciseStatistics {
  const organized = getExercisesBySpeciesAndVoice();
  const stats: ExerciseStatistics = {
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