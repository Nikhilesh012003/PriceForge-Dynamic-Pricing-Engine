import express from "express";
import {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
} from "../controllers/purchase.controller.js";
import {
  verifyAccessToken,
  verifyAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", verifyAccessToken, getUserPurchases);
router.get("/all", verifyAccessToken, verifyAdmin, getAllPurchases);
router.post("/", verifyAccessToken, createPurchase);

export default router;
