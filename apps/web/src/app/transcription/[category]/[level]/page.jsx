"use client";

import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { UniversalTranscriptionGame } from "../../shared/UniversalTranscriptionGame.jsx";
import { getLevelConfigByParams } from "../../data/levelConfigs.js";

/**
 * Dynamic Transcription Level Route Handler
 * 
 * Handles all transcription level routes:
 * - /transcription/basic-triads/1
 * - /transcription/basic-triads/2  
 * - /transcription/basic-triads/3
 * - /transcription/seventh-chords/1
 * - /transcription/seventh-chords/2
 * - /transcription/seventh-chords/3
 * - /transcription/extended-chords/1
 * - /transcription/extended-chords/2
 * - /transcription/extended-chords/3
 * - /transcription/jazz-chords/1
 * 
 * This single component replaces what would have been 10 separate page files,
 * demonstrating the clean architecture approach that minimizes tech debt.
 */
export default function TranscriptionLevelPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [levelConfig, setLevelConfig] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLevelConfig = async () => {
      try {
        const { category, level } = params;
        
        // Validate parameters
        if (!category || !level) {
          setError({
            title: "Invalid Route",
            message: "Missing category or level parameter.",
            suggestion: "Please check the URL and try again."
          });
          setIsLoading(false);
          return;
        }

        // Load level configuration
        const config = getLevelConfigByParams(category, level);
        setLevelConfig(config);
        setError(null);
        
      } catch (err) {
        console.error('Failed to load level configuration:', err);
        setError({
          title: "Level Not Found",
          message: `The transcription level "${params.category}/${params.level}" could not be found.`,
          suggestion: "Please check the URL or return to the transcription hub to select a valid level."
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
            Preparing {params.category} level {params.level}
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
              onClick={() => navigate('/transcription')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Transcription Hub
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

  // Success state - render the transcription game
  return (
    <UniversalTranscriptionGame 
      levelConfig={levelConfig}
      key={`${params.category}-${params.level}`} // Force re-mount on route change
    />
  );
}