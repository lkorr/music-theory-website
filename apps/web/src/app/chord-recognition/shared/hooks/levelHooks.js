// Shared React hooks and utilities for basic-triads levels
import { useEffect } from 'react';

// Timer hook for tracking elapsed time during level play
export const useTimer = (startTime, isAnswered, setCurrentTime, timerRef) => {
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

// Handle Enter key press to submit answers
export const createHandleKeyPress = (handleSubmit, isAnswered) => {
  return (e) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };
};