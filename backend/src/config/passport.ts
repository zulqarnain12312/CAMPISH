import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Check if user exists with same email
        existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.avatar = profile.photos?.[0]?.value || existingUser.avatar;
          existingUser.isEmailVerified = true;
          await existingUser.save();
          return done(null, existingUser);
        }
        
        // Create new user
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          isEmailVerified: true,
        });
        
        await newUser.save();
        return done(null, newUser);
        
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;