import express from 'express'
const router = express.Router();
import {auth} from '../middleware/auth.js'
import JobOffer from '../models/JobOffer.js';

// Get all offers (recent first)
router.get('/', auth, async (req, res) => {
  try {
    const offers = await JobOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// Create an offer
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Seuls les administrateurs et employés peuvent créer des offres' });
    }

    const { title, nature, type, salary, location, description } = req.body;
    const newOffer = new JobOffer({
      title,
      nature,
      type,
      salary,
      location,
      description,
      author: req.user.username
    });

    const offer = await newOffer.save();
    res.json(offer);
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

export default router
