// Piano Roll Integration Utilities for Fux Exercises
// Configurable parameters for easy adjustment and iteration

// CONFIGURABLE VOICE RANGE SETTINGS - Easy to adjust based on testing
export const VOICE_RANGE_CONFIG = {
  // Conservative default ranges (can be expanded based on actual data analysis)
  twoVoices: {
    // Upper voice when cantus firmus is lower
    upper: {
      preferredMin: 60, // C4 (middle C)
      preferredMax: 84, // C6
      absoluteMin: 48,  // C3
      absoluteMax: 96,  // C7
      color: 'rgba(34, 197, 94, 0.15)', // green
      borderColor: 'rgba(34, 197, 94, 0.3)',
      label: 'Upper Voice Range'
    },
    // Lower voice when cantus firmus is upper
    lower: {
      preferredMin: 36, // C2
      preferredMax: 72, // C5  
      absoluteMin: 24,  // C1
      absoluteMax: 84,  // C6
      color: 'rgba(59, 130, 246, 0.15)', // blue
      borderColor: 'rgba(59, 130, 246, 0.3)',
      label: 'Lower Voice Range'
    }
  },
  threeVoices: {
    soprano: {
      preferredMin: 60, // C4
      preferredMax: 84, // C6
      absoluteMin: 48, // C3
      absoluteMax: 96, // C7
      color: 'rgba(236, 72, 153, 0.15)', // pink
      borderColor: 'rgba(236, 72, 153, 0.3)',
      label: 'Soprano'
    },
    alto: {
      preferredMin: 53, // F3
      preferredMax: 77, // F5
      absoluteMin: 41, // F2  
      absoluteMax: 89, // F6
      color: 'rgba(147, 51, 234, 0.15)', // purple
      borderColor: 'rgba(147, 51, 234, 0.3)',
      label: 'Alto'
    },
    bass: {
      preferredMin: 36, // C2
      preferredMax: 60, // C4
      absoluteMin: 24, // C1
      absoluteMax: 72, // C5
      color: 'rgba(59, 130, 246, 0.15)', // blue
      borderColor: 'rgba(59, 130, 246, 0.3)',
      label: 'Bass'
    }
  },
  fourVoices: {
    soprano: {
      preferredMin: 60, // C4
      preferredMax: 84, // C6
      absoluteMin: 48, // C3
      absoluteMax: 96, // C7
      color: 'rgba(236, 72, 153, 0.15)', // pink
      borderColor: 'rgba(236, 72, 153, 0.3)',
      label: 'Soprano'
    },
    alto: {
      preferredMin: 53, // F3
      preferredMax: 77, // F5
      absoluteMin: 41, // F2
      absoluteMax: 89, // F6
      color: 'rgba(147, 51, 234, 0.15)', // purple
      borderColor: 'rgba(147, 51, 234, 0.3)',
      label: 'Alto'
    },
    tenor: {
      preferredMin: 48, // C3
      preferredMax: 72, // C5
      absoluteMin: 36, // C2
      absoluteMax: 84, // C6
      color: 'rgba(251, 146, 60, 0.15)', // orange
      borderColor: 'rgba(251, 146, 60, 0.3)',
      label: 'Tenor'
    },
    bass: {
      preferredMin: 36, // C2
      preferredMax: 60, // C4
      absoluteMin: 24, // C1
      absoluteMax: 72, // C5
      color: 'rgba(59, 130, 246, 0.15)', // blue
      borderColor: 'rgba(59, 130, 246, 0.3)',
      label: 'Bass'
    }
  }
};

// CONFIGURABLE COUNTERPOINT RULES - Easy to adjust
export const COUNTERPOINT_CONFIG = {
  // Maximum interval between voices (in semitones)
  maxInterval: 19, // Perfect 12th (octave + 5th)
  
  // Preferred interval range (in semitones) 
  preferredMaxInterval: 12, // Perfect octave
  
  // Cantus firmus visual styling
  cantusFirmusStyle: {
    backgroundColor: 'rgb(59, 130, 246)', // blue-500
    borderColor: 'rgb(37, 99, 235)', // blue-600
    textColor: 'white',
    label: 'CF'
  },
  
  // User note styling
  userNoteStyle: {
    backgroundColor: 'rgb(34, 197, 94)', // green-500
    borderColor: 'rgb(22, 163, 74)', // green-600
    textColor: 'white',
    label: ''
  }
};

