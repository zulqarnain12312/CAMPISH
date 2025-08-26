import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get cart
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    const filter = userId ? { user: userId } : { sessionId };
    
    const cart = await Cart.findOne(filter).populate('items.product', 'name price images slug isActive');

    if (!cart) {
      return res.json({
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    // Filter out inactive products
    cart.items = cart.items.filter(item => (item.product as any).isActive);
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', [
  optionalAuth,
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 1 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, variant } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.trackQuantity && product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const filter = userId ? { user: userId } : { sessionId };
    let cart = await Cart.findOne(filter);

    if (!cart) {
      // Create new cart
      cart = new Cart({
        ...(userId ? { user: userId } : { sessionId }),
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      
      // Check stock again
      if (product.trackQuantity && product.quantity < cart.items[existingItemIndex].quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        variant,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images slug isActive');

    res.json({
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update', [
  optionalAuth,
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 0 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, variant } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product && product.trackQuantity && product.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name price images slug isActive');

    res.json({
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    const { variant } = req.query;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const variantObj = variant ? JSON.parse(variant as string) : undefined;
    cart.items = cart.items.filter(item => 
      !(item.product.toString() === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variantObj))
    );

    await cart.save();
    await cart.populate('items.product', 'name price images slug isActive');

    res.json({
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    const filter = userId ? { user: userId } : { sessionId };
    await Cart.findOneAndDelete(filter);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Merge guest cart with user cart (after login)
router.post('/merge', [
  authenticate,
  body('guestSessionId').notEmpty(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { guestSessionId } = req.body;
    const userId = req.user!._id;

    // Find guest cart
    const guestCart = await Cart.findOne({ sessionId: guestSessionId });
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ message: 'No guest cart to merge' });
    }

    // Find or create user cart
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(item =>
        item.product.toString() === guestItem.product.toString() &&
        JSON.stringify(item.variant) === JSON.stringify(guestItem.variant)
      );

      if (existingItemIndex > -1) {
        // Update quantity
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await Cart.findOneAndDelete({ sessionId: guestSessionId });

    await userCart.populate('items.product', 'name price images slug isActive');

    res.json({
      message: 'Carts merged successfully',
      cart: userCart,
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;