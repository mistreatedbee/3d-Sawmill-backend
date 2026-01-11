import express from 'express';
import {
  getTestimonials,
  createTestimonial,
  verifyTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTestimonials);
router.post('/', createTestimonial);
router.put('/:id/verify', authenticate, authorize(['admin']), verifyTestimonial);
router.delete('/:id', authenticate, authorize(['admin']), deleteTestimonial);

export default router;
