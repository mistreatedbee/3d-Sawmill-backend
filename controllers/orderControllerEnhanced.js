import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Analytics } from '../models/Analytics.js';

// Generate unique order number
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.replace('ORD-', '')) : 0;
  return `ORD-${String(lastNumber + 1).padStart(6, '0')}`;
};

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      subtotal,
      discount,
      discountCode,
      tax,
      shippingCost,
      total,
      deliveryMethod,
      estimatedDelivery,
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      notes,
    } = req.body;

    // Validate items and reduce stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with initial status history
    const order = new Order({
      orderNumber,
      userId,
      items,
      subtotal,
      discount,
      discountCode,
      tax,
      shippingCost,
      total,
      deliveryMethod,
      estimatedDelivery,
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      paymentStatus: 'pending',
      notes,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          notes: 'Order created',
        }
      ],
    });

    await order.save();
    await order.populate('userId items.productId');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('items.productId', 'name price images');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow users to view their own orders (unless admin)
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name price images category');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, sortBy = '-createdAt', limit = 10, page = 1 } = req.query;

    // Verify user is viewing their own orders
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('items.productId', 'name price images');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    const oldStatus = order.status;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    // Add to status history
    order.statusHistory.push({
      status,
      notes: notes || `Status changed from ${oldStatus} to ${status}`,
      updatedBy: req.user.email,
    });

    // If delivered, set actual delivery date
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();
    await order.populate('items.productId');

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
    }

    // Restore stock for cancelled items
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      notes: reason || 'Order cancelled by user',
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50, page = 1, sortBy = '-createdAt' } = req.query;

    let query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    order.statusHistory.push({
      status: 'refunded',
      notes: reason || 'Order refunded',
      updatedBy: req.user.email,
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
