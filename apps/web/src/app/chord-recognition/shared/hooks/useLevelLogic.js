/**
 * Shared Level Logic Hook
 * 
 * Consolidates all event handlers and game flow logic that's duplicated across levels.
 * This eliminates ~180 lines of duplicated handler functions per level.
 */

import { useCallback } from 'react';
import { useTimer, createHandleKeyPress } from './levelHooks.js';

/**
 * Custom hook that provides all game logic for a chord recognition level
 * @param {Object} state - Level state from useLevelState hook
 * @param {Object} config - Level configuration object
 * @param {Object} dependencies - Level-specific functions
 * @param {Function} dependencies.generateChord - Function to generate chords
 * @param {Function} dependencies.validateAnswer - Function to validate answers
 * @returns {Object} Object containing all event handlers and logic functions
 */
export const useLevelLogic = (state, config, dependencies) => {
  const { generateChord, validateAnswer } = dependencies;
  
  // Destructure state for easier access
  const {
    currentChord,
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
    setFeedback({
      isCorrect,
      correctAnswer: currentChord.expectedAnswer || currentChord.name,
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
    
    // Auto-advance based on configuration
    const delay = isCorrect 
      ? config.autoAdvance.correctDelay 
      : config.autoAdvance.incorrectDelay;
      
    setTimeout(() => {
      if (score.total + 1 < config.totalProblems) {
        nextChord();
      }
    }, delay);
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
   * Handle keyboard input (Enter to submit, etc.)
   */
  const handleKeyPress = createHandleKeyPress(handleSubmit, isAnswered);
  
  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e) => {
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