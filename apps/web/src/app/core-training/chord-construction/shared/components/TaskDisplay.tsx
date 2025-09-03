/**
 * Task Display Component for Chord Construction
 * 
 * This component displays the current chord construction task including:
 * - Target chord name and description
 * - Action buttons (Clear All, Check Chord)
 * - Feedback display for correct/incorrect answers
 * - Detailed feedback with expected vs actual notes
 * 
 * Features:
 * - Theme-based button styling
 * - Real-time feedback display
 * - Visual feedback with color-coded messages
 * - Disabled states for buttons during answered state
 */

import type { ReactNode } from "react";
import { getMidiNoteName } from "../../../chord-recognition/shared/theory/core/notes";

interface CurrentTask {
  chordName: string;
  description: string;
}

interface Feedback {
  isCorrect: boolean;
  expectedNotes?: number[];
  placedNotes?: number[];
}

interface ButtonTheme {
  primary: string;
  secondary: string;
}

interface FeedbackTheme {
  correct: string;
  incorrect: string;
}

interface Theme {
  text: string;
  buttons: ButtonTheme;
  feedback: FeedbackTheme;
}

interface TaskDisplayProps {
  currentTask: CurrentTask | null;
  placedNotes: number[];
  feedback: Feedback | null;
  isAnswered: boolean;
  onClearAll: () => void;
  onSubmit: () => void;
  theme: Theme;
}

export default function TaskDisplay({ 
  currentTask, 
  placedNotes, 
  feedback, 
  isAnswered, 
  onClearAll, 
  onSubmit, 
  theme 
}: TaskDisplayProps): ReactNode {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Build this chord
      </h2>
      
      {/* Target chord information */}
      {currentTask && (
        <div className="text-center mb-6">
          <div className={`text-3xl font-bold mb-2 ${theme.text}`}>
            {currentTask.chordName}
          </div>
          <p className="text-white/70">
            {currentTask.description}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={onClearAll}
            className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors ${theme.buttons.secondary}`}
            disabled={isAnswered}
          >
            Clear All
          </button>
          
          <button
            onClick={onSubmit}
            disabled={isAnswered || placedNotes.length === 0}
            className={`px-8 py-3 text-white font-semibold rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${theme.buttons.primary}`}
          >
            Check Chord
          </button>
        </div>
        
        {/* Feedback display */}
        {feedback && (
          <div className={`p-4 rounded-lg border ${
            feedback.isCorrect 
              ? theme.feedback.correct 
              : theme.feedback.incorrect
          }`}>
            <p className="font-semibold text-center">
              {feedback.isCorrect ? (
                <span className="text-green-300">✓ Perfect!</span>
              ) : (
                <span className="text-red-300">✗ Not quite right</span>
              )}
            </p>
            
            {/* Detailed feedback for incorrect answers */}
            {!feedback.isCorrect && feedback.expectedNotes && feedback.placedNotes && (
              <div className="mt-3 text-sm space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-white/70">Expected:</span>
                  <span className="text-green-300 font-mono">
                    {feedback.expectedNotes.map(note => getMidiNoteName(note)).join(', ')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-white/70">You placed:</span>
                  <span className="text-red-300 font-mono">
                    {feedback.placedNotes.map(note => getMidiNoteName(note)).join(', ')}
                  </span>
                </div>
                
                {/* Additional helpful feedback */}
                {feedback.expectedNotes.length !== feedback.placedNotes.length && (
                  <p className="text-yellow-300 text-center mt-2">
                    💡 You need exactly {feedback.expectedNotes.length} notes for this chord
                  </p>
                )}
              </div>
            )}
            
            {/* Success message */}
            {feedback.isCorrect && (
              <p className="mt-2 text-green-200 text-center">
                Excellent chord construction! 🎉
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}