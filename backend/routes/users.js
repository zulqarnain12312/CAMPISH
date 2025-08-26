const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        preferences: user.preferences,
        addresses: user.addresses,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, sanitizeInput, async (req, res) => {
  try {
    const { name, phone, preferences, addresses } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (addresses) user.addresses = addresses;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        preferences: user.preferences,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
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

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.getByUser(req.user._id, page, limit);
    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        select: 'name price images rating reviewCount stock isActive isPublished',
        match: { isActive: true, isPublished: true }
      });

    res.json({
      success: true,
      data: user.wishlist || []
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
router.post('/wishlist', protect, sanitizeInput, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product is already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/users/wishlist
// @access  Private
router.delete('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', protect, sanitizeInput, async (req, res) => {
  try {
    const {
      type = 'home',
      street,
      city,
      state,
      zipCode,
      country = 'United States',
      isDefault = false
    } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Street, city, state, and zip code are required'
      });
    }

    const user = await User.findById(req.user._id);

    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      isDefault = true;
    }

    // If this address is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: newAddress
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:index
// @access  Private
router.put('/addresses/:index', protect, sanitizeInput, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const {
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault
    } = req.body;

    const user = await User.findById(req.user._id);

    if (index < 0 || index >= user.addresses.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address index'
      });
    }

    const address = user.addresses[index];

    if (type) address.type = type;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;

    // Handle default address
    if (isDefault !== undefined) {
      if (isDefault) {
        user.addresses.forEach((addr, i) => {
          addr.isDefault = i === index;
        });
      } else {
        address.isDefault = false;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:index
// @access  Private
router.delete('/addresses/:index', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user = await User.findById(req.user._id);

    if (index < 0 || index >= user.addresses.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address index'
      });
    }

    const deletedAddress = user.addresses.splice(index, 1)[0];

    // If deleted address was default, make first address default
    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Set default address
// @route   PATCH /api/users/addresses/:index/default
// @access  Private
router.patch('/addresses/:index/default', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user = await User.findById(req.user._id);

    if (index < 0 || index >= user.addresses.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address index'
      });
    }

    // Unset all defaults
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    user.addresses[index].isDefault = true;
    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully'
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, sanitizeInput, async (req, res) => {
  try {
    const { language, currency, notifications } = req.body;

    const user = await User.findById(req.user._id);

    if (language) user.preferences.language = language;
    if (currency) user.preferences.currency = currency;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get wishlist count
    const user = await User.findById(userId);
    const wishlistCount = user.wishlist.length;

    const stats = {
      totalOrders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
      totalSpent: orderStats.length > 0 ? orderStats[0].totalSpent : 0,
      averageOrderValue: orderStats.length > 0 ? orderStats[0].averageOrderValue : 0,
      wishlistCount
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;