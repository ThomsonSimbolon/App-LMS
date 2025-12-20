const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const qrService = require('./qrService');

// Generate certificate PDF
exports.generateCertificatePDF = async (certificateData) => {
  try {
    const {
      certificateNumber,
      studentName,
      courseName,
      completionDate,
      instructorName,
      qrCodeDataURL
    } = certificateData;

    // Create PDF directory if not exists
    const pdfDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, `${certificateNumber}.pdf`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

      // Border
      doc.lineWidth(3);
      doc.strokeColor('#667eea');
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

      // Inner border
      doc.lineWidth(1);
      doc.strokeColor('#7c3aed');
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

      // Header
      doc.fontSize(32)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF COMPLETION', 0, 100, {
           align: 'center',
           width: doc.page.width
         });

      // Subtitle
      doc.fontSize(14)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('This is to certify that', 0, 180, {
           align: 'center',
           width: doc.page.width
         });

      // Student name
      doc.fontSize(36)
         .fillColor('#667eea')
         .font('Helvetica-Bold')
         .text(studentName, 0, 220, {
           align: 'center',
           width: doc.page.width
         });

      // Course completion text
      doc.fontSize(14)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('has successfully completed the course', 0, 290, {
           align: 'center',
           width: doc.page.width
         });

      // Course name
      doc.fontSize(24)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(courseName, 0, 320, {
           align: 'center',
           width: doc.page.width
         });

      // Completion date
      const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(12)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text(`Completed on: ${formattedDate}`, 0, 380, {
           align: 'center',
           width: doc.page.width
         });

      // Certificate number
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .font('Helvetica')
         .text(`Certificate No: ${certificateNumber}`, 0, 410, {
           align: 'center',
           width: doc.page.width
         });

      // Signature line (left)
      const signatureY = 480;
      doc.moveTo(120, signatureY).lineTo(280, signatureY).stroke();
      doc.fontSize(10)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(instructorName, 120, signatureY + 10, { width: 160, align: 'center' });
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Course Instructor', 120, signatureY + 26, { width: 160, align: 'center' });

      // Signature line (right)
      doc.moveTo(doc.page.width - 280, signatureY)
         .lineTo(doc.page.width - 120, signatureY)
         .stroke();
      doc.fontSize(10)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text('LMS Platform', doc.page.width - 280, signatureY + 10, { width: 160, align: 'center' });
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Educational Platform', doc.page.width - 280, signatureY + 26, { width: 160, align: 'center' });

      // QR Code
      if (qrCodeDataURL) {
        const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        doc.image(qrBuffer, doc.page.width / 2 - 40, signatureY - 20, {
          width: 80,
          height: 80
        });
        doc.fontSize(8)
           .fillColor('#9ca3af')
           .text('Scan to verify', doc.page.width / 2 - 40, signatureY + 65, { width: 80, align: 'center' });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(pdfPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate certificate PDF');
  }
};
