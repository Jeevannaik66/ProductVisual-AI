import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Signup failed");
      
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Brand Section */}
          <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl lg:rounded-[2rem] p-6 sm:p-8 lg:p-12 xl:p-16 flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                    ProductVisual AI
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    AI Product Image Generator
                  </p>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Turn descriptions into
                  <span className="text-blue-600 block mt-1 sm:mt-2">product images</span>
                </h2>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  AI-powered platform that converts simple text into professional product visuals for beauty brands.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 sm:space-y-4">
                {[
                  "Enter product description",
                  "AI enhances your prompt", 
                  "Generate with DALL·E",
                  "Download professional images"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-full flex items-center justify-center py-8 sm:py-12 lg:py-16">
            <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-0">
              {/* Form Header */}
              <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Create Account
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Start generating product images
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4 sm:space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Create a password"
                    required
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base lg:text-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Creating account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Login Redirect */}
              <div className="text-center mt-6 sm:mt-8 lg:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}