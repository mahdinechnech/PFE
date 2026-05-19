import express from "express";
import Annonce from "../models/Annonce.js";
import { auth, adminOnly } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

/* ───────────────── FILE UPLOAD ───────────────── */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ───────────────── GET ALL PUBLIC ANNONCES ───────────────── */
// Only shows approved/open announcements to public
router.get("/", async (req, res) => {
  try {
    const annonces = await Annonce.find({
      $or: [{ status: "pending" }, { status: "approved" }],
    })
      .populate("creator", "username avatar role wilaya phone email")
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (err) {
    console.error("Error fetching public annonces:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* ───────────────── GET CURRENT USER'S ANNONCES (ALL STATUSES) ───────────────── */
router.get("/mine", auth, async (req, res) => {
  try {
    console.log("=== DEBUG /mine endpoint ===");
    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user._id);
    console.log("req.user.id:", req.user.id);
    console.log("req.user.userId:", req.user.userId);

    // Try all possible ID fields
    const userId = req.user._id || req.user.id || req.user.userId;
    console.log("Resolved userId:", userId);

    const annonces = await Annonce.find({ creator: userId })
      .populate("creator", "username avatar role wilaya phone email")
      .sort({ createdAt: -1 });

    console.log(`Found ${annonces.length} announcements for user ${userId}`);
    console.log(
      "Announcements:",
      annonces.map((a) => ({
        id: a._id,
        title: a.title,
        status: a.status,
        creator: a.creator,
      })),
    );

    res.json(annonces);
  } catch (err) {
    console.error("Error fetching user's annonces:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── ADMIN: GET ALL ANNONCES ───────────────── */
router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const annonces = await Annonce.find()
      .populate("creator", "username avatar role wilaya phone email")
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (err) {
    console.error("Error fetching all annonces for admin:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── GET ONE ANNONCE ───────────────── */
router.get("/:id", async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id).populate(
      "creator",
      "username avatar role wilaya phone email",
    );

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce non trouvée",
      });
    }

    // Only return if status is open/approved OR user is the owner/admin
    const isOwner =
      req.user && annonce.creator._id.toString() === req.user._id.toString();
    const isAdminUser = req.user && req.user.role === "admin";

    if (
      !isOwner &&
      !isAdminUser &&
      !["pending", "approved"].includes(annonce.status)
    ) {
      return res.status(403).json({
        message: "Cette annonce n'est pas encore disponible",
      });
    }

    res.json(annonce);
  } catch (err) {
    console.error("Error fetching single annonce:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── CREATE ANNONCE ───────────────── */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, budget, location, phone, status } =
      req.body;

    // Validate required fields
    if (!title || !category || !description || !location) {
      return res.status(400).json({
        message: "Titre, catégorie, description et localisation sont requis",
      });
    }

    // Create annonce with pending status for admin approval
    const annonce = await Annonce.create({
      title: title.trim(),
      category,
      description: description.trim(),
      budget: budget ? Number(budget) : 0,
      location: location.trim(),
      phone: phone || req.user?.phone || "",
      image: req.file ? `/uploads/${req.file.filename}` : "",
      creator: req.user?._id || req.user?.id,
      status: status || "pending", // Default to pending for admin approval
    });

    const populated = await Annonce.findById(annonce._id).populate(
      "creator",
      "username avatar role wilaya phone email",
    );

    return res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE ANNONCE ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── UPDATE ANNONCE ───────────────── */
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce introuvable",
      });
    }

    // Check if user is owner or admin
    const isOwner =
      annonce.creator.toString() === (req.user?._id || req.user?.id).toString();
    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        message:
          "Non autorisé - vous n'êtes pas le propriétaire de cette annonce",
      });
    }

    const updateData = { ...req.body };

    if (updateData.budget) {
      updateData.budget = Number(updateData.budget);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Don't allow status change unless admin
    if (!isAdminUser && updateData.status) {
      delete updateData.status;
    }

    const updated = await Annonce.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("creator", "username avatar role wilaya phone email");

    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      message: "Erreur lors de la mise à jour",
    });
  }
});

/* ───────────────── UPDATE ANNONCE STATUS (ADMIN ONLY) ───────────────── */
router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected", "closed", "pending"].includes(status)) {
      return res.status(400).json({
        message:
          "Statut invalide. Valeurs acceptées: approved, rejected, closed, pending",
      });
    }

    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce introuvable",
      });
    }

    annonce.status = status;

    if (status === "rejected") {
      annonce.rejectReason = rejectReason || "Non spécifié";
    } else {
      annonce.rejectReason = "";
    }

    await annonce.save();

    const populated = await Annonce.findById(annonce._id).populate(
      "creator",
      "username avatar role wilaya phone email",
    );

    res.json(populated);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── DELETE ANNONCE ───────────────── */
router.delete("/:id", auth, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce introuvable",
      });
    }

    // Check if user is owner or admin
    const isOwner =
      annonce.creator.toString() === (req.user?._id || req.user?.id).toString();
    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        message:
          "Non autorisé - vous ne pouvez supprimer que vos propres annonces",
      });
    }

    await Annonce.findByIdAndDelete(req.params.id);

    res.json({
      message: "Annonce supprimée avec succès",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      message: "Erreur lors de la suppression",
    });
  }
});

export default router;
