import express from 'express'
import Annonce from '../models/Annonce.js'
import { auth, clientOnly } from '../middleware/auth.js'
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all annonces
router.get('/', async (req, res) => {
  try {
    const annonces = await Annonce.find().populate('creator', 'username avatar role').sort({ createdAt: -1 });
    res.json(annonces);
  } catch (err) {
    console.error('Erreur fetch annonces:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des annonces' });
  }
});

// Post an annonce (Any authenticated user)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, budget, location } = req.body;
    
    // Validation
    if (!title || !category || !description || !location) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires (titre, catégorie, description, localisation)' });
    }

    // Handle image file
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create new annonce with cleaned data
    const annonce = new Annonce({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      budget: (budget && !isNaN(budget)) ? Number(budget) : undefined,
      location: location.trim(),
      image: imageUrl,
      creator: req.user.id
    });
    
    const savedAnnonce = await annonce.save();
    
    // Populate creator info before sending back
    const populatedAnnonce = await Annonce.findById(savedAnnonce._id).populate('creator', 'username avatar role');
    
    res.status(201).json(populatedAnnonce);
  } catch (err) {
    console.error('Erreur creation annonce:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'annonce', error: err.message });
  }
});

// Edit annonce
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    let annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    // Check ownership or admin role
    if (annonce.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Clean data for update
    const updateData = { ...req.body };
    if (updateData.budget) updateData.budget = Number(updateData.budget);
    
    // Handle new image if uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    annonce = await Annonce.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.json(annonce);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete annonce
router.delete('/:id', auth, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    // Check ownership or admin role
    if (annonce.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await Annonce.findByIdAndDelete(req.params.id);
    res.json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

export default router;
