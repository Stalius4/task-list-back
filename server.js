// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

// We’ll create this auth routes file in the next step
// const authRoutes = require('./routes/auth');
const cors = require('cors');

// Passport config function
const configurePassport = require('./config/passport');

const authRoutes = require('./routes/auth'); 
const taskRoutes = require('./routes/tasks');


const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000', // Replace this with your frontend URL
    credentials: true,              // Allow cookies to be sent
  })
);
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_app_db';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Middleware
app.use(express.json());

// Session Middleware (before passport.initialize)
// NOTE: In production, use a secret from env variables and configure cookie securely
app.use(
  session({
    secret: 'mySecretSessionKey', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,              // helps mitigate XSS attacks
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Future: we’ll add routes for auth, tasks, etc.
app.use('/auth', authRoutes);
app.use('/api/tasks', taskRoutes);