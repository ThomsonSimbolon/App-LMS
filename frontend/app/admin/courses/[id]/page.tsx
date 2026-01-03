"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useRequireRole } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourseById, assignInstructor } from "@/store/slices/courseSlice";
import { fetchUsers } from "@/store/slices/userSlice";
import {
  fetchAssignedAssessors,
  assignAssessorsToCourse,
} from "@/store/slices/courseAssessorSlice";
import { Users, ArrowLeft, Check, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { showToast } = useToast();
  const { currentCourse, loading: courseLoading } = useAppSelector(
    (state) => state.course
  );
  const { users } = useAppSelector((state) => state.user);
  const { assignedAssessors, loading: assessorLoading } = useAppSelector(
    (state) => state.courseAssessor
  );
  const [saving, setSaving] = useState(false);
  const [savingInstructor, setSavingInstructor] = useState(false);
  const [selectedAssessorIds, setSelectedAssessorIds] = useState<number[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!authLoading && courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchAssignedAssessors(courseId));
      dispatch(fetchUsers());
    }
  }, [authLoading, courseId, dispatch]);

  useEffect(() => {
    // Initialize selected assessors from assigned assessors
    if (assignedAssessors.length > 0) {
      setSelectedAssessorIds(assignedAssessors.map((a) => a.id));
    }
  }, [assignedAssessors]);

  // Filter users to get only ASSESSOR role
  const assessors = users.filter((user) => user.role?.name === "ASSESSOR");

  // Filter users to get only INSTRUCTOR role
  const instructors = users.filter((user) => user.role?.name === "INSTRUCTOR");

  const handleAssessorToggle = (assessorId: number) => {
    setSelectedAssessorIds((prev) =>
      prev.includes(assessorId)
        ? prev.filter((id) => id !== assessorId)
        : [...prev, assessorId]
    );
  };

  const handleAssignInstructor = async () => {
    if (!courseId || !selectedInstructorId) {
      showToast("Please select an instructor", "warning");
      return;
    }

    setSavingInstructor(true);
    try {
      const result = await dispatch(
        assignInstructor({
          courseId,
          instructorId: selectedInstructorId,
        })
      );

      if (assignInstructor.fulfilled.match(result)) {
        // Refresh course data
        dispatch(fetchCourseById(courseId));
        showToast("Instructor assigned successfully!", "success");
      } else {
        showToast(
          (result.payload as string) || "Failed to assign instructor",
          "error"
        );
      }
    } catch {
      showToast("An error occurred while assigning instructor", "error");
    } finally {
      setSavingInstructor(false);
    }
  };

  const handleSaveAssessors = async () => {
    if (!courseId) return;

    setSaving(true);
    try {
      const result = await dispatch(
        assignAssessorsToCourse({
          courseId,
          assessorIds: selectedAssessorIds,
        })
      );

      if (assignAssessorsToCourse.fulfilled.match(result)) {
        // Refresh assigned assessors
        dispatch(fetchAssignedAssessors(courseId));
        showToast("Assessors assigned successfully!", "success");
      } else {
        showToast(
          (result.payload as string) || "Failed to assign assessors",
          "error"
        );
      }
    } catch {
      showToast("An error occurred while assigning assessors", "error");
    } finally {
      setSaving(false);
    }
  };

  const course = currentCourse;

  if (authLoading || courseLoading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/courses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {course.title}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Course ID: {course.id}
          </p>
        </div>
      </div>

      {/* Course Info Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Course Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                Instructor
              </label>
              <p className="text-neutral-900 dark:text-white font-medium">
                {course.instructor?.firstName} {course.instructor?.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  className={
                    course.isPublished
                      ? "bg-success/10 text-success dark:bg-success/20 dark:text-success"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }
                >
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">
                Level
              </label>
              <p className="text-slate-900 dark:text-white font-medium">
                {course.level}
              </p>
            </div>
            <div>
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                Type
              </label>
              <p className="text-neutral-900 dark:text-white font-medium">
                {course.type}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Assign Instructor Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Assigned Instructor
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Assign an instructor to manage this course. The instructor will be
            able to edit, manage content, and see this course in their course
            list.
          </p>

          {/* Current Instructor */}
          {currentCourse?.instructor && (
            <div className="mb-6">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                Current Instructor
              </label>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {currentCourse.instructor.firstName}{" "}
                  {currentCourse.instructor.lastName}
                </Badge>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {currentCourse.instructor.email}
                </span>
              </div>
            </div>
          )}

          {/* Instructor Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Select Instructor
            </label>
            {instructors.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                No instructors found. Please create users with INSTRUCTOR role
                first.
              </p>
            ) : (
              <select
                value={selectedInstructorId || ""}
                onChange={(e) =>
                  setSelectedInstructorId(parseInt(e.target.value) || null)
                }
                className="input w-full"
              >
                <option value="">-- Select Instructor --</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName} (
                    {instructor.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Assign Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="ghost"
              onClick={() =>
                setSelectedInstructorId(currentCourse?.instructor?.id || null)
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignInstructor}
              disabled={savingInstructor || !selectedInstructorId}
            >
              {savingInstructor ? "Saving..." : "Assign Instructor"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Assign Assessors Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Assigned Assessors
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Select assessors who can approve certificates for this course. Only
            assigned assessors will be able to review and approve certificate
            requests.
          </p>

          {assessorLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Available Assessors */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Available Assessors
                </label>
                {assessors.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    No assessors found. Please create users with ASSESSOR role
                    first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    {assessors.map((assessor) => {
                      const isSelected = selectedAssessorIds.includes(
                        assessor.id
                      );
                      return (
                        <div
                          key={assessor.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                              : "bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                          onClick={() => handleAssessorToggle(assessor.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-primary-600 border-primary-600"
                                  : "border-neutral-300 dark:border-neutral-600"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {assessor.firstName} {assessor.lastName}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {assessor.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Currently Assigned Assessors */}
              {assignedAssessors.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                    Currently Assigned ({assignedAssessors.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {assignedAssessors.map((assessor) => (
                      <Badge
                        key={assessor.id}
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {assessor.firstName} {assessor.lastName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin/courses")}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAssessors} disabled={saving}>
                  {saving ? "Saving..." : "Save Assessors"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
