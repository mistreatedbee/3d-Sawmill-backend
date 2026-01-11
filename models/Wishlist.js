import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String, // Custom notes about why they saved it
      }
    ],
    isPublic: {
      type: Boolean,
      default: false, // Can share wishlist with others
    },
  },
  { timestamps: true }
);

// Ensure only one wishlist per user
wishlistSchema.index({ userId: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
