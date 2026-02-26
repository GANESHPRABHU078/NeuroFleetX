import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Notification from "../components/Notification";
import "./Auth.css";

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signupDriver } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setNotification({ message: "Passwords do not match!", type: "error" });
      return;
    }

    if (formData.password.length < 8) {
      setNotification({
        message: "Password must be at least 8 characters!",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    const { confirmPassword, ...rawData } = formData;

    // Prepare data for NeuroFleetX backend
    const driverData = {
      username: rawData.username,
      name: `${rawData.firstName} ${rawData.lastName}`,
      email: rawData.email,
      phone: rawData.phone,
      licenseNumber: rawData.licenseNumber || rawData.license_number,
      password: rawData.password,
      role: "driver",
    };

    const result = await signupDriver(driverData);

    if (result.success) {
      setNotification({
        message: "Registration successful! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/driver-login"), 2000);
    } else {
      setNotification({ message: result.message, type: "error" });
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="landing-page bg-slate-950 page-top-padding">
      <Particles />
      <Navbar showLinks={false} />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon">🚗</div>
              <h1 className="auth-title">Driver Registration</h1>
              <p className="auth-subtitle">
                Join NeuroFleetX and start driving
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter license number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                <i
                  className={`fas fa-${
                    isLoading ? "spinner fa-spin" : "user-plus"
                  }`}
                ></i>
                {isLoading ? "Creating Account..." : "Register"}
              </button>

              <p className="auth-footer-text">
                Already have an account?{" "}
                <Link to="/driver-login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <div className="auth-illustration">
            <div className="illustration-icon">🚛</div>
            <h2 className="illustration-title">Drive with NeuroFleetX</h2>
            <ul className="illustration-features">
              <li>
                <span className="feature-icon">📍</span>
                <span>Real-time GPS tracking</span>
              </li>
              <li>
                <span className="feature-icon">🗺️</span>
                <span>Smart route optimization</span>
              </li>
              <li>
                <span className="feature-icon">📊</span>
                <span>Performance analytics</span>
              </li>
              <li>
                <span className="feature-icon">💰</span>
                <span>Competitive earnings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSignup;
