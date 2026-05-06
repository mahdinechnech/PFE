import express from 'express'
import User from '../models/User.js'
import { auth } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Get public profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email -phone');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get public profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Update profile (Handling multipart/form-data for avatar)
router.put('/profile', auth, upload.single('avatarFile'), async (req, res) => {
  try {
    console.log('Update profile request received:', { body: req.body, file: req.file, userId: req.user.id });
    const { bio, location } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
      console.log('Avatar to be updated to:', updateData.avatar);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('User updated successfully:', { id: updatedUser._id, bio: updatedUser.bio, location: updatedUser.location });
    res.json(updatedUser);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil', error: err.message });
  }
});

export default router;
