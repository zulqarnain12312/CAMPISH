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
  selectedOptions: {
    type: Map,
    of: String,
    default: new Map()
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
cartSchema.index({ user: 1 });

// Virtual for total items count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for total with discount
cartSchema.virtual('total').get(function() {
  const subtotal = this.subtotal;
  if (!this.coupon || !this.coupon.discount) {
    return subtotal;
  }
  
  if (this.coupon.type === 'percentage') {
    return subtotal - (subtotal * (this.coupon.discount / 100));
  } else {
    return Math.max(0, subtotal - this.coupon.discount);
  }
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  const subtotal = this.subtotal;
  if (!this.coupon || !this.coupon.discount) {
    return 0;
  }
  
  if (this.coupon.type === 'percentage') {
    return subtotal * (this.coupon.discount / 100);
  } else {
    return Math.min(subtotal, this.coupon.discount);
  }
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, price, selectedOptions = {}) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price; // Update price in case it changed
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedOptions
    });
  }
  
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity, selectedOptions = {}) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
  );
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    this.items = this.items.filter(item => 
      !(item.product.toString() === productId.toString() &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
    );
  } else {
    item.quantity = quantity;
  }
  
  return await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId, selectedOptions = {}) {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
  );
  
  return await this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.coupon = null;
  this.notes = '';
  
  return await this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function(couponCode, discount, type = 'percentage') {
  this.coupon = {
    code: couponCode,
    discount,
    type
  };
  
  return await this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = async function() {
  this.coupon = null;
  
  return await this.save();
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);