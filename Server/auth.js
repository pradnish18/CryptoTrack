const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("./models/Users");
require("dotenv").config();

// Local strategy for username/password login
passport.use(
	new localStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username });
			if (!user) {
				return done(null, false, { message: "Username not found" });
			}

			const isMatch = await user.comparePassword(password);
			if (isMatch) {
				// console.log("User authenticated:", username); // debug
				return done(null, user);
			} else {
				return done(null, false, { message: "Wrong password" });
			}
		} catch (err) {
			return done(err, false);
		}
	})
);

// JWT strategy for protected routes
passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
		},
		async (payload, done) => {
			try {
				const user = await User.findById(payload.id);
				if (user) {
					return done(null, user);
				}
				return done(null, false);
			} catch (err) {
				return done(err, false);
			}
		}
	)
);

module.exports = passport;
