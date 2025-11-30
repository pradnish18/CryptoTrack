const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsersSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	watchlist: {
		type: [String],
		default: [],
	},
	portfolio: {
		type: Map,
		of: {
			totalInvestment: {
				type: Number,
				default: 0,
			},
			coins: {
				type: Number,
				default: 0,
			},
		},
		default: {},
	},
});

// Hash password before saving
UsersSchema.pre("save", async function (next) {
	const user = this;
	if (!user.isModified("password")) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10); // 10 rounds is good enough
		user.password = await bcrypt.hash(user.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

// Compare password method
UsersSchema.methods.comparePassword = async function (enteredPassword) {
	try {
		return await bcrypt.compare(enteredPassword, this.password);
	} catch (err) {
		throw err;
	}
};

const User = mongoose.model("Users", UsersSchema);

module.exports = User;
