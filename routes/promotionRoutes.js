import express from 'express';
import {
  createPromotion,
  validatePromotion,
  applyPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getPromotionStats,
} from '../controllers/promotionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/validate', validatePromotion);
router.get('/', getPromotions);

// Customer routes
router.post('/apply', authenticate, applyPromotion);

// Admin routes
router.post('/', authenticate, authorize('admin'), createPromotion);
router.get('/stats', authenticate, authorize('admin'), getPromotionStats);
router.get('/:id', authenticate, authorize('admin'), getPromotionById);
router.patch('/:id', authenticate, authorize('admin'), updatePromotion);
router.delete('/:id', authenticate, authorize('admin'), deletePromotion);

export default router;
