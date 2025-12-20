const { Certificate, Course, User, Enrollment, Lesson, Section } = require('../models');
const qrService = require('../services/qrService');
const pdfService = require('../services/pdfService');
const cloudinaryService = require('../services/cloudinaryService');
const crypto = require('crypto');
const path = require('path');

// Request certificate
exports.requestCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Course ID is required'
      });
    }

    // Check if enrolled and completed
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId,
        status: 'COMPLETED'
      },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'requireManualApproval'],
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['firstName', 'lastName']
        }]
      }]
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        error: 'Course not completed',
        message: 'You must complete the course before requesting a certificate'
      });
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({
      where: {
        userId: req.user.userId,
        courseId
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Certificate already exists',
        message: 'You have already requested a certificate for this course'
      });
    }

    // Generate certificate number
    const certificateNumber = `LMS-${new Date().getFullYear()}-CERT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Generate QR code
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateNumber}`;
    const qrCode = await qrService.generateQRCode(verifyUrl);

    // Get user data
    const user = await User.findByPk(req.user.userId);
    const studentName = `${user.firstName} ${user.lastName}`;
    const instructorName = `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`;

    // Generate PDF
    const pdfPath = await pdfService.generateCertificatePDF({
      certificateNumber,
      studentName,
      courseName: enrollment.course.title,
      completionDate: enrollment.completedAt,
      instructorName,
      qrCodeDataURL: qrCode
    });

    // Upload PDF to Cloudinary (if configured, otherwise use local)
    let pdfUrl = `/uploads/certificates/${certificateNumber}.pdf`;
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const upload = await cloudinaryService.uploadPDF({ path: pdfPath }, 'certificates');
        pdfUrl = upload.url;
      }
    } catch (uploadError) {
      console.log('Using local PDF storage');
    }

    // Create certificate
    const certificate = await Certificate.create({
      userId: req.user.userId,
      courseId,
      certificateNumber,
      qrCode,
      pdfUrl,
      status: enrollment.course.requireManualApproval ? 'PENDING' : 'APPROVED',
      issuedAt: enrollment.course.requireManualApproval ? null : new Date(),
      issuedBy: enrollment.course.requireManualApproval ? null : enrollment.course.instructorId
    });

    res.status(201).json({
      success: true,
      message: enrollment.course.requireManualApproval 
        ? 'Certificate request submitted for approval'
        : 'Certificate generated successfully',
      data: certificate
    });

  } catch (error) {
    console.error('Request certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get my certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.userId };
    if (status) where.status = status;

    const certificates = await Certificate.findAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { certificates }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Download certificate PDF
exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({
      where: {
        id,
        userId: req.user.userId,
        status: 'APPROVED'
      }
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or not approved'
      });
    }

    // If using Cloudinary, redirect to URL
    if (certificate.pdfUrl.startsWith('http')) {
      return res.redirect(certificate.pdfUrl);
    }

    // If local file
    const filePath = path.join(__dirname, '../../', certificate.pdfUrl);
    res.download(filePath);

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Approve/Reject certificate (Assessor/Admin)
exports.approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Status must be APPROVED or REJECTED'
      });
    }

    const certificate = await Certificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    await certificate.update({
      status,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      approvedBy: req.user.userId,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null
    });

    res.status(200).json({
      success: true,
      message: `Certificate ${status.toLowerCase()} successfully`,
      data: certificate
    });

  } catch (error) {
    console.error('Approve certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get pending certificates (Assessor/Admin)
exports.getPendingCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { status: 'PENDING' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { certificates }
    });

  } catch (error) {
    console.error('Get pending certificates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Verify certificate (Public - no auth)
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      where: {
        certificateNumber,
        status: 'APPROVED'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['title']
        }
      ]
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        message: 'Invalid certificate number or certificate not approved'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateNumber: certificate.certificateNumber,
        status: certificate.status,
        student: {
          firstName: certificate.user.firstName,
          lastName: certificate.user.lastName
        },
        course: {
          title: certificate.course.title
        },
        issuedAt: certificate.issuedAt
      }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
