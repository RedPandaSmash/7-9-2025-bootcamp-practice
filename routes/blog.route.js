import Blog from "../models/blog.model.js";

// import the necessary modules
import Router from "express";
import { validateSession } from "../middleware/validation.js";
import {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import mongoose from "mongoose";

// Create a new router instance
const router = Router();

// GET - /api/blogs - Fetch all blogs
router.get("/", getAllBlogs);

// POST - /api/blogs - Create a new blog
router.post("/", validateSession, createBlog);

// GET - /api/blogs/:id - Fetch a blog by ID
router.get("/:id", getBlogById);

// PUT - /api/blogs/:id - Update a blog by ID
router.put("/:id", validateSession, updateBlog);

// DELETE - /api/blogs/:id - Delete a blog by ID
router.delete("/:id", validateSession, deleteBlog);

// Export the router
export default router;
