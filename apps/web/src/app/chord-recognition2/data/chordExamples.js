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
    title: '7th Chords with First Inversions',
    description: 'Root position and first inversion seventh chords',
    examples: [
      {
        name: 'Cmaj7 Root',
        midiNotes: [60, 64, 67, 71], // C4, E4, G4, B4
      },
      {
        name: 'Cmaj7 1st Inv',
        midiNotes: [64, 67, 71, 72], // E4, G4, B4, C5
      },
      {
        name: 'Dm7 Root',
        midiNotes: [62, 65, 69, 72], // D4, F4, A4, C5
      },
      {
        name: 'Dm7 1st Inv',
        midiNotes: [65, 69, 72, 74], // F4, A4, C5, D5
      }
    ]
  },

  'seventh-chords-3': {
    title: '7th Chords with Second Inversions',
    description: 'Root position, first and second inversions',
    examples: [
      {
        name: 'Cmaj7 Root',
        midiNotes: [60, 64, 67, 71], // C4, E4, G4, B4
      },
      {
        name: 'Cmaj7 2nd Inv',
        midiNotes: [67, 71, 72, 76], // G4, B4, C5, E5
      },
      {
        name: 'G7 Root',
        midiNotes: [67, 71, 74, 77], // G4, B4, D5, F5
      },
      {
        name: 'G7 2nd Inv',
        midiNotes: [74, 77, 79, 83], // D5, F5, G5, B5
      }
    ]
  },

  'seventh-chords-4': {
    title: '7th Chords with Third Inversions',
    description: 'All seventh chord inversions including third inversion',
    examples: [
      {
        name: 'Cmaj7 Root',
        midiNotes: [60, 64, 67, 71], // C4, E4, G4, B4
      },
      {
        name: 'Cmaj7 3rd Inv',
        midiNotes: [71, 72, 76, 79], // B4, C5, E5, G5
      },
      {
        name: 'G7 3rd Inv',
        midiNotes: [77, 79, 83, 86], // F5, G5, B5, D6
      }
    ]
  },

  'seventh-chords-5': {
    title: 'Open Voicing 7th Chords',
    description: '7th chords with wide spacing and octave doubling',
    examples: [
      {
        name: 'Cmaj7 Open',
        midiNotes: [48, 64, 71, 76], // C3, E4, B4, E5
      },
      {
        name: 'Dm7 Open',
        midiNotes: [50, 65, 72, 77], // D3, F4, C5, F5
      },
      {
        name: 'G7 Open',
        midiNotes: [55, 71, 77, 83], // G3, B4, F5, B5
      }
    ]
  },

  // ============================================================================
  // EXTENDED CHORDS EXAMPLES
  // ============================================================================

  'extended-chords-1': {
    title: '9th Chord Types',
    description: 'Various ninth chords in root position only',
    examples: [
      {
        name: 'Major 9th (Cmaj9)',
        midiNotes: [60, 64, 67, 71, 74], // C4, E4, G4, B4, D5
      },
      {
        name: 'Minor 9th (Dm9)',
        midiNotes: [62, 65, 69, 72, 76], // D4, F4, A4, C5, E5
      },
      {
        name: 'Dominant 9th (G9)',
        midiNotes: [67, 71, 74, 77, 81], // G4, B4, D5, F5, A5
      },
      {
        name: 'Dom 7♭9 (G7♭9)',
        midiNotes: [67, 71, 74, 77, 80], // G4, B4, D5, F5, A♭5
      }
    ]
  },

  'extended-chords-2': {
    title: '11th Chord Types',
    description: 'Various eleventh chords and suspended chords',
    examples: [
      {
        name: 'Major 11th (Cmaj11)',
        midiNotes: [60, 67, 71, 74, 77], // C4, G4, B4, D5, F5
      },
      {
        name: 'Minor 11th (Dm11)',
        midiNotes: [62, 69, 72, 76, 79], // D4, A4, C5, E5, G5
      },
      {
        name: 'Sus4 (Csus4)',
        midiNotes: [60, 65, 67], // C4, F4, G4
      },
      {
        name: 'Sus2 (Csus2)',
        midiNotes: [60, 62, 67], // C4, D4, G4
      }
    ]
  },

  'extended-chords-3': {
    title: '13th Chord Types',
    description: 'Thirteenth chords and complex extensions',
    examples: [
      {
        name: 'Major 13th (Cmaj13)',
        midiNotes: [60, 67, 71, 74, 81], // C4, G4, B4, D5, A5
      },
      {
        name: 'Minor 13th (Dm13)',
        midiNotes: [62, 69, 72, 76, 83], // D4, A4, C5, E5, B5
      },
      {
        name: 'Dominant 13th (G13)',
        midiNotes: [67, 74, 77, 81, 88], // G4, D5, F5, A5, E6
      }
    ]
  },

  'extended-chords-4': {
    title: '9th Chord Inversions',
    description: '9th chords with all five inversions',
    examples: [
      {
        name: 'Cmaj9 Root',
        midiNotes: [60, 64, 67, 71, 74], // C4, E4, G4, B4, D5
      },
      {
        name: 'Cmaj9 1st Inv',
        midiNotes: [64, 67, 71, 74, 72], // E4, G4, B4, D5, C5
      },
      {
        name: 'Cmaj9 2nd Inv',
        midiNotes: [67, 71, 74, 72, 76], // G4, B4, D5, C5, E5
      }
    ]
  },

  'extended-chords-5': {
    title: '11th Chord Inversions',
    description: '11th chords with inversions - advanced harmony',
    examples: [
      {
        name: 'Cmaj11 Root',
        midiNotes: [60, 67, 71, 74, 77], // C4, G4, B4, D5, F5
      },
      {
        name: 'Cmaj11 1st Inv',
        midiNotes: [67, 71, 74, 77, 72], // G4, B4, D5, F5, C5
      },
      {
        name: 'Dm11 Root',
        midiNotes: [62, 69, 72, 76, 79], // D4, A4, C5, E5, G5
      }
    ]
  },

  'extended-chords-6': {
    title: '13th Chord Inversions',
    description: '13th chords with inversions - master level harmony',
    examples: [
      {
        name: 'Cmaj13 Root',
        midiNotes: [60, 67, 71, 74, 81], // C4, G4, B4, D5, A5
      },
      {
        name: 'Cmaj13 1st Inv',
        midiNotes: [67, 71, 74, 81, 72], // G4, B4, D5, A5, C5
      },
      {
        name: 'G13 Root',
        midiNotes: [67, 74, 77, 81, 88], // G4, D5, F5, A5, E6
      }
    ]
  }
};