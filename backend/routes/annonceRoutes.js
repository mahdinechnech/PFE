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

router.get("/", async (req, res) => {
  try {
    const annonces = await Annonce.find({
      $or: [{ status: "open" }, { status: "approved" }],
    })
      .populate("creator", "username avatar role wilaya phone")
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET /api/annonces/mine — protected, returns all statuses for current user
router.get("/mine", auth, async (req, res) => {
  const annonces = await Annonce.find({ creator: req.user._id })
    .populate("creator", "username avatar")
    .sort({ createdAt: -1 });
  res.json(annonces);
});
/* ───────────────── ADMIN : GET ALL ANNONCES ───────────────── */

router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const annonces = await Annonce.find()
      .populate("creator", "username avatar role wilaya phone")
      .sort({ createdAt: -1 });

    res.json(annonces);
  } catch (err) {
    console.log(err);

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
      "username avatar role wilaya phone",
    );

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce non trouvée",
      });
    }

    res.json(annonce);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* ───────────────── CREATE ANNONCE ───────────────── */

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, budget, location } = req.body;

    if (!title || !category || !description || !location) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const annonce = await Annonce.create({
      title: title.trim(),
      category,
      description: description.trim(),
      budget: budget ? Number(budget) : 0,
      location: location.trim(),
      phone: req.body.phone,

      image: req.file ? `/uploads/${req.file.filename}` : "",

      creator: req.user?._id || req.user?.id,

      // admin validation workflow
      status: "pending",
    });

    const populated = await Annonce.findById(annonce._id).populate(
      "creator",
      "username avatar role wilaya phone",
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

    // owner or admin only
    const isOwner =
      annonce.creator.toString() === (req.user?._id || req.user?.id).toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Non autorisé",
      });
    }

    const updateData = { ...req.body };

    if (updateData.budget) {
      updateData.budget = Number(updateData.budget);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Annonce.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      {
        new: true,
      },
    ).populate("creator", "username avatar role wilaya phone");

    res.json(updated);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Update error",
    });
  }
});

/* ───────────────── ADMIN : APPROVE / REJECT ───────────────── */

router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected", "open", "closed"].includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
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
      annonce.rejectReason = rejectReason || "";
    } else {
      annonce.rejectReason = "";
    }

    await annonce.save();

    const populated = await Annonce.findById(annonce._id).populate(
      "creator",
      "username avatar role wilaya phone",
    );

    res.json(populated);
  } catch (err) {
    console.log(err);

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

    // owner or admin only
    const isOwner =
      annonce.creator.toString() === (req.user?._id || req.user?.id).toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Non autorisé",
      });
    }

    await Annonce.findByIdAndDelete(req.params.id);

    res.json({
      message: "Annonce supprimée",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Delete error",
    });
  }
});

export default router;
