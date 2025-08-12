// Mock SQL implementation for development without database
const mockExercises = [
  {
    id: 1,
    species_type: 1,
    difficulty_level: 'beginner',
    title: 'First Species - Basic',
    description: 'Learn the fundamentals of MIDI training exercises',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 62, beat: 12, duration: 4 }, // D4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 2,
    species_type: 1,
    difficulty_level: 'intermediate',
    title: 'First Species - Extended',
    description: 'More complex first species exercises',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 67, beat: 0, duration: 4 }, // G4
      { id: '2', note: 65, beat: 4, duration: 4 }, // F4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 62, beat: 12, duration: 4 }, // D4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 3,
    species_type: 1,
    difficulty_level: 'beginner',
    title: 'First Species - Rising Scale',
    description: 'Practice with ascending stepwise motion',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 65, beat: 12, duration: 4 }, // F4
      { id: '5', note: 67, beat: 16, duration: 4 }  // G4
    ])
  },
  {
    id: 4,
    species_type: 1,
    difficulty_level: 'beginner',
    title: 'First Species - Falling Scale',
    description: 'Practice with descending stepwise motion',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 67, beat: 0, duration: 4 }, // G4
      { id: '2', note: 65, beat: 4, duration: 4 }, // F4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 62, beat: 12, duration: 4 }, // D4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 5,
    species_type: 1,
    difficulty_level: 'intermediate',
    title: 'First Species - Skip and Step',
    description: 'Mixture of stepwise motion and small leaps',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 65, beat: 8, duration: 4 }, // F4
      { id: '4', note: 62, beat: 12, duration: 4 }, // D4
      { id: '5', note: 67, beat: 16, duration: 4 }  // G4
    ])
  },
  {
    id: 6,
    species_type: 1,
    difficulty_level: 'intermediate',
    title: 'First Species - Arch Form',
    description: 'Melodic arch reaching a high point and returning',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 69, beat: 8, duration: 4 }, // A4
      { id: '4', note: 65, beat: 12, duration: 4 }, // F4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 7,
    species_type: 1,
    difficulty_level: 'beginner',
    title: 'First Species - Simple Dorian',
    description: 'Introduction to modal counterpoint in D Dorian',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 62, beat: 0, duration: 4 }, // D4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 65, beat: 8, duration: 4 }, // F4
      { id: '4', note: 64, beat: 12, duration: 4 }, // E4
      { id: '5', note: 62, beat: 16, duration: 4 }  // D4
    ])
  },
  {
    id: 8,
    species_type: 1,
    difficulty_level: 'advanced',
    title: 'First Species - Wide Range',
    description: 'Counterpoint across a wider melodic range',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 55, beat: 0, duration: 4 }, // G3
      { id: '2', note: 60, beat: 4, duration: 4 }, // C4
      { id: '3', note: 67, beat: 8, duration: 4 }, // G4
      { id: '4', note: 64, beat: 12, duration: 4 }, // E4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 9,
    species_type: 1,
    difficulty_level: 'intermediate',
    title: 'First Species - Chromatic Touch',
    description: 'Introduction to chromatic inflection',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 66, beat: 8, duration: 4 }, // F#4
      { id: '4', note: 67, beat: 12, duration: 4 }, // G4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 10,
    species_type: 1,
    difficulty_level: 'advanced',
    title: 'First Species - Longer Exercise',
    description: 'Extended cantus firmus for advanced practice',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 67, beat: 12, duration: 4 }, // G4
      { id: '5', note: 65, beat: 16, duration: 4 }, // F4
      { id: '6', note: 64, beat: 20, duration: 4 }, // E4
      { id: '7', note: 62, beat: 24, duration: 4 }, // D4
      { id: '8', note: 60, beat: 28, duration: 4 }  // C4
    ])
  },
  {
    id: 11,
    species_type: 1,
    difficulty_level: 'beginner',
    title: 'First Species - Triad Outline',
    description: 'Cantus firmus outlining a simple triad',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 67, beat: 8, duration: 4 }, // G4
      { id: '4', note: 64, beat: 12, duration: 4 }, // E4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 12,
    species_type: 1,
    difficulty_level: 'intermediate',
    title: 'First Species - Lower Register',
    description: 'Practice in lower register for bass voices',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 48, beat: 0, duration: 4 }, // C3
      { id: '2', note: 50, beat: 4, duration: 4 }, // D3
      { id: '3', note: 52, beat: 8, duration: 4 }, // E3
      { id: '4', note: 53, beat: 12, duration: 4 }, // F3
      { id: '5', note: 48, beat: 16, duration: 4 }  // C3
    ])
  },
  // Species 2 exercises
  {
    id: 13,
    species_type: 2,
    difficulty_level: 'beginner',
    title: 'Second Species - Basic',
    description: 'Learn two notes against one with proper dissonance treatment',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 60, beat: 12, duration: 4 }  // C4
    ])
  },
  {
    id: 14,
    species_type: 2,
    difficulty_level: 'intermediate',
    title: 'Second Species - Passing Tones',
    description: 'Practice using passing tones on weak beats',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 67, beat: 0, duration: 4 }, // G4
      { id: '2', note: 65, beat: 4, duration: 4 }, // F4
      { id: '3', note: 62, beat: 8, duration: 4 }, // D4
      { id: '4', note: 60, beat: 12, duration: 4 }  // C4
    ])
  },
  // Species 3 exercises
  {
    id: 15,
    species_type: 3,
    difficulty_level: 'beginner',
    title: 'Third Species - Four Against One',
    description: 'Learn quarter note patterns with stepwise motion',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 67, beat: 8, duration: 4 }, // G4
      { id: '4', note: 60, beat: 12, duration: 4 }  // C4
    ])
  },
  {
    id: 16,
    species_type: 3,
    difficulty_level: 'advanced',
    title: 'Third Species - Nota Cambiata',
    description: 'Advanced patterns including nota cambiata figures',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 62, beat: 0, duration: 4 }, // D4
      { id: '2', note: 60, beat: 4, duration: 4 }, // C4
      { id: '3', note: 65, beat: 8, duration: 4 }, // F4
      { id: '4', note: 62, beat: 12, duration: 4 }  // D4
    ])
  },
  // Species 4 exercises
  {
    id: 17,
    species_type: 4,
    difficulty_level: 'intermediate',
    title: 'Fourth Species - Suspensions',
    description: 'Learn syncopation and suspension patterns',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 62, beat: 4, duration: 4 }, // D4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 60, beat: 12, duration: 4 }  // C4
    ])
  },
  {
    id: 18,
    species_type: 4,
    difficulty_level: 'advanced',
    title: 'Fourth Species - Chain Suspensions',
    description: 'Advanced syncopation with multiple suspension chains',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 67, beat: 0, duration: 4 }, // G4
      { id: '2', note: 65, beat: 4, duration: 4 }, // F4
      { id: '3', note: 64, beat: 8, duration: 4 }, // E4
      { id: '4', note: 62, beat: 12, duration: 4 }, // D4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  // Species 5 exercises
  {
    id: 19,
    species_type: 5,
    difficulty_level: 'advanced',
    title: 'Fifth Species - Florid Counterpoint',
    description: 'Combine all species techniques in free style',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 60, beat: 0, duration: 4 }, // C4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 67, beat: 8, duration: 4 }, // G4
      { id: '4', note: 65, beat: 12, duration: 4 }, // F4
      { id: '5', note: 60, beat: 16, duration: 4 }  // C4
    ])
  },
  {
    id: 20,
    species_type: 5,
    difficulty_level: 'expert',
    title: 'Fifth Species - Complex Florid',
    description: 'Master-level florid counterpoint with all techniques',
    cantus_firmus: JSON.stringify([
      { id: '1', note: 62, beat: 0, duration: 4 }, // D4
      { id: '2', note: 64, beat: 4, duration: 4 }, // E4
      { id: '3', note: 67, beat: 8, duration: 4 }, // G4
      { id: '4', note: 69, beat: 12, duration: 4 }, // A4
      { id: '5', note: 65, beat: 16, duration: 4 }, // F4
      { id: '6', note: 62, beat: 20, duration: 4 }  // D4
    ])
  }
];

