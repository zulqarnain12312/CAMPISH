# CAMPISH - Modern E-commerce Platform

A complete e-commerce website similar to Shopify with a clean, modern, and responsive design built with Next.js, Node.js, and MongoDB.

## 🚀 Features

### Frontend (User Side)
- **Framework**: Next.js 14 with React 18 and TailwindCSS
- **Homepage**: Hero banner, featured categories, trending products
- **Product Pages**: Image/video gallery, product description, price, quality details, customer reviews
- **Shopping Cart**: Product summary, quantity updates, remove options
- **Checkout**: Shipping info, payment options, order summary
- **Authentication**: Google OAuth integration
- **User Profile**: Wishlist and order history
- **Responsive Design**: Mobile-first approach with smooth animations
- **Dark Mode**: Toggle between light and dark themes

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth
- **Role-based Access**: Admin vs User permissions
- **REST API**: Products, categories, authentication, cart, orders
- **File Upload**: Image and video upload support
- **Payment Integration**: Stripe payment processing

### Admin Panel
- **Secure Admin Access**: Role-based authentication
- **Product Management**: Add/edit/delete products with media upload
- **Order Management**: View and manage customer orders
- **User Management**: Monitor user accounts
- **Content Management**: Edit website sections (hero, categories, footer)

### Extra Features
- **SEO Optimized**: Next.js metadata and structured data
- **Multi-language**: English + Urdu support (ready for implementation)
- **Payment Integration**: Stripe payment processing (sandbox mode)
- **Real-time Updates**: WebSocket support for live updates
- **Analytics**: Built-in analytics dashboard

## 📁 Project Structure

```
campish/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # UI components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── product/     # Product components
│   │   │   ├── cart/        # Cart components
│   │   │   ├── checkout/    # Checkout components
│   │   │   ├── auth/        # Authentication components
│   │   │   └── admin/       # Admin components
│   │   ├── lib/             # Utility functions and configurations
│   │   ├── types/           # TypeScript type definitions
│   │   ├── hooks/           # Custom React hooks
│   │   └── store/           # Zustand state management
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js backend API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── uploads/             # File upload directory
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
└── shared/                  # Shared types and utilities
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Stripe** - Payment processing
- **Nodemailer** - Email sending
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Google OAuth credentials (optional)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campish
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env.local` in frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   Create `.env` in backend:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campish
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev

   # Start frontend (from frontend directory)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Health Check: http://localhost:5000/api/health

## 📱 Features Overview

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Fast Loading**: Optimized images and code splitting
- **Smooth Animations**: Framer Motion for delightful interactions
- **Dark Mode**: Toggle between light and dark themes
- **Search & Filter**: Find products quickly with advanced filtering
- **Shopping Cart**: Persistent cart with real-time updates
- **Wishlist**: Save favorite products for later

### Admin Features
- **Product Management**: Upload images/videos, set prices, manage inventory
- **Order Tracking**: Monitor order status and customer information
- **Analytics Dashboard**: View sales, user statistics, and performance metrics
- **Content Management**: Update website content without coding
- **User Management**: View and manage customer accounts

### Security
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and user permissions
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing security
- **Rate Limiting**: API rate limiting to prevent abuse

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Deploy automatically on push to main branch

### Backend (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `FRONTEND_URL`
3. Deploy with automatic scaling

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend environment variables

## 🔧 Configuration

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Update environment variables

### Stripe Setup
1. Create a Stripe account
2. Get your API keys from dashboard
3. Update environment variables
4. Set up webhook endpoints (optional)

### File Upload (Cloudinary)
1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Update environment variables in backend

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/trending` - Get trending products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/featured` - Get featured categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Multi-language support (Urdu)
- [ ] Advanced search filters
- [ ] Product recommendations
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-vendor support
- [ ] Subscription plans

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS
- MongoDB for the database
- Stripe for payment processing
- All contributors and supporters

---

**CAMPISH** - Your modern e-commerce solution! 🛍️