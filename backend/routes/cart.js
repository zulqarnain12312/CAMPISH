const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user.id);
    
    res.json({
      success: true,
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        discount: cart.discountAmount
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
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

    const { productId, quantity, selectedOptions } = req.body;

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Get or create cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // Add item to cart
    await cart.addItem(productId, quantity, product.price, selectedOptions);

    // Populate product details
    await cart.populate('items.product', 'name images price stock');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart'
    });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:productId', [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be 0 or greater')
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

    const { productId } = req.params;
    const { quantity, selectedOptions } = req.body;

    // Get cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock if quantity > 0
    if (quantity > 0 && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity, selectedOptions);

    // Populate product details
    await cart.populate('items.product', 'name images price stock');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { selectedOptions } = req.query;

    // Get cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // Remove item from cart
    await cart.removeItem(productId, selectedOptions ? JSON.parse(selectedOptions) : {});

    // Populate product details
    await cart.populate('items.product', 'name images price stock');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        total: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/apply-coupon', [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
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

    const { code } = req.body;

    // Get cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // In a real app, you would validate the coupon code here
    // For now, we'll simulate a 10% discount
    const discount = 10;
    const type = 'percentage';

    // Apply coupon
    await cart.applyCoupon(code, discount, type);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        items: cart.items,
        total: cart.total,
        discount: cart.discountAmount,
        coupon: cart.coupon
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying coupon'
    });
  }
});

// @route   DELETE /api/cart/remove-coupon
// @desc    Remove coupon from cart
// @access  Private
router.delete('/remove-coupon', async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOrCreateForUser(req.user.id);

    // Remove coupon
    await cart.removeCoupon();

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        items: cart.items,
        total: cart.total,
        discount: 0
      }
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing coupon'
    });
  }
});

module.exports = router;