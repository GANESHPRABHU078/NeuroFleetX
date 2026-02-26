import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { customersAPI } from "../services/api";

const CustomerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...customerData } = formData;
      const response = await customersAPI.signup(customerData);

      if (response.data.success) {
        alert("Account created successfully! Please login.");
        navigate("/customer-login");
      } else {
        setError(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
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
          className="w-full max-w-2xl"
        >
          <CardSpotlight>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-user-plus text-white text-2xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text mb-2">
                  Create Customer Account
                </h2>
                <p className="text-slate-400">Start booking vehicles today</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="johndoe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Password *
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
                        placeholder="••••••••"
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

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors focus:outline-none"
                      >
                        <i
                          className={`fas ${
                            showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/customer-login"
                    className="text-pink-400 hover:text-pink-300 font-semibold transition"
                  >
                    Login here
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

export default CustomerSignup;