/**
 * Convert Fux exercise data to piano roll format
 * @param {Object} exercise - Fux exercise object
 * @returns {Object} Piano roll compatible exercise data
 */
export function convertFuxExerciseToPianoRollFormat(exercise) {
  if (!exercise || !exercise.cantusFirmus) {
    throw new Error('Invalid exercise data: missing cantusFirmus');
  }

  const cantusFirmus = exercise.cantusFirmus;
  const beatMultiplier = getBeatsPerNote(exercise.species);

  // Convert cantus firmus to piano roll format
  const cantusFirmusNotes = cantusFirmus.midiNotes.map((midiNote, index) => ({
    note: midiNote,
    beat: index * beatMultiplier, // Each cantus firmus note starts at measure boundaries
    duration: beatMultiplier,     // Each cantus firmus note lasts a full measure
    voice: exercise.cantusFirmusPosition || 'cantus',
    isCantusFirmus: true,
    measure: index + 1           // Track which measure this note belongs to
  }));

  return {
    id: exercise.id,
    cantus_firmus: cantusFirmusNotes,
    species_type: exercise.species,
    measureCount: exercise.measureCount,
    modalFinal: exercise.modalFinal,
    cantusFirmusPosition: exercise.cantusFirmusPosition,
    description: exercise.description,
    // Add solution data if available (for reference/validation)
    solution: exercise.solution ? {
      midiNotes: exercise.solution.midiNotes,
      measures: exercise.solution.measures
    } : null
  };
}

/**
 * Get beats per note based on species type
 * @param {number} species - Species number
 * @returns {number} Beats per note
 */
function getBeatsPerNote(species) {
  // Cantus firmus is always whole notes (4 beats) regardless of species
  // The species affects counterpoint note values, not cantus firmus
  return 4;
}

/**
 * Determine optimal voice ranges for counterpoint based on cantus firmus
 * @param {Object} exercise - Converted exercise object
 * @param {string} voiceCategory - Voice category ('two-voice', 'three-voice', etc.)
 * @returns {Object} Voice range recommendations
 */
export function getCounterpointVoiceRanges(exercise, voiceCategory) {
  const voiceKey = getVoiceKey(voiceCategory);
  const ranges = VOICE_RANGE_CONFIG[voiceKey];
  
  if (!ranges) {
    // Default to two-voice if category not found
    return VOICE_RANGE_CONFIG.twoVoices;
  }

  // For cantus firmus positioning logic
  const cantusFirmusNotes = exercise.cantus_firmus;
  const cfMin = Math.min(...cantusFirmusNotes.map(n => n.note));
  const cfMax = Math.max(...cantusFirmusNotes.map(n => n.note));
  const cfRange = { min: cfMin, max: cfMax };

  // Calculate suggested counterpoint ranges based on CF position
  const suggestions = calculateCounterpointSuggestions(
    cfRange, 
    exercise.cantusFirmusPosition,
    ranges
  );

  return {
    ranges,
    cantusFirmusRange: cfRange,
    suggestions,
    voiceCategory: voiceKey
  };
}

/**
 * Calculate suggested counterpoint placement ranges
 * @param {Object} cfRange - Cantus firmus range {min, max}
 * @param {string} cfPosition - 'upper', 'lower', or undefined
 * @param {Object} voiceRanges - Voice range configuration
 * @returns {Object} Counterpoint suggestions
 */
