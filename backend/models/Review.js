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
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
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
  adminResponse: {
    comment: {
      type: String,
      maxlength: [500, 'Admin response cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ isActive: 1 });

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful).length;
});

// Virtual for not helpful count
reviewSchema.virtual('notHelpfulCount').get(function() {
  return this.helpful.filter(h => !h.helpful).length;
});

// Method to mark review as helpful/not helpful
reviewSchema.methods.markHelpful = async function(userId, helpful) {
  const existingIndex = this.helpful.findIndex(h => h.user.toString() === userId.toString());
  
  if (existingIndex > -1) {
    this.helpful[existingIndex].helpful = helpful;
  } else {
    this.helpful.push({ user: userId, helpful });
  }
  
  return await this.save();
};

// Method to remove helpful mark
reviewSchema.methods.removeHelpfulMark = async function(userId) {
  this.helpful = this.helpful.filter(h => h.user.toString() !== userId.toString());
  return await this.save();
};

// Method to add admin response
reviewSchema.methods.addAdminResponse = async function(comment, adminId) {
  this.adminResponse = {
    comment,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  
  return await this.save();
};

// Static method to find reviews by product
reviewSchema.statics.findByProduct = function(productId, options = {}) {
  const { page = 1, limit = 10, rating, sort = 'createdAt', order = 'desc' } = options;
  
  let query = { product: productId, isActive: true };
  if (rating) {
    query.rating = rating;
  }
  
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('user', 'name avatar')
    .populate('adminResponse.respondedBy', 'name')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find reviews by user
reviewSchema.statics.findByUser = function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({ user: userId, isActive: true })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), isActive: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats[0].ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });
  
  return {
    totalReviews: stats[0].totalReviews,
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    ratingDistribution
  };
};

// Static method to get verified reviews
reviewSchema.statics.findVerified = function(productId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({ product: productId, verified: true, isActive: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Pre-save middleware to update product rating
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const stats = await Review.getProductStats(this.product);
  
  // Update product rating
  const Product = mongoose.model('Product');
  await Product.findByIdAndUpdate(this.product, {
    'ratings.average': stats.averageRating,
    'ratings.count': stats.totalReviews
  });
});

// Pre-remove middleware to update product rating
reviewSchema.post('remove', async function() {
  const Review = this.constructor;
  const stats = await Review.getProductStats(this.product);
  
  // Update product rating
  const Product = mongoose.model('Product');
  await Product.findByIdAndUpdate(this.product, {
    'ratings.average': stats.averageRating,
    'ratings.count': stats.totalReviews
  });
});

module.exports = mongoose.model('Review', reviewSchema);