import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Step 1: Retrieve the token from cookies
    const token = req.cookies["jwt-netflix"];

    if (!token) {
      console.log("Token missing");
      return res.status(401).json({ success: false, message: "Unauthorized - No Token Provided" });
    }

    // Step 2: Verify the token using the secret key
    let decoded;
    try {
      decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    } catch (error) {
      console.log("Token verification failed", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
      }
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    console.log("Token decoded:", decoded); // Debug log for decoded token

    // Step 3: Check if the user exists based on the decoded userId
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Step 4: Attach the user information to the request object for later use
    req.user = user;

    // Step 5: Call the next middleware or route handler
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
