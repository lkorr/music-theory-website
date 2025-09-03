"use client";

import { useParams, Link } from "react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  getExerciseBySpeciesVoiceLevel,
  getVoiceDisplayName,
  type VoiceCategory 
} from "../../../../shared/utils/exerciseUtils.js";
import {
  convertFuxExerciseToPianoRollFormat,
  getCounterpointVoiceRanges,
  createPianoRollConfig,
  validateNotePlacement,
  COUNTERPOINT_CONFIG
} from "../../../../shared/utils/pianoRollUtils.js";

// Import enhanced piano roll component
import EnhancedPianoRoll from "../../../../../../../components/Counterpoint/EnhancedPianoRoll.tsx";

// Types for route parameters
interface CounterpointPracticeParams extends Record<string, string | undefined> {
  species?: string;
  voices?: string;
  level?: string;
}

// Types for exercise data
interface Exercise {
  id: string;
  figure: string;
  modalFinal?: string;
  description?: string;
  measureCount?: number;
  cantusFirmusPosition?: string;
  [key: string]: any;
}

interface PianoRollExercise {
  cantus_firmus: Note[];
  [key: string]: any;
}

interface Note {
  note: number;
  beat: number;
  duration: number;
  validation?: NoteValidation;
}

interface NoteValidation {
  isValid: boolean;
  warnings?: string[];
  errors?: string[];
}

interface VoiceRanges {
  suggestions?: {
    primary?: {
      note: string;
    };
  };
  [key: string]: any;
}

interface PianoRollConfig {
  [key: string]: any;
}

interface SpeciesColors {
  [key: number]: string;
}

