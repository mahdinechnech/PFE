import express from "express";
import Service from "../models/Service.js";
import { auth, technicianOnly } from "../middleware/auth.js";

const router = express.Router();

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find()
      .populate("creator", "username avatar role")
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// Post a service (Technician only)
router.post("/", auth, technicianOnly, async (req, res) => {
  try {
    const { title, category, description, price, location } = req.body;
    const service = new Service({
      title,
      category,
      description,
      price,
      location,
      phone,
      creator: req.user.id,
    });
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// Edit service
router.put("/:id", auth, technicianOnly, async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    if (
      service.creator.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.json(service);
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// Delete service
router.delete("/:id", auth, technicianOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    if (
      service.creator.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service supprimé" });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

export default router;
