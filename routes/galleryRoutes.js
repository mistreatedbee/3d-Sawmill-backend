import express from 'express';
import {
  getGallery,
  addGalleryImage,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', authenticate, authorize(['admin']), addGalleryImage);
router.delete('/:id', authenticate, authorize(['admin']), deleteGalleryImage);

export default router;
