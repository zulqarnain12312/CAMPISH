const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  video: {
    public_id: String,
    url: String,
    duration: Number
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Low stock threshold cannot be negative']
  },
  quality: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'new'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  features: [{
    name: String,
    value: String
  }],
  specifications: [{
    name: String,
    value: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  soldCount: {
    type: Number,
    default: 0,
    min: [0, 'Sold count cannot be negative']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  salePercentage: {
    type: Number,
    min: [0, 'Sale percentage cannot be negative'],
    max: [100, 'Sale percentage cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  variants: [{
    name: String,
    options: [{
      name: String,
      price: Number,
      stock: Number,
      sku: String
    }]
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  warranty: {
    type: String,
    maxlength: [200, 'Warranty description cannot exceed 200 characters']
  },
  returnPolicy: {
    type: String,
    maxlength: [500, 'Return policy cannot exceed 500 characters']
  },
  shippingInfo: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ trending: 1 });
productSchema.index({ onSale: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isPublished: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'images.url': 1 });

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate sale percentage if original price is provided
  if (this.originalPrice && this.originalPrice > this.price) {
    this.salePercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    this.onSale = true;
  }
  
  next();
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage ? primaryImage.url : (this.images[0] ? this.images[0].url : null);
});

// Method to update rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / reviews.length;
    this.reviewCount = reviews.length;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }
  
  await this.save();
};

// Method to increment view count
productSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    this.soldCount += quantity;
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  
  await this.save();
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
  return this.find({ 
    isActive: true, 
    isPublished: true, 
    featured: true,
    stock: { $gt: 0 }
  })
  .populate('category', 'name slug')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get trending products
productSchema.statics.getTrending = function(limit = 8) {
  return this.find({ 
    isActive: true, 
    isPublished: true, 
    trending: true,
    stock: { $gt: 0 }
  })
  .populate('category', 'name slug')
  .sort({ soldCount: -1, rating: -1 })
  .limit(limit);
};

// Static method to search products
productSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    isPublished: true,
    stock: { $gt: 0 }
  };

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
    if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
  }

  if (filters.quality && filters.quality.length > 0) {
    searchQuery.quality = { $in: filters.quality };
  }

  if (filters.rating) {
    searchQuery.rating = { $gte: filters.rating };
  }

  let sortQuery = { createdAt: -1 };
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price':
        sortQuery = { price: filters.sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'rating':
        sortQuery = { rating: filters.sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
        sortQuery = { soldCount: -1 };
        break;
    }
  }

  return this.find(searchQuery)
    .populate('category', 'name slug')
    .sort(sortQuery);
};

module.exports = mongoose.model('Product', productSchema);