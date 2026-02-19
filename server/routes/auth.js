import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validatePassword } from '../utils/passwordValidation.js';

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/auth/signup
 */
router.post(
  '/signup',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password || 'Passwords do not match'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { fullName, email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const pwdCheck = validatePassword(password);
      if (!pwdCheck.valid) {
        return res.status(400).json({ message: pwdCheck.message });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }

      const user = await User.create({ fullName, email, password });
      const token = generateToken(user._id);

      res.cookie('token', token, { ...cookieOptions, path: '/' });
      res.status(201).json({
        message: 'Account created successfully',
        user: { id: user._id, fullName: user.fullName, email: user.email },
        token,
      });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      res.cookie('token', token, { ...cookieOptions, path: '/' });
      res.json({
        message: 'Login successful',
        user: { id: user._id, fullName: user.fullName, email: user.email },
        token,
      });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me - Get current user (protected)
 */
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
