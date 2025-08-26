/**
 * Shared Level Logic Hook
 * 
 * Consolidates all event handlers and game flow logic that's duplicated across levels.
 * This eliminates ~180 lines of duplicated handler functions per level.
 */

import { useCallback, useEffect } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TimerRef {
  current: NodeJS.Timeout | null;
}

interface ChordData {
  chords?: any[];
  expectedAnswer?: string;
  answer?: string;
  name?: string;
}

interface Feedback {
  show: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  expectedAnswer: string;
  userAnswer: string;
  timeTaken: number;
}

interface Score {
  correct: number;
  total: number;
  streak: number;
}

interface Helpers {
  resetForNextQuestion: () => void;
  updateScore: (
    isCorrect: boolean, 
    timeTaken: number, 
    totalProblems: number, 
    passAccuracy: number, 
    passTime: number
  ) => void;
  resetLevel: () => void;
}

interface AutoAdvanceConfig {
  correctDelay: number;
  incorrectDelay: number;
}

interface LevelState {
  currentChord: ChordData | null;
  feedback: Feedback | null;
  score: Score;
  startTime: number | null;
  isAnswered: boolean;
  userAnswer: string;
  totalTime: number;
  inputRef: React.RefObject<HTMLInputElement>;
  timerRef: TimerRef;
  setCurrentChord: (chord: ChordData | null) => void;
  setUserAnswer: (answer: string) => void;
  setFeedback: (feedback: Feedback | null) => void;
  setIsAnswered: (isAnswered: boolean) => void;
  setHasStarted: (hasStarted: boolean) => void;
  setStartTime: (startTime: number | null) => void;
  setCurrentTime: (currentTime: number) => void;
  helpers: Helpers;
}

interface LevelConfig {
  totalProblems: number;
  passAccuracy: number;
  passTime: number;
  autoAdvance: AutoAdvanceConfig;
}

interface Dependencies {
  generateChord: (currentChord: ChordData | null) => ChordData;
  validateAnswer: (userAnswer: string, correctAnswer: string) => boolean;
}

interface LevelLogicReturn {
  // Core game flow handlers
  startLevel: () => void;
  nextChord: () => void;
  handleSubmit: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restartLevel: () => void;
  
  // State checks
  canSubmit: boolean;
  
  // Utility functions
  focusInput: () => void;
}

// ============================================================================
// TIMER HOOK
// ============================================================================

/**
 * Inline timer hook for tracking elapsed time during level play
 */
const useTimer = (
  startTime: number | null, 
  isAnswered: boolean, 
  setCurrentTime: (time: number) => void, 
  timerRef: TimerRef
): void => {
  useEffect(() => {
    if (startTime && !isAnswered) {
      timerRef.current = setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isAnswered, setCurrentTime, timerRef]);
};

// ============================================================================
// MAIN HOOK
// ============================================================================

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
  dependencies: Dependencies
): LevelLogicReturn => {
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
    try {
      setHasStarted(true);
      const firstChord = generateChord(currentChord);
      
      // Ensure the chord was generated successfully
      if (!firstChord || !firstChord.chords || firstChord.chords.length === 0) {
        console.error('Failed to generate initial chord progression:', firstChord);
        // Try generating again
        const retryChord = generateChord(null);
        if (retryChord && retryChord.chords && retryChord.chords.length > 0) {
          setCurrentChord(retryChord);
        } else {
          console.error('Failed to generate chord progression after retry');
          // Generate a fallback error message for the user
          alert('Failed to generate chord progression. Please refresh the page.');
          return;
        }
      } else {
        setCurrentChord(firstChord);
      }
      
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
    } catch (error) {
      console.error('Error starting level:', error);
      alert('An error occurred while starting the level. Please refresh the page.');
    }
  }, [currentChord, generateChord, setHasStarted, setCurrentChord, setStartTime, setCurrentTime, inputRef]);
  
  /**
   * Move to next chord - reset state for new question
   */
  const nextChord = useCallback(() => {
    try {
      const newChord = generateChord(currentChord);
      
      // Ensure the chord was generated successfully
      if (!newChord || !newChord.chords || newChord.chords.length === 0) {
        console.error('Failed to generate next chord progression:', newChord);
        // Try generating again
        const retryChord = generateChord(null);
        if (retryChord && retryChord.chords && retryChord.chords.length > 0) {
          setCurrentChord(retryChord);
        } else {
          console.error('Failed to generate chord progression after retry');
          alert('Failed to generate next chord progression. Please refresh the page.');
          return;
        }
      } else {
        setCurrentChord(newChord);
      }
      
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
    } catch (error) {
      console.error('Error generating next chord:', error);
      alert('An error occurred while generating the next chord. Please refresh the page.');
    }
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
    const isCorrect = validateAnswer(userAnswer, currentChord.expectedAnswer || currentChord.answer || currentChord.name || '');
    
    // Set feedback for display
    const correctAnswer = currentChord.expectedAnswer || currentChord.answer || currentChord.name || '';
    setFeedback({
      show: true,
      isCorrect,
      correctAnswer,
      expectedAnswer: correctAnswer, // Add expectedAnswer property for page template
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