const speciesRules = {
  1: [
    'All intervals must be consonant (unisons, 3rds, 5ths, 6ths, octaves)',
    'Begin and end with perfect consonances (unison, 5th, or octave)', 
    'Avoid parallel perfect consonances (no consecutive 5ths or octaves)',
    'Avoid hidden parallels (similar motion to perfect consonances)',
    'Limit consecutive imperfect consonances (max 3 thirds or sixths in a row)',
    'Use primarily stepwise motion with strategic leaps',
    'After large leaps, prefer contrary motion for recovery',
    'Maintain single melodic climax, not at beginning or end',
    'Prefer contrary motion for voice independence (aim for 40%+)'
  ],
  2: [
    'Strong beats (downbeats) must always be consonant',
    'Weak beats may use dissonance only as passing tones',
    'Passing tones must be approached and left by step in same direction',
    'No leaps to or from dissonant intervals',
    'Begin with half rest or on downbeat',
    'End with proper cadential approach (6-8 or 3-8 motion)',
    'All Species 1 rules apply to strong beat progressions'
  ],
  3: [
    'Strong beats (beat 1 of measure) must be consonant',
    'Weak beat dissonances must move by step (passing tones)',
    'Nota cambiata allowed: step down, leap down 3rd, step up twice',
    'Use predominantly stepwise motion (70%+ recommended)',
    'Beat 3 should preferably be consonant (moderately strong)',
    'No direction changes on dissonant beats (except nota cambiata)',
    'Maintain rhythmic flow with quarter note patterns'
  ],
  4: [
    'Suspensions must be prepared by consonant note of same pitch',
    'Dissonant suspensions occur on strong beats (tied from weak beat)',
    'Suspensions must resolve downward by step to consonance',
    'Resolution occurs on weak beat following suspension',
    'Common patterns: 7-6, 4-3, 9-8 suspensions',
    'Emphasize syncopation with tied notes across bar lines',
    'Chain suspensions for expressive effect'
  ],
  5: [
    'Combines techniques from all previous species',
    'May use whole notes, half notes, quarter notes, paired eighth notes',
    'Strong beats should be consonant unless prepared suspensions',
    'Dissonances follow species-appropriate treatment based on context',
    'Eighth notes only in pairs, typically on weak beats',
    'May include rests for variety and expression',
    'Suspension resolution may be delayed by one note',
    'Most elaborate cadential approaches possible'
  ]
};

