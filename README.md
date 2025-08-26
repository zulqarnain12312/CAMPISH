# CAMPISH - Premium E-commerce Platform

A complete, modern e-commerce website built with Next.js, Node.js, and MongoDB, featuring a clean Shopify-like design with full admin panel and user management.

## 🚀 Features

### Frontend (Next.js + TypeScript + TailwindCSS)
- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Product Management**: Image/video galleries, detailed product pages with reviews
- **Shopping Cart**: Real-time cart updates, quantity management, wishlist
- **User Authentication**: Google OAuth integration, JWT-based auth
- **Checkout Process**: Multi-step checkout with shipping and payment options
- **Search & Filtering**: Advanced product search with multiple filters
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication**: JWT + Google OAuth with role-based access control
- **File Upload**: Image and video upload with validation
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Stripe/PayPal ready (sandbox mode)
- **Admin Panel**: Full admin dashboard with analytics and user management

### Admin Features
- **Dashboard**: Real-time analytics, sales reports, inventory management
- **Product Management**: Add/edit/delete products with image/video upload
- **Order Management**: Process orders, update status, track shipments
- **User Management**: View users, manage roles, activate/deactivate accounts
- **Category Management**: Hierarchical category system with SEO optimization
- **System Settings**: Configure site settings, payment methods, shipping options

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Hooks + Context
- **UI Components**: Headless UI, Lucide React Icons
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Payment**: Stripe (ready for integration)

## 📁 Project Structure

```
campish/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/         # Basic UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── product/    # Product-related components
│   │   │   ├── cart/       # Cart components
│   │   │   ├── checkout/   # Checkout components
│   │   │   ├── auth/       # Authentication components
│   │   │   └── admin/      # Admin panel components
│   │   ├── lib/            # Utility libraries
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── controllers/        # Route controllers
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads directory
│   └── server.js           # Main server file
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campish
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
MONGODB_URI=mongodb://localhost:27017/campish
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
FRONTEND_URL=http://localhost:3000

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Configure environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Start development server
npm run dev
```

### 4. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# The application will automatically create collections and indexes
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campish
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 📱 Features Overview

### User Features
- **Browse Products**: View products by category, search, and filter
- **Product Details**: View images, videos, descriptions, reviews, and ratings
- **Shopping Cart**: Add/remove items, update quantities, apply coupons
- **Wishlist**: Save products for later purchase
- **User Account**: Profile management, order history, address book
- **Checkout**: Multi-step checkout with shipping and payment options
- **Order Tracking**: Track order status and shipping information

### Admin Features
- **Dashboard**: Overview of sales, orders, users, and inventory
- **Product Management**: CRUD operations for products with media upload
- **Category Management**: Hierarchical category system
- **Order Management**: Process orders, update status, manage refunds
- **User Management**: View users, manage roles and permissions
- **Analytics**: Sales reports, top products, revenue analytics
- **System Settings**: Configure site settings and payment methods

## 🔐 Authentication & Authorization

### User Authentication
- Email/password registration and login
- Google OAuth integration
- JWT-based session management
- Password reset functionality

### Role-Based Access Control
- **User**: Browse products, manage cart, place orders
- **Admin**: Full access to admin panel and system management

## 💳 Payment Integration

The platform is ready for payment integration with:
- **Stripe**: Credit card payments
- **PayPal**: Alternative payment method
- **Cash on Delivery**: For local deliveries

## 🚚 Shipping & Delivery

- Multiple shipping methods (Standard, Express, Free)
- Address validation and management
- Order tracking and status updates
- Shipping cost calculation

## 📊 Analytics & Reporting

### Admin Dashboard
- Real-time sales analytics
- Product performance metrics
- User activity tracking
- Inventory management
- Revenue reports

### User Analytics
- Order history and spending patterns
- Wishlist and cart analytics
- Product view tracking

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- XSS and CSRF protection
- Secure file upload validation

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interface
- Progressive Web App (PWA) ready

## 🌙 Dark Mode

- System preference detection
- Manual toggle option
- Persistent user preference
- Smooth transitions

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Render/Heroku)
```bash
# Set environment variables
# Deploy to your preferred platform
```

### Database (MongoDB Atlas)
- Set up MongoDB Atlas cluster
- Update MONGODB_URI in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@campish.com
- Documentation: [Coming Soon]
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- MongoDB team for the flexible database
- All contributors and supporters

---

**CAMPISH** - Your trusted destination for quality products with exceptional customer service.