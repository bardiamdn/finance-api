const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Profile = require('./db/profile');

// routes
const transactionRoutes = require("./routes/transactionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const homeRoute = require("./routes/homeRoute");
// utils functions
const utils = require("./lib/utils");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Set headers
  res.header("Content-Type", "application/json");

  next();
});

// It's better to connect the db once here.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const cookieOptions = {
  // httpOnly: true,  // Prevent JavaScript access
  // secure: true,    // Only send over HTTPS
  // sameSite: 'Strict', // Prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
};

function hourDayToSec(input) {
  if(input.includes('h')) {
    return parseInt(input) * 60 * 60;
  } else if(input.includes('d')) {
    return parseInt(input) * 24 * 60 * 60;
  }
}

app.get('/', async (req, res) => {
  const userEmail = req.headers['cf-access-authenticated-user-email'];
  if (userEmail) {
      console.log(`User Email: ${userEmail}`);
      let profile = await Profile.findOne({ userEmail: userEmail }).exec();

      if (!profile) {
        profile = new Profile({ userEmail: userEmail });
      try {
        await profile.save();
      } catch (error) {
        console.error('Error creating profile:', error);
        return res.status(500).send('Internal Server Error');
      }
    }
    const { token, expires } = utils.issueJWT(profile);

    res.cookie('profile_id', profile._id.toString(), cookieOptions);
    res.cookie('crunchcat_token', token, {
      ...cookieOptions,
      maxAge: hourDayToSec(expires) * 1000, // Convert seconds to milliseconds
    });
    res.cookie('crunchcat_expires_in', expires.toString(), cookieOptions);

    return res.status(301).redirect('/home');
  } else {
      res.status(401).send('Unauthorized: Email header not found');
  }
});

app.use(cookieParser());

app.use("/api", utils.authMiddleware);
app.use("/api/transaction", transactionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/balance", balanceRoutes);

app.use("/api/home", homeRoute);

const PORT = 3000;
app.listen(PORT);
console.log(`app is running on http://localhost:${PORT}`);
