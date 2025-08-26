const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

module.exports = { upload };

