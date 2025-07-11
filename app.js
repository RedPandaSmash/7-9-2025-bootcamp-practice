// import necessary modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";
import { validateSession } from "./middleware/validation.js";
import blogRoutes from "./routes/blog.route.js";

// load environment variables
dotenv.config();

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(process.cwd(), "public")));

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

    // issue the token to the user
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

// use the blog routes for blog operations
app.use("/api/blogs", blogRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
