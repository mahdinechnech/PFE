import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

console.log("Testing connection to:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Could not connect to MongoDB");
    console.error(err);
    process.exit(1);
  });
const hash = await bcrypt.hash("admin1234", 10);

console.log(hash);
