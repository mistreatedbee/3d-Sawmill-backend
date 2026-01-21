import express from 'express';
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// Compatibility layer: frontend uses /api/specials for promotions/specials CRUD
const router = express.Router();

// Admin list (frontend expects auth)
router.get('/', authenticate, authorize('admin'), getPromotions);
router.get('/:id', authenticate, authorize('admin'), getPromotionById);
router.post('/', authenticate, authorize('admin'), createPromotion);

// Frontend uses PUT for updates
router.put('/:id', authenticate, authorize('admin'), updatePromotion);
router.patch('/:id', authenticate, authorize('admin'), updatePromotion);

router.delete('/:id', authenticate, authorize('admin'), deletePromotion);

export default router;

