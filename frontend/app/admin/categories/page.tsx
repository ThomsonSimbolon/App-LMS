"use client";

import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useRequireRole } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  createCategory,
  clearError,
} from "@/store/slices/categorySlice";
import { X, Plus, Search, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { categories, loading, error } = useAppSelector(
    (state) => state.category
  );
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      dispatch(fetchCategories(100));
    }
  }, [authLoading, dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateModal]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term) ||
        category.slug?.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(
      createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon.trim() || undefined,
      })
    );

    if (createCategory.fulfilled.match(result)) {
      // Reset form and close modal
      setFormData({ name: "", description: "", icon: "" });
      setFormErrors({});
      setShowCreateModal(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({ name: "", description: "", icon: "" });
    setFormErrors({});
    dispatch(clearError());
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Category Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage course categories on the platform
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="p-4 text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {authLoading || loading ? (
          <div className="p-8 text-center text-neutral-500">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            {searchTerm
              ? "No categories found matching your search."
              : "No categories found. Create your first category to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Category Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Slug
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Description
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span className="text-xl">{category.icon}</span>
                        )}
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{category.slug || "—"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                      {category.description || (
                        <span className="text-neutral-400">No description</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                      {category.createdAt
                        ? formatDate(category.createdAt)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div
          className="fixed z-50 flex items-center justify-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute bg-black/50 backdrop-blur-sm"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
            onClick={handleCloseModal}
          />
          {/* Modal Content */}
          <Card className="w-full max-w-md relative z-10 m-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Create New Category
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the category"
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="icon"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Icon (Emoji)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      placeholder="e.g., 💻"
                      maxLength={2}
                      className="flex-1"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="px-3"
                      title="Pick an emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Optional: Add an emoji icon for this category
                  </p>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <>
                      {/* Backdrop untuk close picker saat klik outside */}
                      <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setShowEmojiPicker(false)}
                      />
                      {/* Emoji Picker - fixed positioning di center untuk tidak terpotong */}
                      <div
                        className="fixed z-[70]"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          maxHeight: "90vh",
                          overflow: "auto",
                        }}
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            setFormData((prev) => ({
                              ...prev,
                              icon: emojiData.emoji,
                            }));
                            setShowEmojiPicker(false);
                          }}
                          theme={(theme === "dark" ? "dark" : "light") as Theme}
                          width={350}
                          height={400}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
