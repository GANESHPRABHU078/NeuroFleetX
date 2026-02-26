import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { loginCustomer } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginCustomer(formData);

      if (result.success) {
        navigate("/customer-dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page bg-slate-950 min-h-screen flex flex-col">
      <Particles />
      <Navbar showLinks={false} />

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <CardSpotlight>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text mb-2">
                  Customer Login
                </h2>
                <p className="text-slate-400">Access your booking account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Username or Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="Enter your username or email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors focus:outline-none"
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    to="/customer-signup"
                    className="text-pink-400 hover:text-pink-300 font-semibold transition"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLogin;
