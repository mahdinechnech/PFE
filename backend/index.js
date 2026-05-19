import dotenv from "dotenv";
dotenv.config();

console.log("📦 Loading environment variables...");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

console.log("📦 Importing modules...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
console.log("📁 Loading routes...");
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import annonceRoutes from "./routes/annonceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
console.log("✅ Routes loaded");

const app = express();

// Middleware
console.log("🔧 Setting up middleware...");
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("✅ Middleware configured");

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.get("/", (req, res) => {
  res.send("<h1>FixIt Backend is running!</h1>");
});

// Connect to MongoDB
console.log("🔌 Connecting to MongoDB...");
console.log(
  "MongoDB URI:",
  process.env.MONGODB_URI ? "✅ Present" : "❌ Missing",
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    console.log("📊 Database name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB:", err);
    process.exit(1);
  });

// Routes
console.log("🛣️  Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forum", forumRoutes);
console.log("✅ Routes configured");

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Handle 404
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`=========================================`);
  console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📂 UPLOADS: http://localhost:${PORT}/uploads`);
  console.log(`=========================================`);
});

// Handle process events
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
