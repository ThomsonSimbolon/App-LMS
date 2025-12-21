const { Course, Section, Lesson, Quiz, Question, Category, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Course Versioning Service
 * 
 * Handles course versioning to allow instructors to update course content
 * without breaking student progress or issued certificates.
 */

/**
 * Increment version string
 * Examples: 1.0 -> 1.1, 1.9 -> 2.0, 2.5 -> 2.6
 * 
 * @param {string} currentVersion - Current version string (e.g., "1.0")
 * @returns {string} - Next version string (e.g., "1.1")
 */
const incrementVersion = (currentVersion) => {
  const parts = currentVersion.split('.');
  let major = parseInt(parts[0]) || 1;
  let minor = parseInt(parts[1]) || 0;

  // Increment minor version
  minor += 1;

  // If minor reaches 10, increment major and reset minor
  if (minor >= 10) {
    major += 1;
    minor = 0;
  }

  return `${major}.${minor}`;
};

/**
 * Publish a new version of a course
 * 
 * This function increments the version number of an existing course.
 * It does NOT create a new course - it only updates the version field.
 * 
 * Note: Students who enrolled before will keep their courseVersion in enrollment record,
 * so they can still access the version they enrolled in. New enrollments will use the updated version.
 * 
 * @param {number} courseId - Course ID to update
 * @param {number} instructorId - Instructor ID (for authorization)
 * @returns {Promise<Object>} - Updated course with new version
 */
const publishNewVersion = async (courseId, instructorId) => {
  try {
    // Get course
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    // Verify ownership
    if (course.instructorId !== instructorId) {
      throw new Error('You do not have permission to publish a new version of this course');
    }

    // Calculate new version
    const newVersion = incrementVersion(course.version || '1.0');

    // Update only the version field (and slug to reflect new version)
    // Remove any existing version suffix from slug (e.g., -v1-2, -v2-0)
    const baseSlug = course.slug.replace(/-v\d+-\d+$/, '').replace(/-v\d+\.\d+$/, '');
    const newSlug = `${baseSlug}-v${newVersion.replace('.', '-')}`;

    // Update version, slug, and set isPublished to true with publishedAt timestamp
    await course.update({
      version: newVersion,
      slug: newSlug,
      isPublished: true,
      publishedAt: new Date()
    });

    // Fetch updated course with relations for response
    const updatedCourse = await Course.findByPk(courseId, {
      include: [
        {
          model: Section,
          as: 'sections',
          include: [
            {
              model: Lesson,
              as: 'lessons'
            }
          ]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    return updatedCourse;

  } catch (error) {
    throw error;
  }
};

module.exports = {
  publishNewVersion,
  incrementVersion
};

