import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// 🔹 Load env variables
dotenv.config();

const app = express();

// =====================
// ✅ MIDDLEWARE
// =====================

// 🔥 CORS FIX (VERY IMPORTANT for Vercel)
app.use(cors({
  origin: "*", // allow all (safe for your demo)
}));

// JSON parser
app.use(express.json());

// =====================
// ✅ DATABASE CONNECTION
// =====================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ DB Error:", err));

// =====================
// ✅ ROUTES IMPORT
// =====================

// 👉 Make sure these files exist
import authRoutes from "./routes/authRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// =====================
// ✅ ROUTES USE
// =====================

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/settings", settingsRoutes);

// =====================
// ✅ ROOT ROUTE (for testing)
// =====================

app.get("/", (req, res) => {
  res.send("🚀 HMS Backend Running");
});

// =====================
// ✅ ERROR HANDLER (optional but useful)
// =====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

// =====================
// ✅ PORT (IMPORTANT FOR RENDER)
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
