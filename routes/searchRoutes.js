import express from 'express';
import {
  advancedSearch,
  getFilterOptions,
  getSimilarProducts,
  searchSuggestions,
} from '../controllers/searchController.js';

const router = express.Router();

// Advanced search with filters
router.get('/advanced', advancedSearch);

// Get all available filter options
router.get('/filters', getFilterOptions);

// Get similar products
router.get('/similar/:productId', getSimilarProducts);

// Search suggestions/autocomplete
router.get('/suggestions', searchSuggestions);

export default router;
