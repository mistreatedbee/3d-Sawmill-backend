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
      items,
      deliveryMethod,
      estimatedDelivery,
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      requestType,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
    }));

    if (normalizedItems.some(i => !i.productId || !i.quantity || i.quantity < 1)) {
      return res.status(400).json({ error: 'Invalid items payload' });
    }

    const isQuote = requestType === 'quote';

    // Validate items and reduce stock
    let computedSubtotal = 0;
    const enrichedItems = [];

    for (const item of normalizedItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      // For invoice requests we enforce stock; for quote requests we allow requesting above current stock
      if (!isQuote && product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const unitPrice = product.price || 0;
      computedSubtotal += unitPrice * item.quantity;

      enrichedItems.push({
        productId: product._id,
        quantity: item.quantity,
        productName: product.name,
        unitPrice,
      });

      // Reduce stock only for invoice requests
      if (!isQuote) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const computedTax = 0;
    const computedShippingCost = deliveryMethod === 'delivery' ? 0 : 0;
    const computedDiscount = 0;
    const computedTotal = computedSubtotal + computedTax + computedShippingCost - computedDiscount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with initial status history
    const order = new Order({
      orderNumber,
      userId: req.user.id,
      items: enrichedItems,
      subtotal: computedSubtotal,
      discount: computedDiscount,
      tax: computedTax,
      shippingCost: computedShippingCost,
      total: computedTotal,
      deliveryMethod,
      estimatedDelivery,
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      notes,
      requestType: isQuote ? 'quote' : 'invoice',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          notes: isQuote ? 'Quote requested' : 'Invoice requested',
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

export const updateOrderFinancials = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, shippingCost, tax, discount, adminNotes } = req.body;

    const order = await Order.findById(id).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (items && !Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array' });
    }

    // Update line items (quantity + unitPrice) by productId match
    if (Array.isArray(items)) {
      const incomingByProductId = new Map(
        items
          .filter((i) => i && (i.productId || i.id))
          .map((i) => [String(i.productId || i.id), i])
      );

      order.items.forEach((line) => {
        const key = String(line.productId?._id || line.productId);
        const incoming = incomingByProductId.get(key);
        if (!incoming) return;

        const nextQty = Number(incoming.quantity);
        const nextPrice = Number(incoming.unitPrice);

        if (!Number.isFinite(nextQty) || nextQty < 1) return;
        if (!Number.isFinite(nextPrice) || nextPrice < 0) return;

        line.quantity = nextQty;
        line.unitPrice = nextPrice;
        // Keep snapshot name up to date if possible
        if (!line.productName) {
          line.productName = line.productId?.name || line.productName || '';
        }
      });
    }

    if (shippingCost !== undefined) {
      const v = Number(shippingCost);
      if (Number.isFinite(v) && v >= 0) order.shippingCost = v;
    }
    if (tax !== undefined) {
      const v = Number(tax);
      if (Number.isFinite(v) && v >= 0) order.tax = v;
    }
    if (discount !== undefined) {
      const v = Number(discount);
      if (Number.isFinite(v) && v >= 0) order.discount = v;
    }
    if (typeof adminNotes === 'string') {
      order.adminNotes = adminNotes;
    }

    // Recalculate totals
    const subtotal = order.items.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * (Number(line.quantity) || 0), 0);
    order.subtotal = subtotal;
    order.total = subtotal + (order.tax || 0) + (order.shippingCost || 0) - (order.discount || 0);

    await order.save();
    await order.populate('items.productId');
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
    const paymentPending = await Order.countDocuments({ paymentStatus: 'pending' });
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const statusBreakdown = stats.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
      statusBreakdown,
      paymentPending,
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
