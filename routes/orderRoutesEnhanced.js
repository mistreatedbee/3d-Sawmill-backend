import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  refundOrder,
} from '../controllers/orderControllerEnhanced.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/number/:orderNumber', getOrderByNumber); // Public - for order tracking
router.get('/user/:userId', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/stats/overview', authenticate, authorize('admin'), getOrderStats);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.patch('/:id/payment-status', authenticate, authorize('admin'), updatePaymentStatus);
router.patch('/:id/refund', authenticate, authorize('admin'), refundOrder);

export default router;