function calculateCounterpointSuggestions(cfRange, cfPosition, voiceRanges) {
  const suggestions = {};

  if (cfPosition === 'lower') {
    // Cantus firmus is lower, counterpoint should generally be above
    suggestions.primary = {
      min: Math.max(cfRange.min, cfRange.max - 7), // Stay close but above
      max: Math.min(cfRange.max + COUNTERPOINT_CONFIG.preferredMaxInterval, cfRange.max + 19),
      note: 'Counterpoint typically above cantus firmus'
    };
  } else if (cfPosition === 'upper') {
    // Cantus firmus is upper, counterpoint should generally be below  
    suggestions.primary = {
      min: Math.max(cfRange.min - 19, cfRange.min - COUNTERPOINT_CONFIG.preferredMaxInterval),
      max: Math.min(cfRange.max, cfRange.min + 7), // Stay close but below
      note: 'Counterpoint typically below cantus firmus'
    };
  } else {
    // Position not specified, provide general guidance
    suggestions.primary = {
      min: cfRange.min - COUNTERPOINT_CONFIG.preferredMaxInterval,
      max: cfRange.max + COUNTERPOINT_CONFIG.preferredMaxInterval,
      note: 'Counterpoint within an octave of cantus firmus when possible'
    };
  }

  return suggestions;
}

/**
 * Convert URL voice category to config key
 * @param {string} voiceCategory - URL format ('two-voice', 'three-voice', etc.)
 * @returns {string} Config key ('twoVoices', 'threeVoices', etc.)
 */
function getVoiceKey(voiceCategory) {
  const mapping = {
    'two-voice': 'twoVoices',
    'three-voice': 'threeVoices', 
    'four-voice': 'fourVoices'
  };
  return mapping[voiceCategory] || 'twoVoices';
}

/**
 * Create piano roll configuration for voice range display
 * @param {Object} voiceRanges - Output from getCounterpointVoiceRanges
 * @returns {Object} Piano roll display configuration
 */
export function createPianoRollConfig(voiceRanges) {
  const config = {
    voiceRangeHighlights: [],
    cantusFirmusRange: voiceRanges.cantusFirmusRange,
    suggestions: voiceRanges.suggestions,
    voiceLabels: []
  };

  // Add voice range highlights
  Object.entries(voiceRanges.ranges).forEach(([voiceName, range]) => {
    config.voiceRangeHighlights.push({
      name: voiceName,
      label: range.label,
      minNote: range.preferredMin,
      maxNote: range.preferredMax,
      backgroundColor: range.color,
      borderColor: range.borderColor,
      isPreferred: true
    });

    // Add absolute range if different from preferred
    if (range.absoluteMin !== range.preferredMin || range.absoluteMax !== range.preferredMax) {
      config.voiceRangeHighlights.push({
        name: `${voiceName}_absolute`,
        label: `${range.label} (Extended)`,
        minNote: range.absoluteMin,
        maxNote: range.absoluteMax,
        backgroundColor: range.color.replace('0.15', '0.05'), // More transparent
        borderColor: range.borderColor.replace('0.3', '0.1'),
        isPreferred: false
      });
    }
  });

  return config;
}

/**
 * Validate note placement according to counterpoint rules
 * @param {number} midiNote - MIDI note to validate
 * @param {Object} exercise - Exercise data
 * @param {Object} voiceRanges - Voice range configuration
 * @returns {Object} Validation result
 */
export function validateNotePlacement(midiNote, exercise, voiceRanges) {
  const warnings = [];
  const errors = [];

  // Check against cantus firmus intervals
  const cantusFirmusNotes = exercise.cantus_firmus.map(n => n.note);
  
  cantusFirmusNotes.forEach((cfNote, index) => {
    const interval = Math.abs(midiNote - cfNote);
    
    if (interval > COUNTERPOINT_CONFIG.maxInterval) {
      errors.push({
        type: 'interval_too_large',
        message: `Interval of ${interval} semitones exceeds maximum of ${COUNTERPOINT_CONFIG.maxInterval}`,
        measure: index + 1
      });
    } else if (interval > COUNTERPOINT_CONFIG.preferredMaxInterval) {
      warnings.push({
        type: 'interval_large', 
        message: `Interval of ${interval} semitones is large (preferred max: ${COUNTERPOINT_CONFIG.preferredMaxInterval})`,
        measure: index + 1
      });
    }
  });

  // Check against suggested ranges
  const suggestions = voiceRanges.suggestions;
  if (suggestions.primary) {
    if (midiNote < suggestions.primary.min || midiNote > suggestions.primary.max) {
      warnings.push({
        type: 'outside_suggested_range',
        message: `Note outside suggested range (${suggestions.primary.min}-${suggestions.primary.max})`,
        note: suggestions.primary.note
      });
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    midiNote
  };
}