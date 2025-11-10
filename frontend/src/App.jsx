import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Generations from "./pages/generations"; // ✅ import Generations page

// ✅ Check if user is logged in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("userSession");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected Generations Route */}
        <Route
          path="/generations"
          element={
            <ProtectedRoute>
              <Generations />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes redirect back */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
