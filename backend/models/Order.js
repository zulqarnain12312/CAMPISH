const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  selectedOptions: [{
    name: String,
    value: String,
    price: Number
  }],
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'cash_on_delivery']
  },
  paymentIntentId: String,
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United States'
    }
  },
  shippingMethod: {
    name: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      default: 0
    },
    estimatedDays: String,
    trackingNumber: String,
    carrier: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  coupon: {
    code: String,
    discount: Number,
    discountType: String
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelReason: String
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.email': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  
  next();
});

// Virtual for full name
orderSchema.virtual('customerName').get(function() {
  return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
});

// Virtual for full address
orderSchema.virtual('fullAddress').get(function() {
  const addr = this.shippingAddress;
  return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to update status
orderSchema.methods.updateStatus = async function(status, userId = null) {
  this.status = status;
  
  if (status === 'delivered') {
    this.deliveredAt = new Date();
  } else if (status === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = userId;
  }
  
  await this.save();
  return this;
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(status) {
  this.paymentStatus = status;
  await this.save();
  return this;
};

// Method to add tracking information
orderSchema.methods.addTracking = async function(trackingNumber, carrier) {
  this.shippingMethod.trackingNumber = trackingNumber;
  this.shippingMethod.carrier = carrier;
  await this.save();
  return this;
};

// Method to process refund
orderSchema.methods.processRefund = async function(amount, reason) {
  if (amount > this.total) {
    throw new Error('Refund amount cannot exceed order total');
  }
  
  this.refundAmount = amount;
  this.refundReason = reason;
  this.paymentStatus = 'refunded';
  
  if (amount === this.total) {
    this.status = 'refunded';
  }
  
  await this.save();
  return this;
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get order by number
orderSchema.statics.getByNumber = function(orderNumber) {
  return this.findOne({ orderNumber })
    .populate('user', 'name email')
    .populate('items.product', 'name images price');
};

// Static method to get orders with filters
orderSchema.statics.getWithFilters = function(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.user) query.user = filters.user;
  if (filters.dateFrom) {
    query.createdAt = { $gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo) {
    if (query.createdAt) {
      query.createdAt.$lte = new Date(filters.dateTo);
    } else {
      query.createdAt = { $lte: new Date(filters.dateTo) };
    }
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get order statistics
orderSchema.statics.getStats = async function(period = 'month') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
  
  return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

module.exports = mongoose.model('Order', orderSchema);