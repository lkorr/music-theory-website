/**
 * Level configurations for jazz/extended chords
 */

import { jazzLevelConfigs } from '../chordLogic.js';

/**
 * Get configuration for a specific level
 * @param {string} levelId - The level identifier (e.g., 'level1', 'level2')
 * @returns {Object} Level configuration object
 */
export const getLevelConfig = (levelId) => {
  return jazzLevelConfigs[levelId];
};