export default function CounterpointPracticePage(): JSX.Element {
  const params = useParams<CounterpointPracticeParams>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pianoRollExercise, setPianoRollExercise] = useState<PianoRollExercise | null>(null);
  const [voiceRanges, setVoiceRanges] = useState<VoiceRanges | null>(null);
  const [pianoRollConfig, setPianoRollConfig] = useState<PianoRollConfig | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);

  // Audio context for note playback
  const audioContextRef = useRef<AudioContext | null>(null);

  // Parse URL parameters with proper defaults and validation
  const speciesNumber = parseInt(params.species?.replace('species-', '') || '1', 10);
  const voiceCategory = params.voices || '';
  const level = parseInt(params.level?.replace('level-', '') || '1', 10);

  useEffect(() => {
    const initializeExercise = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Get the fux exercise data
        const fuxExercise = getExerciseBySpeciesVoiceLevel(speciesNumber, voiceCategory as VoiceCategory, level);
        
        if (!fuxExercise) {
          setError(`Exercise not found: Species ${speciesNumber}, ${getVoiceDisplayName(voiceCategory as VoiceCategory)}, Level ${level}`);
          return;
        }

        setExercise(fuxExercise as Exercise);

        // Convert to piano roll format
        const pianoRollData = convertFuxExerciseToPianoRollFormat(fuxExercise);
        setPianoRollExercise(pianoRollData as PianoRollExercise);

        // Calculate voice ranges and suggestions
        const ranges = getCounterpointVoiceRanges(pianoRollData, voiceCategory as VoiceCategory);
        setVoiceRanges(ranges as VoiceRanges);

        // Create piano roll display configuration
        const config = createPianoRollConfig(ranges);
        setPianoRollConfig(config as PianoRollConfig);

        // Initialize audio context
        if (!audioContextRef.current) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
          } catch (err) {
            console.warn('Audio not supported:', err);
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Error loading exercise: ${errorMessage}`);
        console.error('Exercise loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeExercise();
  }, [speciesNumber, voiceCategory, level]);

  const playNote = useCallback((midiNote: number, duration: number = 0.5, startTime: number = 0): void => {
    if (!audioContextRef.current) return;

    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      frequency,
      audioContextRef.current.currentTime + startTime
    );

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(audioContextRef.current.currentTime + startTime);
    oscillator.stop(audioContextRef.current.currentTime + startTime + duration);
  }, []);

  const handlePlayPause = useCallback((): void => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying && pianoRollExercise) {
      // Make playback faster: treat each measure (4 beats) as 1 second at default tempo
      const measureDuration = 60 / tempo; // 1 measure = this many seconds
      const beatDuration = measureDuration / 4; // 1 beat = this many seconds
      
      const allNotes = [...pianoRollExercise.cantus_firmus, ...userNotes];

      allNotes.forEach((note: Note) => {
        const noteDuration = Math.min(beatDuration * note.duration, measureDuration * 0.9); // Cap duration
        playNote(
          note.note,
          noteDuration,
          note.beat * beatDuration
        );
      });

      const totalDuration = Math.max(
        ...allNotes.map((n: Note) => (n.beat + n.duration) * beatDuration)
      );
      
      setTimeout(() => {
        setIsPlaying(false);
      }, totalDuration * 1000);
    }
  }, [isPlaying, pianoRollExercise, userNotes, tempo, playNote]);

  const resetExercise = useCallback((): void => {
    setUserNotes([]);
    setIsPlaying(false);
  }, []);

  const handleUserNotesChange = useCallback((notes: Note[]): void => {
    // Validate notes according to counterpoint rules
    if (voiceRanges && pianoRollExercise) {
      const validatedNotes = notes.map((note: Note) => {
        const validation = validateNotePlacement(note.note, pianoRollExercise, voiceRanges);
        return { ...note, validation };
      });
      setUserNotes(validatedNotes);
    } else {
      setUserNotes(notes);
    }
  }, [voiceRanges, pianoRollExercise]);

  const getSpeciesColor = (species: number): string => {
    const colors: SpeciesColors = {
      1: 'bg-green-500',
      2: 'bg-blue-500', 
      3: 'bg-purple-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[species] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white font-medium">Loading piano roll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Exercise</h2>
            <p className="text-red-300/80">{error}</p>
          </div>
          <Link
            to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${level}`}
            className="inline-block bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300"
          >
            ← Back to Exercise
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${level}`} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">
                🎹 Piano Roll Practice
              </h1>
              <p className="text-white/60 text-sm">
                Species {speciesNumber} • {getVoiceDisplayName(voiceCategory)} • Level {level}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full ${getSpeciesColor(speciesNumber)} text-white text-sm font-semibold`}>
              Figure {exercise?.figure}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Exercise Info Bar */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h3 className="text-white font-semibold">{exercise?.description}</h3>
                <p className="text-white/70 text-sm">
                  {exercise?.modalFinal?.toUpperCase()} mode • 
                  Cantus Firmus: {exercise?.cantusFirmusPosition} • 
                  {exercise?.measureCount} measures
                </p>
              </div>
            </div>
            
            {voiceRanges?.suggestions?.primary && (
              <div className="text-right">
                <div className="text-white/70 text-sm">Counterpoint Guidance:</div>
                <div className="text-white text-sm font-medium">
                  {voiceRanges.suggestions.primary.note}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Piano Roll */}
        {pianoRollExercise && pianoRollConfig && (
          <EnhancedPianoRoll
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            handlePlayPause={handlePlayPause}
            resetExercise={resetExercise}
            tempo={tempo}
            setTempo={setTempo}
            currentExercise={pianoRollExercise}
            userNotes={userNotes}
            setUserNotes={handleUserNotesChange}
            playNote={playNote}
            voiceRanges={voiceRanges}
            pianoRollConfig={pianoRollConfig}
            speciesNumber={speciesNumber}
            voiceCategory={voiceCategory}
          />
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={resetExercise}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Clear All Notes
          </button>
          <Link
            to={`/counterpoint/species-${speciesNumber}/${voiceCategory}/level-${level}`}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Back to Exercise Info
          </Link>
        </div>
      </main>
    </div>
  );
}