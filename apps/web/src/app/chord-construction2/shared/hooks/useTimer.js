/**
 * Timer Hook for Chord Construction
 * 
 * This hook manages timing functionality for chord construction exercises:
 * - Current problem timer
 * - Average time calculation
 * - Total time tracking
 * - Timer start/stop/reset functionality
 * 
 * Features:
 * - Automatic timer updates every 100ms
 * - Proper cleanup of intervals
 * - Average time calculation with running totals
 * - Reset functionality for new problems
 */

import { useState, useEffect, useRef } from 'react';

export default function useTimer() {
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const timerRef = useRef(null);

  /**
   * Start the timer for a new problem
   */
  const startTimer = () => {
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
  };

  /**
   * Stop the timer and record the time
   * @returns {number} The time taken for this problem
   */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const problemTime = currentTime;
    const newTotalTime = totalTime + problemTime;
    const newProblemCount = problemCount + 1;
    const newAvgTime = newTotalTime / newProblemCount;
    
    setTotalTime(newTotalTime);
    setProblemCount(newProblemCount);
    setAvgTime(newAvgTime);
    setStartTime(null);
    
    return problemTime;
  };

  /**
   * Reset timer for a new problem without affecting totals
   */
  const resetCurrentTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStartTime(null);
    setCurrentTime(0);
  };

  /**
   * Reset all timer state (for level restart)
   */
  const resetAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStartTime(null);
    setCurrentTime(0);
    setTotalTime(0);
    setAvgTime(0);
    setProblemCount(0);
  };

  /**
   * Effect to handle timer updates
   */
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(elapsed);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Cleanup interval on unmount or when startTime changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  /**
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // Current state
    currentTime,
    avgTime,
    totalTime,
    isRunning: startTime !== null,
    
    // Actions
    startTimer,
    stopTimer,
    resetCurrentTimer,
    resetAllTimers
  };
}