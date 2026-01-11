import mongoose from 'mongoose';

const bulkPricingSchema = new mongoose.Schema(
  {
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQuantity: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const dimensionsSchema = new mongoose.Schema(
  {
    length: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm', 'inches', 'feet'],
      default: 'mm',
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Plywood', '4x4 Timber', 'Boards', 'Doors', 'Window Frames', 'Pillars', 'Custom Cuts', 'Other'],
      required: true,
    },
    productType: {
      type: String,
      required: true,
      description: 'Specific product type (e.g., "Standard Panel", "Engineered Board")',
    },
    woodType: {
      type: String,
      required: true,
      enum: [
        'Pine',
        'Meranti',
        'Kiaat',
        'Yellowwood',
        'Stinkwood',
        'Teak',
        'Mahogany',
        'Oak',
        'Softwood',
        'Hardwood',
        'Engineered Wood',
        'MDF',
        'Plywood',
        'Composite',
        'Laminate',
        'Other',
      ],
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      type: dimensionsSchema,
      required: true,
    },
    weight: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs', 'g'],
        default: 'kg',
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bulkPricing: [bulkPricingSchema],
    specifications: {
      material: String,
      finish: String,
      moisture: String,
      gradeOrQuality: String,
      additionalSpecs: String,
    },
    tags: [String],
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    leadTime: {
      value: {
        type: Number,
        default: 1,
      },
      unit: {
        type: String,
        enum: ['days', 'weeks'],
        default: 'days',
      },
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
