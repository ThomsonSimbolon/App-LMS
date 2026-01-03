"use client";

import { useRouter } from "next/navigation";
import {
  LessonContent,
  QuizExamLessonContent,
  LessonContentData,
} from "@/store/slices/lessonSlice";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Clock, Award } from "lucide-react";

interface ExamLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
}

export function ExamLesson({ lesson }: ExamLessonProps) {
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

  const handleTakeExam = () => {
    if (typeof quizId === "number" && quizId > 0) {
      router.push(`/dashboard/quizzes/${quizId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="error">Exam</Badge>
        {lesson.isRequired && <Badge variant="default">Required</Badge>}
      </div>

      <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Exam Information
        </h3>

        <div className="space-y-3 mb-6">
          {typeof quizId === "number" && quizId > 0 && (
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Exam ID:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                #{quizId}
              </span>
            </div>
          )}

          {typeof passingScore === "number" && (
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Passing Score:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                {passingScore}%
              </span>
            </div>
          )}

          {typeof timeLimit === "number" && timeLimit > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Time Limit:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                {Math.floor(timeLimit / 60)} minutes
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Complete this exam through the quiz system. You must pass the exam
            to complete this lesson.
          </p>
          {typeof quizId === "number" && quizId > 0 ? (
            <Button onClick={handleTakeExam} className="w-full">
              Take Exam
            </Button>
          ) : (
            <p className="text-sm text-warning-600 dark:text-warning-400">
              Exam not yet configured. Please contact your instructor.
            </p>
          )}
        </div>
      </div>

      {lesson.description && (
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300">
            {lesson.description}
          </p>
        </div>
      )}
    </div>
  );
}
