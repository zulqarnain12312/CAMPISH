const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, isAdmin, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const categories = await Category.getFeatured();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.getTree();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug')
      .populate('children', 'name slug image');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (!category.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true
    })
    .populate('parent', 'name slug')
    .populate('children', 'name slug image');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get category breadcrumb
// @route   GET /api/categories/:id/breadcrumb
// @access  Public
router.get('/:id/breadcrumb', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const breadcrumb = await category.getBreadcrumb();

    res.json({
      success: true,
      data: breadcrumb
    });
  } catch (error) {
    console.error('Get category breadcrumb error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({
      category: req.params.id,
      isActive: true,
      isPublished: true
    });

    // Get average price
    const avgPriceResult = await Product.aggregate([
      {
        $match: {
          category: category._id,
          isActive: true,
          isPublished: true
        }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const stats = {
      productCount,
      avgPrice: avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0,
      minPrice: avgPriceResult.length > 0 ? avgPriceResult[0].minPrice : 0,
      maxPrice: avgPriceResult.length > 0 ? avgPriceResult[0].maxPrice : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${productCount} products. Please move or delete the products first.`
      });
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories. Please delete subcategories first.'
      });
    }

    await category.remove();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Toggle category status (Admin only)
// @route   PATCH /api/categories/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { isActive, isFeatured } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (isActive !== undefined) category.isActive = isActive;
    if (isFeatured !== undefined) category.isFeatured = isFeatured;

    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update category sort order (Admin only)
// @route   PATCH /api/categories/:id/sort-order
// @access  Private/Admin
router.patch('/:id/sort-order', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { sortOrder } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    category.sortOrder = sortOrder || 0;
    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Update category sort order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Bulk update categories (Admin only)
// @route   PATCH /api/categories/bulk
// @access  Private/Admin
router.patch('/bulk', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        error: 'Categories array is required'
      });
    }

    const updatePromises = categories.map(async (cat) => {
      return Category.findByIdAndUpdate(
        cat._id,
        { sortOrder: cat.sortOrder, isActive: cat.isActive, isFeatured: cat.isFeatured },
        { new: true }
      );
    });

    const updatedCategories = await Promise.all(updatePromises);

    res.json({
      success: true,
      data: updatedCategories
    });
  } catch (error) {
    console.error('Bulk update categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;