import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware for jsonwebtoken authentication
const validateSession = async (req, res, next) => {
  try {
    // take the token provided by the request object
    const token = req.headers.authorization;

    // check the status of the token
    const decodedToken = await jwt.verify(token, process.env.jwt_SECRET);

    // provide response
    const user = await User.findById(decodedToken.id);

    if (!user) throw new Error("User not found");

    req.user = user; // attach the user to the request object

    return next(); // call the next middleware or route handler
  } catch (error) {
    res.json({
      error: "Unauthorized access",
    });
  }
};

export { validateSession };
