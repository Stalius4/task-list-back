// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

function configurePassport(passport) {
  // Local Strategy: use email as the usernameField
  const authenticateUser = async (email, password, done) => {
    try {
      // 1. Check if user with that email exists
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'No user with that email' });
      }

      // 2. Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // 3. If successful, return the user
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

module.exports = configurePassport;
