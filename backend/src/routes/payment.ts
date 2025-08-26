import express from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import Order from '../models/Order';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-12-18.acacia',
});

// Create payment intent
router.post('/create-payment-intent', [
  authenticate,
  body('orderId').isMongoId(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;
    const user = req.user!;

    // Find the order
    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentDetails.status !== 'pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
    });

    // Update order with payment intent ID
    order.paymentDetails.transactionId = paymentIntent.id;
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment
router.post('/confirm-payment', [
  authenticate,
  body('paymentIntentId').notEmpty(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId } = req.body;
    const user = req.user!;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Find and update order
    const order = await Order.findOne({
      'paymentDetails.transactionId': paymentIntentId,
      user: user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment status
    order.paymentDetails.status = 'completed';
    order.status = 'confirmed';
    await order.save();

    res.json({
      message: 'Payment confirmed successfully',
      order,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stripe webhook for payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update order status
        const order = await Order.findOne({
          'paymentDetails.transactionId': paymentIntent.id,
        });

        if (order) {
          order.paymentDetails.status = 'completed';
          order.status = 'confirmed';
          await order.save();
          console.log('Order payment confirmed:', order.orderNumber);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update order status
        const failedOrder = await Order.findOne({
          'paymentDetails.transactionId': failedPayment.id,
        });

        if (failedOrder) {
          failedOrder.paymentDetails.status = 'failed';
          await failedOrder.save();
          console.log('Order payment failed:', failedOrder.orderNumber);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get payment methods (for future use)
router.get('/payment-methods', authenticate, async (req: AuthRequest, res) => {
  try {
    // This would typically return saved payment methods for the user
    // For now, return supported methods
    res.json({
      supportedMethods: [
        {
          id: 'stripe',
          name: 'Credit/Debit Card',
          description: 'Pay securely with your card',
          enabled: true,
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Pay with your PayPal account',
          enabled: false, // Not implemented yet
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          description: 'Pay when you receive your order',
          enabled: true,
        },
      ],
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;