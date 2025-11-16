import { supabase } from '../utils/supabaseClient.js';

// --- Constants (Industry Best Practice) ---
// Centralizing "magic strings" and settings makes the code maintainable.
const ACCESS_TOKEN_COOKIE = 'sb_access_token';
const REFRESH_TOKEN_COOKIE = 'sb_refresh_token';
const IS_PROD = process.env.NODE_ENV === 'production';
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Centralized utility for all cookie options.
 * Ensures all options (httpOnly, secure, sameSite) are identical
 * whenever we set or clear a cookie.
 * @param {number} maxAge - Max age in milliseconds
 */
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: IS_PROD, // Must be true for sameSite='none'
  sameSite: 'none', // Allow cross-site cookie (Vercel frontend -> Render backend)
  path: '/',
  maxAge: maxAge,
});

/**
 * Centralized error handler.
 * @param {Response} res - Express response object
 * @param {Error} error - The error object
 */
const handleError = (res, error) => {
  // Log the full error for debugging
  console.error('[AUTH_ERROR]', error.message);

  // Supabase errors often have a specific status
  const status = error.status || (error.name === 'AuthApiError' ? 400 : 500);
  const message = error.message || 'Internal Server Error';
  res.status(status).json({ error: message });
};

/**
 * Centralized credential validator.
 * @param {string} email
 * @param {string} password
 * @returns {string | null} - An error message, or null if valid.
 */
const validateCredentials = (email, password) => {
  if (!email || !password) {
    return 'Email and password are required.';
  }
  // Basic email regex
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Invalid email format.';
  }
  // Supabase default policy is 6 chars
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null; // All valid
};

// --- Controller Functions ---

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    const validationError = validateCredentials(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // 2. API Call
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // 3. Response
    // Use 201 Created for a successful resource creation
    res.status(201).json({ message: 'Signup successful', user: data.user });
  } catch (err) {
    handleError(res, err);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    const validationError = validateCredentials(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // 2. API Call
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const session = data.session;
    if (!session) {
      // This should theoretically not happen if there's no error
      return res.status(500).json({ error: 'No session returned' });
    }

    // 3. Set Cookies (The *CRITICAL* part)
    // We set *both* the access token and the refresh token.

    // Access token (short-lived)
    const accessMaxAge = session.expires_in ? session.expires_in * 1000 : 3600 * 1000;
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      session.access_token,
      getCookieOptions(accessMaxAge)
    );

    // Refresh token (long-lived)
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      session.refresh_token,
      getCookieOptions(REFRESH_TOKEN_MAX_AGE)
    );

    res.json({ message: 'Login successful' });
  } catch (err) {
    handleError(res, err);
  }
};

export const logout = async (req, res) => {
  try {
    // Clear *both* cookies by setting maxAge to 0
    const clearOptions = { ...getCookieOptions(0) };
    res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions);

    // 204 No Content is the standard response for a successful
    // action that returns no data.
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
};

export const me = async (req, res) => {
  try {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    // --- Flow 1: Check if Access Token is valid ---
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      
      if (!error) {
        // Access token is valid. Return the user.
        return res.json({ user: data.user });
      }
      
      // If we're here, the access token was invalid (e.g., expired).
      // We'll now try to use the refresh token.
    }

    // --- Flow 2: Access Token is missing or expired, try Refresh Token ---
    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        // Refresh token is invalid or expired. User must log in again.
        throw error;
      }

      // Refresh was successful! We get a new session.
      const session = data.session;

      // Re-set both cookies with the new, valid tokens.
      const accessMaxAge = session.expires_in ? session.expires_in * 1000 : 3600 * 1000;
      res.cookie(
        ACCESS_TOKEN_COOKIE,
        session.access_token,
        getCookieOptions(accessMaxAge)
      );
      res.cookie(
        REFRESH_TOKEN_COOKIE,
        session.refresh_token,
        getCookieOptions(REFRESH_TOKEN_MAX_AGE)
      );

      // Return the new user object
      return res.json({ user: session.user });
    }

    // --- Flow 3: No tokens at all ---
    // If neither token was present, the user is not authenticated.
    res.status(401).json({ error: 'Not authenticated' });

  } catch (err) {
    // This will catch the `refreshSession` error, clearing cookies
    // and sending a 401.
    const clearOptions = { ...getCookieOptions(0) };
    res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions);
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
};