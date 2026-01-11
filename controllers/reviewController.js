import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, orderId, images } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Verify purchase if orderId provided
    let verified = false;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.userId.toString() === userId && order.status === 'delivered') {
        verified = true;
      }
    }

    const review = new Review({
      productId,
      userId,
      orderId,
      rating,
      title,
      comment,
      images: images || [],
      verified,
      status: 'pending', // Moderation required
    });

    await review.save();
    await review.populate('userId', 'name avatar');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, page = 1, sortBy = '-createdAt' } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      productId,
      status: 'approved',
    })
      .populate('userId', 'name avatar')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({
      productId,
      status: 'approved',
    });

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      reviews,
      stats: {
        averageRating,
        totalReviews: total,
        ratingDistribution: stats,
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ userId });

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only allow user to update their own review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.status = 'pending'; // Re-moderate after update

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only allow user to delete their own review or admin
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin functions
export const getPendingReviews = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('productId', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ status: 'pending' });

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('userId', 'name');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.unhelpful += 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
