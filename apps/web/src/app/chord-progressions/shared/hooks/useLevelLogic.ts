/**
 * Level Logic Hook for Chord Progressions 2
 * 
 * Contains all game logic for chord progression levels:
 * - Progression generation and validation
 * - Score calculation and timing
 * - Level completion assessment
 * - Input handling and auto-advance
 */

import { useEffect, useCallback } from 'react';
import { generateProgression, validateProgressionAnswer, playChordProgression } from '../utils/progressionLogic';
import type { LevelConfig } from '../../data/levelConfigs';
import type { LevelState, Score, LevelResult, Feedback } from './useLevelState';

export interface LevelLogic {
  // Core actions
  startLevel: () => void;
  generateNewProgression: () => void;
  submitAnswer: () => void;
  nextProgression: () => void;
  
  // Input handling
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Audio control
  playProgression: () => Promise<void>;
  handleVolumeChange: (volume: number) => void;
  
  // Computed properties
  canSubmit: boolean;
  progress: number;
  timeRemaining: number;
}

export function useLevelLogic(
  state: LevelState & {
    setHasStarted: (value: boolean) => void;
    setIsCompleted: (value: boolean) => void;
    setCurrentProgression: (value: any) => void;
    setUserAnswer: (value: string) => void;
    setScore: (value: Score) => void;
    setCurrentProblemIndex: (value: number) => void;
    setStartTime: (value: number | null) => void;
    setCurrentTime: (value: number) => void;
    setAvgTime: (value: number) => void;
    setProblemTimes: (value: number[]) => void;
    setFeedback: (value: Feedback | null) => void;
    setLevelResult: (value: LevelResult | null) => void;
    setIsPlaying: (value: boolean) => void;
    setVolume: (value: number) => void;
    setPlayCount: (value: number) => void;
  },
  config: LevelConfig
): LevelLogic {
  
  // Computed properties (moved up to avoid circular dependencies)
  const canSubmit = Boolean(
    state.currentProgression && 
    state.userAnswer.trim() && 
    !state.feedback?.show &&
    !state.isPlaying
  );
  
  const progress = config.totalProblems > 0 
    ? Math.min((state.score.total / config.totalProblems) * 100, 100)
    : 0;
  
  const timeRemaining = Math.max(0, config.passTime - state.currentTime);
  
  /**
   * Complete the level and calculate final results
   */
  const completeLevel = useCallback(() => {
    const accuracy = state.score.total > 0 ? (state.score.correct / state.score.total) * 100 : 0;
    const passed = accuracy >= config.passAccuracy && state.avgTime <= config.passTime;
    
    const result: LevelResult = {
      passed,
      accuracy,
      avgTime: state.avgTime,
      score: state.score
    };
    
    state.setLevelResult(result);
    state.setIsCompleted(true);
  }, [state.score, state.avgTime, config.passAccuracy, config.passTime]);
  
  /**
   * Generate a new chord progression
   */
  const generateNewProgression = useCallback(() => {
    try {
      const progression = generateProgression(config.progressionGeneration);
      state.setCurrentProgression(progression);
      state.setUserAnswer('');
      state.setFeedback(null);
      state.setStartTime(Date.now());
      state.setCurrentTime(0);
      state.setPlayCount(0);
      
      // Focus input after a short delay
      setTimeout(() => {
        state.inputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Failed to generate progression:', error);
    }
  }, [config.progressionGeneration]);
  
  /**
   * Move to the next progression
   */
  const nextProgression = useCallback(() => {
    if (state.score.total < config.totalProblems) {
      generateNewProgression();
    } else {
      completeLevel();
    }
  }, [state.score.total, config.totalProblems, generateNewProgression, completeLevel]);
  
  /**
   * Start the level
   */
  const startLevel = useCallback(() => {
    state.setHasStarted(true);
    state.setStartTime(Date.now());
    generateNewProgression();
  }, [generateNewProgression]);
  
  /**
   * Submit the current answer
   */
  const submitAnswer = useCallback(() => {
    if (!state.currentProgression || !state.userAnswer.trim() || state.feedback?.show) {
      return;
    }
    
    const isCorrect = validateProgressionAnswer(
      state.userAnswer.trim(),
      state.currentProgression.expectedAnswer
    );
    
    // Record timing
    const problemTime = state.currentTime;
    const newProblemTimes = [...state.problemTimes, problemTime];
    state.setProblemTimes(newProblemTimes);
    
    // Update score
    const newScore: Score = {
      correct: state.score.correct + (isCorrect ? 1 : 0),
      total: state.score.total + 1
    };
    state.setScore(newScore);
    state.setCurrentProblemIndex(newScore.total);
    
    // Calculate average time
    const newAvgTime = newProblemTimes.reduce((sum, time) => sum + time, 0) / newProblemTimes.length;
    state.setAvgTime(newAvgTime);
    
    // Show feedback
    const feedback: Feedback = {
      show: true,
      isCorrect,
      expectedAnswer: isCorrect ? undefined : state.currentProgression.expectedAnswer
    };
    state.setFeedback(feedback);
    
  }, [state.currentProgression, state.userAnswer, state.currentTime, state.problemTimes, state.score]);
  
  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    state.setUserAnswer(e.target.value);
  }, []);
  
  /**
   * Handle key press (Enter to submit)
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSubmit) {
      submitAnswer();
    }
  }, [canSubmit, submitAnswer]);
  
  /**
   * Play the current progression
   */
  const playProgression = useCallback(async (): Promise<void> => {
    if (!state.currentProgression || state.isPlaying) return;
    
    state.setIsPlaying(true);
    state.setPlayCount(prev => prev + 1);
    
    try {
      await playChordProgression(
        state.currentProgression.chords,
        config.audioConfig.tempo,
        config.audioConfig.chordDuration
      );
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      state.setIsPlaying(false);
    }
  }, [state.currentProgression, state.isPlaying, config.audioConfig]);
  
  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback((volume: number) => {
    state.setVolume(volume);
  }, []);
  
  // Timer effect for tracking problem time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.hasStarted && !state.isCompleted && state.startTime && !state.feedback?.show) {
      interval = setInterval(() => {
        const newTime = (Date.now() - state.startTime!) / 1000;
        state.setCurrentTime(newTime);
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.hasStarted, state.isCompleted, state.startTime, state.feedback?.show]);
  
  // Auto-play progression when new one is generated
  useEffect(() => {
    if (state.currentProgression && state.playCount === 0 && state.hasStarted) {
      playProgression();
    }
  }, [state.currentProgression, state.playCount, state.hasStarted, playProgression]);
  
  // Auto-advance after feedback is shown
  useEffect(() => {
    if (state.feedback?.show) {
      const delay = state.feedback.isCorrect 
        ? config.autoAdvance.correctDelay 
        : config.autoAdvance.incorrectDelay;
      
      const timer = setTimeout(() => {
        if (state.score.total < config.totalProblems) {
          nextProgression();
        } else {
          completeLevel();
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [state.feedback, config.autoAdvance, config.totalProblems, state.score.total, nextProgression, completeLevel]);
  
  return {
    // Core actions
    startLevel,
    generateNewProgression,
    submitAnswer,
    nextProgression,
    
    // Input handling
    handleInputChange,
    handleKeyPress,
    
    // Audio control
    playProgression,
    handleVolumeChange,
    
    // Computed properties
    canSubmit,
    progress,
    timeRemaining
  };
}