import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number, // Maximum discount amount for percentage-based
    },
    minimumOrderValue: {
      type: Number,
      default: 0, // Minimum order total to apply coupon
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
    applicableCategories: [String], // Can apply to entire categories
    usageLimit: {
      type: Number, // Total uses allowed, null for unlimited
    },
    usagePerCustomer: {
      type: Number,
      default: 1, // How many times each customer can use
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        usedAt: Date,
      }
    ],
  },
  { timestamps: true }
);

// Index for code lookup
promotionSchema.index({ code: 1, active: 1 });
promotionSchema.index({ validFrom: 1, validUntil: 1 });

export const Promotion = mongoose.model('Promotion', promotionSchema);
