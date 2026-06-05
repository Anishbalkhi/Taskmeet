import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/tokenGenerator.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  const verificationToken = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    email_verification_token: verificationToken,
    email_verification_expires: expiresAt,
  });

  sendVerificationEmail(email, verificationToken).catch(err =>
    console.error(`Email failed: ${err.message}`)
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
  });
});

const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const token = jwt.sign(
    { sub: email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.is_email_verified,
    },
  });
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  const user = await User.findOne({
    email_verification_token: token,
    email_verification_expires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired verification token', 400));
  }

  user.is_email_verified = true;
  user.email_verification_token = undefined;
  user.email_verification_expires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = generateToken();
    user.reset_password_token = resetToken;
    user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    sendPasswordResetEmail(email, resetToken).catch(err =>
      console.error(`Reset email failed: ${err.message}`)
    );
  }

  res.json({
    success: true,
    message: 'If the email exists, a password reset link has been sent',
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    reset_password_token: token,
    reset_password_expires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  user.password = await bcrypt.hash(password, 10);
  user.reset_password_token = undefined;
  user.reset_password_expires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isEmailVerified: req.user.is_email_verified,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, roleName, phone, location, website } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio;
  if (roleName !== undefined) updates.roleName = roleName;
  if (phone !== undefined) updates.phone = phone;
  if (location !== undefined) updates.location = location;
  if (website !== undefined) updates.website = website;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      roleName: user.roleName,
      phone: user.phone,
      location: user.location,
      website: user.website,
      isEmailVerified: user.is_email_verified,
    },
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Current and new password are required', 400));
  }
  if (newPassword.length < 8) {
    return next(new ErrorResponse('New password must be at least 8 characters', 400));
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

export { register, login, verifyEmail, forgotPassword, resetPassword, getCurrentUser, updateProfile, changePassword };
