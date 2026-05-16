import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ─────────────────────────────────────────────
// ADMIN LOGIN
// ─────────────────────────────────────────────
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

    // Find admin by email
    const user = await User.findOne({ email });

    console.log("USER:", user);

    // User not found
    if (!user) {
      return res.status(403).json({
        message: "Utilisateur introuvable",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("MATCH:", isMatch);
    console.log("ROLE:", user.role);

    // Wrong password or not admin
    if (!isMatch || user.role !== "admin") {
      return res.status(403).json({
        message: "Accès non autorisé",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

export default router;
