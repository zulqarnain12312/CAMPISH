const express = require('express');
const { query, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/featured
// @desc    Get featured categories
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Get categories with products
    const categories = await Category.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $match: {
          productCount: { $gt: 0 }
        }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          name: 1,
          description: 1,
          image: 1,
          slug: 1,
          productCount: 1,
          isActive: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
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
      message: 'Server error while fetching category'
    });
  }
});

// @route   GET /api/categories/slug/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
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
      message: 'Server error while fetching category'
    });
  }
});

// @route   GET /api/categories/:id/products
// @desc    Get products by category with pagination
// @access  Public
router.get('/:id/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['price', 'name', 'createdAt', 'rating']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Get products by category
    const products = await Product.find({
      category: id,
      isActive: true
    })
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

    // Get total count
    const totalProducts = await Product.countDocuments({
      category: id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalProducts,
          pages: Math.ceil(totalProducts / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category products'
    });
  }
});

// @route   GET /api/categories/:id/stats
// @desc    Get category statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get category statistics
    const stats = await Product.aggregate([
      {
        $match: {
          category: category._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalViews: { $sum: '$viewCount' },
          totalSold: { $sum: '$soldCount' },
          averageRating: { $avg: '$ratings.average' }
        }
      }
    ]);

    const categoryStats = stats[0] || {
      totalProducts: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalViews: 0,
      totalSold: 0,
      averageRating: 0
    };

    res.json({
      success: true,
      data: {
        category,
        stats: categoryStats
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category statistics'
    });
  }
});

// @route   GET /api/categories/parent/:parentId
// @desc    Get subcategories by parent ID
// @access  Public
router.get('/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    const subcategories = await Category.find({
      parent: parentId,
      isActive: true
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories'
    });
  }
});

// @route   GET /api/categories/tree
// @desc    Get category tree structure
// @access  Public
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => String(item.parent) === String(parentId))
        .map(item => ({
          ...item.toObject(),
          children: buildTree(items, item._id)
        }));
    };

    const categoryTree = buildTree(categories);

    res.json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category tree'
    });
  }
});

module.exports = router;