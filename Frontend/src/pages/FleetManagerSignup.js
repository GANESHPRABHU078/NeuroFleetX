import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Notification from "../components/Notification";
import "./Auth.css";

const FleetManagerSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    companyName: "",
    fleetId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signupFleetManager } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setNotification({ message: "Passwords do not match!", type: "error" });
      return;
    }

    setIsLoading(true);
    const { confirmPassword, ...rawData } = formData;

    // Prepare data for NeuroFleetX backend
    const fleetManagerData = {
      username: rawData.username,
      name: `${rawData.firstName} ${rawData.lastName}`,
      email: rawData.email,
      phone: rawData.phone,
      fleetId: rawData.fleetId,
      password: rawData.password,
      role: "fleet_manager",
    };

    const result = await signupFleetManager(fleetManagerData);

    if (result.success) {
      setNotification({
        message: result.message || "Account created! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/fleet-login"), 1500);
    } else {
      setNotification({ message: result.message, type: "error" });
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <Particles />
      <Navbar showLinks={false} />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h2>Fleet Manager Sign Up</h2>
            <p>Create your NeuroFleetX account to manage fleets and drivers</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <i className="fas fa-user"></i> First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  <i className="fas fa-user"></i> Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user-tag"></i> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <i className="fas fa-phone"></i> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">
                <i className="fas fa-building"></i> Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter your company or fleet name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fleetId">
                <i className="fas fa-id-card"></i> Fleet ID
              </label>
              <input
                type="text"
                id="fleetId"
                name="fleetId"
                value={formData.fleetId}
                onChange={handleChange}
                required
                placeholder="Enter your fleet ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={`fas fa-${
                      showConfirmPassword ? "eye-slash" : "eye"
                    }`}
                  ></i>
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
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="auth-footer">
              Already have an account? <Link to="/fleet-login">Login</Link>
            </p>
          </form>
        </div>

        <div className="auth-illustration">
          <div className="illustration-content">
            <i className="fas fa-truck"></i>
            <h3>Join NeuroFleetX</h3>
            <ul>
              <li>
                <i className="fas fa-check"></i> Easy registration process
              </li>
              <li>
                <i className="fas fa-check"></i> Instant access to dashboard
              </li>
              <li>
                <i className="fas fa-check"></i> Onboard unlimited drivers
              </li>
              <li>
                <i className="fas fa-check"></i> Manage multiple routes
              </li>
              <li>
                <i className="fas fa-check"></i> Free forever
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagerSignup;
