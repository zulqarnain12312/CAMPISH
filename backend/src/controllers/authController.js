const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

function signToken(user) {
  const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
  const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

exports.credentialsRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const role = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).includes(email)
    ? "admin"
    : "user";
  const user = await User.create({ name, email, passwordHash, role, provider: "credentials" });
  const token = signToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.credentialsLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const image = payload.picture;
    let user = await User.findOne({ email });
    const role = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).includes(email)
      ? "admin"
      : "user";
    if (!user) {
      user = await User.create({ name, email, image, role, provider: "google", providerId: payload.sub });
    }
    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  return res.json({ user });
};

