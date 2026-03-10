import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  verifyAccessToken,
  verifyAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllProducts);
router.get("/:id", verifyAccessToken, getProductById);
router.post("/", verifyAccessToken, verifyAdmin, createProduct);
router.put("/:id", verifyAccessToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyAccessToken, verifyAdmin, deleteProduct);

export default router;
