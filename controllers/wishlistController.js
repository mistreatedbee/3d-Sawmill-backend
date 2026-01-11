import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is viewing their own wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let wishlist = await Wishlist.findOne({ userId })
      .populate('items.productId', 'name price images category description stock');

    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, notes } = req.body;

    // Verify user is updating their own wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create wishlist if doesn't exist
      wishlist = new Wishlist({
        userId,
        items: [{ productId, notes }],
      });
    } else {
      // Check if item already in wishlist
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }

      wishlist.items.push({ productId, notes });
    }

    await wishlist.save();
    await wishlist.populate('items.productId', 'name price images category');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Verify user is updating their own wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('items.productId', 'name price images category');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { notes } = req.body;

    // Verify user is updating their own wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const item = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not in wishlist' });
    }

    item.notes = notes;
    await wishlist.save();
    await wishlist.populate('items.productId');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is updating their own wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    ).populate('items.productId');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const shareWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isPublic } = req.body;

    // Verify user owns wishlist
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { isPublic },
      { new: true }
    ).populate('items.productId', 'name price images category');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({
      userId,
      isPublic: true,
    }).populate('items.productId', 'name price images category description');

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found or is private' });
    }

    res.json({
      wishlist: {
        items: wishlist.items,
        itemCount: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
