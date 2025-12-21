"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArrowLeft, Upload, BookOpen, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categorySlice";
import {
  fetchCourseById,
  updateCourse,
  togglePublish,
  clearError,
} from "@/store/slices/courseSlice";
import Badge from "@/components/ui/Badge";
import { getFileUrl } from "@/lib/api";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

// Extended Course interface untuk edit page
interface CourseWithDetails {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  type: string;
  price?: number;
  category?: { id: number; name: string };
  categoryId?: number;
  requireSequentialCompletion?: boolean;
  requireManualApproval?: boolean;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { categories, loading: categoriesLoading } = useAppSelector(
    (state) => state.category
  );
  const { currentCourse, loading: courseLoading } = useAppSelector(
    (state) => state.course
  );
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    level: "BEGINNER",
    type: "FREE",
    price: "0",
    requireSequentialCompletion: false,
    requireManualApproval: false,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Fetch course data and categories
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchCategories(100));
    }
  }, [courseId, dispatch]);

  // Initialize form data when course is loaded
  useEffect(() => {
    if (currentCourse && !isInitialized) {
      // Type assertion untuk akses property yang mungkin tidak ada di interface
      const courseData = currentCourse as CourseWithDetails;
      setFormData({
        title: currentCourse.title || "",
        description: currentCourse.description || "",
        categoryId:
          (currentCourse.category?.id || courseData.categoryId)?.toString() ||
          "",
        level: currentCourse.level || "BEGINNER",
        type: currentCourse.type || "FREE",
        price: currentCourse.price?.toString() || "0",
        requireSequentialCompletion:
          courseData.requireSequentialCompletion || false,
        requireManualApproval: courseData.requireManualApproval || false,
      });

      // Set thumbnail preview if course has thumbnail
      if (currentCourse.thumbnail) {
        setThumbnailPreview(getFileUrl(currentCourse.thumbnail));
      }

      setIsInitialized(true);
    }
  }, [currentCourse, isInitialized]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Please select an image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Image size must be less than 5MB",
        }));
        return;
      }

      setThumbnailFile(file);
      setErrors((prev) => ({ ...prev, thumbnail: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (
      formData.type !== "FREE" &&
      (!formData.price || parseFloat(formData.price) <= 0)
    ) {
      newErrors.price = "Price must be greater than 0 for paid courses";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(clearError());
    setUpdateLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("type", formData.type);
      formDataToSend.append(
        "price",
        formData.type === "FREE" ? "0" : formData.price
      );
      formDataToSend.append(
        "requireSequentialCompletion",
        formData.requireSequentialCompletion.toString()
      );
      formDataToSend.append(
        "requireManualApproval",
        formData.requireManualApproval.toString()
      );

      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      const result = await dispatch(
        updateCourse({ courseId, data: formDataToSend })
      );

      if (updateCourse.fulfilled.match(result)) {
        // Success - redirect to courses list
        router.push(`/instructor/courses`);
      } else {
        const errorMessage =
          (result.payload as string) || "Failed to update course";
        setErrors({ submit: errorMessage });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (courseLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Course not found
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/instructor/courses")}
          className="mt-4"
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Edit Course
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Update course information and settings
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-700 dark:text-error-300">
              {errors.submit}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <Input
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  placeholder="e.g., Complete JavaScript Course"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`input ${
                      errors.description
                        ? "border-error-DEFAULT focus:ring-error-DEFAULT"
                        : ""
                    }`}
                    placeholder="Describe what students will learn in this course..."
                    required
                  />
                  {errors.description && (
                    <p className="text-sm text-error-DEFAULT mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`input ${
                      errors.categoryId
                        ? "border-error-DEFAULT focus:ring-error-DEFAULT"
                        : ""
                    }`}
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-error-DEFAULT mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                  {categoriesLoading && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Loading categories...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Settings */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Course Settings
              </h2>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Course Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="FREE">Free</option>
                      <option value="PAID">Paid</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                </div>

                {formData.type !== "FREE" && (
                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    error={errors.price}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    helperText="Enter the price for this course"
                  />
                )}

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requireSequentialCompletion"
                      checked={formData.requireSequentialCompletion}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Require Sequential Completion
                      </span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Students must complete lessons in order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requireManualApproval"
                      checked={formData.requireManualApproval}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Require Manual Certificate Approval
                      </span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Certificates require manual approval before issuance
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail Upload */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Course Thumbnail
              </h2>

              <div className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative w-full h-48 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview(null);
                        setThumbnailFile(null);
                        setErrors((prev) => ({ ...prev, thumbnail: "" }));
                      }}
                      className="absolute top-2 right-2 bg-error-600 hover:bg-error-700 text-white rounded-full p-1.5 transition-colors"
                    >
                      <span className="text-xs">×</span>
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                      <Upload className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Upload Thumbnail
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}

                {errors.thumbnail && (
                  <p className="text-sm text-error-DEFAULT">
                    {errors.thumbnail}
                  </p>
                )}

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  A good thumbnail helps attract students to your course.
                  Recommended size: 1280x720px
                </p>
              </div>
            </div>

            {/* Publish Status & Submit Button */}
            <div className="card p-6 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="space-y-4">
                {/* Publish Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Publication Status
                      </h3>
                      <Badge
                        variant={
                          currentCourse?.isPublished ? "success" : "warning"
                        }
                      >
                        {currentCourse?.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCourse?.isPublished || false}
                        onChange={async (e) => {
                          if (!currentCourse) return;
                          const newStatus = e.target.checked;
                          setToggleLoading(true);
                          dispatch(clearError());
                          try {
                            const result = await dispatch(
                              togglePublish({
                                courseId: currentCourse.id,
                                isPublished: newStatus,
                              })
                            );
                            if (togglePublish.rejected.match(result)) {
                              const errorMessage =
                                (result.payload as string) ||
                                "Failed to update publish status";
                              showToast(errorMessage, "error");
                              // Revert checkbox
                              e.target.checked = !newStatus;
                            } else if (togglePublish.fulfilled.match(result)) {
                              showToast(
                                `Course ${
                                  newStatus ? "published" : "unpublished"
                                } successfully!`,
                                "success"
                              );
                            }
                          } catch {
                            showToast(
                              "Failed to update publish status",
                              "error"
                            );
                            e.target.checked = !newStatus;
                          } finally {
                            setToggleLoading(false);
                          }
                        }}
                        disabled={toggleLoading || !currentCourse}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {toggleLoading
                          ? "Loading..."
                          : currentCourse?.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentCourse?.isPublished
                      ? "This course is visible to students"
                      : "This course is not visible to students"}
                  </p>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={updateLoading}
                    className="w-full"
                    disabled={toggleLoading}
                  >
                    Update Course
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => router.back()}
                    className="w-full mt-3"
                    disabled={updateLoading || toggleLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
