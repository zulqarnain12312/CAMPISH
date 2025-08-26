# 🚀 Quick Start Guide

Get CAMPISH up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git installed

## Quick Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd campish
   npm run setup
   ```

2. **Configure environment**
   
   Create `.env.local` in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

   Create `.env` in `backend/`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campish
   JWT_SECRET=your_secret_key_here
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## What's Included

### Frontend Features
- ✅ Modern homepage with hero banner
- ✅ Product listing with filters
- ✅ Shopping cart functionality
- ✅ User authentication (login/register)
- ✅ Responsive design
- ✅ Dark mode toggle
- ✅ Search functionality

### Backend Features
- ✅ RESTful API
- ✅ JWT authentication
- ✅ Product management
- ✅ Cart management
- ✅ User management
- ✅ Category management

### Database Models
- ✅ User model with authentication
- ✅ Product model with variants
- ✅ Category model with hierarchy
- ✅ Cart model with items
- ✅ Order model with status tracking
- ✅ Review model with ratings

## Next Steps

1. **Add real data**: Create products and categories
2. **Configure payments**: Set up Stripe integration
3. **Add images**: Configure Cloudinary for file uploads
4. **Deploy**: Follow deployment instructions in README.md

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Install all dependencies
npm run install:all

# Clean all node_modules
npm run clean
```

## API Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products

# Get categories
curl http://localhost:5000/api/categories
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in backend/.env
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in backend/.env

3. **Frontend can't connect to backend**
   - Verify NEXT_PUBLIC_API_URL in frontend/.env.local
   - Check CORS settings in backend

4. **Build errors**
   - Clear node_modules: `npm run clean`
   - Reinstall: `npm run install:all`

### Getting Help

- Check the main README.md for detailed documentation
- Review API endpoints in the README
- Create an issue for bugs or feature requests

## 🎉 You're Ready!

Your CAMPISH e-commerce platform is now running! Start building your online store.

---

**Happy coding! 🛍️**