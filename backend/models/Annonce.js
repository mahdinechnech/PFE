import mongoose from "mongoose";

const AnnonceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Plomberie",
        "Électricité",
        "Mécanique",
        "Beauté",
        "Ménage",
        "Jardinage",
        "Livraison",
        "Baby sitting",
        "Maçonnerie",
        "Peinture",
        "Charpenterie",
        "Autre",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    budget: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "closed"],
      default: "pending",
    },

    rejectReason: {
      type: String,
      default: "",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Annonce", AnnonceSchema);
