import mongoose from "mongoose";

const AnnonceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number },
  location: { type: String, required: true }, // Wilaya or Address
  image: { type: String, default: '' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Annonce = mongoose.model('Annonce', AnnonceSchema);
export default Annonce;
