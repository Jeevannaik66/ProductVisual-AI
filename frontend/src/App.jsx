import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import Spinner from './components/Spinner.jsx';
import { useAuthStore } from './stores/authStore.js';
import Signup from "./pages/signup.jsx";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Generations from "./pages/generations.jsx";

/**
 * --- Protected Route ---
 * Best Practice: Assumes the global auth check (`checkAuth`) has already run.
 * This component's only job is to check if a user *exists* in the state.
 * If not, it redirects to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  // No `loading` check is needed here because the `App` component
  // is now handling the *initialization* state.
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * --- Public Route ---
 * Best Practice: A route that *only* public users should see (e.g., login, signup).
 * If a logged-in user tries to visit this, they are redirected
 * to their main dashboard.
 */
const PublicRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * --- Root Redirect ---
 * A simple component to handle the root URL ("/")
 * - Logged-in users go to "/dashboard"
 * - Public users go to "/signup"
 */
const RootRedirect = () => {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />;
};

function App() {
  // Select the initialization status and the action
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // --- GLOBAL AUTH CHECK ---
  // On first app load, run `checkAuth` *once*.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // `checkAuth` is stable, so this runs once on mount.

  // --- INITIALIZATION LOADING ---
  // Best Practice: Do *not* render any routes until the app knows
  // if a user is logged in or not. This prevents "flashes" of
  // the login page for already-authenticated users.
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // --- APP ROUTER ---
  // This code only runs *after* isInitialized is true.
  return (
    <Router>
      <Routes>
        {/* Root redirector handles where to send users from "/" */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes (e.g., login, signup) */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes (e.g., app dashboard) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generations"
          element={
            <ProtectedRoute>
              <Generations />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route redirects to the correct root */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;