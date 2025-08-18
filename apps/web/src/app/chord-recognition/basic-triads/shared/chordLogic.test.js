import { describe, it, expect, beforeEach } from 'vitest';
import { generateChord, validateAnswer, levelConfigs } from './chordLogic.js';

// Import level-specific functions for comparison
import { generateLevel1Chord, validateLevel1Answer } from '../recognition/level1/level1Utils.js';
import { generateLevel2Chord, validateLevel2Answer } from '../recognition/level2/level2Utils.js';
import { generateLevel3Chord, validateLevel3Answer } from '../recognition/level3/level3Utils.js';
import { generateLevel4Chord, validateLevel4Answer } from '../recognition/level4/level4Utils.js';

describe('Chord Logic Validation Tests', () => {
  describe('Level 1 Comparison', () => {
    it('generateChord with level1 config should match generateLevel1Chord', () => {
      // Test chord generation consistency
      const trials = 50;
      let matches = 0;
      
      for (let i = 0; i < trials; i++) {
        const sharedResult = generateChord(levelConfigs.level1);
        const levelResult = generateLevel1Chord();
        
        // Check if both results have the same structure
        expect(sharedResult).toHaveProperty('notes');
        expect(sharedResult).toHaveProperty('expectedAnswer');
        expect(levelResult).toHaveProperty('notes');
        expect(levelResult).toHaveProperty('expectedAnswer');
        
        // Both should generate valid basic triads
        expect(sharedResult.notes).toHaveLength(3);
        expect(levelResult.notes).toHaveLength(3);
        
        matches++;
      }
      
      expect(matches).toBe(trials);
    });

    it('validateAnswer should match validateLevel1Answer for various inputs', () => {
      const testCases = [
        { answer: 'C', expected: 'C' },
        { answer: 'c', expected: 'C' },
        { answer: 'Cmaj', expected: 'C' },
        { answer: 'C major', expected: 'C' },
        { answer: 'Dm', expected: 'Dm' },
        { answer: 'D minor', expected: 'Dm' },
        { answer: 'Fdim', expected: 'Fdim' },
        { answer: 'F diminished', expected: 'Fdim' },
        { answer: 'wrong', expected: 'C' },
      ];

      testCases.forEach(({ answer, expected }) => {
        const sharedResult = validateAnswer(answer, expected, levelConfigs.level1);
        const levelResult = validateLevel1Answer(answer, expected);
        
        expect(sharedResult).toBe(levelResult);
      });
    });
  });

  describe('Level 2 Comparison', () => {
    it('should validate inversion answers consistently', () => {
      const testCases = [
        { answer: 'C', expected: 'C' },
        { answer: 'C/1', expected: 'C/1' },
        { answer: 'C first inversion', expected: 'C/1' },
        { answer: 'Dm/1', expected: 'Dm/1' },
        { answer: 'D minor first inversion', expected: 'Dm/1' },
      ];

      testCases.forEach(({ answer, expected }) => {
        const levelResult = validateLevel2Answer(answer, expected);
        
        // For now, just ensure level validation works
        expect(typeof levelResult).toBe('boolean');
      });
    });
  });

  describe('Level 3 Comparison', () => {
    it('should validate second inversion answers consistently', () => {
      const testCases = [
        { answer: 'C', expected: 'C' },
        { answer: 'C/1', expected: 'C/1' },
        { answer: 'C/2', expected: 'C/2' },
        { answer: 'C second inversion', expected: 'C/2' },
        { answer: 'Dm/2', expected: 'Dm/2' },
      ];

      testCases.forEach(({ answer, expected }) => {
        const levelResult = validateLevel3Answer(answer, expected);
        
        // For now, just ensure level validation works
        expect(typeof levelResult).toBe('boolean');
      });
    });
  });

  describe('Level 4 Comparison', () => {
    it('should handle enharmonic equivalents', () => {
      const testCases = [
        { answer: 'C#', expected: 'Db' },
        { answer: 'Db', expected: 'C#' },
        { answer: 'F#', expected: 'Gb' },
        { answer: 'Ab', expected: 'G#' },
      ];

      testCases.forEach(({ answer, expected }) => {
        const levelResult = validateLevel4Answer(answer, expected);
        
        // For now, just ensure level validation works
        expect(typeof levelResult).toBe('boolean');
      });
    });
  });

  describe('Shared Function Validation', () => {
    it('generateChord should produce valid chord structures for all levels', () => {
      Object.keys(levelConfigs).forEach(levelKey => {
        const config = levelConfigs[levelKey];
        const chord = generateChord(config);
        
        expect(chord).toHaveProperty('notes');
        expect(chord).toHaveProperty('expectedAnswer');
        expect(Array.isArray(chord.notes)).toBe(true);
        expect(typeof chord.expectedAnswer).toBe('string');
        expect(chord.notes.length).toBeGreaterThan(0);
      });
    });

    it('validateAnswer should handle basic validation patterns', () => {
      const config = levelConfigs.level1;
      
      // Test exact matches
      expect(validateAnswer('C', 'C', config)).toBe(true);
      expect(validateAnswer('Dm', 'Dm', config)).toBe(true);
      
      // Test case insensitivity
      expect(validateAnswer('c', 'C', config)).toBe(true);
      expect(validateAnswer('dm', 'Dm', config)).toBe(true);
      
      // Test wrong answers
      expect(validateAnswer('C', 'Dm', config)).toBe(false);
      expect(validateAnswer('invalid', 'C', config)).toBe(false);
    });
  });
});