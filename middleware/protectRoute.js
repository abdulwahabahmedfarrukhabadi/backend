import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Step 1: Retrieve the token from cookies or authorization header
    const token = req.cookies["jwt-netflix"] || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Step 2: Verify the token using the secret key
    let decoded;
    try {
      decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.name === "TokenExpiredError" ? "Token expired, please log in again" : "Invalid token",
      });
    }

    // Step 3: Check if the user exists based on the decoded userId
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Step 4: Attach the user information to the request object
    req.user = user;

    // Step 5: Call the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
