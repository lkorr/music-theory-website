/**
 * Dynamic Route Handler for Chord Recognition Levels
 * 
 * This single file handles ALL 15 chord recognition levels through dynamic routing.
 * Replaces the need for 15+ individual level page files with one universal handler.
 * 
 * Route Pattern: /chord-recognition/[category]/[level]
 * Examples:
 * - /chord-recognition/basic-triads/1
 * - /chord-recognition/seventh-chords/3
 * - /chord-recognition/extended-chords/6
 * 
 * Architecture Benefits:
 * - 95% reduction in page files (1 vs 15+)
 * - Configuration-driven level loading
 * - Consistent error handling across all levels
 * - Easy to add new levels (just add config entry)
 * - Type-safe parameter validation
 */

import { useParams } from "react-router";
import { getLevelConfigByParams, type LevelConfig } from "../../data/levelConfigs";
import UniversalChordRecognitionGame from "../../shared/UniversalChordRecognitionGame";
import { Link } from "react-router";

/**
 * Route parameters interface for type safety
 */
interface RouteParams extends Record<string, string | undefined> {
  category: string;
  level: string;
}

/**
 * Props interface for error components
 */
interface ErrorComponentProps {
  category: string;
  level: string;
}

/**
 * Level Not Found Error Component
 * Displays when user navigates to invalid level parameters
 */
function LevelNotFoundError({ category, level }: ErrorComponentProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-white mb-4">Level Not Found</h1>
        <p className="text-white/70 mb-2">
          Could not find level <strong>{level}</strong> in category <strong>{category}</strong>
        </p>
        <p className="text-white/50 text-sm mb-6">
          Please check the URL and try again.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/chord-recognition"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Chord Recognition Hub
          </Link>
          <Link
            to="/midi-training"
            className="block w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to MIDI Training
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-white/40">
          <p>Available categories: basic-triads, seventh-chords, extended-chords</p>
          <p>Available levels: 1-4 (basic-triads), 1-5 (seventh-chords), 1-6 (extended-chords)</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Component
 * Shows while level configuration is being loaded
 */
function LevelLoading(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Loading level...</p>
      </div>
    </div>
  );
}

/**
 * Configuration Error Component
 * Shows when level configuration exists but is invalid
 */
function ConfigurationError({ category, level }: ErrorComponentProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Configuration Error</h1>
        <p className="text-white/70 mb-6">
          Level configuration for <strong>{category}-{level}</strong> is invalid or incomplete.
        </p>
        <Link
          to="/chord-recognition"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Back to Hub
        </Link>
      </div>
    </div>
  );
}

/**
 * Type guard to validate level configuration structure
 */
function isValidLevelConfig(config: LevelConfig | null): config is LevelConfig {
  return (
    config !== null &&
    typeof config.id === 'string' &&
    typeof config.title === 'string' &&
    config.chordGeneration !== undefined &&
    config.validation !== undefined
  );
}

/**
 * Main Dynamic Route Handler Component
 * 
 * This component:
 * 1. Extracts route parameters (category and level)
 * 2. Validates parameters and loads appropriate configuration
 * 3. Renders UniversalChordRecognitionGame with level config
 * 4. Handles error states gracefully
 */
export default function ChordRecognitionLevelPage(): JSX.Element {
  // Extract route parameters with type safety
  const params = useParams<RouteParams>();
  const { category, level } = params;
  
  // Validate parameters exist
  if (!category || !level) {
    return <LevelNotFoundError category={category || 'unknown'} level={level || 'unknown'} />;
  }
  
  // Attempt to load level configuration
  let levelConfig: LevelConfig | null = null;
  try {
    levelConfig = getLevelConfigByParams(category, level);
  } catch (error) {
    console.error(`Failed to load level configuration:`, error);
    return <LevelNotFoundError category={category} level={level} />;
  }
  
  // Validate that config was found and is valid
  if (!isValidLevelConfig(levelConfig)) {
    if (levelConfig === null) {
      return <LevelNotFoundError category={category} level={level} />;
    } else {
      console.error(`Invalid level configuration for ${category}-${level}:`, levelConfig);
      return <ConfigurationError category={category} level={level} />;
    }
  }
  
  // Successfully loaded valid configuration - render the game
  return <UniversalChordRecognitionGame levelConfig={levelConfig} />;
}

/**
 * Route Configuration Notes:
 * 
 * This component handles these URL patterns:
 * 
 * Basic Triads:
 * - /chord-recognition/basic-triads/1 → basic-triads-1 config
 * - /chord-recognition/basic-triads/2 → basic-triads-2 config  
 * - /chord-recognition/basic-triads/3 → basic-triads-3 config
 * - /chord-recognition/basic-triads/4 → basic-triads-4 config
 * 
 * Seventh Chords:
 * - /chord-recognition/seventh-chords/1 → seventh-chords-1 config
 * - /chord-recognition/seventh-chords/2 → seventh-chords-2 config
 * - /chord-recognition/seventh-chords/3 → seventh-chords-3 config
 * - /chord-recognition/seventh-chords/4 → seventh-chords-4 config
 * - /chord-recognition/seventh-chords/5 → seventh-chords-5 config
 * 
 * Extended Chords:
 * - /chord-recognition/extended-chords/1 → extended-chords-1 config
 * - /chord-recognition/extended-chords/2 → extended-chords-2 config
 * - /chord-recognition/extended-chords/3 → extended-chords-3 config
 * - /chord-recognition/extended-chords/4 → extended-chords-4 config
 * - /chord-recognition/extended-chords/5 → extended-chords-5 config
 * - /chord-recognition/extended-chords/6 → extended-chords-6 config
 * 
 * Error Handling:
 * - Invalid category → LevelNotFoundError
 * - Invalid level number → LevelNotFoundError  
 * - Missing config → LevelNotFoundError
 * - Malformed config → Configuration Error
 * 
 * This architecture eliminates the need for:
 * - 15 individual page.jsx files
 * - 15 individual levelXUtils.js files
 * - Duplicate error handling across levels
 * - Manual route registration for each level
 */