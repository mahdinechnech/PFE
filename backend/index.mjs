import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
// console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
