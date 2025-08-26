import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ICart extends Document {
  _id: string;
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  variant: {
    name: { type: String },
    value: { type: String },
  },
});

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
}, {
  timestamps: true,
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

// Index for cleanup of expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

export default mongoose.model<ICart>('Cart', cartSchema);