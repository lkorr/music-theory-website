/**
 * Shared Level State Hook
 * 
 * Consolidates all state management that's duplicated across chord recognition levels.
 * This eliminates ~100 lines of duplicated state declarations per level.
 * Now includes integration with statistics tracking for persistent progress.
 */

import { useState, useRef, useCallback } from 'react';
import { useStatistics } from './useStatistics';

// Type definitions
export interface ChordResult {
  name: string;
  expectedAnswer?: string;
  notes: number[];
  root: string;
  chordType: string;
  inversion: string;
}

export interface ScoreState {
  correct: number;
  total: number;
  streak: number;
}

export interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  timeTaken: number;
}

export interface LevelResult {
  passed: boolean;
  accuracy: number;
  avgTime: number;
  score: ScoreState;
}

export interface GameState {
  currentChord: ChordResult | null;
  userAnswer: string;
  feedback: FeedbackState | null;
  isAnswered: boolean;
}

export interface ProgressState {
  score: ScoreState;
  hasStarted: boolean;
  isCompleted: boolean;
  levelResult: LevelResult | null;
}

export interface TimingState {
  startTime: number | null;
  currentTime: number;
  avgTime: number;
  totalTime: number;
}

export interface UIState {
  showLabels: boolean;
}

export interface Refs {
  inputRef: React.RefObject<HTMLInputElement>;
  timerRef: React.RefObject<number>;
}

export interface StateSetters {
  setCurrentChord: (chord: ChordResult | null) => void;
  setUserAnswer: (answer: string) => void;
  setFeedback: (feedback: FeedbackState | null) => void;
  setIsAnswered: (answered: boolean) => void;
  setScore: (score: ScoreState | ((prev: ScoreState) => ScoreState)) => void;
  setHasStarted: (started: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
  setLevelResult: (result: LevelResult | null) => void;
  setStartTime: (time: number | null) => void;
  setCurrentTime: (time: number) => void;
  setAvgTime: (time: number) => void;
  setTotalTime: (time: number) => void;
  setShowLabels: (show: boolean) => void;
}

export interface StateHelpers {
  resetLevel: () => void;
  resetForNextQuestion: () => void;
  updateScore: (
    isCorrect: boolean,
    timeTaken: number,
    totalProblems: number,
    passAccuracy: number,
    passTime: number,
    moduleType: string,
    category: string,
    level: string
  ) => void;
  startSession: () => void;
}

export interface LevelState extends GameState, ProgressState, TimingState, UIState, Refs, StateSetters {
  gameState: GameState;
  progressState: ProgressState;
  timingState: TimingState;
  uiState: UIState;
  refs: Refs;
  setters: StateSetters;
  helpers: StateHelpers;
  
  // Statistics integration
  statistics: ReturnType<typeof useStatistics>;
  sessionStartTime: string | null;
  sessionToken: string;
}

/**
 * Custom hook that provides all state needed for a chord recognition level
 * @returns Object containing all state variables and their setters
 */
export const useLevelState = (): LevelState => {
  // Initialize statistics hook
  const statistics = useStatistics();
  
  // Session tracking for statistics
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [sessionToken] = useState<string>(() => statistics.generateSessionToken());
  // Core game state
  const [currentChord, setCurrentChord] = useState<ChordResult | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  // Progress and scoring state
  const [score, setScore] = useState<ScoreState>({ correct: 0, total: 0, streak: 0 });
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
  const timerRef = useRef<number>(null);
  
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
  const setters: StateSetters = {
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
  const helpers: StateHelpers = {
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
      setSessionStartTime(null);
      // statistics.clearLastResult();
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
     * Update score with new result and save statistics when level completes
     * @param isCorrect - Whether the answer was correct
     * @param timeTaken - Time taken in seconds
     * @param totalProblems - Total problems in the level
     * @param passAccuracy - Required accuracy to pass
     * @param passTime - Required average time to pass
     * @param moduleType - Module type for statistics
     * @param category - Category for statistics
     * @param level - Level for statistics
     */
    updateScore: (
      isCorrect: boolean,
      timeTaken: number,
      totalProblems: number,
      passAccuracy: number,
      passTime: number,
      moduleType: string,
      category: string,
      level: string
    ) => {
      setScore(prev => {
        const newTotal = prev.total + 1;
        const newTotalTime = totalTime + timeTaken;
        setTotalTime(newTotalTime);
        setAvgTime(newTotalTime / newTotal);
        
        const newScore: ScoreState = {
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: newTotal,
          streak: isCorrect ? prev.streak + 1 : 0
        };
        
        // Check if level is completed
        if (newTotal >= totalProblems) {
          const finalAccuracy = (newScore.correct / newTotal) * 100;
          const finalAvgTime = newTotalTime / newTotal;
          const passed = finalAccuracy >= passAccuracy && finalAvgTime <= passTime;
          
          const levelResult: LevelResult = {
            passed,
            accuracy: finalAccuracy,
            avgTime: finalAvgTime,
            score: newScore
          };
          
          setLevelResult(levelResult);
          setIsCompleted(true);
          
          // Save statistics to server when level is completed
          if (sessionStartTime) {
            const sessionData = {
              moduleType,
              category,
              level,
              accuracy: finalAccuracy,
              avgTime: finalAvgTime,
              totalTime: Math.round(newTotalTime),
              problemsSolved: totalProblems,
              correctAnswers: newScore.correct,
              bestStreak: newScore.streak,
              completed: true,
              passed,
              startTime: sessionStartTime,
              endTime: new Date().toISOString(),
              sessionToken
            };
            
            // Save session asynchronously (don't block UI)
            statistics.saveSession(sessionData).catch(error => {
              console.error('Failed to save session statistics:', error);
            });
          }
        }
        
        return newScore;
      });
    },
    
    /**
     * Start a new session timer for statistics tracking
     */
    startSession: () => {
      setSessionStartTime(new Date().toISOString());
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
    ...setters,
    setters,
    
    // Helper functions
    helpers,
    
    // Statistics integration
    statistics,
    sessionStartTime,
    sessionToken
  };
};