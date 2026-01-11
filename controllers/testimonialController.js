import { Testimonial } from '../models/Testimonial.js';

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ verified: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, role, content, avatar, rating } = req.body;

    const testimonial = new Testimonial({
      name,
      role,
      content,
      avatar,
      rating,
      verified: false,
    });

    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
