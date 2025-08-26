const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discountAmount,
        shippingCost: cart.shippingCost,
        total: cart.total,
        itemCount: cart.itemCount,
        coupon: cart.coupon,
        shippingAddress: cart.shippingAddress,
        shippingMethod: cart.shippingMethod,
        notes: cart.notes
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post('/items', protect, sanitizeInput, async (req, res) => {
  try {
    const { productId, quantity = 1, options = [] } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.isActive || !product.isPublished) {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Get or create cart
    const cart = await Cart.getOrCreate(req.user._id);

    // Add item to cart
    await cart.addItem(productId, quantity, options);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
router.put('/items/:itemId', protect, sanitizeInput, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    const cart = await Cart.getOrCreate(req.user._id);
    await cart.updateItemQuantity(req.params.itemId, quantity);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
router.delete('/items/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.getOrCreate(req.user._id);
    await cart.removeItem(req.params.itemId);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount
      }
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.getOrCreate(req.user._id);
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        _id: cart._id,
        items: [],
        subtotal: 0,
        discount: 0,
        shippingCost: 0,
        total: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
router.post('/coupon', protect, sanitizeInput, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    const cart = await Cart.getOrCreate(req.user._id);
    await cart.applyCoupon(code);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount,
        coupon: updatedCart.coupon
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
router.delete('/coupon', protect, async (req, res) => {
  try {
    const cart = await Cart.getOrCreate(req.user._id);
    await cart.removeCoupon();

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount,
        coupon: null
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Set shipping address
// @route   POST /api/cart/shipping-address
// @access  Private
router.post('/shipping-address', protect, sanitizeInput, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'United States'
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        error: 'All shipping address fields are required'
      });
    }

    const shippingAddress = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country
    };

    const cart = await Cart.getOrCreate(req.user._id);
    await cart.setShippingAddress(shippingAddress);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Shipping address updated successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount,
        shippingAddress: updatedCart.shippingAddress
      }
    });
  } catch (error) {
    console.error('Set shipping address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Set shipping method
// @route   POST /api/cart/shipping-method
// @access  Private
router.post('/shipping-method', protect, sanitizeInput, async (req, res) => {
  try {
    const { name, cost = 0, estimatedDays } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Shipping method name is required'
      });
    }

    const shippingMethod = {
      name,
      cost: parseFloat(cost),
      estimatedDays
    };

    const cart = await Cart.getOrCreate(req.user._id);
    await cart.setShippingMethod(shippingMethod);

    // Refresh cart data
    const updatedCart = await Cart.getOrCreate(req.user._id);

    res.json({
      success: true,
      message: 'Shipping method updated successfully',
      data: {
        _id: updatedCart._id,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        discount: updatedCart.discountAmount,
        shippingCost: updatedCart.shippingCost,
        total: updatedCart.total,
        itemCount: updatedCart.itemCount,
        shippingMethod: updatedCart.shippingMethod
      }
    });
  } catch (error) {
    console.error('Set shipping method error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add notes to cart
// @route   POST /api/cart/notes
// @access  Private
router.post('/notes', protect, sanitizeInput, async (req, res) => {
  try {
    const { notes } = req.body;

    if (notes && notes.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Notes cannot exceed 500 characters'
      });
    }

    const cart = await Cart.getOrCreate(req.user._id);
    cart.notes = notes;
    await cart.save();

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discountAmount,
        shippingCost: cart.shippingCost,
        total: cart.total,
        itemCount: cart.itemCount,
        notes: cart.notes
      }
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get available shipping methods
// @route   GET /api/cart/shipping-methods
// @access  Private
router.get('/shipping-methods', protect, async (req, res) => {
  try {
    // This would typically come from a shipping service or database
    const shippingMethods = [
      {
        name: 'Standard Shipping',
        cost: 5.99,
        estimatedDays: '3-5 business days'
      },
      {
        name: 'Express Shipping',
        cost: 12.99,
        estimatedDays: '1-2 business days'
      },
      {
        name: 'Free Shipping',
        cost: 0,
        estimatedDays: '5-7 business days',
        minOrder: 50
      }
    ];

    res.json({
      success: true,
      data: shippingMethods
    });
  } catch (error) {
    console.error('Get shipping methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;