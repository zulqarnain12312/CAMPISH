const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const auth = require("../controllers/authController");
const products = require("../controllers/productController");
const categories = require("../controllers/categoryController");
const orders = require("../controllers/orderController");

const router = express.Router();

// Auth
router.post("/auth/register", auth.credentialsRegister);
router.post("/auth/login", auth.credentialsLogin);
router.post("/auth/google", auth.googleLogin);
router.get("/auth/me", authRequired, auth.me);

// Products
router.get("/products", products.list);
router.get("/products/:slug", products.detail);
router.post("/products", authRequired, adminOnly, products.create);
router.put("/products/:id", authRequired, adminOnly, products.update);
router.delete("/products/:id", authRequired, adminOnly, products.remove);

// Categories
router.get("/categories", categories.list);
router.post("/categories", authRequired, adminOnly, categories.create);
router.put("/categories/:id", authRequired, adminOnly, categories.update);
router.delete("/categories/:id", authRequired, adminOnly, categories.remove);

// Orders
router.post("/orders/checkout", authRequired, orders.createCheckout);
router.post("/orders", authRequired, orders.createOrder);
router.get("/orders/mine", authRequired, orders.listMine);
router.get("/orders", authRequired, adminOnly, orders.listAll);
router.put("/orders/:id/status", authRequired, adminOnly, orders.updateStatus);

module.exports = router;

