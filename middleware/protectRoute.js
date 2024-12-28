import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";
import cors from "cors";

const app = express();

// Set up CORS to allow requests from the frontend domain
app.use(cors({
  origin: "https://your-frontend-domain.com", // Replace with your frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Authorization,Content-Type", // Include any headers that might be needed
  credentials: true, // Allow cookies to be sent with the request
}));

export const protectRoute = async (req, res, next) => {
  try {
    // Retrieve token from cookies or headers
    const token = req.cookies["jwt-netflix"] || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - Token Missing" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token",
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    // Attach user to request
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
