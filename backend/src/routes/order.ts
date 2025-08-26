import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create order
router.post('/create', [
  authenticate,
  body('shippingAddress').isObject(),
  body('shippingAddress.firstName').notEmpty().trim(),
  body('shippingAddress.lastName').notEmpty().trim(),
  body('shippingAddress.address').notEmpty().trim(),
  body('shippingAddress.city').notEmpty().trim(),
  body('shippingAddress.state').notEmpty().trim(),
  body('shippingAddress.postalCode').notEmpty().trim(),
  body('shippingAddress.country').notEmpty().trim(),
  body('paymentDetails').isObject(),
  body('paymentDetails.method').isIn(['stripe', 'paypal', 'cod']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user!;
    const { shippingAddress, billingAddress, paymentDetails, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and create order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product as any;
      
      if (!product.isActive) {
        return res.status(400).json({ 
          message: `Product ${product.name} is no longer available` 
        });
      }

      if (product.trackQuantity && product.quantity < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const orderItem = {
        product: product._id,
        name: product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        image: product.images[0]?.url || '',
        variant: cartItem.variant,
      };

      orderItems.push(orderItem);
      subtotal += cartItem.price * cartItem.quantity;
    }

    // Calculate totals (you can implement tax calculation logic here)
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: user._id,
      email: user.email,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentDetails: {
        ...paymentDetails,
        amount: total,
        currency: 'USD',
      },
      notes,
    });

    await order.save();

    // Update product quantities
    for (const cartItem of cart.items) {
      const product = cartItem.product as any;
      if (product.trackQuantity) {
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: -cartItem.quantity } }
        );
      }
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: user._id });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', [
  authenticate,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const filter: any = { user: user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name slug images')
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const order = await Order.findOne({
      _id: req.params.id,
      user: user._id,
    }).populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const order = await Order.findOne({
      _id: req.params.id,
      user: user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.trackQuantity) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes

// Get all orders (admin only)
router.get('/admin/all', [
  authenticate,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  query('search').optional().isString(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', [
  authenticate,
  requireAdmin,
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, trackingNumber, estimatedDelivery, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    if (notes) order.notes = notes;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
      
      // Restore product quantities
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.trackQuantity) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;