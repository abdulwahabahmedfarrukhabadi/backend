import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from 'cors';
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import tvRoutes from "./routes/tv.route.js";
import searchRoutes from "./routes/search.route.js";

import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { protectRoute } from "./middleware/protectRoute.js";

const app = express();
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: 'https://frontend2-blush.vercel.app', // Your frontend's domain
  credentials: true, // Allow cookies to be sent
  // Allow specific headers
};


app.use(cors(corsOptions));


// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the API server!");
});

// Error handling for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Connect to the database
connectDB();

// Export app for Vercel
export default app;
