import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'productImages') {
      uploadPath = path.join(uploadDir, 'products', 'images');
    } else if (file.fieldname === 'productVideos') {
      uploadPath = path.join(uploadDir, 'products', 'videos');
    } else if (file.fieldname === 'categoryImage') {
      uploadPath = path.join(uploadDir, 'categories');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadDir, 'avatars');
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check file type
  if (file.fieldname === 'productImages' || file.fieldname === 'categoryImage' || file.fieldname === 'avatar') {
    // Image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else if (file.fieldname === 'productVideos') {
    // Video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  } else {
    cb(new Error('Unknown field!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // Convert absolute path to relative URL
  const relativePath = filePath.replace(uploadDir, '').replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};