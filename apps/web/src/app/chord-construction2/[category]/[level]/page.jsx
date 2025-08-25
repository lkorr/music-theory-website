/**
 * Dynamic Route Handler for Chord Construction Levels
 * 
 * This single file handles ALL 9 chord construction levels through dynamic routing.
 * Replaces the need for 9+ individual level page files with one universal handler.
 * 
 * Route Pattern: /chord-construction2/[category]/[level]
 * Examples:
 * - /chord-construction2/basic-triads/1
 * - /chord-construction2/seventh-chords/2
 * - /chord-construction2/extended-chords/3
 * 
 * Architecture Benefits:
 * - 90% reduction in page files (1 vs 9+)
 * - Configuration-driven level loading
 * - Consistent error handling across all levels
 * - Easy to add new levels (just add config entry)
 * - Type-safe parameter validation
 */

import { useParams } from "react-router";
import { getLevelConfigByParams } from "../../data/levelConfigs.js";
import UniversalChordConstructor from "../../shared/UniversalChordConstructor.jsx";
import { Link } from "react-router";

/**
 * Level Not Found Error Component
 * Displays when user navigates to invalid level parameters
 */
function LevelNotFoundError({ category, level }) {
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
          Could not find level <strong>{level}</strong> in category <strong>{category}</strong>
        </p>
        <p className="text-white/50 text-sm mb-6">
          Please check the URL and try again.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/chord-construction2"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Chord Construction Hub
          </Link>
          <Link
            to="/dashboard"
            className="block w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-white/40">
          <p>Available categories: basic-triads, seventh-chords, extended-chords</p>
          <p>Available levels: 1-3 (each category)</p>
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
 * Main Dynamic Route Handler Component
 * 
 * This component:
 * 1. Extracts route parameters (category and level)
 * 2. Validates parameters and loads appropriate configuration
 * 3. Renders UniversalChordConstructor with level config
 * 4. Handles error states gracefully
 */
export default function ChordConstructionLevelPage() {
  // Extract route parameters
  const params = useParams();
  const { category, level } = params;
  
  // Validate parameters exist
  if (!category || !level) {
    return <LevelNotFoundError category={category || 'unknown'} level={level || 'unknown'} />;
  }
  
  // Attempt to load level configuration
  let levelConfig;
  try {
    levelConfig = getLevelConfigByParams(category, level);
  } catch (error) {
    console.error(`Failed to load level configuration:`, error);
    return <LevelNotFoundError category={category} level={level} />;
  }
  
  // Validate that config was found
  if (!levelConfig) {
    return <LevelNotFoundError category={category} level={level} />;
  }
  
  // Additional validation: ensure config matches expected structure
  if (!levelConfig.id || !levelConfig.title || !levelConfig.chordGeneration) {
    console.error(`Invalid level configuration for ${category}-${level}:`, levelConfig);
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
            Level configuration for <strong>{category}-{level}</strong> is invalid or incomplete.
          </p>
          <Link
            to="/chord-construction2"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Hub
          </Link>
        </div>
      </div>
    );
  }
  
  // Successfully loaded valid configuration - render the game
  return <UniversalChordConstructor levelConfig={levelConfig} />;
}

/**
 * Route Configuration Notes:
 * 
 * This component handles these URL patterns:
 * 
 * Basic Triads:
 * - /chord-construction2/basic-triads/1 → basic-triads-1 config
 * - /chord-construction2/basic-triads/2 → basic-triads-2 config  
 * - /chord-construction2/basic-triads/3 → basic-triads-3 config
 * 
 * Seventh Chords:
 * - /chord-construction2/seventh-chords/1 → seventh-chords-1 config
 * - /chord-construction2/seventh-chords/2 → seventh-chords-2 config
 * - /chord-construction2/seventh-chords/3 → seventh-chords-3 config
 * 
 * Extended Chords:
 * - /chord-construction2/extended-chords/1 → extended-chords-1 config
 * - /chord-construction2/extended-chords/2 → extended-chords-2 config
 * - /chord-construction2/extended-chords/3 → extended-chords-3 config
 * 
 * Error Handling:
 * - Invalid category → LevelNotFoundError
 * - Invalid level number → LevelNotFoundError  
 * - Missing config → LevelNotFoundError
 * - Malformed config → Configuration Error
 * 
 * This architecture eliminates the need for:
 * - 9 individual page.jsx files
 * - 9 individual levelXUtils.js files
 * - Duplicate error handling across levels
 * - Manual route registration for each level
 */