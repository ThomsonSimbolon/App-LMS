const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const sectionController = require('../controllers/sectionController');
const lessonController = require('../controllers/lessonController');
const { verifyToken, hasRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', courseController.getAllCourses);

// Authenticated routes
router.get('/my-courses', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  courseController.getMyCourses
);

router.get('/:id', courseController.getCourseById);

// Instructor/Admin routes - Course management
router.post('/', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  upload.single('thumbnail'),
  courseController.createCourse
);

router.put('/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  upload.single('thumbnail'),
  courseController.updateCourse
);

router.delete('/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  courseController.deleteCourse
);

router.patch('/:id/publish', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  courseController.togglePublish
);

// Section management
router.post('/:courseId/sections', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  sectionController.createSection
);

router.put('/sections/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  sectionController.updateSection
);

router.delete('/sections/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  sectionController.deleteSection
);

// Lesson management
router.post('/sections/:sectionId/lessons', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  upload.single('file'),
  lessonController.createLesson
);

router.put('/lessons/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  upload.single('file'),
  lessonController.updateLesson
);

router.delete('/lessons/:id', 
  verifyToken, 
  hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  lessonController.deleteLesson
);

module.exports = router;
