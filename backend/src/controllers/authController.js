const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Role } = require('../models');
const { jwtConfig } = require('../config/jwt');
const emailService = require('../services/emailService');

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role ? user.role.name : null
  };

  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiration
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiration
  });

  return { accessToken, refreshToken };
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, roleId } = req.body;

    // Validation
    if (!email || !password || !firstName || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: [
          { field: 'required', message: 'Email, password, firstName, and roleId are required' }
        ]
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: [
          { field: 'email', message: 'Invalid email format' }
        ]
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: [
          { field: 'email', message: 'Email is already in use' }
        ]
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: [
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]
      });
    }

    // Validate role
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: [
          { field: 'roleId', message: 'Invalid role ID' }
        ]
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName: lastName || null,
      roleId,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
      isActive: true
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    // Fetch user with role
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password', 'emailVerificationToken', 'refreshToken'] }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: userWithRole
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Email not verified',
        message: 'Please verify your email before logging in'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: 'Your account has been deactivated'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token
    await user.update({
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date()
    });

    // Return user without sensitive data
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: jwtConfig.accessExpiration
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token',
        message: 'Email verification token is invalid'
      });
    }

    // Check if token expired
    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        error: 'Token expired',
        message: 'Email verification token has expired'
      });
    }

    // Verify email
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token is invalid or expired'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { id: decoded.userId, refreshToken },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: jwtConfig.accessExpiration
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    await User.update(
      { refreshToken: null },
      { where: { id: userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
