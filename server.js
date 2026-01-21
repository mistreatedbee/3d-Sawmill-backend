import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutesEnhanced.js';
import galleryRoutes from './routes/galleryRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import specialsRoutes from './routes/specialsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';

dotenv.config();

const app = express();

// Middleware
// Configure CORS to allow requests from both local development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://3-d-s-sawmill.vercel.app',
  process.env.CORS_ORIGIN // eslint-disable-line no-undef
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/specials', specialsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000; // eslint-disable-line no-undef

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
