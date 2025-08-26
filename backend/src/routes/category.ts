import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload, deleteFile, getFileUrl } from '../utils/upload';
import path from 'path';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', [
  authenticate,
  requireAdmin,
  upload.single('categoryImage'),
  body('name').notEmpty().trim(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isActive, sortOrder } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const categoryData: any = {
      name,
      description,
      isActive: isActive !== 'false',
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    };

    // Process uploaded image
    if (req.file) {
      categoryData.image = getFileUrl(req.file.path);
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', [
  authenticate,
  requireAdmin,
  upload.single('categoryImage'),
], async (req: AuthRequest, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    Object.assign(category, req.body);

    // Process uploaded image if any
    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        const oldImagePath = path.join(__dirname, '../../uploads', category.image.replace('/uploads', ''));
        deleteFile(oldImagePath);
      }
      
      category.image = getFileUrl(req.file.path);
    }

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', [authenticate, requireAdmin], async (req: AuthRequest, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete associated image
    if (category.image) {
      const imagePath = path.join(__dirname, '../../uploads', category.image.replace('/uploads', ''));
      deleteFile(imagePath);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;