import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function RulesPanel({
  currentExercise,
  userNotes,
  ruleViolations,
  validationResult,
}) {
  const [showRules, setShowRules] = useState(true);

  const canSubmit = userNotes.length === currentExercise.cantus_firmus.length;
  const isPerfect = canSubmit && ruleViolations.length === 0;

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-black">
          Species {currentExercise.species_type} Rules
        </h2>
        <button
          onClick={() => setShowRules(!showRules)}
          className="p-1 hover:bg-white/20 rounded"
        >
          <HelpCircle size={20} className="text-black/70" />
        </button>
      </div>

      {showRules && currentExercise.rules && (
        <div className="space-y-3 mb-6">
          {currentExercise.rules.map((rule, index) => (
            <div key={index} className="bg-white/30 rounded-lg p-3">
              <p className="text-sm text-black leading-relaxed">
                <span className="font-semibold">{index + 1}.</span> {rule}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t border-white/20">
        <h3 className="font-semibold text-black mb-3">Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-black/70">Notes placed:</span>
            <span className="text-black font-medium">
              {userNotes.length}/{currentExercise.cantus_firmus.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-black/70">Rule violations:</span>
            <span
              className={`font-medium ${
                ruleViolations.length > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {ruleViolations.length}
            </span>
          </div>
          {validationResult && (
            <div className="flex justify-between text-sm">
              <span className="text-black/70">Score:</span>
              <span className="text-black font-medium">
                {validationResult.score}/100
              </span>
            </div>
          )}
        </div>

        {ruleViolations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-black mb-2">Issues:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {ruleViolations.map((violation, index) => (
                <div
                  key={index}
                  className="text-xs text-red-600 bg-red-50 rounded p-2"
                >
                  Beat {violation.beat}: {violation.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {validationResult?.feedback && validationResult.feedback.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-black mb-2">Suggestions:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {validationResult.feedback.map((feedback, index) => (
                <div
                  key={index}
                  className="text-xs text-blue-600 bg-blue-50 rounded p-2"
                >
                  {feedback.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className={`w-full mt-4 px-4 py-2 rounded-full font-medium transition-colors ${
            isPerfect
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-[#151515] text-white hover:bg-[#333]"
          }`}
          disabled={!canSubmit}
        >
          {isPerfect ? "Perfect! Next Exercise" : "Complete the Exercise"}
        </button>
      </div>
    </div>
  );
}
