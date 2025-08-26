const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    providerId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

