const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  if (this.parent) {
    return `${this.parent.fullPath} > ${this.name}`;
  }
  return this.name;
});

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set level based on parent
  if (this.parent) {
    this.level = this.parent.level + 1;
  } else {
    this.level = 0;
  }
  
  next();
});

// Method to get all children recursively
categorySchema.methods.getAllChildren = async function() {
  const children = await this.model('Category').find({ parent: this._id });
  let allChildren = [...children];
  
  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = allChildren.concat(grandChildren);
  }
  
  return allChildren;
};

// Method to get breadcrumb
categorySchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [this];
  let current = this;
  
  while (current.parent) {
    current = await this.model('Category').findById(current.parent);
    if (current) {
      breadcrumb.unshift(current);
    }
  }
  
  return breadcrumb;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function() {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('children', 'name slug image');
};

// Static method to get category tree
categorySchema.statics.getTree = function() {
  return this.find({ isActive: true, parent: null })
    .sort({ sortOrder: 1, name: 1 })
    .populate({
      path: 'children',
      match: { isActive: true },
      options: { sort: { sortOrder: 1, name: 1 } },
      populate: {
        path: 'children',
        match: { isActive: true },
        options: { sort: { sortOrder: 1, name: 1 } }
      }
    });
};

module.exports = mongoose.model('Category', categorySchema);