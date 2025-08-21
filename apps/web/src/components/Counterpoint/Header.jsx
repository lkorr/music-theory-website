import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { CompactAuthButton } from "../auth/AuthButton.jsx";

export default function CounterpointHeader({
  currentExercise,
  exercises,
  currentExerciseId,
  handlePrevExercise,
  handleNextExercise,
}) {
  const currentIndex = exercises.findIndex((ex) => ex.id === currentExerciseId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === exercises.length - 1;

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors">
            <span className="text-white text-sm font-bold">♪</span>
          </Link>
          <h1 className="text-xl font-bold text-black">
            Midi Counterpoint Trainer
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-black/70">
            {currentExercise.title} - {currentExercise.difficulty_level}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevExercise}
              disabled={isFirst}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>
            <button
              onClick={handleNextExercise}
              disabled={isLast}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          </div>
          <CompactAuthButton />
        </div>
      </div>
    </header>
  );
}