const mockSql = (query, params = []) => {
  console.log('Mock SQL Query:', query, params);
  
  // Handle SELECT queries
  if (query.includes('SELECT * FROM exercises')) {
    if (query.includes('WHERE id = $1')) {
      const id = parseInt(params[0]);
      return Promise.resolve(mockExercises.filter(ex => ex.id === id));
    }
    if (query.includes('WHERE species_type = $1')) {
      const species = parseInt(params[0]);
      return Promise.resolve(mockExercises.filter(ex => ex.species_type === species));
    }
    return Promise.resolve(mockExercises);
  }
  
  if (query.includes('SELECT rule_text, rule_order FROM species_rules')) {
    // Extract species type from WHERE clause parameter
    const species = params && params.length > 0 ? parseInt(params[0]) : 1;
    const rules = speciesRules[species] || speciesRules[1];
    return Promise.resolve(rules.map((rule, index) => ({
      rule_text: rule,
      rule_order: index + 1,
      species_type: species,
      is_active: true
    })));
  }
  
  // Handle INSERT queries
  if (query.includes('INSERT INTO exercises')) {
    const newExercise = {
      id: mockExercises.length + 1,
      species_type: params[0],
      difficulty_level: params[1] || 'beginner',
      cantus_firmus: params[2],
      title: params[3],
      description: params[4]
    };
    mockExercises.push(newExercise);
    return Promise.resolve([newExercise]);
  }
  
  // Default empty result
  return Promise.resolve([]);
};

// Template literal support for tagged queries
mockSql.transaction = () => {
  throw new Error('Transactions not supported in mock mode');
};

export default mockSql;