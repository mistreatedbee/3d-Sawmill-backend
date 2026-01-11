import { Gallery } from '../models/Gallery.js';

export const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const images = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addGalleryImage = async (req, res) => {
  try {
    const { url, title, category, description } = req.body;

    const image = new Gallery({
      url,
      title,
      category,
      description,
    });

    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
