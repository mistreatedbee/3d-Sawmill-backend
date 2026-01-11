import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Factory', 'Projects', 'Products', 'Before/After'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Gallery = mongoose.model('Gallery', gallerySchema);
