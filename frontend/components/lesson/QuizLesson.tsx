"use client";

import { useRouter } from "next/navigation";
import {
  LessonContent,
  QuizExamLessonContent,
  LessonContentData,
} from "@/store/slices/lessonSlice";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Clock, CheckCircle } from "lucide-react";

interface QuizLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
}

export function QuizLesson({ lesson }: QuizLessonProps) {
  const router = useRouter();

  // Type guard untuk memastikan content adalah QuizExamLessonContent
  const isQuizContent = (
    content: LessonContentData
  ): content is QuizExamLessonContent => {
    return (
      "quizId" in content || "passingScore" in content || "timeLimit" in content
    );
  };

  const { content } = lesson;

  // Gunakan type guard dan extract properti dengan type safety
  const quizContent = isQuizContent(content) ? content : null;
  const quizId: number | undefined = quizContent?.quizId;
  const passingScore: number = quizContent?.passingScore ?? 70;
  const timeLimitValue: number | undefined = quizContent?.timeLimit;

  // Validasi timeLimit sebagai number sebelum operasi aritmatika
  const timeLimit: number | undefined =
    typeof timeLimitValue === "number" ? timeLimitValue : undefined;

  const handleTakeQuiz = () => {
    if (quizId) {
      router.push(`/dashboard/quizzes/${quizId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="warning">Quiz</Badge>
        {lesson.isRequired && <Badge variant="default">Required</Badge>}
      </div>

      <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Quiz Information
        </h3>

        <div className="space-y-3 mb-6">
          {typeof quizId === "number" && quizId > 0 && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Quiz ID:
              </span>{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                #{quizId}
              </span>
            </div>
          )}

          {typeof passingScore === "number" && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Passing Score:
              </span>{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                {passingScore}%
              </span>
            </div>
          )}

          {typeof timeLimit === "number" && timeLimit > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Time Limit:
              </span>{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                {Math.floor(timeLimit / 60)} minutes
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Complete this quiz through the quiz system. You must pass the quiz
            to complete this lesson.
          </p>
          {typeof quizId === "number" && quizId > 0 ? (
            <Button onClick={handleTakeQuiz} className="w-full">
              Take Quiz
            </Button>
          ) : (
            <p className="text-sm text-warning-600 dark:text-warning-400">
              Quiz not yet configured. Please contact your instructor.
            </p>
          )}
        </div>
      </div>

      {lesson.description && (
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-neutral-700 dark:text-neutral-300">
            {lesson.description}
          </p>
        </div>
      )}
    </div>
  );
}
