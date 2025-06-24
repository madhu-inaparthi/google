const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const User = require('./models/schema'); // Import your User schema

// Determine the callback URL based on environment
const callbackURL = process.env.NODE_ENV === 'production'
  ? `${process.env.BACKEND_URL || 'https://s89-madhukiran-fashionmerge.onrender.com'}/auth/google/callback`
  : 'http://localhost:5000/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.YOUR_GOOGLE_CLIENT_ID, // Replace with your Google Client ID
      clientSecret: process.env.YOUR_GOOGLE_CLIENT_SECRET, // Replace with your Google Client Secret
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile); 
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          console.log('Creating new user for Google account:', profile.emails[0].value); // Debugging

          // Create a new user if not found with properly initialized arrays
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: null, // No password for Google-authenticated users
            cartItems: [],
            wishlistItems: [],
            chatbotHistory: [],
            wardrobe: []
          });
          await user.save();
        } else {
          console.log('User already exists:', user.email); // Debugging
        }

        // Generate JWT token for the user
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' } // Token expires in 7 days
        );

        // Attach the token to the user object
        user.token = token;

        return done(null, user); // Pass only the user object to serializeUser
      } catch (err) {
        console.error('Error during Google authentication:', err); // Debugging
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id || user._id || user.user?.id || user.user?._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization:', err); // Debugging
    done(err, null);
  }
});