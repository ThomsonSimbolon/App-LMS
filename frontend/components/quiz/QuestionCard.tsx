'use client';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: {
    id: number;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    options: Option[];
    points: number;
  };
  selectedAnswer?: string;
  onAnswerChange: (questionId: number, answer: string) => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="card p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {question.points} {question.points === 1 ? 'point' : 'points'}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
        {question.text}
      </h3>

      <div className="space-y-3">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedAnswer === option.id
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => onAnswerChange(question.id, option.id)}
              className="w-5 h-5 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-slate-900 dark:text-white">
              {option.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
