import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    minQuantity: {
      type: Number,
      required: [true, "Minimum quantity is required"],
      min: [1, "Minimum quantity must be at least 1"],
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

pricingRuleSchema.index({ product: 1, minQuantity: 1 }, { unique: true });

const PricingRule = mongoose.model("PricingRule", pricingRuleSchema);
export default PricingRule;
