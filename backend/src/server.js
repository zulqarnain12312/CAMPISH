const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const apiRoutes = require("./routes/index");
const uploadRoutes = require("./routes/upload");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shop";
const USE_INMEMORY = String(process.env.USE_INMEMORY || "0") === "1";

async function start() {
  try {
    if (!USE_INMEMORY) {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");
    } else {
      console.log("Starting in in-memory mode; MongoDB not connected");
    }
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

module.exports = app;

