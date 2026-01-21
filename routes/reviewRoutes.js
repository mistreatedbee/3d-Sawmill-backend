import express from 'express';
import {
  createReview,
  getReviewsAdmin,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getPendingReviews,
  approveReview,
  rejectReview,
  markHelpful,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Admin list route (compat for older admin UI)
router.get('/', authenticate, authorize('admin'), getReviewsAdmin);

// Customer routes
router.post('/', authenticate, createReview);
router.get('/user/:userId', authenticate, getUserReviews);
router.patch('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/helpful', authenticate, markHelpful);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingReviews);
router.patch('/:id/approve', authenticate, authorize('admin'), approveReview);
router.patch('/:id/reject', authenticate, authorize('admin'), rejectReview);

export default router;
