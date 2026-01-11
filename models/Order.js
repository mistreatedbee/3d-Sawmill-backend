import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: String,
  updatedBy: String, // admin email or system
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountCode: String,
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [orderStatusHistorySchema],
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true,
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String,
    shippingAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'payfast'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
