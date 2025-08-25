"use client";

import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import ChordProgressionTranscriptionGame from "../shared/ChordProgressionTranscriptionGame";
import { getLevelConfigByParams } from "../data/levelConfigs";

// Type definitions
interface RouteParams extends Record<string, string | undefined> {
  level: string;
}

interface ErrorState {
  title: string;
  message: string;
  suggestion: string;
}

interface AudioConfig {
  tempo: number;
  chordDuration: number;
  pauseBetweenChords: number;
  instrument: string;
  baseOctave: number;
  volume: number;
}

interface ScoringConfig {
  perfectScore: number;
  timePenalty: number;
  wrongNotePenalty: number;
  hintPenalty: number;
}

interface AvailableKeys {
  major: string[];
  minor?: string[];
}

interface LevelConfig {
  title: string;
  description: string;
  audio: AudioConfig;
  progressions: string[][];
  availableKeys: AvailableKeys;
  maxAttempts: number;
  showHints: boolean;
  scoring: ScoringConfig;
  theme: string;
  showProgressBar: boolean;
}

/**
 * Dynamic Chord Progression Transcription Level Route Handler
 * 
 * Handles all progression transcription level routes:
 * - /chord-progression-transcription/level1
 * - /chord-progression-transcription/level2
 * - /chord-progression-transcription/level3
 * - /chord-progression-transcription/level4
 * 
 * This single component replaces what would have been 4 separate page files,
 * demonstrating clean architecture that minimizes tech debt.
 */
export default function ChordProgressionTranscriptionLevelPage(): JSX.Element {
  const params = useParams<RouteParams>();
  const navigate = useNavigate();
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLevelConfig = async (): Promise<void> => {
      try {
        const { level } = params;
        
        // Validate parameters
        if (!level) {
          setError({
            title: "Invalid Route",
            message: "Missing level parameter.",
            suggestion: "Please check the URL and try again."
          });
          setIsLoading(false);
          return;
        }

        // Load level configuration
        const config = getLevelConfigByParams(level);
        setLevelConfig(config);
        setError(null);
        
      } catch (err) {
        console.error('Failed to load level configuration:', err);
        setError({
          title: "Level Not Found",
          message: `The progression transcription level "${params.level}" could not be found.`,
          suggestion: "Please check the URL or return to the progression transcription hub to select a valid level."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLevelConfig();
  }, [params]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Transcription Level...</h2>
          <p className="text-white/70">
            Preparing chord progression transcription {params.level}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-4">{error.title}</h2>
          <p className="text-white/70 mb-6">{error.message}</p>
          <p className="text-white/50 text-sm mb-6">{error.suggestion}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/chord-progression-transcription')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Progression Hub
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the progression transcription game
  if (!levelConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Configuration Error</h2>
          <p className="text-white/70">Level configuration could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <ChordProgressionTranscriptionGame 
      levelConfig={levelConfig}
      key={`progression-${params.level}`} // Force re-mount on route change
    />
  );
}