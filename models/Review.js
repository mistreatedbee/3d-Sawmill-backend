import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    verified: {
      type: Boolean,
      default: false, // true if reviewer purchased the product
    },
    helpful: {
      type: Number,
      default: 0, // count of helpful votes
    },
    unhelpful: {
      type: Number,
      default: 0, // count of unhelpful votes
    },
    images: [String], // URLs of review images
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // Reviews moderated before display
    },
  },
  { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ userId: 1 });

export const Review = mongoose.model('Review', reviewSchema);
