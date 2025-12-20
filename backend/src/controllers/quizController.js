const { Quiz, Question, ExamResult, Course, User, Section, Lesson } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Get quiz details
exports.getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Get question count
    const questionCount = await Question.count({ where: { quizId } });

    // Get user's attempts
    const myAttempts = await ExamResult.count({
      where: {
        quizId,
        userId: req.user.userId
      }
    });

    // Get best score
    const bestResult = await ExamResult.findOne({
      where: {
        quizId,
        userId: req.user.userId
      },
      order: [['score', 'DESC']]
    });

    const canRetake = quiz.maxAttempts === 0 || myAttempts < quiz.maxAttempts;

    res.status(200).json({
      success: true,
      data: {
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        maxAttempts: quiz.maxAttempts,
        questionCount,
        myAttempts,
        bestScore: bestResult ? bestResult.score : 0,
        canRetake,
        randomizeQuestions: quiz.randomizeQuestions,
        showAnswersAfterSubmit: quiz.showAnswersAfterSubmit
      }
    });

  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Start quiz
exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check attempts limit
    if (quiz.maxAttempts > 0) {
      const attempts = await ExamResult.count({
        where: {
          quizId,
          userId: req.user.userId
        }
      });

      if (attempts >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          error: 'Maximum attempts reached',
          message: `You have reached the maximum number of attempts (${quiz.maxAttempts})`
        });
      }
    }

    // Get questions
    let questions = await Question.findAll({
      where: { quizId },
      order: quiz.randomizeQuestions ? [['order', 'ASC']] : [['order', 'ASC']],
      attributes: ['id', 'question', 'type', 'options', 'points', 'order']
    });

    // Randomize if needed
    if (quiz.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    const sessionId = uuidv4();
    const startedAt = new Date();
    const expiresAt = quiz.timeLimit 
      ? new Date(startedAt.getTime() + quiz.timeLimit * 60000)
      : null;

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          points: q.points
        })),
        startedAt,
        expiresAt,
        timeLimit: quiz.timeLimit
      }
    });

  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { sessionId, answers, startedAt } = req.body;

    if (!answers || !sessionId || !startedAt) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Session ID, answers, and start time are required'
      });
    }

    const quiz = await Quiz.findByPk(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check time limit
    const submittedAt = new Date();
    const timeSpent = Math.floor((submittedAt - new Date(startedAt)) / 1000); // in seconds

    if (quiz.timeLimit && timeSpent > quiz.timeLimit * 60) {
      return res.status(400).json({
        success: false,
        error: 'Time limit exceeded',
        message: 'Quiz submission time has expired'
      });
    }

    // Get all questions
    const questions = await Question.findAll({ where: { quizId } });

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (userAnswer !== undefined) {
        // Compare answers (handle different question types)
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          if (userAnswer.toString() === question.correctAnswer.toString()) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'SHORT_ANSWER') {
          // For short answer, do case-insensitive comparison
          if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            earnedPoints += question.points;
          }
        }
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= quiz.passingScore;

    // Get current attempt number
    const attemptNumber = await ExamResult.count({
      where: {
        quizId,
        userId: req.user.userId
      }
    }) + 1;

    // Save result
    const result = await ExamResult.create({
      userId: req.user.userId,
      quizId,
      answers: JSON.stringify(answers),
      score,
      totalPoints: earnedPoints,
      maxPoints: totalPoints,
      isPassed,
      attemptNumber,
      startedAt,
      submittedAt,
      timeSpent
    });

    res.status(200).json({
      success: true,
      message: isPassed ? 'Congratulations! You passed!' : 'You did not pass. Try again!',
      data: {
        resultId: result.id,
        score,
        totalPoints: earnedPoints,
        maxPoints: totalPoints,
        isPassed,
        attemptNumber,
        timeSpent,
        passingScore: quiz.passingScore
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const results = await ExamResult.findAll({
      where: {
        quizId,
        userId: req.user.userId
      },
      order: [['createdAt', 'DESC']]
    });

    // If show answers is enabled, include correct answers
    let questionsWithAnswers = null;
    if (quiz.showAnswersAfterSubmit && results.length > 0) {
      const questions = await Question.findAll({ where: { quizId } });
      const latestResult = results[0];
      const userAnswers = JSON.parse(latestResult.answers);

      questionsWithAnswers = questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[q.id],
        isCorrect: userAnswers[q.id]?.toString() === q.correctAnswer?.toString(),
        explanation: q.explanation,
        points: q.points
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          passingScore: quiz.passingScore
        },
        results: results.map(r => ({
          id: r.id,
          score: r.score,
          totalPoints: r.totalPoints,
          maxPoints: r.maxPoints,
          isPassed: r.isPassed,
          attemptNumber: r.attemptNumber,
          timeSpent: r.timeSpent,
          submittedAt: r.submittedAt
        })),
        questionsWithAnswers
      }
    });

  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Create quiz (Instructor/Admin)
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      type = 'PRACTICE',
      courseId,
      lessonId,
      passingScore = 70,
      timeLimit = 0,
      maxAttempts = 0,
      randomizeQuestions = false,
      showAnswersAfterSubmit = true
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title is required'
      });
    }

    // Verify ownership if linked to course
    if (courseId) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      if (course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    const quiz = await Quiz.create({
      title,
      type,
      courseId: courseId || null,
      lessonId: lessonId || null,
      passingScore,
      timeLimit,
      maxAttempts,
      randomizeQuestions,
      showAnswersAfterSubmit
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const {
      question,
      type,
      options,
      correctAnswer,
      points = 1,
      order,
      explanation
    } = req.body;

    if (!question || !type || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Question, type, and correct answer are required'
      });
    }

    const quiz = await Quiz.findByPk(quizId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check permission
    if (quiz.course && quiz.course.instructorId !== req.user.userId && req.user.roleName !== 'ADMIN' && req.user.roleName !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get next order if not provided
    let questionOrder = order;
    if (!questionOrder) {
      const maxOrder = await Question.max('order', { where: { quizId } });
      questionOrder = (maxOrder || 0) + 1;
    }

    const newQuestion = await Question.create({
      quizId,
      question,
      type,
      options: Array.isArray(options) ? JSON.stringify(options) : options,
      correctAnswer,
      points,
      order: questionOrder,
      explanation
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: newQuestion
    });

  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
