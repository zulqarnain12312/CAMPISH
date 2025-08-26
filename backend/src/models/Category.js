const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

