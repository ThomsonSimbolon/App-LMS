import React from 'react';

interface QuizResultsProps {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
  onRetry?: () => void;
  onContinue?: () => void;
}

export function QuizResults({
  score,
  totalPoints,
  percentage,
  passed,
  passingScore,
  correctAnswers,
  totalQuestions,
  onRetry,
  onContinue,
}: QuizResultsProps) {
  return (
    <div className="card p-8 max-w-2xl mx-auto">
      {/* Result Icon */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">
          {passed ? '🎉' : '😔'}
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${
          passed
            ? 'text-accent-600 dark:text-accent-400'
            : 'text-error dark:text-error-light'
        }`}>
          {passed ? 'Congratulations!' : 'Not Quite There'}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {passed
            ? 'You passed the quiz!'
            : `You need ${passingScore}% to pass`}
        </p>
      </div>

      {/* Score Display */}
      <div className="bg-primary-soft dark:bg-primary/20 p-8 rounded-xl mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-neutral-900 dark:text-white mb-2">
            {percentage}%
          </div>
          <div className="text-lg text-neutral-600 dark:text-neutral-400">
            {score} out of {totalPoints} points
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {correctAnswers}/{totalQuestions}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Correct Answers
          </div>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {passed ? '✓' : '✗'}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Status
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {!passed && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
          >
            Try Again
          </button>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="flex-1 btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-6 py-3"
          >
            {passed ? 'Continue Course' : 'Back to Course'}
          </button>
        )}
      </div>
    </div>
  );
}
