import mongoose from 'mongoose';

const inventoryAlertSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    alertType: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'overstock', 'slow_moving'],
      required: true,
    },
    threshold: {
      type: Number,
      required: true, // Level at which alert triggers
    },
    currentStock: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: String, // Admin email
    acknowledgedAt: Date,
    actionTaken: String, // Description of action taken
    autoReorder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      quantity: Number, // Quantity to reorder
      supplier: String, // Supplier email or ID
      orderPlaced: {
        type: Boolean,
        default: false,
      },
      orderDate: Date,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Index for active alerts
inventoryAlertSchema.index({ productId: 1, acknowledged: 1 });
inventoryAlertSchema.index({ alertType: 1, severity: 1 });

export const InventoryAlert = mongoose.model('InventoryAlert', inventoryAlertSchema);
