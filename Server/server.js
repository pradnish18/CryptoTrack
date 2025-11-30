const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("./models/Users");
const PORT = process.env.PORT || 3000;
const app = express();

// CORS setup for frontend
app.use(
	cors({
		origin: process.env.CLIENT || "https://cryptotrack-ultimez.vercel.app",
		credentials: true,
	})
);

app.use(express.json());
const passport = require("./auth");
app.use(passport.initialize());

app.get("/", (req, res) => {
	res.send("API is running");
});

// User registration endpoint
app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (user) {
			return res.status(400).json({ Error: "User already exists" });
		}

		const newUser = new User({ username, password });
		await newUser.save();
		res.status(200).json({ message: "User registered successfully" });
	} catch (err) {
		console.error("Registration error:", err);
		return res.status(500).json(err);
	}
});

// Login endpoint
app.post("/login", (req, res, next) => {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const payload = { id: user._id, username: user.username };
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		res.json({
			message: "Login successful",
			token: token,
			user: {
				id: user._id,
				username: user.username,
			},
		});
	})(req, res, next);
});

// Get user's watchlist
app.get(
	"/watchlist",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		try {
			const userId = req.user._id;
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ Error: "User not found" });
			}

			res.json({ watchlist: user.watchlist });
		} catch (err) {
			res.status(500).json(err);
		}
	}
);

// Get user's portfolio
app.get(
	"/portfolio",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		try {
			const user = await User.findById(req.user._id);
			if (!user) {
				return res.status(404).json({ Error: "User not found" });
			}

			res.json(user.portfolio);
		} catch (err) {
			res.status(500).json(err);
		}
	}
);

// Add coin to watchlist
app.put(
	"/watchlist/add",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const { coin } = req.body;
		try {
			const user = await User.findByIdAndUpdate(
				req.user._id,
				{ $addToSet: { watchlist: coin } },
				{ new: true }
			);

			if (!user) {
				return res.status(404).json({ Error: "User not found" });
			}

			res.json({ watchlist: user.watchlist });
		} catch (err) {
			res.status(500).json(err.message);
		}
	}
);

// Remove coin from watchlist
app.put(
	"/watchlist/remove",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const { coin } = req.body;
		try {
			const user = await User.findByIdAndUpdate(
				req.user._id,
				{ $pull: { watchlist: coin } },
				{ new: true }
			);

			if (!user) {
				return res.status(404).json({ Error: "User not found" });
			}

			res.json({ watchlist: user.watchlist });
		} catch (err) {
			return res.status(500).json(err.message);
		}
	}
);

// Update portfolio (add/remove coins)
// TODO: maybe add transaction history later
app.put(
	"/portfolio/update",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const { coin, coinData } = req.body;

		try {
			// basic validation
			if (
				!coin ||
				!coinData ||
				typeof coinData.totalInvestment !== "number" ||
				typeof coinData.coins !== "number"
			) {
				return res.status(400).json({ error: "Invalid data provided" });
			}

			const user = await User.findById(req.user._id);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const portfolio = user.portfolio;
			const existingCoinData = portfolio.get(coin);

			if (existingCoinData) {
				const newCoins = existingCoinData.coins + coinData.coins;

				// Check if trying to sell more than owned
				if (coinData.coins < 0) {
					const sellAmount = Math.abs(coinData.coins);
					const ownedCoins = existingCoinData.coins;

					if (sellAmount > ownedCoins) {
						return res.status(400).json({
							error: `Can't sell ${sellAmount} coins. You only have ${ownedCoins} coins.`,
						});
					}
				}

				if (newCoins <= 0) {
					portfolio.delete(coin);
				} else {
					let newTotalInvestment;

					if (coinData.coins < 0) {
						// Selling: adjust investment proportionally
						const remainingRatio =
							newCoins / existingCoinData.coins;
						newTotalInvestment =
							existingCoinData.totalInvestment * remainingRatio;
					} else {
						// Buying: add to investment
						newTotalInvestment =
							existingCoinData.totalInvestment +
							coinData.totalInvestment;
					}

					existingCoinData.totalInvestment = newTotalInvestment;
					existingCoinData.coins = newCoins;
					portfolio.set(coin, existingCoinData);
				}
			} else {
				if (coinData.totalInvestment > 0 && coinData.coins > 0) {
					portfolio.set(coin, coinData);
				} else if (coinData.coins < 0) {
					return res.status(400).json({
						error: "You don't own this coin",
					});
				}
			}

			user.markModified("portfolio");

			const updatedUser = await user.save();
			res.json(updatedUser.portfolio);
		} catch (err) {
			console.error(err);
			res.status(500).json(err.message);
		}
	}
);

app.listen(PORT);
