import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').trim('-');
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);