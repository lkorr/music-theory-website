/**
 * Shared Level Logic Hook
 * 
 * Consolidates all event handlers and game flow logic that's duplicated across levels.
 * This eliminates ~180 lines of duplicated handler functions per level.
 */

import { useCallback } from 'react';
import { useTimer, createHandleKeyPress } from './levelHooks';

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
  accuracy: number;
  averageTime: number;
  hasCompleted: boolean;
  hasPassed: boolean;
}

export interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  timeTaken: number;
}

export interface LevelStateHelpers {
  resetForNextQuestion: () => void;
  updateScore: (isCorrect: boolean, timeTaken: number, totalProblems: number, passAccuracy: number, passTime: number) => void;
  resetLevel: () => void;
}

export interface LevelState {
  currentChord: ChordResult | null;
  feedback: FeedbackState | null;
  score: ScoreState;
  startTime: number | null;
  isAnswered: boolean;
  userAnswer: string;
  totalTime: number;
  inputRef: React.RefObject<HTMLInputElement>;
  timerRef: React.RefObject<number>;
  setCurrentChord: (chord: ChordResult | null) => void;
  setUserAnswer: (answer: string) => void;
  setFeedback: (feedback: FeedbackState | null) => void;
  setIsAnswered: (answered: boolean) => void;
  setHasStarted: (started: boolean) => void;
  setStartTime: (time: number | null) => void;
  setCurrentTime: (time: number) => void;
  helpers: LevelStateHelpers;
}

export interface LevelConfig {
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  autoAdvance: {
    correctDelay: number;
    incorrectDelay: number;
  };
}

export interface LevelDependencies {
  generateChord: (previousChord?: ChordResult | null) => ChordResult;
  validateAnswer: (userAnswer: string, expectedAnswer: string) => boolean;
}

export interface LevelLogicResult {
  startLevel: () => void;
  nextChord: () => void;
  handleSubmit: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restartLevel: () => void;
  canSubmit: boolean;
  focusInput: () => void;
}

/**
 * Custom hook that provides all game logic for a chord recognition level
 * @param state - Level state from useLevelState hook
 * @param config - Level configuration object
 * @param dependencies - Level-specific functions
 * @returns Object containing all event handlers and logic functions
 */
export const useLevelLogic = (
  state: LevelState, 
  config: LevelConfig, 
  dependencies: LevelDependencies
): LevelLogicResult => {
  const { generateChord, validateAnswer } = dependencies;
  
  // Destructure state for easier access
  const {
    currentChord,
    feedback,
    score,
    startTime,
    isAnswered,
    userAnswer,
    totalTime,
    inputRef,
    timerRef,
    setCurrentChord,
    setUserAnswer,
    setFeedback,
    setIsAnswered,
    setHasStarted,
    setStartTime,
    setCurrentTime,
    helpers
  } = state;
  
  // Initialize timer using existing hook
  useTimer(startTime, isAnswered, setCurrentTime, timerRef);
  
  /**
   * Start the level - initialize first chord and timer
   */
  const startLevel = useCallback(() => {
    setHasStarted(true);
    const firstChord = generateChord(currentChord);
    setCurrentChord(firstChord);
    
    // Start timer for first problem
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
    
    // Focus the input after a brief delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [currentChord, generateChord, setHasStarted, setCurrentChord, setStartTime, setCurrentTime, inputRef]);
  
  /**
   * Move to next chord - reset state for new question
   */
  const nextChord = useCallback(() => {
    const newChord = generateChord(currentChord);
    setCurrentChord(newChord);
    
    // Reset question-specific state
    helpers.resetForNextQuestion();
    
    // Start timer for new problem
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
    
    // Focus the input after a brief delay to ensure DOM is updated
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, [currentChord, generateChord, setCurrentChord, helpers, setStartTime, setCurrentTime, inputRef]);
  
  /**
   * Handle answer submission - validate, score, and advance
   */
  const handleSubmit = useCallback(() => {
    if (!currentChord || !userAnswer.trim() || !startTime) return;
    
    // Calculate time taken for this problem
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    
    // Validate the answer using level-specific validator
    const isCorrect = validateAnswer(userAnswer, currentChord.expectedAnswer || currentChord.name);
    
    // Set feedback for display
    const correctAnswer = currentChord.expectedAnswer || currentChord.name;
    setFeedback({
      show: true,
      isCorrect,
      correctAnswer,
      userAnswer: userAnswer.trim(),
      timeTaken: timeTaken
    });
    
    // Update score and check completion
    helpers.updateScore(
      isCorrect, 
      timeTaken, 
      config.totalProblems, 
      config.passAccuracy, 
      config.passTime
    );
    
    setIsAnswered(true);
    
    // Auto-advance only for correct answers
    if (isCorrect) {
      setTimeout(() => {
        if (score.total + 1 < config.totalProblems) {
          nextChord();
        }
      }, config.autoAdvance.correctDelay);
    }
    // For incorrect answers, wait for manual continuation
  }, [
    currentChord, 
    userAnswer, 
    startTime, 
    validateAnswer, 
    setFeedback, 
    helpers, 
    config.totalProblems, 
    config.passAccuracy, 
    config.passTime,
    config.autoAdvance,
    setIsAnswered, 
    score.total, 
    nextChord
  ]);
  
  /**
   * Handle keyboard input (Enter to submit or continue)
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isAnswered) {
        // Submit answer if not answered yet
        handleSubmit();
      } else if (feedback && feedback.show && !feedback.isCorrect && score.total < config.totalProblems) {
        // Continue to next question if wrong answer
        nextChord();
      }
    }
  }, [isAnswered, handleSubmit, feedback, score.total, config.totalProblems, nextChord]);
  
  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  }, [setUserAnswer]);
  
  /**
   * Restart the current level
   */
  const restartLevel = useCallback(() => {
    helpers.resetLevel();
    startLevel();
  }, [helpers, startLevel]);
  
  /**
   * Check if user can submit (has answer and not already answered)
   */
  const canSubmit = Boolean(userAnswer.trim() && !isAnswered && currentChord);
  
  return {
    // Core game flow handlers
    startLevel,
    nextChord,
    handleSubmit,
    handleKeyPress,
    handleInputChange,
    restartLevel,
    
    // State checks
    canSubmit,
    
    // Utility functions
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
};