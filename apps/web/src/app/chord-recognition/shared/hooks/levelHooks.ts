// Shared React hooks and utilities for basic-triads levels
import { useEffect } from 'react';

/**
 * Timer hook for tracking elapsed time during level play
 * @param startTime - Start time in milliseconds
 * @param isAnswered - Whether the current question is answered
 * @param setCurrentTime - Function to update current time
 * @param timerRef - Ref to store timer ID
 */
export const useTimer = (
  startTime: number | null,
  isAnswered: boolean,
  setCurrentTime: (time: number) => void,
  timerRef: React.RefObject<number | null>
): void => {
  useEffect(() => {
    if (startTime && !isAnswered) {
      timerRef.current = window.setInterval(() => {
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

/**
 * Handle Enter key press to submit answers
 * @param handleSubmit - Function to handle answer submission
 * @param isAnswered - Whether the current question is answered
 * @returns Keyboard event handler function
 */
export const createHandleKeyPress = (
  handleSubmit: () => void,
  isAnswered: boolean
) => {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };
};