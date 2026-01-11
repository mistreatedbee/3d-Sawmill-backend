import { Product } from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;
    
    // Build query
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    let sortQuery = {};
    if (sort === 'price-asc') {
      sortQuery.price = 1;
    } else if (sort === 'price-desc') {
      sortQuery.price = -1;
    } else {
      sortQuery.name = 1;
    }

    const products = await Product.find(query).sort(sortQuery);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      productType,
      woodType,
      color,
      price,
      stock,
      dimensions,
      weight,
      images,
      featured,
      isAvailable,
      bulkPricing,
      specifications,
      tags,
      minimumOrderQuantity,
      leadTime,
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      productType,
      woodType,
      color,
      price,
      stock,
      dimensions,
      weight,
      images,
      featured,
      isAvailable,
      bulkPricing: bulkPricing || [],
      specifications: specifications || {},
      tags: tags || [],
      minimumOrderQuantity: minimumOrderQuantity || 1,
      leadTime: leadTime || { value: 1, unit: 'days' },
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
