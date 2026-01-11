import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
