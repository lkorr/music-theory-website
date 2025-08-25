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

interface TimerState {
  currentTime: number;
  avgTime: number;
  totalTime: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => number;
  resetCurrentTimer: () => void;
  resetAllTimers: () => void;
}

export default function useTimer(): TimerState {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start the timer for a new problem
   */
  const startTimer = (): void => {
    const now = Date.now();
    setStartTime(now);
    setCurrentTime(0);
  };

  /**
   * Stop the timer and record the time
   * @returns The time taken for this problem
   */
  const stopTimer = (): number => {
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
  const resetCurrentTimer = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStartTime(null);
    setCurrentTime(0);
  };

  /**
   * Reset all timer state (for level restart)
   */
  const resetAllTimers = (): void => {
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