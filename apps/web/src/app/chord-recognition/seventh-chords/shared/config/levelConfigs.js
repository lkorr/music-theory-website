/**
 * Extended Chords Level Configuration
 * 
 * Centralized configuration for all extended chord levels
 */

import { extendedLevelConfigs } from '../chordLogic.js';

/**
 * Get configuration for a specific level
 * @param {string} levelId - Level identifier (e.g., 'level1', 'level2')
 * @returns {Object} Level configuration object
 */
export const getLevelConfig = (levelId) => {
  const config = extendedLevelConfigs[levelId];
  if (!config) {
    throw new Error(`Level configuration not found for: ${levelId}`);
  }
  return config;
};