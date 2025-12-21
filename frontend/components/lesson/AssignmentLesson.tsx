'use client';

import { useState } from 'react';
import { LessonContent, AssignmentSubmissionData } from '@/store/slices/lessonSlice';
import Badge from '../ui/Badge';
import { Calendar, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import Button from '../ui/Button';

interface AssignmentLessonProps {
  lesson: LessonContent;
  onComplete?: (submissionData: AssignmentSubmissionData) => void;
  isCompleted?: boolean;
}

export function AssignmentLesson({ 
  lesson, 
  onComplete,
  isCompleted = false 
}: AssignmentLessonProps) {
  const { content } = lesson;
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const instructions = content.instructions || '';
  const submissionType = content.submissionType || 'ANY';
  const deadline = content.deadline;
  const maxScore = content.maxScore || 100;

  const isOverdue = deadline ? new Date(deadline) < new Date() : false;
  const isDeadlineApproaching = deadline 
    ? new Date(deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000 
    : false;

  const handleSubmit = async () => {
    if (!onComplete) return;

    const submissionData: AssignmentSubmissionData = {};

    if (submissionType === 'TEXT' || submissionType === 'ANY') {
      if (submissionText.trim()) {
        submissionData.text = submissionText;
      }
    }

    if (submissionType === 'LINK' || submissionType === 'ANY') {
      if (submissionLink.trim()) {
        submissionData.link = submissionLink;
      }
    }

    if (submissionType === 'FILE' || submissionType === 'ANY') {
      if (submissionFile) {
        // TODO: Upload file and get URL
        // For now, just show message
        alert('File upload feature coming soon. Please use text or link submission.');
        return;
      }
    }

    // Validate that at least one submission is provided
    if (!submissionData.text && !submissionData.link && !submissionData.fileUrl) {
      alert('Please provide a submission (text, file, or link)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (submissionType === 'TEXT') return submissionText.trim().length > 0;
    if (submissionType === 'LINK') return submissionLink.trim().length > 0;
    if (submissionType === 'FILE') return submissionFile !== null;
    // ANY
    return submissionText.trim().length > 0 || 
           submissionLink.trim().length > 0 || 
           submissionFile !== null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="default">Assignment</Badge>
        {isOverdue && <Badge variant="error">Overdue</Badge>}
        {isDeadlineApproaching && !isOverdue && <Badge variant="warning">Due Soon</Badge>}
        {isCompleted && <Badge variant="success">Submitted</Badge>}
      </div>

      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Assignment Instructions
        </h3>

        {instructions && (
          <div className="mb-6 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>
        )}

        <div className="space-y-3 text-sm mb-6">
          {submissionType && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Submission Type:
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {submissionType}
              </span>
            </div>
          )}

          {deadline && (
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-danger-600 dark:text-danger-400' : ''}`}>
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Deadline:</span>
              <span>{new Date(deadline).toLocaleString()}</span>
            </div>
          )}

          {maxScore && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Max Score:
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {maxScore} points
              </span>
            </div>
          )}
        </div>

        {!isCompleted && (
          <div className="space-y-4 mt-6">
            {(submissionType === 'TEXT' || submissionType === 'ANY') && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Text Submission
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  rows={6}
                  placeholder="Enter your submission text here..."
                />
              </div>
            )}

            {(submissionType === 'LINK' || submissionType === 'ANY') && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link Submission
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            )}

            {(submissionType === 'FILE' || submissionType === 'ANY') && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  File Submission
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
                {submissionFile && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Selected: {submissionFile.name}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting || isOverdue}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>

            {isOverdue && (
              <p className="text-sm text-danger-600 dark:text-danger-400">
                This assignment is overdue. Please contact your instructor.
              </p>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="mt-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <p className="text-sm text-success-700 dark:text-success-300">
              ✓ Assignment submitted successfully. Waiting for instructor review.
            </p>
          </div>
        )}
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

