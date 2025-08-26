const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    public_id: String,
    url: String
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      default: true
    }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportReason: String
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ isActive: 1 });

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Pre-save middleware to update product rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (product) {
      await product.updateRating();
    }
  }
  next();
});

// Pre-remove middleware to update product rating
reviewSchema.pre('remove', async function(next) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    await product.updateRating();
  }
  next();
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId, helpful = true) {
  const existingIndex = this.helpful.findIndex(h => h.user.toString() === userId);
  
  if (existingIndex >= 0) {
    this.helpful[existingIndex].helpful = helpful;
  } else {
    this.helpful.push({ user: userId, helpful });
  }
  
  await this.save();
  return this;
};

// Method to report review
reviewSchema.methods.report = async function(reason) {
  this.reported = true;
  this.reportReason = reason;
  await this.save();
  return this;
};

// Method to verify review
reviewSchema.methods.verify = async function() {
  this.verified = true;
  await this.save();
  return this;
};

// Static method to get reviews by product
reviewSchema.statics.getByProduct = function(productId, page = 1, limit = 10, sort = 'newest') {
  const skip = (page - 1) * limit;
  let sortQuery = {};
  
  switch (sort) {
    case 'newest':
      sortQuery = { createdAt: -1 };
      break;
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'rating':
      sortQuery = { rating: -1 };
      break;
    case 'helpful':
      sortQuery = { 'helpful.length': -1 };
      break;
  }
  
  return this.find({ 
    product: productId, 
    isActive: true 
  })
  .populate('user', 'name avatar')
  .sort(sortQuery)
  .skip(skip)
  .limit(limit);
};

// Static method to get reviews by user
reviewSchema.statics.getByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId, isActive: true })
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductStats = function(productId) {
  return this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: 1
      }
    }
  ]);
};

// Static method to get verified reviews
reviewSchema.statics.getVerified = function(productId, limit = 5) {
  return this.find({ 
    product: productId, 
    verified: true, 
    isActive: true 
  })
  .populate('user', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get recent reviews
reviewSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'name avatar')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get reported reviews
reviewSchema.statics.getReported = function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ reported: true })
    .populate('user', 'name email')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);