const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const { upload } = require("../utils/uploader");

const router = express.Router();

router.post("/image", authRequired, adminOnly, upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.post("/media", authRequired, adminOnly, upload.array("files", 5), (req, res) => {
  res.json({ urls: req.files.map((f) => `/uploads/${f.filename}`) });
});

module.exports = router;

