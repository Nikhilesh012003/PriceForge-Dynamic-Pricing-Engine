import Product from "../models/Product.model.js";
import PricingRule from "../models/PricingRule.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, basePrice, description, category } = req.body;

    if (!basePrice || basePrice <= 0) {
      return res
        .status(400)
        .json({ message: "Base price must be greater than zero" });
    }

    const product = await Product.create({
      name,
      basePrice,
      description,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Product name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "username email",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, basePrice, description, category, isActive } = req.body;

    if (basePrice !== undefined && basePrice <= 0) {
      return res
        .status(400)
        .json({ message: "Base price must be greater than zero" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, basePrice, description, category, isActive },
      { new: true, runValidators: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Product name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await PricingRule.updateMany(
      { product: req.params.id },
      { isActive: false },
    );

    res.json({ message: "Product deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
