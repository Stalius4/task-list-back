// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// --------------------
// 1. Register (Sign Up)
// --------------------
router.post('/register', async (req, res) => {
  console.log("sda")
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in DB
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---------------
// 2. Login
// ---------------
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // info.message comes from passport config (e.g. 'No user' or 'Incorrect password')
      return res.status(401).json({ message: info.message || 'Login failed' });
    }
    // Log the user in using req.logIn
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({ message: 'Logged in successfully', user: { email: user.email } });
    });
  })(req, res, next);
});

// ---------------
// 3. Logout
// ---------------
router.get('/logout', (req, res) => {
  // Passport attaches the logout method to the req.
  // The newer versions of Passport use an asynchronous logout.
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// ---------------------------
// 4. Current User (Check Auth)
// ---------------------------
router.get('/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    // Passport attaches the user object to req.user
    return res.json({ user: req.user });
  }
  return res.status(401).json({ user: null });
});

module.exports = router;
