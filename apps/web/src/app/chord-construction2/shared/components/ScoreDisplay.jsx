/**
 * Score Display Component for Chord Construction
 * 
 * This component displays the player's progress and performance metrics:
 * - Progress bar showing completion status
 * - Current timer
 * - Average time per problem  
 * - Accuracy percentage
 * - Correct answers count
 * - Current streak
 * 
 * Features:
 * - Color-coded performance indicators
 * - Theme-based progress bar styling
 * - Real-time updates
 * - Responsive grid layout
 */

export default function ScoreDisplay({ 
  correct, 
  total, 
  streak, 
  currentTime, 
  avgTime, 
  isAnswered, 
  totalProblems, 
  theme 
}) {
  // Calculate derived metrics
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = Math.round((total / totalProblems) * 100);
  
  /**
   * Get color class based on performance thresholds
   */
  const getPerformanceColor = (value, thresholds) => {
    if (value >= thresholds.excellent) return 'text-green-600';
    if (value >= thresholds.good) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get accuracy color based on standard thresholds
   */
  const getAccuracyColor = () => {
    return getPerformanceColor(accuracy, { excellent: 85, good: 70 });
  };

  /**
   * Get time color (lower is better for average time)
   */
  const getTimeColor = (time) => {
    if (time <= 0) return 'text-white';
    if (time <= 8) return 'text-green-600';
    return 'text-red-600';
  };

  /**
   * Get streak color based on streak length
   */
  const getStreakColor = () => {
    return getPerformanceColor(streak, { excellent: 5, good: 3 });
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
      {/* Progress section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress: {total}/{totalProblems}</span>
          <span>{progress}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${theme.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Statistics grid */}
      <div className="grid grid-cols-5 gap-4 text-center">
        {/* Current Time */}
        <div>
          <div className="text-2xl font-bold text-white">
            {currentTime.toFixed(1)}s
          </div>
          <div className="text-sm text-white/70">Current Time</div>
        </div>
        
        {/* Average Time */}
        <div>
          <div className={`text-2xl font-bold ${getTimeColor(avgTime)}`}>
            {avgTime > 0 ? avgTime.toFixed(1) : '0.0'}s
          </div>
          <div className="text-sm text-white/70">Average Time</div>
        </div>
        
        {/* Accuracy */}
        <div>
          <div className={`text-2xl font-bold ${getAccuracyColor()}`}>
            {accuracy}%
          </div>
          <div className="text-sm text-white/70">Accuracy</div>
        </div>
        
        {/* Correct Count */}
        <div>
          <div className="text-2xl font-bold text-white">
            {correct}
          </div>
          <div className="text-sm text-white/70">Correct</div>
        </div>
        
        {/* Streak */}
        <div>
          <div className={`text-2xl font-bold ${getStreakColor()}`}>
            {streak}
          </div>
          <div className="text-sm text-white/70">Streak</div>
        </div>
      </div>
      
      {/* Performance indicators (optional helpful text) */}
      {total > 0 && (
        <div className="mt-4 text-center text-xs text-white/50">
          {accuracy >= 85 && avgTime > 0 && avgTime <= 8 && (
            <span className="text-green-400">🎉 Excellent performance! Keep it up!</span>
          )}
          {accuracy >= 85 && avgTime > 8 && (
            <span className="text-yellow-400">⚡ Great accuracy! Try to speed up a bit.</span>
          )}
          {accuracy < 85 && avgTime > 0 && avgTime <= 8 && (
            <span className="text-blue-400">🎯 Good speed! Focus on accuracy.</span>
          )}
          {accuracy < 70 && (
            <span className="text-red-400">💪 Take your time and focus on getting the chords right.</span>
          )}
        </div>
      )}
    </div>
  );
}