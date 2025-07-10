// import necessary modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";

// load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGODB;

console.log(`MONGO: ${MONGO}`);

// Middleware to parse JSON request bodies
app.use(express.json());

// connect to MongoDB
mongoose.connect(`${MONGO}/anotherMongooseTest`);
const db = mongoose.connection;
db.once("open", () => {
  console.log(`connected: ${MONGO}`);
});

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET - /api/public - public route
app.get("/api/public", (req, res) => {
  res.json({
    message: "This is a public route. No authentication required.",
  });
});

// GET - /api/private - private route
app.get("/api/private", validateSession, (req, res) => {
  res.json({
    message: "This is a private route. Authentication required.",
    user: req.user, // the user object attached by the validateSession middleware
  });
});

// POST - /api/signup - create a new user
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = new User({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10), // hash the password
    });

    const newUser = await user.save();

    // issue the toke to the user
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.jwt_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      user: newUser,
      token: token,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST - /api/login - authenticate a user
app.post("/api/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // find the user by email
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // compare the password with the hashed password
    // save in the database
    const verifyPwd = await bcrypt.compare(password, foundUser.password);

    if (!verifyPwd) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    // issue the token to the user
    const token = jwt.sign(
      {
        id: foundUser._id,
      },
      process.env.jwt_SECRET,
      { expiresIn: "1h" }
    );

    // send the user and token in the response
    res.status(200).json({
      user: foundUser,
      token: token,
      message: "User logged in successfully!",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
