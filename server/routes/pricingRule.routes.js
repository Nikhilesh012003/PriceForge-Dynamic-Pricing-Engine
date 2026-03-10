import express from "express";
import {
  createPricingRule,
  getRulesByProduct,
  getAllRules,
  updatePricingRule,
  deletePricingRule,
  calculatePrice,
} from "../controllers/pricingRule.controller.js";
import {
  verifyAccessToken,
  verifyAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllRules);
router.get("/product/:productId", verifyAccessToken, getRulesByProduct);
router.post("/calculate", verifyAccessToken, calculatePrice);
router.post("/", verifyAccessToken, verifyAdmin, createPricingRule);
router.put("/:id", verifyAccessToken, verifyAdmin, updatePricingRule);
router.delete("/:id", verifyAccessToken, verifyAdmin, deletePricingRule);

export default router;
