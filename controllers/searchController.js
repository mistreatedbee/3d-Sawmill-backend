import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

export const advancedSearch = async (req, res) => {
  try {
    const {
      search,
      category,
      woodType,
      color,
      priceMin,
      priceMax,
      minRating,
      tags,
      featured,
      inStock,
      sortBy = '-createdAt',
      limit = 20,
      page = 1,
    } = req.query;

    let query = { isAvailable: true };

    // Text search across name, description, tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { productType: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Wood type filter
    if (woodType) {
      if (Array.isArray(woodType)) {
        query.woodType = { $in: woodType };
      } else {
        query.woodType = woodType;
      }
    }

    // Color filter
    if (color) {
      if (Array.isArray(color)) {
        query.color = { $in: color };
      } else {
        query.color = color;
      }
    }

    // Price range filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Featured products
    if (featured === 'true') {
      query.featured = true;
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort query
    const sortObj = {};
    if (sortBy === 'price-asc') {
      sortObj.price = 1;
    } else if (sortBy === 'price-desc') {
      sortObj.price = -1;
    } else if (sortBy === 'name') {
      sortObj.name = 1;
    } else if (sortBy === 'newest') {
      sortObj.createdAt = -1;
    } else if (sortBy === 'bestselling') {
      // Will sort by review count as proxy
      sortObj.featured = -1;
    } else {
      sortObj[sortBy] || (sortObj.createdAt = -1);
    }

    // Execute query
    const skip = (page - 1) * limit;
    let products = await Product.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // If minRating specified, filter by review rating (requires post-processing)
    if (minRating) {
      const productIds = products.map(p => p._id);
      const productRatings = await Review.aggregate([
        {
          $match: {
            productId: { $in: productIds },
            status: 'approved',
          },
        },
        {
          $group: {
            _id: '$productId',
            averageRating: { $avg: '$rating' },
          },
        },
      ]);

      const ratingMap = new Map(
        productRatings.map(r => [r._id.toString(), r.averageRating])
      );

      products = products.filter(
        p => (ratingMap.get(p._id.toString()) || 0) >= parseFloat(minRating)
      );
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Enhance with review data
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({
          productId: product._id,
          status: 'approved',
        });

        const averageRating = reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;

        return {
          ...product.toObject(),
          reviewCount: reviews.length,
          averageRating,
        };
      })
    );

    res.json({
      products: enhancedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      appliedFilters: {
        search: search || null,
        category: category || null,
        woodType: woodType || null,
        color: color || null,
        priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null,
        minRating: minRating || null,
        tags: tags || null,
        featured: featured === 'true',
        inStock: inStock === 'true',
        sortBy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    // Get unique values for all filterable fields
    const categories = await Product.distinct('category', { isAvailable: true });
    const woodTypes = await Product.distinct('woodType', { isAvailable: true });
    const colors = await Product.distinct('color', { isAvailable: true });
    const allTags = await Product.distinct('tags', { isAvailable: true });

    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    const { minPrice = 0, maxPrice = 0, avgPrice = 0 } = priceStats[0] || {};

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      categories: categories.sort(),
      woodTypes: woodTypes.sort(),
      colors: colors.sort(),
      tags: allTags.sort(),
      priceRange: {
        min: Math.floor(minPrice),
        max: Math.ceil(maxPrice),
        average: Math.round(avgPrice),
      },
      ratingOptions: [1, 2, 3, 4, 5],
      ratingDistribution: ratingDistribution.map(d => ({
        rating: d._id,
        count: d.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSimilarProducts = async (req, res) => {
  try {
    const { productId, limit = 5 } = req.query;

    // Get the source product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find similar products (same category and wood type)
    const similar = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      woodType: product.woodType,
      isAvailable: true,
    })
      .limit(parseInt(limit));

    // If not enough, add products from same category
    if (similar.length < limit) {
      const categoryProducts = await Product.find({
        _id: { $ne: productId },
        category: product.category,
        isAvailable: true,
      })
        .limit(parseInt(limit) - similar.length);

      similar.push(...categoryProducts);
    }

    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      isAvailable: true,
    })
      .select('name category')
      .limit(parseInt(limit))
      .lean();

    const uniqueSuggestions = [
      ...new Set(suggestions.map(p => p.name)),
    ];

    res.json({
      suggestions: uniqueSuggestions,
      count: uniqueSuggestions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
