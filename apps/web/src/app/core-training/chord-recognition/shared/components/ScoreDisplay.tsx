import type { ReactNode } from "react";

interface AccuracyThresholds {
  high: number;
  medium: number;
}

interface ScoreDisplayProps {
  correct: number;
  total: number;
  streak: number;
  currentTime: number;
  avgTime: number;
  isAnswered: boolean;
  totalProblems: number;
  progressColor?: string;
  avgTimeThreshold?: number;
  accuracyThresholds?: AccuracyThresholds;
}

// Score display component
export default function ScoreDisplay({ 
  correct, 
  total, 
  streak, 
  currentTime, 
  avgTime, 
  isAnswered, 
  totalProblems, 
  progressColor = "bg-blue-500",
  avgTimeThreshold = 5,
  accuracyThresholds = { high: 90, medium: 70 }
}: ScoreDisplayProps): ReactNode {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-black/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${progressColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-black">
            {currentTime.toFixed(1)}s
          </div>
          <div className="text-sm text-black/70">Current Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            avgTime > 0 && avgTime <= avgTimeThreshold ? 'text-green-600' : avgTime > avgTimeThreshold ? 'text-red-600' : 'text-black'
          }`}>
            {avgTime > 0 ? avgTime.toFixed(1) : '0.0'}s
          </div>
          <div className="text-sm text-black/70">Average Time</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${
            accuracy >= accuracyThresholds.high ? 'text-green-600' : accuracy >= accuracyThresholds.medium ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {accuracy}%
          </div>
          <div className="text-sm text-black/70">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-black">{correct}/{total}</div>
          <div className="text-sm text-black/70">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-black">{streak}</div>
          <div className="text-sm text-black/70">Streak</div>
        </div>
      </div>
    </div>
  );
}