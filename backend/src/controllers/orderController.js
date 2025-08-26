const Order = require("../models/Order");
const Product = require("../models/Product");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

exports.createCheckout = async (req, res) => {
  const { items } = req.body; // [{productId, quantity}]
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const idToProduct = new Map(products.map((p) => [String(p._id), p]));
  const lineItems = items.map((i) => {
    const p = idToProduct.get(String(i.productId));
    return {
      price_data: {
        currency: "usd",
        product_data: { name: p.title },
        unit_amount: Math.round(p.price * 100),
      },
      quantity: i.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${req.headers.origin || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin || "http://localhost:3000"}/checkout/cancel`,
  });

  res.json({ id: session.id, url: session.url });
};

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, payment } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await Order.create({ user: req.user.id, items, shippingAddress, payment, total });
  res.status(201).json(order);
};

exports.listMine = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
  res.json(orders);
};

exports.listAll = async (_req, res) => {
  const orders = await Order.find({}).sort("-createdAt").populate("user", "name email");
  res.json(orders);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
};

