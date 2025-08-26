# ShopifyClone - Complete E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js, Express.js, MongoDB, and TypeScript. Features a clean, responsive design similar to Shopify with comprehensive admin panel, authentication, payment processing, and more.

## 🚀 Features

### Frontend (User Side)
- **Modern UI/UX**: Clean, responsive design with TailwindCSS
- **Homepage**: Hero banner, featured categories, trending products
- **Product Pages**: Image/video gallery, descriptions, reviews, variants
- **Shopping Cart**: Add/remove items, quantity updates, persistent cart
- **Checkout**: Shipping info, payment options, order summary
- **User Authentication**: JWT + Google OAuth integration
- **User Dashboard**: Profile management, order history, wishlist
- **Search & Filters**: Advanced product search and filtering
- **Dark Mode**: System/manual theme switching

### Backend (API)
- **Express.js**: RESTful API with TypeScript
- **MongoDB**: Database with Mongoose ODM
- **Authentication**: JWT tokens + Google OAuth 2.0
- **File Uploads**: Image/video handling with Multer
- **Payment**: Stripe integration (sandbox mode)
- **Security**: Helmet, CORS, rate limiting, input validation
- **Role-based Access**: Admin vs User permissions

### Admin Panel
- **Secure Access**: Admin-only authentication
- **Dashboard**: Sales analytics, order management
- **Product Management**: CRUD operations with media upload
- **Category Management**: Organize products into categories
- **Order Management**: Track and update order status
- **User Management**: View and manage user accounts

### Additional Features
- **SEO Optimized**: Meta tags, structured data
- **Responsive Design**: Mobile-first approach
- **Performance**: Image optimization, lazy loading
- **Error Handling**: Comprehensive error management
- **TypeScript**: Full type safety across the stack

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Passport.js** - Google OAuth
- **Stripe** - Payment processing
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth credentials
- Stripe account (for payments)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd shopify-clone
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
```

Configure `backend/.env`:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/ecommerce

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
SESSION_SECRET=your-super-secret-session-key

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file and configure
cp .env.local.example .env.local
```

Configure `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### 4. Database Setup
Make sure MongoDB is running locally or configure Atlas connection string.

### 5. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Admin Access

To create an admin user:

1. Register a regular account
2. Connect to MongoDB and update the user document:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```
3. Access admin panel at `/admin`

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Render)
1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster
2. Update connection string
3. Configure network access

## 🔧 Environment Variables

### Backend
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - Get products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item

### Order Endpoints
- `POST /api/orders/create` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order

## 🎨 Design System

The application uses a modern design system with:
- **Colors**: Primary blue, accent orange, semantic colors
- **Typography**: Geist Sans font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components
- **Dark Mode**: Automatic and manual theme switching

## 🔒 Security Features

- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevent API abuse
- **CORS**: Configured for production
- **Helmet**: Security headers
- **JWT**: Secure authentication
- **Password Hashing**: bcryptjs with salt rounds
- **File Upload Security**: Type validation and size limits

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interactions
- Optimized images for different screen sizes
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@shopifyclone.com

## 🙏 Acknowledgments

- Shopify for design inspiration
- Next.js team for the amazing framework
- TailwindCSS for the utility-first approach
- MongoDB for the flexible database
- Stripe for payment processing