// backend/middleware/authMiddleware.js
import { supabase } from '../utils/supabaseClient.js';

/**
 * Middleware to protect routes
 * Checks Authorization header "Bearer <token>"
 * Attaches user object to req.user if valid
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Support token via Authorization header OR HttpOnly cookie (sb_access_token)
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.sb_access_token;

    let token = null;
    if (authHeader) {
      const [scheme, hdrToken] = authHeader.split(' ');
      if (scheme === 'Bearer' && hdrToken) token = hdrToken;
    }
    if (!token && cookieToken) token = cookieToken;

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }

    if (!data?.user) return res.status(401).json({ message: 'Unauthorized: user not found' });

    req.user = data.user; // attach user to request
    next();
  } catch (err) {
    console.error('authMiddleware unexpected error:', err);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

// Optional auth middleware: does not return 401, sets req.user to user or null
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.sb_access_token;

    let token = null;
    if (authHeader) {
      const [scheme, hdrToken] = authHeader.split(' ');
      if (scheme === 'Bearer' && hdrToken) token = hdrToken;
    }
    if (!token && cookieToken) token = cookieToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.warn('optionalAuthMiddleware supabase error:', error);
      req.user = null;
      return next();
    }

    req.user = data?.user || null;
    next();
  } catch (err) {
    console.error('optionalAuthMiddleware unexpected error:', err);
    req.user = null;
    next();
  }
};
