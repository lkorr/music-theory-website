/**
 * Progression Display Component for Chord Progressions 2
 * 
 * Displays progression information including:
 * - Piano roll visualization
 * - Key signature
 * - Current progression number
 * - Play button with volume control
 * - Visual feedback for correct/incorrect answers
 */

"use client";

import { useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import ProgressionPianoRoll from "./ProgressionPianoRoll";
import type { ChordProgression } from "../utils/progressionLogic";
import type { Feedback } from "../hooks/useLevelState";

interface ProgressionDisplayProps {
  progression: ChordProgression | null;
  feedback: Feedback | null;
  isPlaying: boolean;
  volume: number;
  progressionNumber: number;
  totalProblems: number;
  onPlay: () => void;
  onVolumeChange: (volume: number) => void;
  theme: string;
}

export default function ProgressionDisplay({
  progression,
  feedback,
  isPlaying,
  volume,
  progressionNumber,
  totalProblems,
  onPlay,
  onVolumeChange,
  theme
}: ProgressionDisplayProps): React.ReactNode {
  
  const [showLabels, setShowLabels] = useState<boolean>(false);
  
  // Theme configuration
  const getThemeClasses = (theme: string) => {
    const themes = {
      emerald: {
        container: 'bg-emerald-500/20 border-emerald-500/50',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        text: 'text-emerald-300'
      },
      teal: {
        container: 'bg-teal-500/20 border-teal-500/50',
        button: 'bg-teal-600 hover:bg-teal-700',
        text: 'text-teal-300'
      },
      purple: {
        container: 'bg-purple-500/20 border-purple-500/50',
        button: 'bg-purple-600 hover:bg-purple-700',
        text: 'text-purple-300'
      },
      indigo: {
        container: 'bg-indigo-500/20 border-indigo-500/50',
        button: 'bg-indigo-600 hover:bg-indigo-700',
        text: 'text-indigo-300'
      }
    };
    
    return themes[theme as keyof typeof themes] || themes.emerald;
  };
  
  const themeClasses = getThemeClasses(theme);
  
  return (
    <>
      {progression && (
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
            {/* Header with volume controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Chord Progression {progressionNumber}/{totalProblems}
              </h3>
              
              {/* Volume Control - similar to chord-progression-transcription */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onVolumeChange(volume > 0 ? 0 : 0.3)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  title={volume > 0 ? "Mute" : "Unmute"}
                >
                  {volume > 0 ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-white/20 rounded-lg appearance-none slider"
                  title="Volume"
                />
              </div>
            </div>
            
            {/* Play Button */}
            <div className="text-center mb-4">
              <button
                onClick={onPlay}
                disabled={isPlaying}
                className={`flex items-center space-x-2 px-6 py-3 ${themeClasses.button} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto`}
                title="Play progression"
              >
                <Play size={16} className={isPlaying ? "animate-pulse" : ""} />
                <span>{isPlaying ? "Playing..." : "Play Progression"}</span>
              </button>
            </div>
          </div>
          
          <ProgressionPianoRoll
            chords={progression.chords}
            currentKey={progression.key}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
          />
        </div>
      )}
    </>
  );
}