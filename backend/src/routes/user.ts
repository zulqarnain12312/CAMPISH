import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload, deleteFile, getFileUrl } from '../utils/upload';
import path from 'path';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  authenticate,
  upload.single('avatar'),
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user!;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      user.email = email;
      user.isEmailVerified = false; // Reset email verification
    }

    if (name) {
      user.name = name;
    }

    // Process uploaded avatar
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatar && !user.avatar.includes('googleusercontent.com')) {
        const oldAvatarPath = path.join(__dirname, '../../uploads', user.avatar.replace('/uploads', ''));
        deleteFile(oldAvatarPath);
      }
      
      user.avatar = getFileUrl(req.file.path);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;

    // Delete avatar if exists
    if (user.avatar && !user.avatar.includes('googleusercontent.com')) {
      const avatarPath = path.join(__dirname, '../../uploads', user.avatar.replace('/uploads', ''));
      deleteFile(avatarPath);
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;