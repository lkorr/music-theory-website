/**
 * Universal Theme Configuration for Chord Construction
 * 
 * This file centralizes all visual theme configurations used across different levels.
 * Each theme controls the color scheme and visual appearance of the entire level.
 * 
 * Themes correspond to difficulty progression:
 * - emerald: Level 1 of each category (introductory)
 * - teal: Level 2 of each category (intermediate within category)
 * - cyan: Level 3 of each category (advanced within category)  
 * - purple: Extended chords (advanced/expert)
 */

export interface ThemeColors {
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  pianoRoll: {
    placedNotes: string;
    correctNotes: string;
    incorrectNotes: string;
    solutionNotes: string;
  };
  progressBar: string;
  buttons: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
  };
  feedback: {
    correct: string;
    incorrect: string;
    neutral: string;
  };
}

export const THEMES: Record<string, ThemeColors> = {
  emerald: {
    name: 'emerald',
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-emerald-500",
    secondary: "bg-emerald-600", 
    accent: "border-emerald-300",
    text: "text-emerald-100",
    pianoRoll: {
      placedNotes: "bg-emerald-500 border-emerald-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      solutionNotes: "bg-yellow-400 border-yellow-500"
    },
    progressBar: "bg-emerald-500",
    buttons: {
      primary: "bg-emerald-500 hover:bg-emerald-600",
      secondary: "bg-gray-500 hover:bg-gray-600",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700"
    },
    feedback: {
      correct: "bg-green-500/20 border-green-500",
      incorrect: "bg-red-500/20 border-red-500",
      neutral: "bg-white/20 border-white/30"
    }
  },

  teal: {
    name: 'teal',
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-teal-500",
    secondary: "bg-teal-600", 
    accent: "border-teal-300",
    text: "text-teal-100",
    pianoRoll: {
      placedNotes: "bg-teal-500 border-teal-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      solutionNotes: "bg-yellow-400 border-yellow-500"
    },
    progressBar: "bg-teal-500",
    buttons: {
      primary: "bg-teal-500 hover:bg-teal-600",
      secondary: "bg-gray-500 hover:bg-gray-600",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700"
    },
    feedback: {
      correct: "bg-green-500/20 border-green-500",
      incorrect: "bg-red-500/20 border-red-500",
      neutral: "bg-white/20 border-white/30"
    }
  },

  cyan: {
    name: 'cyan',
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-cyan-500",
    secondary: "bg-cyan-600", 
    accent: "border-cyan-300",
    text: "text-cyan-100",
    pianoRoll: {
      placedNotes: "bg-cyan-500 border-cyan-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      solutionNotes: "bg-yellow-400 border-yellow-500"
    },
    progressBar: "bg-cyan-500",
    buttons: {
      primary: "bg-cyan-500 hover:bg-cyan-600",
      secondary: "bg-gray-500 hover:bg-gray-600",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700"
    },
    feedback: {
      correct: "bg-green-500/20 border-green-500",
      incorrect: "bg-red-500/20 border-red-500",
      neutral: "bg-white/20 border-white/30"
    }
  },

  purple: {
    name: 'purple',
    background: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    primary: "bg-purple-500",
    secondary: "bg-purple-600", 
    accent: "border-purple-300",
    text: "text-purple-100",
    pianoRoll: {
      placedNotes: "bg-purple-500 border-purple-600",
      correctNotes: "bg-green-500 border-green-600",
      incorrectNotes: "bg-red-500 border-red-600",
      solutionNotes: "bg-yellow-400 border-yellow-500"
    },
    progressBar: "bg-purple-500",
    buttons: {
      primary: "bg-purple-500 hover:bg-purple-600",
      secondary: "bg-gray-500 hover:bg-gray-600",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700"
    },
    feedback: {
      correct: "bg-green-500/20 border-green-500",
      incorrect: "bg-red-500/20 border-red-500",
      neutral: "bg-white/20 border-white/30"
    }
  }
};

/**
 * Get theme configuration by name
 * @param themeName - Name of the theme (emerald, teal, cyan, purple)
 * @returns Theme configuration object
 */
export function getTheme(themeName: string): ThemeColors {
  return THEMES[themeName] || THEMES.emerald; // Default to emerald if theme not found
}

/**
 * Get theme configuration from level config
 * @param levelConfig - Level configuration object
 * @returns Theme configuration object
 */
export function getThemeFromLevelConfig(levelConfig?: { theme?: string }): ThemeColors {
  return getTheme(levelConfig?.theme || 'emerald');
}