const express = require("express");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const app = express();

// Static credentials - NO DATABASE
const STATIC_USER = {
	username: "admin",
	password: "password123"
};

// In-memory storage for user data (resets on server restart)
let userPortfolio = {};
let userWatchlist = [];

// CORS setup for frontend
app.use(
	cors({
		origin: process.env.CLIENT || "https://cryptotrack-ultimez.vercel.app",
		credentials: true,
	})
);

app.use(express.json());

// Simple auth middleware
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Access denied" });
	}

	// For static auth, we just check if token matches our static username
	if (token === STATIC_USER.username) {
		req.user = { username: STATIC_USER.username };
		next();
	} else {
		res.status(403).json({ error: "Invalid token" });
	}
};

// Login endpoint - static credentials
app.post("/login", (req, res) => {
	const { username, password } = req.body;

	// Debug logging
	console.log("Login attempt received:");
	console.log("  Username:", username);
	console.log("  Password:", password);
	console.log("  Expected username:", STATIC_USER.username);
	console.log("  Expected password:", STATIC_USER.password);
	console.log("  Match:", username === STATIC_USER.username && password === STATIC_USER.password);

	if (username === STATIC_USER.username && password === STATIC_USER.password) {
		// Return the username as token (simple static implementation)
		res.json({
			token: STATIC_USER.username,
			user: { username: STATIC_USER.username }
		});
	} else {
		res.status(401).json({ error: "Invalid credentials" });
	}
});

// Register endpoint - disabled (static user only)
app.post("/register", (req, res) => {
	res.status(400).json({
		error: "Registration is disabled. Please use the static credentials (username: admin, password: password123)"
	});
});

// Portfolio endpoints
app.get("/portfolio", authenticateToken, (req, res) => {
	// Return portfolio object directly, not wrapped
	res.json(userPortfolio);
});

app.put("/portfolio/update", authenticateToken, (req, res) => {
	const { coin, coinData } = req.body;

	if (!coin || !coinData) {
		return res.status(400).json({ error: "Coin and coinData are required" });
	}

	// Merge with existing data instead of replacing
	if (userPortfolio[coin]) {
		userPortfolio[coin] = {
			totalInvestment: userPortfolio[coin].totalInvestment + coinData.totalInvestment,
			coins: userPortfolio[coin].coins + coinData.coins
		};
	} else {
		userPortfolio[coin] = coinData;
	}

	// Remove coin if coins become 0 or negative
	if (userPortfolio[coin].coins <= 0) {
		delete userPortfolio[coin];
	}

	// Return portfolio object directly, not wrapped
	res.json(userPortfolio);
});

// Watchlist endpoints
app.get("/watchlist", authenticateToken, (req, res) => {
	res.json({ watchlist: userWatchlist });
});

app.put("/watchlist/add", authenticateToken, (req, res) => {
	const { coin } = req.body;

	if (!coin) {
		return res.status(400).json({ error: "Coin is required" });
	}

	if (!userWatchlist.includes(coin)) {
		userWatchlist.push(coin);
	}

	res.json({
		message: "Coin added to watchlist",
		watchlist: userWatchlist
	});
});

app.put("/watchlist/remove", authenticateToken, (req, res) => {
	const { coin } = req.body;

	if (!coin) {
		return res.status(400).json({ error: "Coin is required" });
	}

	userWatchlist = userWatchlist.filter(c => c !== coin);

	res.json({
		message: "Coin removed from watchlist",
		watchlist: userWatchlist
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.send("CryptoTrack API is running with static authentication");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Static credentials - Username: ${STATIC_USER.username}, Password: ${STATIC_USER.password}`);
});
