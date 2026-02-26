import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Notification from "../components/Notification";
import "./Auth.css";

const FleetManagerLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    fleetId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fleetLogin } = useAuth();
  const { loadData } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await fleetLogin(
        formData.username,
        formData.fleetId,
        formData.password
      );

      if (result.success) {
        setNotification({
          message: "Login successful! Loading data...",
          type: "success",
        });

        // Load data after successful login
        await loadData();

        setTimeout(() => navigate("/fleet-dashboard"), 1000);
      } else {
        setNotification({ message: result.message, type: "error" });
      }
    } catch (error) {
      setNotification({
        message: "Login failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
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

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <i className="fas fa-truck"></i>
            </div>
            <h2>Fleet Manager Login</h2>
            <p>Welcome back! Please login to your NeuroFleetX account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
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

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              <i
                className={`fas fa-${
                  isLoading ? "spinner fa-spin" : "sign-in-alt"
                }`}
              ></i>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="auth-footer">
              Don't have an account? <Link to="/fleet-signup">Sign Up</Link>
            </p>
          </form>
        </div>

        <div className="auth-illustration">
          <div className="illustration-content">
            <i className="fas fa-truck"></i>
            <h3>Fleet Manager Portal</h3>
            <ul>
              <li>
                <i className="fas fa-check"></i> Manage fleet operations
              </li>
              <li>
                <i className="fas fa-check"></i> Assign and optimize routes
              </li>
              <li>
                <i className="fas fa-check"></i> Monitor drivers in real-time
              </li>
              <li>
                <i className="fas fa-check"></i> Generate performance reports
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagerLogin;
