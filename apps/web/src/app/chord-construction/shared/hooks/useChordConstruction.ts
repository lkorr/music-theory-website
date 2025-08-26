/**
 * Chord Construction Game Logic Hook
 * 
 * This hook manages all the game state and logic for chord construction exercises:
 * - Game state management (started, completed, current task)
 * - Score tracking (correct, total, streak)
 * - Note placement and validation
 * - Task generation based on level configuration
 * - Feedback handling
 * - Level completion detection
 * 
 * Features:
 * - Configuration-driven task generation
 * - Inversion handling for different level requirements
 * - Comprehensive chord validation
 * - Automatic level progression
 * - State reset functionality
 */

import { useState, useRef } from 'react';
import { noteNames } from "../../../chord-recognition/shared/theory/core/notes.js";
import { chordTypes, extendedChordTypes, inversionTypes } from "../../../chord-recognition/shared/theory/core/constants.js";
import type { ChordData } from "../../../chord-recognition/shared/theory/core/constants.js";
import type { LevelConfig } from "../../data/levelConfigs.js";

interface ConstructionTask {
  root: string;
  chordType: string;
  inversion: string;
  chordName: string;
  description: string;
  expectedNotes: number[];
}

interface FeedbackData {
  isCorrect: boolean;
  expectedNotes: number[];
  placedNotes: number[];
  time: number;
}

interface ScoreData {
  correct: number;
  total: number;
  streak: number;
}

interface LevelResult {
  passed: boolean;
  accuracy: number;
  avgTime: number;
}

interface StatisticsCallback {
  (data: {
    moduleType: string;
    category: string;
    level: string;
    accuracy: number;
    avgTime: number;
    totalTime: number;
    problemsSolved: number;
    correctAnswers: number;
    bestStreak: number;
    completed: boolean;
    passed: boolean;
    startTime: string;
    endTime: string;
    sessionToken: string;
  }): Promise<void>;
}

interface ChordConstructionState {
  hasStarted: boolean;
  isCompleted: boolean;
  currentTask: ConstructionTask | null;
  placedNotes: number[];
  feedback: FeedbackData | null;
  isAnswered: boolean;
  showSolution: boolean;
  score: ScoreData;
  levelResult: LevelResult | null;
  sessionToken: string;
  sessionStartTime: string | null;
  bestStreak: number;
  startLevel: () => void;
  nextTask: () => void;
  handleNoteToggle: (midiNote: number) => void;
  submitAnswer: (onTimerStop?: () => number, getAvgTime?: () => number, getTotalTime?: () => number, onStatisticsSave?: StatisticsCallback) => { isCorrect: boolean; newScore: ScoreData } | undefined;
  clearAllNotes: () => void;
  resetLevel: () => void;
  setShowSolution: (show: boolean) => void;
  generateNewSessionToken: () => void;
  setStatisticsCallback: (callback: StatisticsCallback, category: string, level: string) => void;
}

