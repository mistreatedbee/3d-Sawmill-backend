import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin routes - must come first
router.get('/admin/all', authenticate, authorize(['admin']), getAllOrders);
router.get('/stats/overview', authenticate, authorize(['admin']), async (req, res) => {
  res.json({ pending: 0, processing: 0, delivered: 0 });
});

// User routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getOrders);
router.get('/', authenticate, authorize(['admin']), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize(['admin']), updateOrderStatus);
router.patch('/:id/status', authenticate, authorize(['admin']), updateOrderStatus);
router.patch('/:id/payment-status', authenticate, authorize(['admin']), async (req, res) => {
  res.json({ success: true });
});

export default router;
