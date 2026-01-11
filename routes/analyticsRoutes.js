import express from 'express';
import {
  getAnalytics,
  getDailyAnalytics,
  getTopProducts,
  getRevenueChart,
  getCategoryAnalytics,
  getPaymentMethodAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin analytics routes
router.get('/', authenticate, authorize('admin'), getAnalytics);
router.get('/daily', authenticate, authorize('admin'), getDailyAnalytics);
router.get('/top-products', authenticate, authorize('admin'), getTopProducts);
router.get('/revenue-chart', authenticate, authorize('admin'), getRevenueChart);
router.get('/categories', authenticate, authorize('admin'), getCategoryAnalytics);
router.get('/payment-methods', authenticate, authorize('admin'), getPaymentMethodAnalytics);

export default router;
