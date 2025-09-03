/**
 * Dynamic Route Handler for Chord Progressions 2 Levels
 * 
 * This single file handles ALL 4 chord progression levels through dynamic routing.
 * Replaces the need for 4+ individual level page files with one universal handler.
 * 
 * Route Pattern: /chord-progressions/[level]
 * Examples:
 * - /chord-progressions/1 → Level 1 (Basic Progressions)
 * - /chord-progressions/2 → Level 2 (Progressions with Inversions)  
 * - /chord-progressions/3 → Level 3 (Non-Diatonic Chords)
 * - /chord-progressions/4 → Level 4 (Non-Diatonic with Inversions)
 * 
 * Architecture Benefits:
 * - 75% reduction in page files (1 vs 4+)
 * - Configuration-driven level loading
 * - Consistent error handling across all levels
 * - Easy to add new levels (just add config entry)
 * - Type-safe parameter validation
 */

import { useParams } from "react-router";
import { getLevelConfig, isValidLevel, type LevelConfig } from "../data/levelConfigs";
import UniversalChordProgressionGame from "../shared/UniversalChordProgressionGame";
import { Link } from "react-router";

/**
 * Route parameters interface for type safety
 */
interface RouteParams extends Record<string, string | undefined> {
  level: string;
}

/**
 * Props interface for error components
 */
interface ErrorComponentProps {
  level: string;
}

/**
 * Level Not Found Error Component
 * Displays when user navigates to invalid level parameter
 */
function LevelNotFoundError({ level }: ErrorComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-white mb-4">Level Not Found</h1>
        <p className="text-white/70 mb-2">
          Could not find level <strong>{level}</strong>
        </p>
        <p className="text-white/50 text-sm mb-6">
          Please check the URL and try again.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/chord-progressions"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Chord Progressions Hub
          </Link>
          <Link
            to="/dashboard"
            className="block w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-white/40">
          <p>Available levels: 1, 2, 3, 4</p>
          <p>Examples: /chord-progressions/1, /chord-progressions/2</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Component
 * Shows while level configuration is being loaded
 */
function LevelLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
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
function ConfigurationError({ level }: ErrorComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">Configuration Error</h1>
        <p className="text-white/70 mb-6">
          Level configuration for <strong>{level}</strong> is invalid or incomplete.
        </p>
        <Link
          to="/chord-progressions"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
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
    config.progressionGeneration !== undefined
  );
}

/**
 * Main Dynamic Route Handler Component
 * 
 * This component:
 * 1. Extracts route parameters (level number)
 * 2. Validates parameters and loads appropriate configuration
 * 3. Renders UniversalChordProgressionGame with level config
 * 4. Handles error states gracefully
 */
export default function ChordProgressions2LevelPage(): JSX.Element {
  // Extract route parameters with type safety
  const params = useParams<RouteParams>();
  const { level } = params;
  
  // Validate parameter exists
  if (!level) {
    return <LevelNotFoundError level="unknown" />;
  }
  
  // Validate level number format
  const levelNumber = parseInt(level, 10);
  if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 4) {
    return <LevelNotFoundError level={level} />;
  }
  
  // Convert to level key format expected by config
  const levelKey = `level${level}`;
  
  // Validate that level exists in configuration
  if (!isValidLevel(levelKey)) {
    return <LevelNotFoundError level={level} />;
  }
  
  // Attempt to load level configuration
  let levelConfig: LevelConfig | null = null;
  try {
    levelConfig = getLevelConfig(levelKey);
  } catch (error) {
    console.error(`Failed to load level configuration:`, error);
    return <LevelNotFoundError level={level} />;
  }
  
  // Validate that config was found and is valid
  if (!isValidLevelConfig(levelConfig)) {
    if (levelConfig === null) {
      return <LevelNotFoundError level={level} />;
    } else {
      console.error(`Invalid level configuration for level ${level}:`, levelConfig);
      return <ConfigurationError level={level} />;
    }
  }
  
  // Successfully loaded valid configuration - render the game
  return <UniversalChordProgressionGame levelConfig={levelConfig} />;
}

/**
 * Route Configuration Notes:
 * 
 * This component handles these URL patterns:
 * 
 * Level 1: Basic Progressions
 * - /chord-progressions/1 → level1 config
 * 
 * Level 2: Progressions with Inversions
 * - /chord-progressions/2 → level2 config
 * 
 * Level 3: Non-Diatonic Chords
 * - /chord-progressions/3 → level3 config
 * 
 * Level 4: Non-Diatonic with Inversions
 * - /chord-progressions/4 → level4 config
 * 
 * Error Handling:
 * - Invalid level number → LevelNotFoundError
 * - Missing level parameter → LevelNotFoundError
 * - Missing config → LevelNotFoundError
 * - Malformed config → ConfigurationError
 * 
 * This architecture eliminates the need for:
 * - 4 individual page.tsx files
 * - 4 individual levelXUtils.ts files
 * - Duplicate error handling across levels
 * - Manual route registration for each level
 * 
 * Clean Architecture Benefits:
 * - Single source of truth for level handling
 * - Consistent error states across all levels
 * - Easy to add new levels (just add to config)
 * - Centralized validation logic
 * - Type-safe parameter handling
 */