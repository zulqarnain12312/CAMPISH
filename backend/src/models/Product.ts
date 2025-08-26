import mongoose, { Document, Schema } from 'mongoose';

export interface IProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProductVideo {
  url: string;
  thumbnail: string;
}

export interface IProductVariant {
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: mongoose.Types.ObjectId;
  tags: string[];
  images: IProductImage[];
  videos: IProductVideo[];
  variants: IProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const productVideoSchema = new Schema<IProductVideo>({
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
});

const productVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number },
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  barcode: {
    type: String,
  },
  trackQuantity: {
    type: Boolean,
    default: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  images: [productImageSchema],
  videos: [productVideoSchema],
  variants: [productVariantSchema],
  seoTitle: {
    type: String,
    maxlength: 60,
  },
  seoDescription: {
    type: String,
    maxlength: 160,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').trim('-');
  }
  
  // Auto-generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.name.substring(0, 60);
  }
  if (!this.seoDescription) {
    this.seoDescription = this.shortDescription || this.description.substring(0, 160);
  }
  
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

export default mongoose.model<IProduct>('Product', productSchema);