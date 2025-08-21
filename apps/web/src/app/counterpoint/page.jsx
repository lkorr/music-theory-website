"use client";

import { useCounterpoint } from "../../hooks/useCounterpoint";
import { LoadingScreen, ErrorScreen } from "../../components/Counterpoint/StatusScreens";
import CounterpointHeader from "../../components/Counterpoint/Header";
import SpeciesSelector from "../../components/Counterpoint/SpeciesSelector";
import RulesPanel from "../../components/Counterpoint/RulesPanel";
import PianoRoll from "../../components/Counterpoint/PianoRoll";

export default function CounterpointApp() {
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
    playNote,
    handlePlayPause,
    handlePrevExercise,
    handleNextExercise,
    resetExercise,
    handleSpeciesChange,
  } = useCounterpoint();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <CounterpointHeader
        currentExercise={currentExercise}
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
            <PianoRoll
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                handlePlayPause={handlePlayPause}
                resetExercise={resetExercise}
                tempo={tempo}
                setTempo={setTempo}
                currentExercise={currentExercise}
                userNotes={userNotes}
                setUserNotes={setUserNotes}
                ruleViolations={ruleViolations}
                draggedNote={draggedNote}
                setDraggedNote={setDraggedNote}
                playNote={playNote}
            />
          </div>
          <div className="lg:col-span-1">
            <RulesPanel
              currentExercise={currentExercise}
              userNotes={userNotes}
              ruleViolations={ruleViolations}
              validationResult={validationResult}
            />
          </div>
        </div>
      </main>

    </div>
  );
}