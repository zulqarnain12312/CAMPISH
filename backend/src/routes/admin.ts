import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', [authenticate, requireAdmin], async (req: AuthRequest, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      recentOrders,
      topProducts,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Product.find({ isActive: true })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      monthlyRevenue: monthlyRevenue[0]?.totalRevenue || 0,
      monthlyOrders: monthlyRevenue[0]?.orderCount || 0,
      recentOrders,
      topProducts,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', [
  authenticate,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('role').optional().isIn(['user', 'admin']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (admin only) - includes inactive products
router.get('/products', [
  authenticate,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('category').optional().isMongoId(),
  query('status').optional().isIn(['active', 'inactive']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;

    const filter: any = {};
    
    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all categories (admin only) - includes inactive categories
router.get('/categories', [authenticate, requireAdmin], async (req: AuthRequest, res) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json(categories);
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', [
  authenticate,
  requireAdmin,
], async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user!._id && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', [authenticate, requireAdmin], async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user!._id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sales analytics
router.get('/analytics/sales', [
  authenticate,
  requireAdmin,
  query('period').optional().isIn(['week', 'month', 'year']),
], async (req: AuthRequest, res) => {
  try {
    const period = req.query.period as string || 'month';
    
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // month
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;