import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { error } from "console";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword, role } =
      req.body;

    // Check passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Default role
    const finalRole = role === "admin" ? "client" : role || "client";

    // Check existing user
    let user = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (user) {
      return res.status(400).json({
        message: "L'utilisateur existe déjà",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: finalRole,
    });

    // Save user
    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Response
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Basic Login (Clients & Techniciens only)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("EMAIL:", email);

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { username: identifier },
      ],
    });

    if (!user)
      return res.status(400).json({ message: "Identifiants invalides" });

    // Block Admin login from basic login
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Accès refusé. Veuillez utiliser le portail administrateur.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Votre compte a été suspendu." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Admin Secret Login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("EMAIL:", email);

    // Find admin by email
    const user = await User.findOne({ email });

    console.log("USER:", user);

    if (!user) {
      return res.status(403).json({
        message: "Utilisateur introuvable",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("MATCH:", isMatch);
    console.log("ROLE:", user.role);

    if (!isMatch || user.role !== "admin") {
      return res.status(403).json({
        message: "Accès non autorisé",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Aucun utilisateur avec cet email" });

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // In a real app, send email here. For now, return it (dev mode)
    res.json({ message: "Lien de réinitialisation généré", resetToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Jeton invalide ou expiré" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
});
console.log(error);

export default router;
