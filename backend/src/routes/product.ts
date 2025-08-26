import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product';
import Category from '../models/Category';
import { authenticate, requireAdmin, AuthRequest, optionalAuth } from '../middleware/auth';
import { upload, deleteFile, getFileUrl } from '../utils/upload';
import path from 'path';

const router = express.Router();

// Get all products (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isMongoId(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('featured').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const sort = req.query.sort as string || 'createdAt';
    const order = req.query.order as string || 'desc';
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const featured = req.query.featured === 'true';

    // Build filter
    const filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }
    
    if (featured) {
      filter.isFeatured = true;
    }

    // Build sort
    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', [
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'productImages', maxCount: 10 },
    { name: 'productVideos', maxCount: 3 }
  ]),
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('sku').notEmpty().trim(),
  body('category').isMongoId(),
  body('quantity').isInt({ min: 0 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, shortDescription, price, comparePrice, cost,
      sku, barcode, trackQuantity, quantity, weight, dimensions,
      category, tags, seoTitle, seoDescription, isActive, isFeatured
    } = req.body;

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Check if SKU is unique
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    // Process uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const images = [];
    const videos = [];

    if (files.productImages) {
      for (let i = 0; i < files.productImages.length; i++) {
        const file = files.productImages[i];
        images.push({
          url: getFileUrl(file.path),
          alt: `${name} - Image ${i + 1}`,
          isPrimary: i === 0
        });
      }
    }

    if (files.productVideos) {
      for (const file of files.productVideos) {
        videos.push({
          url: getFileUrl(file.path),
          thumbnail: '' // You might want to generate thumbnails
        });
      }
    }

    const product = new Product({
      name,
      description,
      shortDescription,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      sku,
      barcode,
      trackQuantity: trackQuantity !== 'false',
      quantity: parseInt(quantity),
      weight: weight ? parseFloat(weight) : undefined,
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
      category,
      tags: tags ? JSON.parse(tags) : [],
      images,
      videos,
      seoTitle,
      seoDescription,
      isActive: isActive !== 'false',
      isFeatured: isFeatured === 'true',
    });

    await product.save();
    await product.populate('category', 'name slug');

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', [
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'productImages', maxCount: 10 },
    { name: 'productVideos', maxCount: 3 }
  ]),
], async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.assign(product, req.body);

    // Process uploaded files if any
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files.productImages) {
      const newImages = [];
      for (let i = 0; i < files.productImages.length; i++) {
        const file = files.productImages[i];
        newImages.push({
          url: getFileUrl(file.path),
          alt: `${product.name} - Image ${i + 1}`,
          isPrimary: i === 0
        });
      }
      product.images = [...product.images, ...newImages];
    }

    if (files.productVideos) {
      const newVideos = [];
      for (const file of files.productVideos) {
        newVideos.push({
          url: getFileUrl(file.path),
          thumbnail: ''
        });
      }
      product.videos = [...product.videos, ...newVideos];
    }

    await product.save();
    await product.populate('category', 'name slug');

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', [authenticate, requireAdmin], async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated files
    product.images.forEach(image => {
      const filePath = path.join(__dirname, '../../uploads', image.url.replace('/uploads', ''));
      deleteFile(filePath);
    });

    product.videos.forEach(video => {
      const filePath = path.join(__dirname, '../../uploads', video.url.replace('/uploads', ''));
      deleteFile(filePath);
    });

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products (public)
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;