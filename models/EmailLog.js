import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipientName: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order_confirmation', 'order_update', 'shipment', 'delivery_notification', 'promotional', 'review_request', 'abandoned_cart', 'wishlist_alert', 'review_approved'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'bounced', 'opened', 'clicked'],
      default: 'sent',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    openedAt: Date,
    clickedAt: Date,
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    template: String, // Template name used
    variables: mongoose.Schema.Types.Mixed, // Dynamic data passed to template
  },
  { timestamps: true }
);

// Index for tracking sent emails
emailLogSchema.index({ recipientEmail: 1, sentAt: -1 });
emailLogSchema.index({ orderId: 1 });
emailLogSchema.index({ status: 1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);
