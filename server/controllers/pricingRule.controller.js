import PricingRule from "../models/PricingRule.model.js";
import Product from "../models/Product.model.js";

export const createPricingRule = async (req, res) => {
  try {
    const { productId, minQuantity, discountPercentage, label } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = await PricingRule.findOne({
      product: productId,
      minQuantity,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({
        message: `A rule with minQuantity ${minQuantity} already exists for this product`,
      });
    }

    const rule = await PricingRule.create({
      product: productId,
      minQuantity,
      discountPercentage,
      label,
      createdBy: req.user._id,
    });

    await rule.populate("product", "name basePrice");
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRulesByProduct = async (req, res) => {
  try {
    const rules = await PricingRule.find({
      product: req.params.productId,
      isActive: true,
    })
      .populate("product", "name basePrice")
      .sort({ minQuantity: 1 });

    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRules = async (req, res) => {
  try {
    const rules = await PricingRule.find({ isActive: true })
      .populate("product", "name basePrice category")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePricingRule = async (req, res) => {
  try {
    const { minQuantity, discountPercentage, label, isActive } = req.body;

    const rule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      { minQuantity, discountPercentage, label, isActive },
      { new: true, runValidators: true },
    ).populate("product", "name basePrice");

    if (!rule) {
      return res.status(404).json({ message: "Pricing rule not found" });
    }

    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!rule) {
      return res.status(404).json({ message: "Pricing rule not found" });
    }

    res.json({ message: "Pricing rule deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const calculatePrice = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const rules = await PricingRule.find({
      product: productId,
      isActive: true,
      minQuantity: { $lte: quantity },
    }).sort({ minQuantity: -1 });

    let bestRule = null;
    let discountPercentage = 0;

    if (rules.length > 0) {
      bestRule = rules[0];
      discountPercentage = bestRule.discountPercentage;
    }

    const discountedUnitPrice =
      product.basePrice * (1 - discountPercentage / 100);
    const totalPrice = discountedUnitPrice * quantity;

    res.json({
      product,
      quantity,
      basePrice: product.basePrice,
      appliedRule: bestRule,
      discountPercentage,
      discountedUnitPrice: parseFloat(discountedUnitPrice.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
