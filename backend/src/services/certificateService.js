const { Certificate } = require("../models");
const activityLogService = require("./activityLogService");

const CERTIFICATE_ALREADY_REQUESTED_MESSAGE =
  "Certificate has already been requested for this course";

/**
 * Ensures a student can request a certificate for a given course.
 * Blocks any repeat requests (including when the previous request was REJECTED).
 *
 * Throws an Error with `statusCode = 409` on conflict.
 */
exports.assertCertificateNotAlreadyRequested = async ({
  userId,
  courseId,
  req,
}) => {
  const normalizedCourseId = Number.parseInt(String(courseId), 10);

  const existing = await Certificate.findOne({
    where: {
      userId,
      courseId: normalizedCourseId,
    },
    attributes: ["id", "status", "certificateNumber"],
  });

  if (!existing) return;

  // Non-blocking but awaited to satisfy audit requirement.
  await activityLogService.log(
    "CERT_REQUEST_BLOCKED",
    { id: userId },
    { type: "COURSE", id: normalizedCourseId },
    {
      courseId: normalizedCourseId,
      existingCertificateId: existing.id,
      existingStatus: existing.status,
      existingCertificateNumber: existing.certificateNumber,
      reason: "CERTIFICATE_ALREADY_REQUESTED",
    },
    req
  );

  const error = new Error(CERTIFICATE_ALREADY_REQUESTED_MESSAGE);
  error.statusCode = 409;
  error.publicMessage = CERTIFICATE_ALREADY_REQUESTED_MESSAGE;
  throw error;
};

exports.constants = {
  CERTIFICATE_ALREADY_REQUESTED_MESSAGE,
};
