const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    payment: {
      provider: { type: String, enum: ["stripe", "paypal"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      chargeId: String,
    },
    total: { type: Number, required: true },
    status: { type: String, enum: ["created", "processing", "shipped", "delivered", "cancelled"], default: "created" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);

