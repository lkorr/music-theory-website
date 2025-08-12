import { useState, useCallback, useRef, useEffect } from "react";

export function useCounterpoint() {
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

  const audioContextRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      } catch (err) {
        console.error("Audio not supported:", err);
      }
    };

    initAudio();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const playNote = useCallback((midiNote, duration = 0.5, startTime = 0) => {
    if (!audioContextRef.current) return;

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
    );
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration * 1000);
  }, [currentExercise, userNotes, tempo, playNote]);

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

  useEffect(() => {
    if (!currentExerciseId) {
        if(exercises.length === 0) setLoading(false);
        return;
    };
    
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

  useEffect(() => {
    const validateCounterpoint = async () => {
      if (!currentExercise || userNotes.length === 0) {
        setRuleViolations([]);
        setValidationResult(null);
        return;
      }
      try {
        const response = await fetch("/api/validate-counterpoint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cantusFirmus: currentExercise.cantus_firmus,
            userNotes,
            speciesType: currentExercise.species_type,
          }),
        });
        if (!response.ok) throw new Error(`Validation failed: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setRuleViolations(data.violations);
          setValidationResult(data);
        }
      } catch (err) {
        console.error("Error validating counterpoint:", err);
      }
    };
    const timeoutId = setTimeout(validateCounterpoint, 300);
    return () => clearTimeout(timeoutId);
  }, [userNotes, currentExercise]);

  const handlePlayPause = () => {
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
  };

  const handlePrevExercise = () => {
    const currentIndex = exercises.findIndex((ex) => ex.id === currentExerciseId);
    if (currentIndex > 0) {
      setCurrentExerciseId(exercises[currentIndex - 1].id);
    }
  };

  const handleNextExercise = () => {
    const currentIndex = exercises.findIndex((ex) => ex.id === currentExerciseId);
    if (currentIndex < exercises.length - 1) {
      setCurrentExerciseId(exercises[currentIndex + 1].id);
    }
  };

  const resetExercise = () => {
    setUserNotes([]);
    setRuleViolations([]);
    setValidationResult(null);
  };

  const handleSpeciesChange = (species) => {
    setSelectedSpecies(species);
  };
  
  return {
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
    playNote,
    handlePlayPause,
    handlePrevExercise,
    handleNextExercise,
    resetExercise,
    handleSpeciesChange,
  };
}
