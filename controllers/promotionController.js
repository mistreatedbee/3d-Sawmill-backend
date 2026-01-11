import { Promotion } from '../models/Promotion.js';
import { Order } from '../models/Order.js';

export const createPromotion = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minimumOrderValue,
      applicableProducts,
      applicableCategories,
      usageLimit,
      usagePerCustomer,
      validFrom,
      validUntil,
    } = req.body;

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({ error: 'Valid from date must be before valid until date' });
    }

    const promotion = new Promotion({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minimumOrderValue,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      usageLimit,
      usagePerCustomer: usagePerCustomer || 1,
      validFrom,
      validUntil,
      active: true,
    });

    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validatePromotion = async (req, res) => {
  try {
    const { code, orderTotal, userId, productIds, category } = req.body;

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      active: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!promotion) {
      return res.status(400).json({ error: 'Invalid or expired promotion code' });
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ error: 'Promotion has reached usage limit' });
    }

    // Check minimum order value
    if (orderTotal < promotion.minimumOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of R${promotion.minimumOrderValue} required`,
      });
    }

    // Check if applicable to products/categories
    if (promotion.applicableProducts.length > 0 || promotion.applicableCategories.length > 0) {
      const applicable = promotion.applicableProducts.some(pid =>
        productIds.includes(pid.toString())
      ) || promotion.applicableCategories.includes(category);

      if (!applicable) {
        return res.status(400).json({
          error: 'This promotion is not applicable to your items',
        });
      }
    }

    // Check per-customer usage
    if (userId && promotion.usagePerCustomer) {
      const userUsageCount = promotion.usedBy.filter(
        u => u.userId.toString() === userId
      ).length;

      if (userUsageCount >= promotion.usagePerCustomer) {
        return res.status(400).json({
          error: `You have already used this promotion ${promotion.usagePerCustomer} time(s)`,
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (orderTotal * promotion.discountValue) / 100;
      if (promotion.maxDiscount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscount);
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    res.json({
      valid: true,
      promotion: {
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalTotal: parseFloat((orderTotal - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const applyPromotion = async (req, res) => {
  try {
    const { code, orderId, userId } = req.body;

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Record usage
    promotion.usageCount += 1;
    promotion.usedBy.push({
      userId,
      orderId,
      usedAt: new Date(),
    });

    await promotion.save();

    res.json({ message: 'Promotion applied successfully', promotion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromotions = async (req, res) => {
  try {
    const { active = true, limit = 20, page = 1 } = req.query;

    let query = {};
    if (active !== undefined) {
      query.active = active === 'true';
      query.validFrom = { $lte: new Date() };
      query.validUntil = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    const promotions = await Promotion.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Promotion.countDocuments(query);

    res.json({
      promotions,
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

export const getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, active, usageLimit, validUntil } = req.body;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      {
        description,
        active,
        usageLimit,
        validUntil,
      },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromotionStats = async (req, res) => {
  try {
    const stats = await Promotion.aggregate([
      {
        $group: {
          _id: null,
          totalPromotions: { $sum: 1 },
          activePromotions: {
            $sum: {
              $cond: [{ $eq: ['$active', true] }, 1, 0],
            },
          },
          totalUsage: { $sum: '$usageCount' },
          totalDiscountGiven: {
            $sum: {
              $cond: [
                { $eq: ['$discountType', 'fixed_amount'] },
                { $multiply: ['$discountValue', '$usageCount'] },
                0,
              ],
            },
          },
        },
      },
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
