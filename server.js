require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

// Initialize Express app
const app = express();

// Set up session middleware
app.use(session({
  secret: 'your_session_secret', // Replace with a real secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'google', 'public')));

// Simple in-memory user store (replace with a real database in production)
const users = [];

// Configure Google Strategy for Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.YOUR_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID', // Replace with your Google Client ID
      clientSecret: process.env.YOUR_GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET', // Replace with your Google Client Secret
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile);
        
        // Check if user already exists in our simple in-memory store
        let user = users.find(u => u.email === profile.emails[0].value);
        
        if (!user) {
          console.log('Creating new user for Google account:', profile.emails[0].value);
          
          // Create a new user
          user = {
            id: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value
          };
          
          users.push(user);
        } else {
          console.log('User already exists:', user.email);
        }
        
        return done(null, user);
      } catch (err) {
        console.error('Error during Google authentication:', err);
        return done(err, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'google', 'public', 'index.html'));
});

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to success page with user info
    res.redirect(`/success.html?name=${encodeURIComponent(req.user.username)}&email=${encodeURIComponent(req.user.email)}`);
  }
);

// Success route
app.get('/success', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'google', 'public', 'success.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});