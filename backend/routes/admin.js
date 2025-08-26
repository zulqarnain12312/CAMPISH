const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, isAdmin, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, isAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
      isActive: true
    })
    .select('name stock price')
    .limit(10);

    // Get revenue stats
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      recentOrders,
      lowStockProducts,
      revenue: revenueStats.length > 0 ? revenueStats[0] : {
        totalRevenue: 0,
        averageOrderValue: 0,
        orderCount: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get sales statistics
// @route   GET /api/admin/dashboard/sales
// @access  Private/Admin
router.get('/dashboard/sales', protect, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const days = req.query.days || 30;

    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // Get daily sales
    const dailySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailySales,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload image
// @route   POST /api/admin/upload/image
// @access  Private/Admin
router.post('/upload/image', protect, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Upload video
// @route   POST /api/admin/upload/video
// @access  Private/Admin
router.post('/upload/video', protect, isAdmin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
router.patch('/users/:id/role', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
router.patch('/users/:id/status', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user details (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist', 'name price images');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ user: req.params.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user,
        orders
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, isAdmin, async (req, res) => {
  try {
    // This would typically come from a settings collection or environment variables
    const settings = {
      siteName: 'CAMPISH',
      siteDescription: 'Premium E-commerce Store',
      contactEmail: 'support@campish.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Commerce St, City, State 12345',
      socialMedia: {
        facebook: 'https://facebook.com/campish',
        twitter: 'https://twitter.com/campish',
        instagram: 'https://instagram.com/campish'
      },
      paymentMethods: ['stripe', 'paypal'],
      shippingMethods: ['standard', 'express', 'free'],
      maintenanceMode: false
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    // This would typically save to a settings collection
    const settings = req.body;

    // For now, just return the updated settings
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get backup data
// @route   GET /api/admin/backup
// @access  Private/Admin
router.get('/backup', protect, isAdmin, async (req, res) => {
  try {
    // This would typically create a database backup
    const backupData = {
      timestamp: new Date().toISOString(),
      products: await Product.countDocuments(),
      categories: await Category.countDocuments(),
      users: await User.countDocuments(),
      orders: await Order.countDocuments()
    };

    res.json({
      success: true,
      data: backupData
    });
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;