import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // Default to client if not specified or trying to sneak in admin
    const finalRole = (role === 'admin') ? 'client' : (role || 'client');

    let user = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (user) return res.status(400).json({ message: 'L\'utilisateur existe déjà' });

    user = new User({ username, email, phone, password, role: finalRole });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Basic Login (Clients & Techniciens only)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }, { username: identifier }]
    });

    if (!user) return res.status(400).json({ message: 'Identifiants invalides' });

    // Block Admin login from basic login
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Veuillez utiliser le portail administrateur.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Votre compte a été suspendu.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Admin Secret Login
router.post('/admin-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun utilisateur avec cet email' });

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // In a real app, send email here. For now, return it (dev mode)
    res.json({ message: 'Lien de réinitialisation généré', resetToken });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Jeton invalide ou expiré' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

export default router;
