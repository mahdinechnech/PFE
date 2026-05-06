import express from 'express'
import User from '../models/User.js'
import { auth, adminOnly } from '../middleware/auth.js'

const router = express.Router();

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Ban/Unban user
router.put('/users/ban/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de bannir un administrateur' });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Change user role
router.put('/users/role/:id', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['client', 'technicien', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

export default router;
