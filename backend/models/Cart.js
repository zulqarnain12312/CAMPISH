const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
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
  }]
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    }
  },
  shippingMethod: {
    name: String,
    cost: {
      type: Number,
      default: 0
    },
    estimatedDays: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon || !this.coupon.discount) return 0;
  
  const subtotal = this.subtotal;
  if (this.coupon.discountType === 'percentage') {
    return (subtotal * this.coupon.discount) / 100;
  } else {
    return Math.min(this.coupon.discount, subtotal);
  }
});

// Virtual for shipping cost
cartSchema.virtual('shippingCost').get(function() {
  return this.shippingMethod ? this.shippingMethod.cost : 0;
});

// Virtual for total
cartSchema.virtual('total').get(function() {
  return this.subtotal - this.discountAmount + this.shippingCost;
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, options = []) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  // Check if item already exists in cart
  const existingItem = this.items.find(item => 
    item.product.toString() === productId &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(options)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price;
  } else {
    this.items.push({
      product: productId,
      quantity: quantity,
      price: product.price,
      selectedOptions: options
    });
  }
  
  await this.save();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    const Product = mongoose.model('Product');
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    item.quantity = quantity;
    item.price = product.price;
  }
  
  await this.save();
  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(itemId) {
  this.items.pull(itemId);
  await this.save();
  return this;
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.coupon = null;
  this.shippingAddress = null;
  this.shippingMethod = null;
  this.notes = null;
  await this.save();
  return this;
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function(couponCode) {
  // TODO: Implement coupon validation logic
  // For now, just a placeholder
  this.coupon = {
    code: couponCode,
    discount: 10,
    discountType: 'percentage'
  };
  await this.save();
  return this;
};

// Method to remove coupon
cartSchema.methods.removeCoupon = async function() {
  this.coupon = null;
  await this.save();
  return this;
};

// Method to set shipping address
cartSchema.methods.setShippingAddress = async function(address) {
  this.shippingAddress = address;
  await this.save();
  return this;
};

// Method to set shipping method
cartSchema.methods.setShippingMethod = async function(method) {
  this.shippingMethod = method;
  await this.save();
  return this;
};

// Static method to get cart by user
cartSchema.statics.getByUser = function(userId) {
  return this.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images stock isActive isPublished'
    });
};

// Static method to create or get cart for user
cartSchema.statics.getOrCreate = async function(userId) {
  let cart = await this.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images stock isActive isPublished'
    });
  
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);