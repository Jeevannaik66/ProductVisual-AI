// backend/middleware/authMiddleware.js
import { supabase } from '../utils/supabaseClient.js';

/**
 * Middleware to protect routes
 * Checks Authorization header "Bearer <token>"
 * Attaches user object to req.user if valid
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }

    if (!data?.user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    req.user = data.user; // ✅ attach user to request
    next();
  } catch (err) {
    console.error('authMiddleware unexpected error:', err);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};
