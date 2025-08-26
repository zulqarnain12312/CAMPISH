const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, isAdmin, optionalAuth, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 }
    };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Quality filter
    if (req.query.quality) {
      const qualities = req.query.quality.split(',');
      query.quality = { $in: qualities };
    }

    // Rating filter
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }

    // Search query
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price':
          sort = { price: req.query.sortOrder === 'desc' ? -1 : 1 };
          break;
        case 'rating':
          sort = { rating: req.query.sortOrder === 'desc' ? -1 : 1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { soldCount: -1 };
          break;
        case 'name':
          sort = { name: req.query.sortOrder === 'desc' ? -1 : 1 };
          break;
      }
    }

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Increment view count for authenticated users
    if (req.user) {
      products.forEach(product => {
        product.incrementViewCount();
      });
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.getFeatured(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.getTrending(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'name price images rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.isActive || !product.isPublished) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViewCount();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true,
      isPublished: true
    })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('relatedProducts', 'name price images rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViewCount();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const products = await Product.search(query, filters);
    const total = products.length;

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
router.get('/category/:categoryId', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Check if category exists
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get products in category
    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 }
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Product.countDocuments({
      category: req.params.categoryId,
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 }
    });

    res.json({
      success: true,
      data: products,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.remove();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update product stock (Admin only)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
router.patch('/:id/stock', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.updateStock(quantity, operation);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Toggle product status (Admin only)
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { isActive, isPublished } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (isActive !== undefined) product.isActive = isActive;
    if (isPublished !== undefined) product.isPublished = isPublished;

    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;