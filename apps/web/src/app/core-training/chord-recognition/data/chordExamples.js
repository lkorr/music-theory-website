/**
 * Chord Examples for Start Screens
 * 
 * Visual chord examples that appear before each level starts,
 * showing users what types of chords they'll be identifying.
 */

export const CHORD_EXAMPLES = {
  // ============================================================================
  // BASIC TRIADS EXAMPLES
  // ============================================================================
  
  'basic-triads-1': {
    title: 'Basic Triad Types',
    description: 'Root position only - natural notes',
    examples: [
      {
        name: 'Major (C)',
        midiNotes: [60, 64, 67], // C4, E4, G4
      },
      {
        name: 'Minor (Dm)',
        midiNotes: [62, 65, 69], // D4, F4, A4
      },
      {
        name: 'Diminished (Bdim)',
        midiNotes: [59, 62, 65], // B3, D4, F4
      },
      {
        name: 'Augmented (Caug)',
        midiNotes: [60, 64, 68], // C4, E4, G#4
      }
    ]
  },

  'basic-triads-2': {
    title: 'First Inversions',
    description: 'Major, minor, and diminished triads with first inversions',
    examples: [
      {
        name: 'C Major Root',
        midiNotes: [60, 64, 67], // C4, E4, G4
      },
      {
        name: 'C Major 1st Inv',
        midiNotes: [64, 67, 72], // E4, G4, C5
      },
      {
        name: 'D Minor Root',
        midiNotes: [62, 65, 69], // D4, F4, A4
      },
      {
        name: 'D Minor 1st Inv',
        midiNotes: [65, 69, 74], // F4, A4, D5
      },
      {
        name: 'B Dim Root',
        midiNotes: [59, 62, 65], // B3, D4, F4
      },
      {
        name: 'B Dim 1st Inv',
        midiNotes: [62, 65, 71], // D4, F4, B4
      }
    ]
  },

  'basic-triads-3': {
    title: 'All Inversions',
    description: 'Root position, first inversion, and second inversion',
    examples: [
      {
        name: 'C Major Root',
        midiNotes: [60, 64, 67], // C4, E4, G4
      },
      {
        name: 'C Major 1st Inv',
        midiNotes: [64, 67, 72], // E4, G4, C5
      },
      {
        name: 'C Major 2nd Inv',
        midiNotes: [67, 72, 76], // G4, C5, E5
      },
      {
        name: 'D Minor Root',
        midiNotes: [62, 65, 69], // D4, F4, A4
      },
      {
        name: 'D Minor 2nd Inv',
        midiNotes: [69, 74, 77], // A4, D5, F5
      },
      {
        name: 'B Dim 2nd Inv',
        midiNotes: [65, 71, 74], // F4, B4, D5
      }
    ]
  },

  'basic-triads-4': {
    title: 'Open Voicings',
    description: 'Triads with wide spacing and octave doubling',
    examples: [
      {
        name: 'C Major Open',
        midiNotes: [48, 64, 72], // C3, E4, C5
      },
      {
        name: 'F Major Open',
        midiNotes: [53, 69, 77], // F3, A4, F5
      },
      {
        name: 'G Major Open',
        midiNotes: [55, 71, 79], // G3, B4, G5
      },
      {
        name: 'A Minor Open',
        midiNotes: [45, 64, 69], // A2, E4, A4
      },
      {
        name: 'D Dim Open',
        midiNotes: [50, 65, 74], // D3, F4, D5
      },
      {
        name: 'F Aug Open',
        midiNotes: [53, 69, 78], // F3, A4, F#5
      }
    ]
  },

  // ============================================================================
  // SEVENTH CHORDS EXAMPLES
  // ============================================================================

  'seventh-chords-1': {
    title: '7th Chord Types (Root Position)',
    description: 'All seventh chord types in root position only',
    examples: [
      {
        name: 'Major 7th (Cmaj7)',
        midiNotes: [60, 64, 67, 71], // C4, E4, G4, B4
      },
      {
        name: 'Minor 7th (Dm7)',
        midiNotes: [62, 65, 69, 72], // D4, F4, A4, C5
      },
      {
        name: 'Dominant 7th (G7)',
        midiNotes: [67, 71, 74, 77], // G4, B4, D5, F5
      },
      {
        name: 'Diminished 7th (Bdim7)',
        midiNotes: [59, 62, 65, 68], // B3, D4, F4, Ab4
      },
      {
        name: 'Half Dim 7th (Bm7♭5)',
        midiNotes: [59, 62, 65, 69], // B3, D4, F4, A4
      }
    ]
  },

  'seventh-chords-2': {
    title: '7th Chords - First Inversions Only',
    description: 'All seventh chord types in first inversion only',
    examples: [
      {
        name: 'Maj7 1st Inv (Cmaj7/E)',
        midiNotes: [64, 67, 71, 72], // E4, G4, B4, C5
      },
      {
        name: 'Min7 1st Inv (Dm7/F)', 
        midiNotes: [65, 69, 72, 74], // F4, A4, C5, D5
      },
      {
        name: 'Dom7 1st Inv (G7/B)',
        midiNotes: [71, 74, 77, 79], // B4, D5, F5, G5
      },
      {
        name: 'Dim7 1st Inv (Bdim7/D)',
        midiNotes: [62, 65, 68, 71], // D4, F4, Ab4, B4
      },
      {
        name: 'HalfDim7 1st Inv (Bm7♭5/D)',
        midiNotes: [62, 65, 69, 71], // D4, F4, A4, B4
      }
    ]
  },

  'seventh-chords-3': {
    title: '7th Chords - Second Inversions Only',
    description: 'All seventh chord types in second inversion only',
    examples: [
      {
        name: 'Maj7 2nd Inv (Cmaj7/G)',
        midiNotes: [67, 71, 72, 76], // G4, B4, C5, E5
      },
      {
        name: 'Min7 2nd Inv (Dm7/A)',
        midiNotes: [69, 72, 74, 77], // A4, C5, D5, F5
      },
      {
        name: 'Dom7 2nd Inv (G7/D)',
        midiNotes: [74, 77, 79, 83], // D5, F5, G5, B5
      },
      {
        name: 'Dim7 2nd Inv (Bdim7/F)',
        midiNotes: [65, 68, 71, 74], // F4, Ab4, B4, D5
      },
      {
        name: 'HalfDim7 2nd Inv (Bm7♭5/F)',
        midiNotes: [65, 69, 71, 74], // F4, A4, B4, D5
      }
    ]
  },

  'seventh-chords-4': {
    title: '7th Chords - Third Inversions Only',
    description: 'All seventh chord types in third inversion only',
    examples: [
      {
        name: 'Maj7 3rd Inv (Cmaj7/B)',
        midiNotes: [71, 72, 76, 79], // B4, C5, E5, G5
      },
      {
        name: 'Min7 3rd Inv (Dm7/C)',
        midiNotes: [72, 74, 77, 81], // C5, D5, F5, A5
      },
      {
        name: 'Dom7 3rd Inv (G7/F)',
        midiNotes: [77, 79, 83, 86], // F5, G5, B5, D6
      },
      {
        name: 'Dim7 3rd Inv (Bdim7/A♭)',
        midiNotes: [68, 71, 74, 77], // Ab4, B4, D5, F5
      },
      {
        name: 'HalfDim7 3rd Inv (Bm7♭5/A)',
        midiNotes: [69, 71, 74, 77], // A4, B4, D5, F5
      }
    ]
  },


  // ============================================================================
  // EXTENDED CHORDS EXAMPLES
  // ============================================================================

  'extended-chords-1': {
    title: '9th Chord Types',
    description: 'All ninth chord variations in root position only',
    examples: [
      {
        name: 'Major 9th (Cmaj9)',
        midiNotes: [60, 64, 67, 71, 74], // C4, E4, G4, B4, D5
      },
      {
        name: 'Minor 9th (Cm9)',
        midiNotes: [60, 63, 67, 70, 74], // C4, Eb4, G4, Bb4, D5
      },
      {
        name: 'Dominant 9th (C9)',
        midiNotes: [60, 64, 67, 70, 74], // C4, E4, G4, Bb4, D5
      },
      {
        name: 'Dom 7♭9 (C7♭9)',
        midiNotes: [60, 64, 67, 70, 73], // C4, E4, G4, Bb4, Db5
      },
      {
        name: 'Dom 7♯9 (C7♯9)',
        midiNotes: [60, 64, 67, 70, 75], // C4, E4, G4, Bb4, D#5
      },
      {
        name: 'Min 7♭9 (Cm7♭9)',
        midiNotes: [60, 63, 67, 70, 73], // C4, Eb4, G4, Bb4, Db5
      },
      {
        name: 'Add 9 (Cadd9)',
        midiNotes: [60, 64, 67, 74], // C4, E4, G4, D5
      },
      {
        name: 'Min Add 9 (Cmadd9)',
        midiNotes: [60, 63, 67, 74], // C4, Eb4, G4, D5
      },
      {
        name: 'Dim7 Add 9 (Cdim7add9)',
        midiNotes: [60, 63, 66, 69, 74], // C4, Eb4, F#4, A4, D5
      },
      {
        name: 'Dim7♭9 (Cdim7♭9)',
        midiNotes: [60, 63, 66, 69, 73], // C4, Eb4, F#4, A4, Db5
      },
      {
        name: 'Half Dim 9 (Cø9)',
        midiNotes: [60, 63, 66, 70, 74], // C4, Eb4, F#4, Bb4, D5
      },
      {
        name: 'Half Dim♭9 (Cø7♭9)',
        midiNotes: [60, 63, 66, 70, 73], // C4, Eb4, F#4, Bb4, Db5
      }
    ]
  },

  'extended-chords-2': {
    title: '11th Chord Types',
    description: 'All eleventh chord variations in root position only',
    examples: [
      {
        name: 'Major 11th (Cmaj11)',
        midiNotes: [60, 64, 67, 71, 74, 77], // C4, E4, G4, B4, D5, F5
      },
      {
        name: 'Minor 11th (Cm11)',
        midiNotes: [60, 63, 67, 70, 74, 77], // C4, Eb4, G4, Bb4, D5, F5
      },
      {
        name: 'Dominant 11th (C11)',
        midiNotes: [60, 64, 67, 70, 74, 77], // C4, E4, G4, Bb4, D5, F5
      },
      {
        name: 'Major 7#11 (Cmaj7#11)',
        midiNotes: [60, 64, 67, 71, 78], // C4, E4, G4, B4, F#5
      },
      {
        name: 'Dom 7#11 (C7#11)',
        midiNotes: [60, 64, 67, 70, 78], // C4, E4, G4, Bb4, F#5
      },
      {
        name: 'Min 7#11 (Cm7#11)',
        midiNotes: [60, 63, 67, 70, 78], // C4, Eb4, G4, Bb4, F#5
      },
      {
        name: 'Add 11 (Cadd11)',
        midiNotes: [60, 64, 67, 77], // C4, E4, G4, F5
      },
      {
        name: 'Min Add 11 (Cmadd11)',
        midiNotes: [60, 63, 67, 77], // C4, Eb4, G4, F5
      },
      {
        name: 'Dom 11♭9 (C11♭9)',
        midiNotes: [60, 64, 67, 70, 73, 77], // C4, E4, G4, Bb4, Db5, F5
      },
      {
        name: 'Dom 11#9 (C11#9)',
        midiNotes: [60, 64, 67, 70, 75, 77], // C4, E4, G4, Bb4, D#5, F5
      },
      {
        name: 'Min 11♭9 (Cm11♭9)',
        midiNotes: [60, 63, 67, 70, 73, 77], // C4, Eb4, G4, Bb4, Db5, F5
      }
    ]
  },

  'extended-chords-3': {
    title: '13th Chord Types',
    description: 'All thirteenth chord variations in root position only',
    examples: [
      {
        name: 'Major 13th (Cmaj13)',
        midiNotes: [60, 64, 67, 71, 74, 81], // C4, E4, G4, B4, D5, A5
      },
      {
        name: 'Minor 13th (Cm13)',
        midiNotes: [60, 63, 67, 70, 74, 81], // C4, Eb4, G4, Bb4, D5, A5
      },
      {
        name: 'Dominant 13th (C13)',
        midiNotes: [60, 64, 67, 70, 74, 81], // C4, E4, G4, Bb4, D5, A5
      },
      {
        name: 'Major 13#11 (Cmaj13#11)',
        midiNotes: [60, 64, 67, 71, 78, 81], // C4, E4, G4, B4, F#5, A5
      },
      {
        name: 'Dom 13#11 (C13#11)',
        midiNotes: [60, 64, 67, 70, 78, 81], // C4, E4, G4, Bb4, F#5, A5
      },
      {
        name: 'Dom 13♭9 (C13♭9)',
        midiNotes: [60, 64, 67, 70, 73, 81], // C4, E4, G4, Bb4, Db5, A5
      },
      {
        name: 'Dom 13#9 (C13#9)',
        midiNotes: [60, 64, 67, 70, 75, 81], // C4, E4, G4, Bb4, D#5, A5
      },
      {
        name: 'Add 13 (Cadd13)',
        midiNotes: [60, 64, 67, 81], // C4, E4, G4, A5
      },
      {
        name: 'Min Add 13 (Cmadd13)',
        midiNotes: [60, 63, 67, 81], // C4, Eb4, G4, A5
      },
      {
        name: 'Dom 13#11♭9 (C13#11♭9)',
        midiNotes: [60, 64, 67, 70, 73, 78, 81], // C4, E4, G4, Bb4, Db5, F#5, A5
      },
      {
        name: 'Dom 13#11#9 (C13#11#9)',
        midiNotes: [60, 64, 67, 70, 75, 78, 81], // C4, E4, G4, Bb4, D#5, F#5, A5
      },
      {
        name: 'Min 13#11 (Cm13#11)',
        midiNotes: [60, 63, 67, 70, 74, 78, 81], // C4, Eb4, G4, Bb4, D5, F#5, A5
      },
      {
        name: 'Min 13♭9 (Cm13♭9)',
        midiNotes: [60, 63, 67, 70, 73, 81], // C4, Eb4, G4, Bb4, Db5, A5
      }
    ]
  },

};