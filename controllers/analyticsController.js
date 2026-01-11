import { Analytics } from '../models/Analytics.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const generateDailyAnalytics = async (date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get orders for the day
    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: 'completed',
    }).populate('items.productId');

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscounts = orders.reduce((sum, order) => sum + (order.discount || 0), 0);

    // Get unique customers
    const uniqueCustomers = new Set(orders.map(o => o.userId.toString())).size;

    // Calculate product metrics
    const productMetrics = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId._id.toString();
        if (!productMetrics[productId]) {
          productMetrics[productId] = {
            productId: item.productId._id,
            name: item.productId.name,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productMetrics[productId].unitsSold += item.quantity;
        productMetrics[productId].revenue += item.quantity * item.productId.price;
      });
    });

    // Sort by revenue and add rank
    const sortedProducts = Object.values(productMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));

    // Category metrics
    const categoryMetrics = {};
    sortedProducts.forEach(product => {
      const product_data = orders.find(o =>
        o.items.some(item => item.productId._id.toString() === product.productId.toString())
      )?.items.find(item => item.productId._id.toString() === product.productId.toString())?.productId;

      if (product_data?.category) {
        if (!categoryMetrics[product_data.category]) {
          categoryMetrics[product_data.category] = {
            category: product_data.category,
            unitsSold: 0,
            revenue: 0,
          };
        }
        categoryMetrics[product_data.category].unitsSold += product.unitsSold;
        categoryMetrics[product_data.category].revenue += product.revenue;
      }
    });

    // Payment method metrics
    const paymentMetrics = {};
    orders.forEach(order => {
      if (!paymentMetrics[order.paymentMethod]) {
        paymentMetrics[order.paymentMethod] = {
          method: order.paymentMethod,
          count: 0,
          totalAmount: 0,
        };
      }
      paymentMetrics[order.paymentMethod].count += 1;
      paymentMetrics[order.paymentMethod].totalAmount += order.total;
    });

    // Delivery metrics
    const deliveryMetrics = {
      pickup: { count: 0, revenue: 0 },
      delivery: { count: 0, revenue: 0 },
    };
    orders.forEach(order => {
      if (deliveryMetrics[order.deliveryMethod]) {
        deliveryMetrics[order.deliveryMethod].count += 1;
        deliveryMetrics[order.deliveryMethod].revenue += order.total;
      }
    });

    // Status breakdown
    const allOrders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const statusBreakdown = {
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      packed: allOrders.filter(o => o.status === 'packed').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    };

    // Create or update analytics record
    const analytics = await Analytics.findOneAndUpdate(
      { date: { $gte: startOfDay, $lte: endOfDay } },
      {
        date: startOfDay,
        metrics: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          totalDiscounts,
          uniqueCustomers,
          newCustomers: uniqueCustomers,
          repeatCustomers: 0,
          conversionRate: 0,
        },
        productMetrics: sortedProducts,
        categoryMetrics: Object.values(categoryMetrics),
        paymentMetrics: Object.values(paymentMetrics),
        deliveryMetrics,
        ordersStatusBreakdown: statusBreakdown,
      },
      { new: true, upsert: true }
    );

    return analytics;
  } catch (error) {
    console.error('Error generating daily analytics:', error);
    throw error;
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, metric = 'daily' } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const analytics = await Analytics.find(query).sort({ date: -1 });

    // Calculate totals
    const totals = {
      totalOrders: 0,
      totalRevenue: 0,
      totalDiscounts: 0,
      uniqueCustomers: 0,
    };

    analytics.forEach(record => {
      totals.totalOrders += record.metrics.totalOrders;
      totals.totalRevenue += record.metrics.totalRevenue;
      totals.totalDiscounts += record.metrics.totalDiscounts;
    });

    res.json({
      analytics,
      totals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyAnalytics = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const analytics = await Analytics.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!analytics) {
      // Generate if doesn't exist
      const generated = await generateDailyAnalytics(queryDate);
      return res.json(generated);
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const topProducts = await Analytics.aggregate([
      { $match: query },
      { $unwind: '$productMetrics' },
      {
        $group: {
          _id: '$productMetrics.productId',
          name: { $first: '$productMetrics.name' },
          unitsSold: { $sum: '$productMetrics.unitsSold' },
          revenue: { $sum: '$productMetrics.revenue' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRevenueChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const revenueData = await Analytics.find(query)
      .select('date metrics.totalRevenue metrics.totalOrders')
      .sort({ date: 1 });

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const categoryStats = await Analytics.aggregate([
      { $match: query },
      { $unwind: '$categoryMetrics' },
      {
        $group: {
          _id: '$categoryMetrics.category',
          unitsSold: { $sum: '$categoryMetrics.unitsSold' },
          revenue: { $sum: '$categoryMetrics.revenue' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentMethodAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const paymentStats = await Analytics.aggregate([
      { $match: query },
      { $unwind: '$paymentMetrics' },
      {
        $group: {
          _id: '$paymentMetrics.method',
          count: { $sum: '$paymentMetrics.count' },
          totalAmount: { $sum: '$paymentMetrics.totalAmount' },
        },
      },
    ]);

    res.json(paymentStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
