"use client";

import { useCounterpointOptimized } from "../../../hooks/useCounterpointOptimized";
import { LoadingScreen, ErrorScreen } from "../../../components/Counterpoint/StatusScreens";
import CounterpointHeader from "../../../components/Counterpoint/Header";
import SpeciesSelector from "../../../components/Counterpoint/SpeciesSelector";
import RulesPanel from "../../../components/Counterpoint/RulesPanel";
import OptimizedPianoRoll from "../../../components/Counterpoint/OptimizedPianoRoll";

// Types for the counterpoint exercise components
interface CounterpointExercise {
  species_type?: number;
  [key: string]: any;
}

interface UserNote {
  [key: string]: any;
}

interface ValidationResult {
  [key: string]: any;
}

interface RuleViolation {
  [key: string]: any;
}

export default function CounterpointApp(): JSX.Element {
  const {
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
  } = useCounterpointOptimized();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <p className="text-white font-medium">No exercise found for this species.</p>
      </div>
    );
  }

  const typedCurrentExercise = currentExercise as CounterpointExercise;
  const typedUserNotes = userNotes as UserNote[];
  const typedRuleViolations = ruleViolations as RuleViolation[];
  const typedValidationResult = validationResult as ValidationResult | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <CounterpointHeader
        currentExercise={typedCurrentExercise}
        exercises={exercises}
        currentExerciseId={currentExerciseId}
        handlePrevExercise={handlePrevExercise}
        handleNextExercise={handleNextExercise}
      />

      <main className="max-w-7xl mx-auto p-6">
        <SpeciesSelector
          selectedSpecies={selectedSpecies}
          handleSpeciesChange={handleSpeciesChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <OptimizedPianoRoll
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                handlePlayPause={handlePlayPause}
                resetExercise={resetExercise}
                tempo={tempo}
                setTempo={setTempo}
                currentExercise={typedCurrentExercise}
                userNotes={typedUserNotes}
                setUserNotes={setUserNotes}
                playNote={playNote}
                speciesNumber={typedCurrentExercise?.species_type || 1}
            />
          </div>
          <div className="lg:col-span-1">
            {isValidating && (
              <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-700 text-sm">
                🔍 Validating counterpoint...
              </div>
            )}
            <RulesPanel
              currentExercise={typedCurrentExercise}
              userNotes={typedUserNotes}
              ruleViolations={typedRuleViolations}
              validationResult={typedValidationResult}
            />
          </div>
        </div>
      </main>

    </div>
  );
}