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