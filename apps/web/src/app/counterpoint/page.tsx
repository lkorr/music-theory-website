"use client";

import { useState } from "react";
import { Link } from "react-router";
import { 
  getAvailableSpecies, 
  getVoiceCategoriesForSpecies, 
  getExercisesForSpeciesAndVoice,
  getVoiceDisplayName,
  getVoiceUrlFormat,
  getExerciseStatistics 
} from "./shared/utils/exerciseUtils.js";

interface SpeciesColors {
  [key: number]: string;
}

interface SpeciesDifficulties {
  [key: number]: string;
}

interface SpeciesDescriptions {
  [key: number]: string;
}

interface ExerciseStats {
  speciesCount: {
    [key: number]: number;
  };
}

export default function CounterpointPage(): JSX.Element {
  const availableSpecies = getAvailableSpecies();
  const [selectedSpecies, setSelectedSpecies] = useState<number>(1);
  const stats: ExerciseStats = getExerciseStatistics();

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

  const getSpeciesDifficulty = (species: number): string => {
    const difficulties: SpeciesDifficulties = {
      1: 'Beginner',
      2: 'Beginner',
      3: 'Intermediate', 
      4: 'Intermediate',
      5: 'Advanced'
    };
    return difficulties[species] || 'Advanced';
  };

  const getSpeciesDescription = (species: number): string => {
    const descriptions: SpeciesDescriptions = {
      1: 'Note against note - Basic consonant intervals',
      2: 'Two notes against one - Introduction to dissonance', 
      3: 'Four notes against one - Scalar passages',
      4: 'Syncopation - Tied notes and suspensions',
      5: 'Florid counterpoint - Mixed note values'
    };
    return descriptions[species] || 'Advanced counterpoint techniques';
  };

  const voiceCategories = getVoiceCategoriesForSpecies(selectedSpecies);

  const handleSpeciesSelect = (species: number): void => {
    setSelectedSpecies(species);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative">
      {/* Logo in absolute top-left corner */}
      <Link to="/" className="absolute top-2 left-2 z-50">
        <img src="/pailiaq-logo-small.png" alt="Logo" className="w-12 h-12" />
      </Link>
      
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-16">
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="text-white text-sm font-bold">←</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Counterpoint Training
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Master Species Counterpoint
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Learn the five species of counterpoint based on Fux's Gradus ad Parnassum. 
            Practice writing melodic lines that follow traditional voice leading rules.
          </p>
        </div>

        {/* Species Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {availableSpecies.map((species: number) => (
              <button
                key={species}
                onClick={() => handleSpeciesSelect(species)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSpecies === species
                    ? `${getSpeciesColor(species)} text-white shadow-lg`
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Species {species}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Species Info */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full ${getSpeciesColor(selectedSpecies)} flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{selectedSpecies}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Species {selectedSpecies}</h3>
                <p className="text-white/70">{getSpeciesDescription(selectedSpecies)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                getSpeciesDifficulty(selectedSpecies) === 'Beginner' ? 'bg-green-100 text-green-800' :
                getSpeciesDifficulty(selectedSpecies) === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {getSpeciesDifficulty(selectedSpecies)}
              </span>
              <div className="text-white/60 text-sm mt-1">
                {stats.speciesCount[selectedSpecies]} exercises
              </div>
            </div>
          </div>

          {/* Voice Categories - Vertical Layout */}
          <div className="space-y-8">
            {voiceCategories.map((voiceKey: string) => {
              const exercises = getExercisesForSpeciesAndVoice(selectedSpecies, getVoiceUrlFormat(voiceKey));
              const voiceUrl = getVoiceUrlFormat(voiceKey);
              
              return (
                <div key={voiceKey} className="relative">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    {/* Voice Category Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${getSpeciesColor(selectedSpecies)} flex items-center justify-center`}>
                          <span className="text-white text-lg font-bold">
                            {voiceKey === 'twoVoices' ? '2' : voiceKey === 'threeVoices' ? '3' : '4'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-white">
                            {getVoiceDisplayName(voiceUrl)} Counterpoint
                          </h4>
                          <p className="text-white/70">
                            {voiceKey === 'twoVoices' && 'Learn the fundamentals with two-part writing'}
                            {voiceKey === 'threeVoices' && 'Explore three-part harmonic relationships'} 
                            {voiceKey === 'fourVoices' && 'Master four-part chorale-style writing'}
                          </p>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm">
                        {exercises.length} exercises
                      </div>
                    </div>

                    {/* Exercise Level Buttons - Horizontal Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                      {exercises.map((exercise: any, index: number) => (
                        <Link
                          key={exercise.id}
                          to={`/counterpoint/species-${selectedSpecies}/${voiceUrl}/level-${index + 1}`}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-center transition-colors duration-200"
                        >
                          <div className="text-white text-sm font-semibold">
                            Level {index + 1}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            Fig. {exercise.figure}
                          </div>
                          <div className="text-white/60 text-xs">
                            {exercise.modalFinal?.toUpperCase()}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">How Counterpoint Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-white/80">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <p>Study the cantus firmus melody</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <p>Add notes following species rules</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <p>Check for voice leading violations</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <p>Perfect your counterpoint technique</p>
              </div>
            </div>
          </div>

          {/* Quick Access to Exercise Mode */}
          <div className="mt-8">
            <Link
              to="/counterpoint/exercise"
              className="inline-block bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-8 py-4 text-white font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Continue Current Exercise →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}