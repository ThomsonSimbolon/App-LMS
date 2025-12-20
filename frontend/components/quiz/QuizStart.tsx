import React from 'react';

interface QuizStartProps {
  quiz: {
    title: string;
    description?: string;
    questionCount: number;
    timeLimit?: number;
    passingScore: number;
    maxAttempts?: number;
  };
  attempts?: number;
  onStart: () => void;
}

export function QuizStart({ quiz, attempts = 0, onStart }: QuizStartProps) {
  const attemptsLeft = quiz.maxAttempts ? quiz.maxAttempts - attempts : null;

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
        {quiz.title}
      </h2>
      {quiz.description && (
        <p className="text-neutral-700 dark:text-neutral-300 mb-6">
          {quiz.description}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            Questions
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {quiz.questionCount}
          </div>
        </div>

        {quiz.timeLimit && (
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Time Limit
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {quiz.timeLimit} min
            </div>
          </div>
        )}

        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            Passing Score
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {quiz.passingScore}%
          </div>
        </div>

        {quiz.maxAttempts && (
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Attempts Left
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {attemptsLeft !== null ? attemptsLeft : '∞'}
            </div>
          </div>
        )}
      </div>

      {attemptsLeft === 0 ? (
        <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 mb-6">
          You have used all available attempts for this quiz.
        </div>
      ) : (
        <button
          onClick={onStart}
          className="w-full btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold"
        >
          Start Quiz
        </button>
      )}
    </div>
  );
}
