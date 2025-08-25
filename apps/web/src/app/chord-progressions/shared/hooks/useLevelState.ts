/**
 * Shared Level State Hook
 * 
 * Consolidates all state management that's duplicated across chord recognition levels.
 * This eliminates ~100 lines of duplicated state declarations per level.
 */

import { useState, useRef } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Feedback {
  show: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  timeTaken: number;
}

interface Score {
  correct: number;
  total: number;
  streak: number;
}

interface LevelResult {
  passed: boolean;
  accuracy: number;
  avgTime: number;
  score: Score;
}

interface ChordData {
  chords?: any[];
  expectedAnswer?: string;
  answer?: string;
  name?: string;
}

interface TimerRef {
  current: NodeJS.Timeout | null;
}

interface GameState {
  currentChord: ChordData | null;
  userAnswer: string;
  feedback: Feedback | null;
  isAnswered: boolean;
}

interface ProgressState {
  score: Score;
  hasStarted: boolean;
  isCompleted: boolean;
  levelResult: LevelResult | null;
}

interface TimingState {
  startTime: number | null;
  currentTime: number;
  avgTime: number;
  totalTime: number;
}

interface UIState {
  showLabels: boolean;
}

interface Refs {
  inputRef: React.RefObject<HTMLInputElement>;
  timerRef: TimerRef;
}

interface Setters {
  setCurrentChord: (chord: ChordData | null) => void;
  setUserAnswer: (answer: string) => void;
  setFeedback: (feedback: Feedback | null) => void;
  setIsAnswered: (isAnswered: boolean) => void;
  setScore: (score: Score | ((prev: Score) => Score)) => void;
  setHasStarted: (hasStarted: boolean) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setLevelResult: (result: LevelResult | null) => void;
  setStartTime: (time: number | null) => void;
  setCurrentTime: (time: number) => void;
  setAvgTime: (time: number) => void;
  setTotalTime: (time: number) => void;
  setShowLabels: (show: boolean) => void;
}

interface Helpers {
  /**
   * Reset all state to initial values (useful for level restart)
   */
  resetLevel: () => void;
  
  /**
   * Reset for next question (preserves progress)
   */
  resetForNextQuestion: () => void;
  
  /**
   * Update score with new result
   * @param isCorrect - Whether the answer was correct
   * @param timeTaken - Time taken in seconds
   * @param totalProblems - Total problems in the level
   * @param passAccuracy - Required accuracy to pass
   * @param passTime - Required average time to pass
   */
  updateScore: (
    isCorrect: boolean, 
    timeTaken: number, 
    totalProblems: number, 
    passAccuracy: number, 
    passTime: number
  ) => void;
}

export interface LevelStateReturn extends GameState, ProgressState, TimingState, UIState, Refs {
  // Grouped state for convenience
  gameState: GameState;
  progressState: ProgressState;
  timingState: TimingState;
  uiState: UIState;
  refs: Refs;
  
  // All setters
  setters: Setters;
  
  // Helper functions
  helpers: Helpers;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Custom hook that provides all state needed for a chord recognition level
 * @returns Object containing all state variables and their setters
 */
export const useLevelState = (): LevelStateReturn => {
  // Core game state
  const [currentChord, setCurrentChord] = useState<ChordData | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  // Progress and scoring state
  const [score, setScore] = useState<Score>({ correct: 0, total: 0, streak: 0 });
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  
  // Timing state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [avgTime, setAvgTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  
  // UI state
  const [showLabels, setShowLabels] = useState<boolean>(true);
  
  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Group related state for easier access
  const gameState: GameState = {
    currentChord,
    userAnswer,
    feedback,
    isAnswered
  };
  
  const progressState: ProgressState = {
    score,
    hasStarted,
    isCompleted,
    levelResult
  };
  
  const timingState: TimingState = {
    startTime,
    currentTime,
    avgTime,
    totalTime
  };
  
  const uiState: UIState = {
    showLabels
  };
  
  const refs: Refs = {
    inputRef,
    timerRef
  };
  
  // All setters grouped for convenience
  const setters: Setters = {
    setCurrentChord,
    setUserAnswer,
    setFeedback,
    setIsAnswered,
    setScore,
    setHasStarted,
    setIsCompleted,
    setLevelResult,
    setStartTime,
    setCurrentTime,
    setAvgTime,
    setTotalTime,
    setShowLabels
  };
  
  // Helper functions for common state operations
  const helpers: Helpers = {
    /**
     * Reset all state to initial values (useful for level restart)
     */
    resetLevel: () => {
      setCurrentChord(null);
      setUserAnswer('');
      setFeedback(null);
      setIsAnswered(false);
      setScore({ correct: 0, total: 0, streak: 0 });
      setHasStarted(false);
      setIsCompleted(false);
      setLevelResult(null);
      setStartTime(null);
      setCurrentTime(0);
      setAvgTime(0);
      setTotalTime(0);
      setShowLabels(true);
    },
    
    /**
     * Reset for next question (preserves progress)
     */
    resetForNextQuestion: () => {
      setUserAnswer('');
      setFeedback(null);
      setIsAnswered(false);
      setStartTime(null);
      setCurrentTime(0);
    },
    
    /**
     * Update score with new result
     * @param isCorrect - Whether the answer was correct
     * @param timeTaken - Time taken in seconds
     * @param totalProblems - Total problems in the level
     * @param passAccuracy - Required accuracy to pass
     * @param passTime - Required average time to pass
     */
    updateScore: (isCorrect: boolean, timeTaken: number, totalProblems: number, passAccuracy: number, passTime: number) => {
      setScore(prev => {
        const newTotal = prev.total + 1;
        const newTotalTime = totalTime + timeTaken;
        setTotalTime(newTotalTime);
        setAvgTime(newTotalTime / newTotal);
        
        const newScore: Score = {
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: newTotal,
          streak: isCorrect ? prev.streak + 1 : 0
        };
        
        // Check if level is completed
        if (newTotal >= totalProblems) {
          const finalAccuracy = (newScore.correct / newTotal) * 100;
          const finalAvgTime = newTotalTime / newTotal;
          const passed = finalAccuracy >= passAccuracy && finalAvgTime <= passTime;
          
          setLevelResult({
            passed,
            accuracy: finalAccuracy,
            avgTime: finalAvgTime,
            score: newScore
          });
          setIsCompleted(true);
        }
        
        return newScore;
      });
    }
  };
  
  // Return all state, setters, and helpers
  return {
    // Individual state pieces
    ...gameState,
    ...progressState,
    ...timingState,
    ...uiState,
    ...refs,
    
    // Grouped state for convenience
    gameState,
    progressState,
    timingState,
    uiState,
    refs,
    
    // All setters
    setters,
    
    // Helper functions
    helpers
  };
};