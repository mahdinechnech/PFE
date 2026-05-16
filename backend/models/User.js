import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["client", "technicien", "admin"],
    default: "client",
  },
  isBanned: { type: Boolean, default: false },

  // Profile info
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  avatar: { type: String, default: "" },

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
export default User;
