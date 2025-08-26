const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, isAdmin, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, sanitizeInput, async (req, res) => {
  try {
    const {
      paymentMethod,
      shippingAddress,
      shippingMethod,
      notes
    } = req.body;

    // Get user's cart
    const cart = await Cart.getOrCreate(req.user._id);

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      selectedOptions: item.selectedOptions,
      total: item.price * item.quantity
    }));

    // Calculate totals
    const subtotal = cart.subtotal;
    const discount = cart.discountAmount;
    const shippingCost = cart.shippingCost || 0;
    const total = cart.total;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      shippingCost,
      total,
      paymentMethod,
      shippingAddress: shippingAddress || cart.shippingAddress,
      shippingMethod: shippingMethod || cart.shippingMethod,
      notes: notes || cart.notes,
      coupon: cart.coupon
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity }
      });
    }

    // Clear cart
    await cart.clearCart();

    // Populate order with product details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get order by number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
router.get('/number/:orderNumber', protect, async (req, res) => {
  try {
    const order = await Order.getByNumber(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
router.patch('/:id/cancel', protect, sanitizeInput, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order is already cancelled'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel delivered order'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', req.user._id);
    order.cancelReason = reason;
    await order.save();

    // Restore product stock if order was processing or shipped
    if (['processing', 'shipped'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update status
    await order.updateStatus(status, req.user._id);

    // Add tracking information if provided
    if (trackingNumber && carrier) {
      await order.addTracking(trackingNumber, carrier);
    }

    // Populate order with details
    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update payment status (Admin only)
// @route   PATCH /api/orders/:id/payment
// @access  Private/Admin
router.patch('/:id/payment', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { paymentStatus, paymentIntentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update payment status
    await order.updatePaymentStatus(paymentStatus);

    // Update payment intent ID if provided
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Process refund (Admin only)
// @route   PATCH /api/orders/:id/refund
// @access  Private/Admin
router.patch('/:id/refund', protect, isAdmin, sanitizeInput, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid refund amount is required'
      });
    }

    // Process refund
    await order.processRefund(amount, reason);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: order
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};

    // Apply filters
    if (req.query.status) filters.status = req.query.status;
    if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
    if (req.query.user) filters.user = req.query.user;
    if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
    if (req.query.dateTo) filters.dateTo = req.query.dateTo;

    const orders = await Order.getWithFilters(filters, page, limit);
    const total = await Order.countDocuments(filters);

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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const stats = await Order.getStats(period);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get order analytics (Admin only)
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
router.get('/admin/analytics', protect, isAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders by status
    const statusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Get orders by day
    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;