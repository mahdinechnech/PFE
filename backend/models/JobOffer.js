import mongoose from "mongoose";

const JobOfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  nature: { type: String, required: true }, // Administratif or Personnel
  type: { type: String, required: true },   // Temps plein, etc.
  salary: { type: Number, required: true },
  location: { type: String, required: true }, // Google Maps URL
  description: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const JobOffer = mongoose.model('JobOffer', JobOfferSchema);
export default JobOffer;
