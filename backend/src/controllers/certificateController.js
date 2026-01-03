const {
  Certificate,
  Course,
  User,
  Enrollment,
  Lesson,
  Section,
  CourseAssessor,
} = require("../models");
const { Op } = require("sequelize");
const qrService = require("../services/qrService");
const pdfService = require("../services/pdfService");
const cloudinaryService = require("../services/cloudinaryService");
const activityLogService = require("../services/activityLogService");
const notificationService = require("../services/notificationService");
const certificateService = require("../services/certificateService");
const crypto = require("crypto");
const path = require("path");

// Request certificate
exports.requestCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Course ID is required",
      });
    }

    // Check if enrolled and completed
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.userId,
        courseId,
        status: "COMPLETED",
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "requireManualApproval"],
          include: [
            {
              model: User,
              as: "instructor",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        error: "Course not completed",
        message: "You must complete the course before requesting a certificate",
      });
    }

    // Service-layer validation: prevent duplicate requests (including after REJECTED)
    await certificateService.assertCertificateNotAlreadyRequested({
      userId: req.user.userId,
      courseId,
      req,
    });

    // Generate certificate number
    const certificateNumber = `LMS-${new Date().getFullYear()}-CERT-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Generate QR code
    const frontendBaseUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const verifyUrl = `${frontendBaseUrl}/verify/${certificateNumber}`;
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
      qrCodeDataURL: qrCode,
    });

    // Upload PDF to Cloudinary (if configured, otherwise use local)
    let pdfUrl = `/uploads/certificates/${certificateNumber}.pdf`;
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const upload = await cloudinaryService.uploadPDF(
          { path: pdfPath },
          "certificates"
        );
        pdfUrl = upload.url;
      }
    } catch (uploadError) {
      console.log("Using local PDF storage");
    }

    // Create certificate with course version
    const certificate = await Certificate.create({
      userId: req.user.userId,
      courseId,
      certificateNumber,
      qrCode,
      pdfUrl,
      status: enrollment.course.requireManualApproval ? "PENDING" : "APPROVED",
      issuedAt: enrollment.course.requireManualApproval ? null : new Date(),
      issuedBy: enrollment.course.requireManualApproval
        ? null
        : enrollment.course.instructorId,
      courseVersion:
        enrollment.course.version || enrollment.courseVersion || "1.0", // Save course version
    });

    // Log certificate request activity (non-blocking)
    // Note: user already fetched above at line 74
    activityLogService.logCertRequested(user, certificate, req).catch((err) => {
      console.error("Failed to log certificate request activity:", err);
    });

    // Send certificate request notification (non-blocking)
    const certStatus = enrollment.course.requireManualApproval
      ? "PENDING"
      : "APPROVED";
    const io = req.app.locals.io;
    notificationService
      .notifyCertificateStatus(
        req.user.userId,
        certificate,
        certStatus,
        null,
        io
      )
      .catch((err) => {
        console.error("Failed to send certificate notification:", err);
      });

    res.status(201).json({
      success: true,
      message: enrollment.course.requireManualApproval
        ? "Certificate request submitted for approval"
        : "Certificate generated successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Request certificate error:", error);

    if (error?.statusCode === 409) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: error.publicMessage || error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
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
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { certificates },
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
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
        status: "APPROVED",
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found or not approved",
      });
    }

    // If using Cloudinary, redirect to URL
    if (certificate.pdfUrl.startsWith("http")) {
      return res.redirect(certificate.pdfUrl);
    }

    // If local file
    const filePath = path.join(__dirname, "../../", certificate.pdfUrl);
    res.download(filePath);
  } catch (error) {
    console.error("Download certificate error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Approve/Reject certificate (Assessor/Admin)
exports.approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const certificate = await Certificate.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found",
      });
    }

    // Authorization: Check if ASSESSOR is assigned to this course
    // ADMIN and SUPER_ADMIN can always approve (fallback)
    if (req.user.roleName === "ASSESSOR") {
      const isAssigned = await CourseAssessor.findOne({
        where: {
          courseId: certificate.courseId,
          assessorId: req.user.userId,
        },
      });

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message:
            "You are not assigned as assessor for this course. Only assigned assessors can approve certificates.",
        });
      }
    }

    await certificate.update({
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvedBy: req.user.userId,
      rejectionReason: status === "REJECTED" ? rejectionReason : null,
    });

    // Log certificate approval/rejection activity (non-blocking)
    const approver = await User.findByPk(req.user.userId);
    if (status === "APPROVED") {
      activityLogService
        .logCertApproved(approver, certificate, req)
        .catch((err) => {
          console.error("Failed to log certificate approval activity:", err);
        });
    } else if (status === "REJECTED") {
      activityLogService
        .logCertRejected(approver, certificate, rejectionReason, req)
        .catch((err) => {
          console.error("Failed to log certificate rejection activity:", err);
        });
    }

    // Send certificate status notification to student (non-blocking)
    const io = req.app.locals.io;
    notificationService
      .notifyCertificateStatus(
        certificate.userId,
        certificate,
        status,
        rejectionReason,
        io
      )
      .catch((err) => {
        console.error("Failed to send certificate status notification:", err);
      });

    res.status(200).json({
      success: true,
      message: `Certificate ${status.toLowerCase()} successfully`,
      data: certificate,
    });
  } catch (error) {
    console.error("Approve certificate error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get pending certificates (Assessor/Admin)
exports.getPendingCertificates = async (req, res) => {
  try {
    // Build where clause for certificate filtering
    const where = { status: "PENDING" };

    // If ASSESSOR role, only show certificates from assigned courses
    if (req.user.roleName === "ASSESSOR") {
      // Get all course IDs where this assessor is assigned
      const assignedCourses = await CourseAssessor.findAll({
        where: { assessorId: req.user.userId },
        attributes: ["courseId"],
      });

      const assignedCourseIds = assignedCourses.map((ca) => ca.courseId);

      // If no assigned courses, return empty array
      if (assignedCourseIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: { certificates: [] },
          message:
            "No certificates found. You are not assigned to any courses.",
        });
      }

      // Filter certificates by assigned course IDs using Sequelize Op.in
      where.courseId = { [Op.in]: assignedCourseIds };
    }
    // ADMIN and SUPER_ADMIN can see all pending certificates

    const certificates = await Certificate.findAll({
      where,
      include: [
        {
          model: User,
          as: "student", // Use 'student' alias as defined in models/index.js
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Format response to match frontend expectations
    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      status: cert.status,
      courseVersion: cert.courseVersion,
      createdAt: cert.createdAt,
      user: cert.student
        ? {
            id: cert.student.id,
            firstName: cert.student.firstName,
            lastName: cert.student.lastName,
            email: cert.student.email,
          }
        : null,
      course: cert.course
        ? {
            id: cert.course.id,
            title: cert.course.title,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: { certificates: formattedCertificates },
    });
  } catch (error) {
    console.error("Get pending certificates error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
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
        status: "APPROVED",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["title"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found",
        message: "Invalid certificate number or certificate not approved",
      });
    }

    res.status(200).json({
      success: true,
      message: "Certificate is valid",
      data: {
        certificateNumber: certificate.certificateNumber,
        status: certificate.status,
        student: {
          firstName: certificate.user.firstName,
          lastName: certificate.user.lastName,
        },
        course: {
          title: certificate.course.title,
          version: certificate.courseVersion || "1.0", // Include course version
        },
        issuedAt: certificate.issuedAt,
        courseVersion: certificate.courseVersion || "1.0",
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
