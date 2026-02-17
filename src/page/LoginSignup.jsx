import React, { useState , useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const AuthForm = ({ mode = "signup", onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMode, setCurrentMode] = useState(mode);


  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/");
  }
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const url = `https://poll-backend-2gxa.onrender.com/api/auth/${currentMode}`;
    const res = await axios.post(url, { email, password });

    // Save token
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // Optional callback
    if (onLoginSuccess) {
      onLoginSuccess(res.data.token, res.data.user);
    }

    // ✅ ALWAYS redirect after success
    navigate("/");

  } catch (err) {
    setError(err.response?.data?.message || "Something went wrong. Check backend!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f4f9] dark:bg-[#131314] px-4 transition-colors">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#1e1f20] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        {/* Logo - suraj Bhai ka  */}
                <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-red-400 bg-clip-text text-transparent inline-block">
           exit-Poll ----
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {currentMode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 text-sm p-3 rounded-lg text-center border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-[#131314] dark:text-gray-100 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-[#131314] dark:text-gray-100 transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              currentMode === "signup" ? "Sign Up" : "Sign In"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentMode === "signup" ? "Already have an account?" : "New to Gemini?"}
            {" "}
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all"
              onClick={() => {
                setCurrentMode(currentMode === "signup" ? "login" : "signup");
                setError("");
              }}
            >
              {currentMode === "signup" ? "Login here" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;