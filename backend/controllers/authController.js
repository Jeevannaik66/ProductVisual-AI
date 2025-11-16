import { supabase } from '../utils/supabaseClient.js';

// Signup
export const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Signup successful', user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login - set HttpOnly cookie with access token (no tokens in JSON body)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    const session = data.session;
    if (!session) return res.status(500).json({ error: 'No session returned' });

    // Set HttpOnly cookie (access token). Refresh token handling omitted for brevity.
    // Supabase returns expires_in (seconds). Convert to milliseconds for maxAge.
    const maxAge = session.expires_in ? session.expires_in * 1000 : 24 * 60 * 60 * 1000;

    // Cookie options:
    // - httpOnly: true prevents JS access to the cookie (more secure)
    // - secure: only send cookie over HTTPS in production
    // - sameSite: 'none' is required for cross-site cookies (frontend on a different origin)
    // - maxAge: lifespan in milliseconds
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('sb_access_token', session.access_token, {
      httpOnly: true,
      secure: isProd, // must be true for sameSite='none' to work in browsers
      sameSite: 'none', // allow cross-site cookie for Vercel frontend -> Render backend
      maxAge,
      // Ensure cookie is sent for all paths in the API
      path: '/',
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout - clear cookie
export const logout = async (req, res) => {
  // Clear cookie using the same options it was set with.
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('sb_access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'none',
    path: '/',
  });
  res.json({ message: 'Logged out' });
};

// Return current user info if cookie is present
export const me = async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: error.message });
    res.json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
