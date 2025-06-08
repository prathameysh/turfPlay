const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://prathameshgavatre:hEvkwLPp18DjjHB1@namastenode.5rc03jd.mongodb.net/turfbooking";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "owner"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  imageURL: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startHour: { type: Number, required: true }, // 0-23
  endHour: { type: Number, required: true }, // 0-23
  createdAt: { type: Date, default: Date.now },
});

const blockedSlotSchema = new mongoose.Schema({
  turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startHour: { type: Number, required: true }, // 0-23
  endHour: { type: Number, required: true }, // 0-23
  createdAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model("User", userSchema);
const Turf = mongoose.model("Turf", turfSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const BlockedSlot = mongoose.model("BlockedSlot", blockedSlotSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Routes

// POST /register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, turfName, location, imageURL } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role,
    });

    await user.save();

    // If owner, create turf
    if (role === "owner" && turfName && location && imageURL) {
      const turf = new Turf({
        name: turfName,
        location,
        imageURL,
        ownerId: user._id,
      });
      await turf.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /turfs
app.get("/turfs", async (req, res) => {
  try {
    const turfs = await Turf.find().populate("ownerId", "name email");
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /book
app.post("/book", authenticateToken, async (req, res) => {
  try {
    const { turfId, date, startHour, endHour } = req.body;
    const userId = req.user.userId;

    // Check if slot is already occupied
    const existingBooking = await Booking.findOne({
      turfId,
      date,
      $or: [{ startHour: { $lt: endHour }, endHour: { $gt: startHour } }],
    });

    const existingBlock = await BlockedSlot.findOne({
      turfId,
      date,
      $or: [{ startHour: { $lt: endHour }, endHour: { $gt: startHour } }],
    });

    if (existingBooking || existingBlock) {
      return res.status(400).json({ error: "Time slot is already occupied" });
    }

    // Create booking
    const booking = new Booking({
      turfId,
      userId,
      date,
      startHour,
      endHour,
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /block-slot
app.post("/block-slot", authenticateToken, async (req, res) => {
  try {
    const { turfId, date, startHour, endHour } = req.body;

    // Verify user owns the turf
    const turf = await Turf.findOne({ _id: turfId, ownerId: req.user.userId });
    if (!turf) {
      return res
        .status(403)
        .json({ error: "You can only block slots for your own turfs" });
    }

    // Create blocked slot
    const blockedSlot = new BlockedSlot({
      turfId,
      date,
      startHour,
      endHour,
    });

    await blockedSlot.save();

    res.status(201).json({
      message: "Slot blocked successfully",
      blockedSlot,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mybookings
app.get("/mybookings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId }).populate(
      "turfId",
      "name location"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /occupied
app.get("/occupied", async (req, res) => {
  try {
    const { date, turfId } = req.query;

    const bookings = await Booking.find({ turfId, date }, "startHour endHour");
    const blockedSlots = await BlockedSlot.find(
      { turfId, date },
      "startHour endHour"
    );

    const occupied = [
      ...bookings.map((b) => ({
        startHour: b.startHour,
        endHour: b.endHour,
        type: "booking",
      })),
      ...blockedSlots.map((b) => ({
        startHour: b.startHour,
        endHour: b.endHour,
        type: "blocked",
      })),
    ];

    res.json(occupied);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /my-turfs (for owners)
app.get("/my-turfs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ error: "Only owners can access this endpoint" });
    }

    const turfs = await Turf.find({ ownerId: req.user.userId });
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
