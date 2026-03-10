import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    basePrice: {
      type: Number,
      required: true,
    },
    appliedRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PricingRule",
      default: null,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountedUnitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    aiExplanation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
