const Product = require("../models/Product");
const slugify = require("slugify");

exports.list = async (req, res) => {
  const { q, category, sort = "-createdAt", page = 1, limit = 20 } = req.query;
  const query = {};
  if (q) query.title = { $regex: String(q), $options: "i" };
  if (category) query.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(query).sort(String(sort)).skip(skip).limit(Number(limit)).populate("category"),
    Product.countDocuments(query),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.detail = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category");
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

exports.create = async (req, res) => {
  const body = req.body;
  const slug = body.slug || slugify(body.title, { lower: true, strict: true });
  const product = await Product.create({ ...body, slug });
  res.status(201).json(product);
};

exports.update = async (req, res) => {
  const body = req.body;
  if (body.title && !body.slug) body.slug = slugify(body.title, { lower: true, strict: true });
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};

