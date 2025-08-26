const Category = require("../models/Category");
const slugify = require("slugify");

exports.list = async (_req, res) => {
  const items = await Category.find({}).sort("name");
  res.json(items);
};

exports.create = async (req, res) => {
  const { name, image } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const exists = await Category.findOne({ slug });
  if (exists) return res.status(409).json({ message: "Category exists" });
  const cat = await Category.create({ name, slug, image });
  res.status(201).json(cat);
};

exports.update = async (req, res) => {
  const body = req.body;
  if (body.name && !body.slug) body.slug = slugify(body.name, { lower: true, strict: true });
  const cat = await Category.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json(cat);
};

exports.remove = async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};

