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
    const maxAge = session.expires_in ? session.expires_in * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('sb_access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout - clear cookie
export const logout = async (req, res) => {
  res.clearCookie('sb_access_token', { httpOnly: true, sameSite: 'lax' });
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
