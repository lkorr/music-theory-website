/**
 * Level State Management Hook for Chord Progressions 2
 * 
 * Manages all state for chord progression levels including:
 * - Current progression and user input
 * - Score tracking and timing
 * - Game flow and completion state
 * - Feedback and validation results
 * - Statistics tracking integration
 */

import { useState, useRef } from 'react';
import { useStatistics } from './useStatistics';
import type { ChordProgression } from '../utils/progressionLogic';
import type { LevelConfig } from '../../data/levelConfigs';

export interface Score {
  correct: number;
  total: number;
}

export interface Feedback {
  show: boolean;
  isCorrect: boolean;
  expectedAnswer?: string;
}

export interface LevelResult {
  passed: boolean;
  accuracy: number;
  avgTime: number;
  score: Score;
}

export interface LevelState {
  // Game state
  hasStarted: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  
  // Current progression
  currentProgression: ChordProgression | null;
  userAnswer: string;
  
  // Scoring and progress
  score: Score;
  currentProblemIndex: number;
  
  // Timing
  startTime: number | null;
  currentTime: number;
  avgTime: number;
  problemTimes: number[];
  
  // Feedback
  feedback: Feedback | null;
  
  // Level completion
  levelResult: LevelResult | null;
  
  // Audio state
  isPlaying: boolean;
  volume: number;
  playCount: number;
  
  // UI refs
  inputRef: React.RefObject<HTMLInputElement>;
  
  // Statistics tracking
  sessionStartTime: string | null;
  sessionToken: string;
  statistics: ReturnType<typeof useStatistics>;
}

export function useLevelState(config?: LevelConfig): LevelState {
  // Game flow state
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Current progression and input
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  
  // Score tracking
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  
  // Timing state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [avgTime, setAvgTime] = useState<number>(0);
  const [problemTimes, setProblemTimes] = useState<number[]>([]);
  
  // Feedback state
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  // Level completion
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [playCount, setPlayCount] = useState<number>(0);
  
  // UI refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Statistics integration
  const statistics = useStatistics();
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [sessionToken] = useState<string>(() => statistics.generateSessionToken());
  
  return {
    // Game state
    hasStarted,
    isCompleted,
    isPaused,
    
    // Current progression
    currentProgression,
    userAnswer,
    
    // Scoring and progress
    score,
    currentProblemIndex,
    
    // Timing
    startTime,
    currentTime,
    avgTime,
    problemTimes,
    
    // Feedback
    feedback,
    
    // Level completion
    levelResult,
    
    // Audio state
    isPlaying,
    volume,
    playCount,
    
    // UI refs
    inputRef,
    
    // Statistics tracking
    sessionStartTime,
    sessionToken,
    statistics,
    
    // State setters (exposed for the logic hook)
    setHasStarted,
    setIsCompleted,
    setIsPaused,
    setCurrentProgression,
    setUserAnswer,
    setScore,
    setCurrentProblemIndex,
    setStartTime,
    setCurrentTime,
    setAvgTime,
    setProblemTimes,
    setFeedback,
    setLevelResult,
    setIsPlaying,
    setVolume,
    setPlayCount,
    setSessionStartTime
  } as LevelState & {
    setHasStarted: (value: boolean) => void;
    setIsCompleted: (value: boolean) => void;
    setIsPaused: (value: boolean) => void;
    setCurrentProgression: (value: ChordProgression | null) => void;
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
    setSessionStartTime: (value: string | null) => void;
  };
}