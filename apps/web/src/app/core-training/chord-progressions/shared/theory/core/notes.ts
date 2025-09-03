/**
 * Notes utilities for chord progressions
 * Re-exports from the main music theory utilities to avoid code duplication
 */

// Re-export all utilities from the main notes module
export {
  noteNames,
  noteNamesWithEnharmonics,
  getMidiNoteName,
  getMidiNoteNameWithEnharmonics,
  isBlackKey,
  getEnharmonicEquivalent,
  normalizeNoteName,
  getNoteNumber,
  getInterval,
  getNaturalNotes,
  isNaturalNote,
  type NoteName,
  type NoteNameWithEnharmonics,
  type NaturalNote
} from '../../../../chord-recognition/shared/theory/core/notes.ts';