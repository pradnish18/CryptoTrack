const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on("connected", () => {
	console.log("MongoDB connected successfully");
});

db.on("error", (err) => {
	console.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
	console.log("MongoDB disconnected");
});

module.exports = db;
