import express from "express";
import User from "../models/User.model.js";
import {
  verifyAccessToken,
  verifyAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyAccessToken, (req, res) => {
  res.json(req.user);
});

router.put("/me", verifyAccessToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true },
    ).select("-password -refreshToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", verifyAccessToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
