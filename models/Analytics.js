import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
      totalDiscounts: {
        type: Number,
        default: 0,
      },
      uniqueCustomers: {
        type: Number,
        default: 0,
      },
      newCustomers: {
        type: Number,
        default: 0,
      },
      repeatCustomers: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
    },
    productMetrics: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        unitsSold: Number,
        revenue: Number,
        rank: Number, // Sales rank for the day
      }
    ],
    categoryMetrics: [
      {
        category: String,
        unitsSold: Number,
        revenue: Number,
      }
    ],
    paymentMetrics: [
      {
        method: String,
        count: Number,
        totalAmount: Number,
      }
    ],
    deliveryMetrics: {
      pickup: {
        count: Number,
        revenue: Number,
      },
      delivery: {
        count: Number,
        revenue: Number,
      },
    },
    ordersStatusBreakdown: {
      pending: Number,
      confirmed: Number,
      processing: Number,
      packed: Number,
      shipped: Number,
      delivered: Number,
      cancelled: Number,
    },
  },
  { timestamps: true }
);

// Index for date-based queries
analyticsSchema.index({ date: -1 });

export const Analytics = mongoose.model('Analytics', analyticsSchema);
