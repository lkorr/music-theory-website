import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export function useCounterpointOptimized() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState(1);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(1);
  const [userNotes, setUserNotes] = useState([]);
  const [ruleViolations, setRuleViolations] = useState([]);
  const [draggedNote, setDraggedNote] = useState(null);
  const [tempo, setTempo] = useState(120);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const audioContextRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  const validationTimeoutRef = useRef(null);
  const validationAbortControllerRef = useRef(null);

  // Initialize audio context once
  useEffect(() => {
    const initAudio = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }
      } catch (err) {
        console.error("Audio not supported:", err);
      }
    };

    initAudio();
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (validationAbortControllerRef.current) {
        validationAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized playNote function to prevent recreating on every render
  const playNote = useCallback((midiNote, duration = 0.5, startTime = 0) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;

    try {
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        frequency,
        audioContextRef.current.currentTime + startTime,
      );

      gainNode.gain.setValueAtTime(
        0,
        audioContextRef.current.currentTime + startTime,
      );
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        audioContextRef.current.currentTime + startTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContextRef.current.currentTime + startTime + duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.start(audioContextRef.current.currentTime + startTime);
      oscillator.stop(audioContextRef.current.currentTime + startTime + duration);
      
      // Clean up oscillator after it's done
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (err) {
      console.error("Error playing note:", err);
    }
  }, []);

  const playSequence = useCallback(() => {
    if (!currentExercise || !audioContextRef.current) return;

    const beatDuration = 60 / tempo;
    const allNotes = [...currentExercise.cantus_firmus, ...userNotes];

    allNotes.forEach((note) => {
      playNote(
        note.note,
        beatDuration * note.duration,
        note.beat * beatDuration,
      );
    });

    const totalDuration = Math.max(
      ...allNotes.map((n) => (n.beat + n.duration) * beatDuration),
      0.1 // Ensure there's always some duration
    );
    
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration * 1000);
  }, [currentExercise, userNotes, tempo, playNote]);

  // Fetch exercises with caching
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/exercises?species=${selectedSpecies}`);
        if (!response.ok) throw new Error(`Failed to fetch exercises: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setExercises(data.exercises);
          if (data.exercises.length > 0) {
            setCurrentExerciseId(data.exercises[0].id);
          } else {
            setCurrentExercise(null);
          }
        } else {
          throw new Error(data.error || "Failed to fetch exercises");
        }
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [selectedSpecies]);

  // Fetch individual exercise
  useEffect(() => {
    if (!currentExerciseId) {
      if(exercises.length === 0) setLoading(false);
      return;
    }
    
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${currentExerciseId}`);
        if (!response.ok) throw new Error(`Failed to fetch exercise: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setCurrentExercise(data.exercise);
          setUserNotes([]);
          setRuleViolations([]);
          setValidationResult(null);
        } else {
          throw new Error(data.error || "Failed to fetch exercise");
        }
      } catch (err) {
        console.error("Error fetching exercise:", err);
        setError("Failed to load exercise");
      }
    };
    fetchExercise();
  }, [currentExerciseId, exercises]);

  // OPTIMIZED: Validation with longer debounce and abort controller
  useEffect(() => {
    const validateCounterpoint = async () => {
      if (!currentExercise || userNotes.length === 0) {
        setRuleViolations([]);
        setValidationResult(null);
        setIsValidating(false);
        return;
      }
      
      setIsValidating(true);
      
      // Abort any pending validation request
      if (validationAbortControllerRef.current) {
        validationAbortControllerRef.current.abort();
      }
      
      // Create new abort controller for this request
      validationAbortControllerRef.current = new AbortController();
      
      try {
        const response = await fetch("/api/validate-counterpoint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cantusFirmus: currentExercise.cantus_firmus,
            userNotes,
            speciesType: currentExercise.species_type,
          }),
          signal: validationAbortControllerRef.current.signal
        });
        
        if (!response.ok) throw new Error(`Validation failed: ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
          setRuleViolations(data.violations || []);
          setValidationResult(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error validating counterpoint:", err);
        }
      } finally {
        setIsValidating(false);
      }
    };
    
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    // INCREASED DEBOUNCE: Wait 1 second (was 300ms) before validating
    validationTimeoutRef.current = setTimeout(validateCounterpoint, 1000);
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (validationAbortControllerRef.current) {
        validationAbortControllerRef.current.abort();
      }
    };
  }, [userNotes, currentExercise]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
    } else {
      setIsPlaying(true);
      playSequence();
    }
  }, [isPlaying, playSequence]);

  const handlePrevExercise = useCallback(() => {
    const currentIndex = exercises.findIndex((ex) => ex.id === currentExerciseId);
    if (currentIndex > 0) {
      setCurrentExerciseId(exercises[currentIndex - 1].id);
    }
  }, [exercises, currentExerciseId]);

  const handleNextExercise = useCallback(() => {
    const currentIndex = exercises.findIndex((ex) => ex.id === currentExerciseId);
    if (currentIndex < exercises.length - 1) {
      setCurrentExerciseId(exercises[currentIndex + 1].id);
    }
  }, [exercises, currentExerciseId]);

  const resetExercise = useCallback(() => {
    setUserNotes([]);
    setRuleViolations([]);
    setValidationResult(null);
  }, []);

  const handleSpeciesChange = useCallback((species) => {
    setSelectedSpecies(species);
  }, []);
  
  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    isPlaying,
    setIsPlaying,
    currentExercise,
    exercises,
    currentExerciseId,
    selectedSpecies,
    userNotes,
    setUserNotes,
    ruleViolations,
    draggedNote,
    setDraggedNote,
    tempo,
    setTempo,
    validationResult,
    loading,
    error,
    isValidating,
    playNote,
    handlePlayPause,
    handlePrevExercise,
    handleNextExercise,
    resetExercise,
    handleSpeciesChange,
  }), [
    isPlaying,
    currentExercise,
    exercises,
    currentExerciseId,
    selectedSpecies,
    userNotes,
    ruleViolations,
    draggedNote,
    tempo,
    validationResult,
    loading,
    error,
    isValidating,
    playNote,
    handlePlayPause,
    handlePrevExercise,
    handleNextExercise,
    resetExercise,
    handleSpeciesChange,
  ]);
}