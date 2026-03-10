import { GoogleGenerativeAI } from "@google/generative-ai";
import Purchase from "../models/Purchase.model.js";
import Product from "../models/Product.model.js";
import PricingRule from "../models/PricingRule.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getBestApplicableRule = async (productId, quantity) => {
  const rules = await PricingRule.find({
    product: productId,
    isActive: true,
    minQuantity: { $lte: quantity },
  }).sort({ minQuantity: -1 });

  return rules.length > 0 ? rules[0] : null;
};

const generateAIExplanation = async (
  product,
  quantity,
  bestRule,
  allRules,
  totalPrice,
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const rulesText =
      allRules.length > 0
        ? allRules
            .map((r) => `- Buy ${r.minQuantity}+: ${r.discountPercentage}% off`)
            .join("\n")
        : "No discount rules defined.";

    const appliedText = bestRule
      ? `Applied rule: Buy ${bestRule.minQuantity}+ units → ${bestRule.discountPercentage}% discount`
      : "No discount applied (quantity below minimum threshold).";

    const prompt = `
You are a pricing engine assistant. Explain the following purchase pricing decision clearly and concisely in 2-3 sentences.

Product: ${product.name}
Base Price: $${product.basePrice}
Quantity Ordered: ${quantity}
Available Discount Rules:
${rulesText}
${appliedText}
Final Total: $${totalPrice}

Explain why this discount was selected as the most beneficial applicable rule, or why no discount was applied. Be direct and informative.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini AI error:", err.message);
    return "AI explanation unavailable at this time.";
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    const bestRule = await getBestApplicableRule(productId, quantity);
    const discountPercentage = bestRule ? bestRule.discountPercentage : 0;
    const discountedUnitPrice =
      product.basePrice * (1 - discountPercentage / 100);
    const totalPrice = parseFloat((discountedUnitPrice * quantity).toFixed(2));

    const allRules = await PricingRule.find({
      product: productId,
      isActive: true,
    }).sort({ minQuantity: 1 });

    const aiExplanation = await generateAIExplanation(
      product,
      quantity,
      bestRule,
      allRules,
      totalPrice,
    );

    const purchase = await Purchase.create({
      user: req.user._id,
      product: productId,
      quantity,
      basePrice: product.basePrice,
      appliedRule: bestRule ? bestRule._id : null,
      discountPercentage,
      discountedUnitPrice: parseFloat(discountedUnitPrice.toFixed(2)),
      totalPrice,
      aiExplanation,
    });

    await purchase.populate([
      { path: "product", select: "name basePrice category" },
      { path: "appliedRule", select: "minQuantity discountPercentage label" },
      { path: "user", select: "username email" },
    ]);

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate("product", "name basePrice category")
      .populate("appliedRule", "minQuantity discountPercentage label")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("product", "name basePrice category")
      .populate("appliedRule", "minQuantity discountPercentage label")
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
