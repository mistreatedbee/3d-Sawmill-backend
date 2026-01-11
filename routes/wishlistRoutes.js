import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  clearWishlist,
  shareWishlist,
  getPublicWishlist,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.get('/:userId', authenticate, getWishlist);
router.post('/:userId/items', authenticate, addToWishlist);
router.delete('/:userId/items/:productId', authenticate, removeFromWishlist);
router.patch('/:userId/items/:productId', authenticate, updateWishlistItem);
router.delete('/:userId/clear', authenticate, clearWishlist);
router.patch('/:userId/share', authenticate, shareWishlist);

// Public route - view public wishlists
router.get('/public/:userId', getPublicWishlist);

export default router;
