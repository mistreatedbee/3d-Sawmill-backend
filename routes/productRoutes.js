import express from 'express';
import {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin (full inventory, including disabled products)
router.get('/admin/all', authenticate, authorize(['admin']), getAllProductsAdmin);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize(['admin']), createProduct);
router.put('/:id', authenticate, authorize(['admin']), updateProduct);
router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

export default router;