export default function useChordConstruction(levelConfig: LevelConfig): ChordConstructionState {
  // Statistics callback
  const statisticsCallbackRef = useRef<StatisticsCallback | null>(null);
  const categoryRef = useRef<string>('');
  const levelRef = useRef<string>('');
  // Game state
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTask, setCurrentTask] = useState<ConstructionTask | null>(null);
  const [placedNotes, setPlacedNotes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  
  // Score tracking
  const [score, setScore] = useState<ScoreData>({ correct: 0, total: 0, streak: 0 });
  
  // Session tracking for statistics
  const [sessionToken, setSessionToken] = useState<string>('');
  const startTimeRef = useRef<Date | null>(null);
  const bestStreakRef = useRef<number>(0);
  
  /**
   * Generate a unique session token for anti-cheat protection
   */
  const generateSessionToken = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Generate a new session token
   */
  const generateNewSessionToken = (): void => {
    const newToken = generateSessionToken();
    setSessionToken(newToken);
  };
  
  /**
   * Set statistics callback for saving
   */
  const setStatisticsCallback = (callback: StatisticsCallback, category: string, level: string): void => {
    statisticsCallbackRef.current = callback;
    categoryRef.current = category;
    levelRef.current = level;
  };

  /**
   * Generate a new chord construction task based on level configuration
   */
  const generateConstructionTask = (previousTask: ConstructionTask | null = null): ConstructionTask => {
    const { chordGeneration } = levelConfig;
    
    // Determine available roots based on level
    const availableRoots = chordGeneration.roots || ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const availableChordTypes = chordGeneration.chordTypes || ['major', 'minor', 'diminished', 'augmented'];
    
    let root: string, chordTypeKey: string, inversion: string, attempt = 0;
    
    // Prevent exact same task appearing twice in a row
    do {
      root = availableRoots[Math.floor(Math.random() * availableRoots.length)];
      chordTypeKey = availableChordTypes[Math.floor(Math.random() * availableChordTypes.length)];
      
      // Handle inversion logic based on level configuration
      if (!chordGeneration.allowInversions) {
        // Root position only
        inversion = 'root';
      } else if (chordGeneration.requireSpecificInversion === 'first') {
        // Force first inversion or mix with root
        if (Math.random() < 0.5) {
          inversion = 'root';
        } else {
          // First inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = availableChordTypes.filter((type: string) => type !== 'augmented');
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'first';
        }
      } else if (chordGeneration.allowInversions && !chordGeneration.requireSpecificInversion) {
        // All inversions allowed
        const inversionChoice = Math.random();
        if (inversionChoice < 0.33) {
          inversion = 'root';
        } else if (inversionChoice < 0.67) {
          // First inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = availableChordTypes.filter((type: string) => type !== 'augmented');
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'first';
        } else {
          // Second inversion (exclude augmented)
          if (chordTypeKey === 'augmented') {
            const nonAugmentedChords = availableChordTypes.filter((type: string) => type !== 'augmented');
            chordTypeKey = nonAugmentedChords[Math.floor(Math.random() * nonAugmentedChords.length)];
          }
          inversion = 'second';
        }
      } else {
        inversion = 'root';
      }
      
      attempt++;
      if (attempt > 20) break; // Prevent infinite loops
      
    } while (previousTask && 
             previousTask.root === root && 
             previousTask.chordType === chordTypeKey &&
             previousTask.inversion === inversion);
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9', 'maj11', 'min11', 'maj13', 'min13'].includes(chordTypeKey);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    const chordType = chordTypesObj[chordTypeKey] as ChordData;
    
    // Choose octave (avoid too high octaves for inversions)
    const baseOctaves = inversion === 'root' ? [48, 60, 72] : [48, 60]; // C3, C4 (C5 only for root)
    const baseOctave = baseOctaves[Math.floor(Math.random() * baseOctaves.length)];
    
    const rootNoteNumber = noteNames.indexOf(root);
    const baseRoot = rootNoteNumber + baseOctave;
    const intervals = chordType.intervals;
    
    let expectedNotes: number[];
    let inversionDescription: string = '';
    let chordName = root + chordType.symbol;
    
    if (inversion === 'root') {
      // Root position
      expectedNotes = intervals.map(interval => baseRoot + interval);
      inversionDescription = '';
    } else {
      // Apply inversion
      const inversionData = inversionTypes[inversion];
      const inversionOrder = inversionData.intervalOrder;
      const reorderedIntervals = inversionOrder.map(index => intervals[index]);
      
      // Create notes with proper voicing for inversion
      expectedNotes = [];
      
      for (let i = 0; i < reorderedIntervals.length; i++) {
        if (i === 0) {
          expectedNotes.push(baseRoot + reorderedIntervals[i]);
        } else {
          let nextNote = baseRoot + reorderedIntervals[i];
          // Ensure ascending order
          while (nextNote <= expectedNotes[expectedNotes.length - 1]) {
            nextNote += 12;
          }
          expectedNotes.push(nextNote);
        }
      }
      
      // Create chord name with slash notation for inversions
      if (inversion === 'first') {
        inversionDescription = ' in 1st inversion';
        const rootIndex = noteNames.indexOf(root);
        const bassInterval = intervals[1];
        const bassNote = noteNames[(rootIndex + bassInterval) % 12];
        chordName += `/${bassNote}`;
      } else if (inversion === 'second') {
        inversionDescription = ' in 2nd inversion';
        const rootIndex = noteNames.indexOf(root);
        const bassInterval = intervals[2];
        const bassNote = noteNames[(rootIndex + bassInterval) % 12];
        chordName += `/${bassNote}`;
      }
    }
    
    // Ensure notes are within piano range
    const validNotes = expectedNotes.filter(note => note >= 36 && note <= 84);
    
    return {
      root,
      chordType: chordTypeKey,
      inversion,
      chordName,
      description: `${root} ${chordType.name}${inversionDescription}`,
      expectedNotes: validNotes
    };
  };

  /**
   * Validate the placed chord against the expected chord
   */
  const validateChord = (task: ConstructionTask, notes: number[]): boolean => {
    if (!task || notes.length === 0) return false;
    
    // Determine which chord types object to use
    const isExtendedChord = ['major7', 'minor7', 'dominant7', 'diminished7', 'halfDiminished7', 'minor7b5', 'maj9', 'min9', 'dom9', 'maj11', 'min11', 'maj13', 'min13'].includes(task.chordType);
    const chordTypesObj = isExtendedChord ? extendedChordTypes : chordTypes;
    
    // Check correct number of notes
    const expectedNoteCount = (chordTypesObj[task.chordType] as ChordData).intervals.length;
    if (notes.length !== expectedNoteCount) return false;
    
    const sortedPlacedNotes = [...notes].sort((a, b) => a - b);
    const placedSemitones = sortedPlacedNotes.map(note => note % 12);
    
    // Get the expected chord structure for the inversion
    const baseIntervals = (chordTypesObj[task.chordType] as ChordData).intervals;
    let expectedSemitonePattern: number[];
    
    if (!task.inversion || task.inversion === 'root') {
      // Root position
      const rootSemitone = noteNames.indexOf(task.root) % 12;
      expectedSemitonePattern = baseIntervals.map(interval => (rootSemitone + interval) % 12);
    } else if (task.inversion === 'first') {
      // First inversion: third in bass
      const rootSemitone = noteNames.indexOf(task.root) % 12;
      const thirdSemitone = (rootSemitone + baseIntervals[1]) % 12;
      const fifthSemitone = (rootSemitone + baseIntervals[2]) % 12;
      const octaveRootSemitone = rootSemitone;
      expectedSemitonePattern = [thirdSemitone, fifthSemitone, octaveRootSemitone];
    } else if (task.inversion === 'second') {
      // Second inversion: fifth in bass
      const rootSemitone = noteNames.indexOf(task.root) % 12;
      const fifthSemitone = (rootSemitone + baseIntervals[2]) % 12;
      const octaveRootSemitone = rootSemitone;
      const thirdSemitone = (rootSemitone + baseIntervals[1]) % 12;
      expectedSemitonePattern = [fifthSemitone, octaveRootSemitone, thirdSemitone];
    } else {
      expectedSemitonePattern = [];
    }
    
    // Sort both patterns for comparison
    const sortedExpected = [...expectedSemitonePattern].sort((a, b) => a - b);
    const sortedPlaced = [...placedSemitones].sort((a, b) => a - b);
    
    // For inversion validation, check bass note
    if (task.inversion === 'first') {
      const expectedBass = (noteNames.indexOf(task.root) + baseIntervals[1]) % 12;
      const actualBass = placedSemitones[0];
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    } else if (task.inversion === 'second') {
      const expectedBass = (noteNames.indexOf(task.root) + baseIntervals[2]) % 12;
      const actualBass = placedSemitones[0];
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    } else {
      // Root position: bass should be root
      const expectedBass = noteNames.indexOf(task.root) % 12;
      const actualBass = placedSemitones[0];
      return sortedExpected.length === sortedPlaced.length &&
             sortedExpected.every((semitone, index) => semitone === sortedPlaced[index]) &&
             expectedBass === actualBass;
    }
  };

  /**
   * Start the level
   */
  const startLevel = (): void => {
    setHasStarted(true);
    const task = generateConstructionTask();
    setCurrentTask(task);
    setScore({ correct: 0, total: 0, streak: 0 });
    setPlacedNotes([]);
    setFeedback(null);
    setIsAnswered(false);
    
    // Initialize session tracking
    generateNewSessionToken();
    startTimeRef.current = new Date();
    bestStreakRef.current = 0;
  };

  /**
   * Move to next task
   */
  const nextTask = (): void => {
    const task = generateConstructionTask(currentTask);
    setCurrentTask(task);
    setPlacedNotes([]);
    setFeedback(null);
    setIsAnswered(false);
    setShowSolution(false);
  };

  /**
   * Handle note placement/removal
   */
  const handleNoteToggle = (midiNote: number): void => {
    if (isAnswered) return;
    
    const noteIndex = placedNotes.indexOf(midiNote);
    if (noteIndex === -1) {
      // Add note
      setPlacedNotes([...placedNotes, midiNote]);
    } else {
      // Remove note
      setPlacedNotes(placedNotes.filter(note => note !== midiNote));
    }
  };

  /**
   * Submit the current answer
   */
  const submitAnswer = (
    onTimerStop?: () => number,
    getAvgTime?: () => number,
    getTotalTime?: () => number,
    onStatisticsSave?: StatisticsCallback
  ): { isCorrect: boolean; newScore: ScoreData } | undefined => {
    if (!currentTask || placedNotes.length === 0 || isAnswered) return;

    const isCorrect = validateChord(currentTask, placedNotes);
    const problemTime = onTimerStop ? onTimerStop() : 0;
    
    const newScore: ScoreData = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
      streak: isCorrect ? score.streak + 1 : 0
    };
    
    // Update best streak tracking
    if (newScore.streak > bestStreakRef.current) {
      bestStreakRef.current = newScore.streak;
    }
    
    setScore(newScore);
    setIsAnswered(true);
    
    const feedbackData: FeedbackData = {
      isCorrect,
      expectedNotes: currentTask.expectedNotes,
      placedNotes: [...placedNotes],
      time: problemTime
    };
    
    setFeedback(feedbackData);
    
    // Check for level completion
    if (newScore.total >= levelConfig.totalProblems) {
      const avgTime = getAvgTime ? getAvgTime() : problemTime;
      const totalTime = getTotalTime ? getTotalTime() : (avgTime * newScore.total);
      const passed = newScore.correct >= Math.ceil(levelConfig.totalProblems * levelConfig.passAccuracy / 100);
      const accuracy = Math.round((newScore.correct / newScore.total) * 100);
      
      // Save statistics immediately
      const saveStats = onStatisticsSave || statisticsCallbackRef.current;
      if (saveStats && categoryRef.current && levelRef.current) {
        saveStats({
          moduleType: 'chord-construction',
          category: categoryRef.current,
          level: levelRef.current,
          accuracy,
          avgTime,
          totalTime: Math.round(totalTime),
          problemsSolved: newScore.total,
          correctAnswers: newScore.correct,
          bestStreak: bestStreakRef.current,
          completed: true,
          passed,
          startTime: startTimeRef.current ? startTimeRef.current.toISOString() : new Date().toISOString(),
          endTime: new Date().toISOString(),
          sessionToken
        }).catch(error => {
          console.error('Failed to save statistics:', error);
        });
      }
      
      // Level completed - delay UI update but not statistics saving
      setTimeout(() => {
        setIsCompleted(true);
        setLevelResult({
          passed,
          accuracy,
          avgTime
        });
      }, 2000);
    }
    
    return { isCorrect, newScore };
  };

  /**
   * Clear all placed notes
   */
  const clearAllNotes = (): void => {
    if (isAnswered) return;
    setPlacedNotes([]);
  };

  /**
   * Reset the entire level
   */
  const resetLevel = (): void => {
    setHasStarted(false);
    setIsCompleted(false);
    setCurrentTask(null);
    setPlacedNotes([]);
    setFeedback(null);
    setIsAnswered(false);
    setShowSolution(false);
    setScore({ correct: 0, total: 0, streak: 0 });
    setLevelResult(null);
    
    // Reset session tracking
    setSessionToken('');
    startTimeRef.current = null;
    bestStreakRef.current = 0;
  };

  return {
    // State
    hasStarted,
    isCompleted,
    currentTask,
    placedNotes,
    feedback,
    isAnswered,
    showSolution,
    score,
    levelResult,
    sessionToken,
    sessionStartTime: startTimeRef.current ? startTimeRef.current.toISOString() : null,
    bestStreak: bestStreakRef.current,
    
    // Actions
    startLevel,
    nextTask,
    handleNoteToggle,
    submitAnswer,
    clearAllNotes,
    resetLevel,
    setShowSolution,
    generateNewSessionToken,
    setStatisticsCallback
  };
}