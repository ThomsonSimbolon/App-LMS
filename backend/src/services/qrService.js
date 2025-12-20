const QRCode = require('qrcode');

// Generate QR code
exports.generateQRCode = async (data) => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Verify data from QR code (simple validation)
exports.verifyQRData = (data, expectedPattern) => {
  return data.includes(expectedPattern);
};
