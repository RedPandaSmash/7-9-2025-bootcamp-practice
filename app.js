// import necessary modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// create an Express application
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;


app.get("/api/health", (req,res) => {
  res.status(200).json({ message: "API is healthy" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});