/**
 * Shared Level State Hook
 * 
 * Consolidates all state management that's duplicated across chord recognition levels.
 * This eliminates ~100 lines of duplicated state declarations per level.
 */

import { useState, useRef } from 'react';

/**
 * Custom hook that provides all state needed for a chord recognition level
 * @returns {Object} Object containing all state variables and their setters
 */
export const useLevelState = () => {
  // Core game state
  const [currentChord, setCurrentChord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Progress and scoring state
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResult, setLevelResult] = useState(null);
  
  // Timing state
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  // UI state
  const [showLabels, setShowLabels] = useState(true);
  
  // Refs for DOM elements
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  // Group related state for easier access
  const gameState = {
    currentChord,
    userAnswer,
    feedback,
    isAnswered
  };
  
  const progressState = {
    score,
    hasStarted,
    isCompleted,
    levelResult
  };
  
  const timingState = {
    startTime,
    currentTime,
    avgTime,
    totalTime
  };
  
  const uiState = {
    showLabels
  };
  
  const refs = {
    inputRef,
    timerRef
  };
  
  // All setters grouped for convenience
  const setters = {
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
  const helpers = {
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
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {number} timeTaken - Time taken in seconds
     * @param {number} totalProblems - Total problems in the level
     * @param {number} passAccuracy - Required accuracy to pass
     * @param {number} passTime - Required average time to pass
     */
    updateScore: (isCorrect, timeTaken, totalProblems, passAccuracy, passTime) => {
      setScore(prev => {
        const newTotal = prev.total + 1;
        const newTotalTime = totalTime + timeTaken;
        setTotalTime(newTotalTime);
        setAvgTime(newTotalTime / newTotal);
        
        const newScore = {
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
    ...setters,
    setters,
    
    // Helper functions
    helpers
  };
};